import { db } from './db';
import { logAudit } from './audit';
import { v4 as uuidv4 } from 'uuid';

// ==========================================
// 1. GLOBAL STATE TYPES & ENUMS
// ==========================================
export type ExecutionState = 
    | 'Pending'
    | 'Queued'
    | 'Provisioning'
    | 'Running'
    | 'Waiting_Approval'
    | 'Retrying'
    | 'Completed'
    | 'Cancelled'
    | 'Failed'
    | 'Timed_Out';

export interface ExecutionEventPayload {
    executionId: string;
    workflowId: string;
    teamId: string;
    state: ExecutionState;
    timestamp: Date;
    processName?: string;
    duration?: number;
    metrics?: any;
    activity?: any;
    reasoning?: string;
    steps?: string[];
    outputs?: any;
    memory?: {
        shortTerm?: any;
        execution?: any;
        longTerm?: any;
    };
    error?: string;
}

type EventHandler = (payload: ExecutionEventPayload) => Promise<void> | void;

// ==========================================
// 2. STATE TRANSITION RULES
// ==========================================
const VALID_TRANSITIONS: Record<ExecutionState, ExecutionState[]> = {
    'Pending': ['Queued', 'Provisioning', 'Cancelled'],
    'Queued': ['Provisioning', 'Running', 'Cancelled'],
    'Provisioning': ['Running', 'Failed', 'Cancelled'],
    'Running': ['Waiting_Approval', 'Retrying', 'Completed', 'Failed', 'Timed_Out', 'Cancelled'],
    'Waiting_Approval': ['Running', 'Cancelled', 'Completed', 'Failed'],
    'Retrying': ['Running', 'Failed', 'Timed_Out', 'Cancelled'],
    'Completed': [],
    'Cancelled': [],
    'Failed': [],
    'Timed_Out': ['Retrying', 'Failed']
};

export class ExecutionStateMachine {
    static canTransition(current: ExecutionState, next: ExecutionState): boolean {
        return VALID_TRANSITIONS[current]?.includes(next) || false;
    }
}

// ==========================================
// 3. SECURE CREDENTIAL VAULT (AES REFERENCE ENVELOPE)
// ==========================================
class CredentialVault {
    private tokenStore = new Map<string, { credentialId: string; expiry: Date }>();

    /**
     * Issues a short-lived temporary token representing a vault credential reference.
     */
    issueTemporaryToken(credentialId: string, ttlSeconds = 600): string {
        const token = `tok_ref_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
        const expiry = new Date(Date.now() + ttlSeconds * 1000);
        this.tokenStore.set(token, { credentialId, expiry });
        return token;
    }

    /**
     * Resolves token to credential reference. Keeps secrets in vault until execution check.
     */
    resolveToken(token: string): { credentialId: string } | null {
        const record = this.tokenStore.get(token);
        if (!record) return null;
        if (record.expiry < new Date()) {
            this.tokenStore.delete(token);
            return null;
        }
        return { credentialId: record.credentialId };
    }
}

export const credentialVault = new CredentialVault();

// ==========================================
// 4. LAYERED MEMORY SYSTEM (AI KNOWLEDGE ENGINE)
// ==========================================
class LayeredMemorySystem {
    /**
     * Commit short-term conversation context, local execution logs, and long-term reflection lessons.
     */
    async commitMemory(payload: ExecutionEventPayload) {
        const { executionId, teamId, memory } = payload;
        if (!memory) return;

        try {
            // Log memory commit sequence
            await db.execute(
                `INSERT INTO "Event" ("userId", "eventType", "metadata", "source") 
                 VALUES ($1, $2, $3, $4)`,
                [
                    null, // System level event
                    'ai_analysis_completed', 
                    JSON.stringify({ 
                        executionId,
                        memoryCommit: {
                            shortTermCount: Object.keys(memory.shortTerm || {}).length,
                            executionStepCount: (payload.steps || []).length,
                            longTermReflection: memory.longTerm?.lessonsLearned || "None"
                        }
                    }),
                    'memory_system'
                ]
            );
        } catch (e) {
            console.error("[MemorySystem] Failed to write trace:", e);
        }
    }
}

export const memorySystem = new LayeredMemorySystem();

// ==========================================
// 5. EVENT BUS ARCHITECTURE (DECOUPLED HANDLERS)
// ==========================================
class AutomationEventBus {
    private handlers: Record<string, EventHandler[]> = {};

    subscribe(eventType: string, handler: EventHandler) {
        if (!this.handlers[eventType]) {
            this.handlers[eventType] = [];
        }
        this.handlers[eventType].push(handler);
    }

    unsubscribe(eventType: string, handler: EventHandler) {
        if (this.handlers[eventType]) {
            this.handlers[eventType] = this.handlers[eventType].filter(h => h !== handler);
        }
    }

    async dispatch(eventType: string, payload: ExecutionEventPayload) {
        const eventHandlers = this.handlers[eventType] || [];
        
        // Execute handlers in parallel to decoupling the main loop
        await Promise.allSettled(
            eventHandlers.map(handler => {
                try {
                    return Promise.resolve(handler(payload));
                } catch (e) {
                    console.error(`[EventBus] Error in handler for event ${eventType}:`, e);
                    return Promise.reject(e);
                }
            })
        );
    }
}

export const automationEventBus = new AutomationEventBus();

// ==========================================
// 6. EVENT BUS HANDLERS LISTENING SETUP
// ==========================================

// Listener 1: Notification Manager
automationEventBus.subscribe('execution.completed', async (payload) => {
    await db.execute(
        `INSERT INTO "Notification" (id, title, message, "teamId", "createdAt") 
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [
            uuidv4(),
            `Automation Completed: ${payload.processName || 'Loop Task'}`,
            `Execution Completed Successfully (Duration: ${payload.duration || 0}s). Reflection memory stored.`,
            payload.teamId
        ]
    );
});

