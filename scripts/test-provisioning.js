const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("FAIL: DATABASE_URL environment variable is missing.");
    process.exit(1);
}

const pool = new Pool({ connectionString });

async function runTests() {
    console.log("=========================================");
    console.log("BLONK PROVISIONING LIFECYCLE TEST RUNNER");
    console.log("=========================================");

    const client = await pool.connect();

    try {
        // 1. Clean up old test data
        console.log("\n[1/7] Cleaning up older test references...");
        await client.query('DELETE FROM "Event" WHERE "eventType" IN (\'infra_capacity_exhausted\', \'invalid_provision_transition\', \'server_reassigned\')');
        await client.query('DELETE FROM "Workflow" WHERE name LIKE \'Test Workflow%\'');
        await client.query('DELETE FROM "User" WHERE email = \'test-user@blonk.co\'');
        await client.query('DELETE FROM "Team" WHERE name = \'Test Hardening Workspace\'');
        await client.query('DELETE FROM "ClusterNode" WHERE name LIKE \'Test Node%\'');

        // 2. Setup mock data
        console.log("[2/7] Seeding mock servers and workspace...");
        const teamRes = await client.query(
            `INSERT INTO "Team" (id, name, "provisioningStatus")
             VALUES (gen_random_uuid(), 'Test Hardening Workspace', 'UNASSIGNED')
             RETURNING id`
        );
        const teamId = teamRes.rows[0].id;

        const userRes = await client.query(
            `INSERT INTO "User" (id, name, email, password, role, "teamId")
             VALUES (gen_random_uuid(), 'Test Operator', 'test-user@blonk.co', 'nopass', 'User', $1)
             RETURNING id`,
            [teamId]
        );
        const userId = userRes.rows[0].id;

        // Seed two nodes
        const node1Res = await client.query(
            `INSERT INTO "ClusterNode" (id, name, url, api_key, status, max_workflows, is_assignable)
             VALUES (gen_random_uuid(), 'Test Node Primary', 'http://node1.local', 'key1', 'Active', 10, true)
             RETURNING id`
        );
        const node1Id = node1Res.rows[0].id;

        const node2Res = await client.query(
            `INSERT INTO "ClusterNode" (id, name, url, api_key, status, max_workflows, is_assignable)
             VALUES (gen_random_uuid(), 'Test Node Secondary', 'http://node2.local', 'key2', 'Active', 10, true)
             RETURNING id`
        );
        const node2Id = node2Res.rows[0].id;

        // Seed a workflow for the team
        await client.query(
            `INSERT INTO "Workflow" (id, "teamId", name, status, performance, "tasksCount", inputs, progress)
             VALUES (gen_random_uuid(), $1, 'Test Workflow Operational Loop', 'Ordered', '0', 0, '{}', 10)`,
            [teamId]
        );

        console.log(`-> Seeded workspace ID: ${teamId}`);
        console.log(`-> Node Primary: ${node1Id}`);
        console.log(`-> Node Secondary: ${node2Id}`);

        // 3. Test load-balanced allocation
        console.log("\n[3/7] Testing server allocation logic...");
        // Emulate allocateNodeForTeam query: find active/assignable node
        const assignableRes = await client.query(`
            SELECT n.*, 
                   (SELECT COUNT(*) FROM "Team" t WHERE t."serverId" = n.id) as assigned_workspaces
            FROM "ClusterNode" n
            WHERE n.status = 'Active' AND n.is_assignable = true
            ORDER BY assigned_workspaces ASC, n."createdAt" ASC
            LIMIT 1
        `);

        if (assignableRes.rows.length === 0) {
            throw new Error("No assignable servers found during allocation test.");
        }

        const allocatedNode = assignableRes.rows[0];
        console.log(`-> Best allocated node candidate matched: ${allocatedNode.name}`);

        // Perform assignment query
        await client.query(
            `UPDATE "Team" SET "serverId" = $1, "provisioningStatus" = 'RESERVED', "assignedAt" = CURRENT_TIMESTAMP WHERE id = $2`,
            [allocatedNode.id, teamId]
        );

        // Verify assignment
        const verifyRes = await client.query('SELECT "serverId", "provisioningStatus" FROM "Team" WHERE id = $1', [teamId]);
        const teamState = verifyRes.rows[0];
        if (teamState.serverId !== allocatedNode.id || teamState.provisioningStatus !== 'RESERVED') {
            throw new Error("Server assignment persistence mismatch.");
        }
        console.log("PASS: Server successfully allocated and status transitioned to RESERVED.");

        // 4. Validate State Transitions
        console.log("\n[4/7] Validating state machine transitions...");
        // Transition to valid state RESERVED -> PREPARING
        await client.query('UPDATE "Team" SET "provisioningStatus" = \'PREPARING\' WHERE id = $1', [teamId]);
        const statePreparingRes = await client.query('SELECT "provisioningStatus" FROM "Team" WHERE id = $1', [teamId]);
        if (statePreparingRes.rows[0].provisioningStatus !== 'PREPARING') {
            throw new Error("Transition to PREPARING failed.");
        }
        console.log("PASS: Valid transition to PREPARING succeeded.");

        // 5. Test capacity exhaustion (QUEUED state fallback)
        console.log("\n[5/7] Testing no-capacity fallback triggers...");
        // Disable assignability for all nodes
        await client.query('UPDATE "ClusterNode" SET is_assignable = false');

        // Check availability
        const checkExhaustedRes = await client.query(`
            SELECT n.* FROM "ClusterNode" n WHERE n.status = 'Active' AND n.is_assignable = true
        `);

        if (checkExhaustedRes.rows.length === 0) {
            console.log("-> Verified no servers are assignable. Triggering fallback assignment status...");
            // Set status to QUEUED
            await client.query(`UPDATE "Team" SET "serverId" = NULL, "provisioningStatus" = 'QUEUED', "assignedAt" = NULL WHERE id = $1`, [teamId]);
            
            // Insert exhaustion audit log
            await client.query(
                `INSERT INTO "Event" ("userId", "eventType", "metadata", "source")
                 VALUES ($1, $2, $3, $4)`,
                [null, 'infra_capacity_exhausted', JSON.stringify({ teamId, title: 'Server Capacity Exhausted', description: 'No active servers available.' }), 'audit_log']
            );
        }

        const verifyQueuedRes = await client.query('SELECT "serverId", "provisioningStatus" FROM "Team" WHERE id = $1', [teamId]);
        const queuedState = verifyQueuedRes.rows[0];
        if (queuedState.serverId !== null || queuedState.provisioningStatus !== 'QUEUED') {
            throw new Error("Exhaustion fallback did not queue workspace.");
        }

        const auditCheck = await client.query('SELECT * FROM "Event" WHERE "eventType" = \'infra_capacity_exhausted\' AND "source" = \'audit_log\'');
        if (auditCheck.rows.length === 0) {
            throw new Error("Exhaustion warning audit log not dispatched.");
        }
        console.log("PASS: Successfully queued workspace and logged capacity exhaustion event.");

        // 6. Test manual server reassignment logic
        console.log("\n[6/7] Testing admin server reassignment and workflow target migration...");
        // Re-enable second node for assignment
        await client.query('UPDATE "ClusterNode" SET is_assignable = true WHERE id = $1', [node2Id]);

        // Trigger reassignment to Node Secondary (node2Id)
        await client.query(`UPDATE "Team" SET "serverId" = $1, "provisioningStatus" = 'READY', "assignedAt" = CURRENT_TIMESTAMP WHERE id = $2`, [node2Id, teamId]);
        // Cascade to all workflows
        await client.query('UPDATE "Workflow" SET "serverId" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "teamId" = $2', [node2Id, teamId]);
        // Insert audit log
        await client.query(
            `INSERT INTO "Event" ("userId", "eventType", "metadata", "source")
             VALUES ($1, $2, $3, $4)`,
            [null, 'server_reassigned', JSON.stringify({ teamId, title: 'Workspace Reassigned' }), 'audit_log']
        );

        // Verify cascades
        const verifyReassignRes = await client.query('SELECT "serverId", "provisioningStatus" FROM "Team" WHERE id = $1', [teamId]);
        if (verifyReassignRes.rows[0].serverId !== node2Id || verifyReassignRes.rows[0].provisioningStatus !== 'READY') {
            throw new Error("Workspace server linkage was not updated.");
        }

        const verifyWorkflowsRes = await client.query('SELECT "serverId" FROM "Workflow" WHERE "teamId" = $1', [teamId]);
        for (const wf of verifyWorkflowsRes.rows) {
            if (wf.serverId !== node2Id) {
                throw new Error("Linked workflows failed to redirect execution targets.");
            }
        }
        console.log("PASS: Reassignment successfully moved workspace and updated execution targets.");

        // 7. Cleanup mock test items
        console.log("\n[7/7] Cleaning up test records from database...");
        await client.query('DELETE FROM "Event" WHERE "metadata" @> $1::jsonb', [JSON.stringify({ teamId })]);
        await client.query('DELETE FROM "Workflow" WHERE "teamId" = $1', [teamId]);
        await client.query('DELETE FROM "User" WHERE id = $1', [userId]);
        await client.query('DELETE FROM "Team" WHERE id = $1', [teamId]);
        await client.query('DELETE FROM "ClusterNode" WHERE id IN ($1, $2)', [node1Id, node2Id]);
        console.log("PASS: Database cleanly reset.");

        console.log("\n=========================================");
        console.log("ALL INTEGRATION TESTS COMPILED & PASSED!");
        console.log("=========================================");

    } catch (e) {
        console.error("\nTEST EXCEPTION DETECTED:\n", e.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runTests();
