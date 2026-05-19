import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

/**
 * Marketplace Installed Items API
 * 
 * GET - Fetch user's installed marketplace items
 * POST - Record a new installation after payment
 */

async function ensureSchema() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "MarketplaceInstallation" (
            id TEXT PRIMARY KEY,
            "templateId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "serverId" TEXT,
            status TEXT DEFAULT 'pending',
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("templateId") REFERENCES "WorkflowTemplate"(id),
            FOREIGN KEY ("userId") REFERENCES "User"(id),
            FOREIGN KEY ("serverId") REFERENCES "ClusterNode"(id)
        )
    `);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        await ensureSchema();

        const installations = await db.query(`
            SELECT mi.*, 
                   wt.name as template_name,
                   wt.description as template_description,
                   wt.price as template_price,
                   cn.name as server_name,
                   cn.status as server_status
            FROM "MarketplaceInstallation" mi
            LEFT JOIN "WorkflowTemplate" wt ON mi."templateId" = wt.id
            LEFT JOIN "ClusterNode" cn ON mi."serverId" = cn.id
            WHERE mi."userId" = $1
            ORDER BY mi."createdAt" DESC
        `, [userId]);

        return NextResponse.json(installations || []);
    } catch (error) {
        console.error('Error fetching installed items:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { templateId, userId } = await request.json();

        if (!templateId || !userId) {
            return NextResponse.json({ error: "Template ID and User ID required" }, { status: 400 });
        }

        await ensureSchema();

        // Check if already installed
        const existing = await db.query(
            'SELECT * FROM "MarketplaceInstallation" WHERE "templateId" = $1 AND "userId" = $2',
            [templateId, userId]
        );

        if (existing.length > 0) {
            return NextResponse.json({ error: "Already installed" }, { status: 400 });
        }

        // Get template details
        const template = await db.query('SELECT * FROM "WorkflowTemplate" WHERE id = $1', [templateId]);
        if (!template.length) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // Create installation record
        const installationId = `install_${Date.now()}`;
        await db.execute(
            'INSERT INTO "MarketplaceInstallation" (id, "templateId", "userId", status) VALUES ($1, $2, $3, $4)',
            [installationId, templateId, userId, 'pending']
        );

        // Update template purchase count
        await db.execute(
            'UPDATE "WorkflowTemplate" SET purchases = purchases + 1, revenue = revenue + $1 WHERE id = $2',
            [parseFloat(template[0].price || 0), templateId]
        );

        // Trigger automatic provisioning if price > 0
        if (parseFloat(template[0].price || 0) > 0) {
            // This will be handled by a separate provisioning endpoint
            // For now, we'll return the installation ID
        }

        return NextResponse.json({ 
            success: true, 
            installationId,
            status: 'pending'
        });
    } catch (error) {
        console.error('Error creating installation:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
