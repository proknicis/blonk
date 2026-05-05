import { db } from './db';

export type AuditEventType = 
    | 'login' 
    | 'logout' 
    | 'role_change' 
    | 'workspace_change' 
    | 'workflow_start' 
    | 'workflow_pause' 
    | 'workflow_approval' 
    | 'credential_connect' 
    | 'ticket_created' 
    | 'admin_change' 
    | 'failed_login';

export async function logAudit(userId: string, eventType: AuditEventType, target: string, metadata: any = {}) {
    try {
        await db.execute(
            `INSERT INTO "Event" ("userId", "eventType", "metadata", "source") 
             VALUES ($1, $2, $3, $4)`,
            [userId, eventType, JSON.stringify({ ...metadata, target }), 'audit_log']
        );
    } catch (error) {
        console.error('[Audit Log Failure]', { userId, eventType, error });
    }
}