automationEventBus.subscribe('execution.failed', async (payload) => {
    await db.execute(
        `INSERT INTO "Notification" (id, title, message, "teamId", "createdAt") 
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [
            uuidv4(),
            `Automation Failed: ${payload.processName || 'Loop Task'}`,
            `Execution interrupted: ${payload.error || 'System Fault'}.`,
            payload.teamId
        ]
    );
});

// Listener 2: Audit Logs Logger
automationEventBus.subscribe('execution.completed', async (payload) => {
    await logAudit(
        '00000000-0000-0000-0000-000000000000', // System user UUID
        'ai_analysis_completed', 
        payload.workflowId, 
        { executionId: payload.executionId, status: 'success', duration: payload.duration }
    );
});

automationEventBus.subscribe('execution.failed', async (payload) => {
    await logAudit(
        '00000000-0000-0000-0000-000000000000', 
        'ai_analysis_completed', 
        payload.workflowId, 
        { executionId: payload.executionId, status: 'failed', error: payload.error }
    );
});

// Listener 3: Memory committing reflection
automationEventBus.subscribe('execution.completed', async (payload) => {
    await memorySystem.commitMemory(payload);
});

// ==========================================
// 7. TASK QUEUE & HEARBEAT TIMEOUT MONITOR
// ==========================================
class ExecutionQueue {
    private queue: ExecutionEventPayload[] = [];
    private activeWorkers = 0;
    private maxWorkers = 5;

    async push(payload: ExecutionEventPayload) {
        payload.state = 'Queued';
        this.queue.push(payload);
        
        await automationEventBus.dispatch('execution.queued', payload);
        this.processQueue();
    }

    private async processQueue() {
        if (this.activeWorkers >= this.maxWorkers || this.queue.length === 0) return;

        this.activeWorkers++;
        const payload = this.queue.shift()!;
        
        try {
            payload.state = 'Running';
            await automationEventBus.dispatch('execution.started', payload);
            
            // Expected task runner execution loop...
            // Trigger n8n/Workers nodes...
        } catch (e) {
            payload.state = 'Failed';
            payload.error = String(e);
            await automationEventBus.dispatch('execution.failed', payload);
        } finally {
            this.activeWorkers--;
            this.processQueue();
        }
    }

    /**
     * Timeout checker checks for stale RUNNING executions with missing callbacks.
     */
    async monitorHeartbeats() {
        // Checks database for workflows stuck in Running status with long delays
        try {
            const staleRuns = await db.query(
                `SELECT wl.id, wl."workflowId", wl."teamId", wl."workflowName"
                 FROM "WorkflowLog" wl
                 WHERE wl.status = 'active' AND wl."createdAt" < NOW() - INTERVAL '15 minutes'`
            ) as any[];

            for (const run of staleRuns) {
                const payload: ExecutionEventPayload = {
                    executionId: run.id,
                    workflowId: run.workflowId,
                    teamId: run.teamId,
                    state: 'Timed_Out',
                    timestamp: new Date(),
                    processName: run.workflowName,
                    error: 'Execution Timed Out: Missing response heartbeat.'
                };

                // Dispatch timed out event
                await automationEventBus.dispatch('execution.failed', payload);
            }
        } catch (e) {
            console.error('[HeartbeatMonitor] Error scanning timeouts:', e);
        }
    }
}

export const executionQueue = new ExecutionQueue();

// ==========================================
// 8. AI AGENT ORCHESTRATOR & PLANNER SYSTEM
// ==========================================
export class AgentOrchestrator {
    /**
     * Evaluates active credentials, Company Brain scopes, selects subagents planner.
     */
    static async resolvePlan(workflowId: string, teamId: string): Promise<{
        aiEmployees: string[];
        brainPermissions: string[];
        credentialsRef: string[];
    }> {
        const wfResult = await db.query(`
            SELECT w.*, wt."productInfo" 
            FROM "Workflow" w
            LEFT JOIN "WorkflowTemplate" wt ON w."templateId" = wt.id
            WHERE w.id = $1 AND w."teamId" = $2
        `, [workflowId, teamId]) as any[];

        if (!wfResult.length) {
            return { aiEmployees: [], brainPermissions: [], credentialsRef: [] };
        }

        const productInfo = typeof wfResult[0].productInfo === 'string'
            ? JSON.parse(wfResult[0].productInfo)
            : wfResult[0].productInfo || {};

        const brainPermissions = productInfo.brainPermissions || ["CRM"];
        const aiEmployees = productInfo.aiEmployees || ["Supervisor"];

        // Resolve Vault References instead of exposing keys
        const creds = await db.query(`
            SELECT id, provider FROM "credentials" 
            WHERE "user_id" IN (SELECT id FROM "User" WHERE "teamId" = $1)
        `, [teamId]) as any[];

        const credentialsRef = creds.map((c: any) => 
            credentialVault.issueTemporaryToken(c.id)
        );

        return {
            aiEmployees,
            brainPermissions,
            credentialsRef
        };
    }
}
