/** Workflow order pipeline — single source of truth for statuses & UI checklist */

export const ORDER_STATUS = {
    PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
    PROVISIONING: "PROVISIONING",
    INSTALLING_N8N: "INSTALLING_N8N",
    SERVER_READY: "SERVER_READY",
    WORKFLOW_IMPORTED: "WORKFLOW_IMPORTED",
    WAITING_CREDENTIALS: "WAITING_CREDENTIALS",
    CREDENTIALS_RECEIVED: "CREDENTIALS_RECEIVED",
    ADMIN_SETUP: "ADMIN_SETUP",
    TESTING: "TESTING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Ordered pipeline for progress comparison */
export const ORDER_PIPELINE: OrderStatus[] = [
    ORDER_STATUS.PAYMENT_RECEIVED,
    ORDER_STATUS.PROVISIONING,
    ORDER_STATUS.INSTALLING_N8N,
    ORDER_STATUS.SERVER_READY,
    ORDER_STATUS.WORKFLOW_IMPORTED,
    ORDER_STATUS.WAITING_CREDENTIALS,
    ORDER_STATUS.CREDENTIALS_RECEIVED,
    ORDER_STATUS.ADMIN_SETUP,
    ORDER_STATUS.TESTING,
    ORDER_STATUS.COMPLETED,
];

export const ORDER_CHECKLIST_LABELS = [
    "Payment received",
    "Creating server",
    "Installing n8n",
    "Importing workflow",
    "Waiting credentials",
    "Admin setup",
    "Testing",
    "Completed",
] as const;

/** Min pipeline index to mark checklist row i as complete */
const CHECKLIST_DONE_AT = [0, 2, 3, 4, 5, 6, 7, 8];
/** Pipeline index while row i is actively in progress */
const CHECKLIST_ACTIVE_AT = [0, 1, 2, 3, 4, 5, 6, 7];

export function statusIndex(status: string): number {
    const idx = ORDER_PIPELINE.indexOf(status as OrderStatus);
    if (idx >= 0) return idx;
    if (status === ORDER_STATUS.FAILED) return -1;
    return 0;
}

export function getOrderChecklist(status: string) {
    const idx = statusIndex(status);
    const failed = status === ORDER_STATUS.FAILED;

    return ORDER_CHECKLIST_LABELS.map((label, i) => {
        const done = !failed && idx >= CHECKLIST_DONE_AT[i];
        const currentPayment = !failed && i === 0 && idx === 0;
        const current = !failed && !done && i > 0 && idx === CHECKLIST_ACTIVE_AT[i];
        return { label, done: done || currentPayment, current };
    });
}

export function getAdminTabForStatus(status: string): string {
    switch (status) {
        case ORDER_STATUS.PAYMENT_RECEIVED:
            return "new";
        case ORDER_STATUS.PROVISIONING:
        case ORDER_STATUS.INSTALLING_N8N:
        case ORDER_STATUS.SERVER_READY:
        case ORDER_STATUS.WORKFLOW_IMPORTED:
            return "provisioning";
        case ORDER_STATUS.WAITING_CREDENTIALS:
            return "credentials";
        case ORDER_STATUS.CREDENTIALS_RECEIVED:
        case ORDER_STATUS.ADMIN_SETUP:
            return "setup";
        case ORDER_STATUS.TESTING:
            return "testing";
        case ORDER_STATUS.COMPLETED:
            return "completed";
        case ORDER_STATUS.FAILED:
            return "failed";
        default:
            return "new";
    }
}

export function formatOrderNumber(seq: number) {
    return `#${String(seq).padStart(4, "0")}`;
}

export function needsCredentialsAction(status: string) {
    return status === ORDER_STATUS.WAITING_CREDENTIALS;
}

export function isOrderComplete(status: string) {
    return status === ORDER_STATUS.COMPLETED;
}
