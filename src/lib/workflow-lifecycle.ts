/** Canonical workflow statuses for marketplace purchase → ready pipeline */

export const WORKFLOW_STATUS = {
    ORDERED: "Ordered",
    PROVISIONING: "Provisioning",
    AWAITING_CREDENTIALS: "Awaiting_Credentials",
    AWAITING_ADMIN_SETUP: "Awaiting_Admin_Setup",
    READY: "Ready",
    ACTIVE: "Active",
    RUNNING: "Running",
    PAUSED: "Paused",
    FAILED: "Failed",
    ERROR: "Error",
    /** @deprecated legacy — treated as Awaiting_Credentials */
    PROVISIONED: "Provisioned",
} as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUS)[keyof typeof WORKFLOW_STATUS];

export const LIFECYCLE_STEPS = [
    { id: 1, key: "order", label: "Order placed" },
    { id: 2, key: "payment", label: "Payment confirmed" },
    { id: 3, key: "server", label: "Server ready" },
    { id: 4, key: "credentials", label: "Credentials added" },
    { id: 5, key: "admin", label: "Admin setup" },
    { id: 6, key: "ready", label: "Workflow ready" },
] as const;

export function normalizeRequirements(value: unknown): Array<Record<string, unknown>> {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter((item) => item && typeof item === "object") as Array<Record<string, unknown>>;
    if (typeof value === "string") {
        try {
            return normalizeRequirements(JSON.parse(value));
        } catch {
            return [];
        }
    }
    return [];
}

export function getRequirementName(req: Record<string, unknown>) {
    return String(req.service || req.app || req.name || req.label || req.type || "").trim().toLowerCase();
}

function normalizeStatus(status: string | null | undefined): string {
    const s = status || WORKFLOW_STATUS.ORDERED;
    if (s === WORKFLOW_STATUS.PROVISIONED) return WORKFLOW_STATUS.AWAITING_CREDENTIALS;
    return s;
}

/** Which lifecycle step (1–6) the workflow is currently on */
export function getLifecycleStepIndex(status: string, hasServer: boolean, credentialsComplete: boolean): number {
    const s = normalizeStatus(status);

    if (s === WORKFLOW_STATUS.FAILED || s === WORKFLOW_STATUS.ERROR) return 3;

    if ([WORKFLOW_STATUS.ACTIVE, WORKFLOW_STATUS.RUNNING].includes(s as any)) return 6;
    if (s === WORKFLOW_STATUS.READY) return 6;
    if (s === WORKFLOW_STATUS.AWAITING_ADMIN_SETUP) return 5;
    if (s === WORKFLOW_STATUS.AWAITING_CREDENTIALS) return credentialsComplete ? 5 : 4;
    if (s === WORKFLOW_STATUS.PROVISIONING) return hasServer ? 3 : 2;
    if (s === WORKFLOW_STATUS.ORDERED) return 2;

    if (["Active", "Running", "Success", "Completed", "Published"].includes(s)) return 6;
    return 2;
}

export function mapWorkflowToUi(
    status: string | null | undefined,
    opts?: { hasServer?: boolean; credentialsComplete?: boolean; n8nWorkflowId?: string | null }
) {
    const s = normalizeStatus(status);
    const hasServer = !!opts?.hasServer;
    const credentialsComplete = !!opts?.credentialsComplete;
    const stepIndex = getLifecycleStepIndex(s, hasServer, credentialsComplete);
    const progressPercent = Math.round((stepIndex / LIFECYCLE_STEPS.length) * 100);

    let displayStatus = "In progress";
    let statusKey: "running" | "failed" | "needs_setup" | "idle" | "in_progress" = "in_progress";
    let actionLabel = "View progress";
    let actionHref = "/dashboard/incidents";

    if (s === WORKFLOW_STATUS.FAILED || s === WORKFLOW_STATUS.ERROR) {
        displayStatus = "Failed";
        statusKey = "failed";
        actionLabel = "View details";
    } else if (s === WORKFLOW_STATUS.AWAITING_CREDENTIALS) {
        displayStatus = "Add credentials";
        statusKey = "needs_setup";
        actionLabel = "Add credentials";
        actionHref = "/dashboard/integrations";
    } else if (s === WORKFLOW_STATUS.PROVISIONING || s === WORKFLOW_STATUS.ORDERED) {
        displayStatus = s === WORKFLOW_STATUS.PROVISIONING ? "Provisioning server" : "Payment confirmed";
        statusKey = "in_progress";
        actionLabel = "Track progress";
    } else if (s === WORKFLOW_STATUS.AWAITING_ADMIN_SETUP) {
        displayStatus = "Admin configuring";
        statusKey = "in_progress";
        actionLabel = "Track progress";
    } else if (s === WORKFLOW_STATUS.READY || opts?.n8nWorkflowId) {
        displayStatus = "Ready";
        statusKey = "idle";
        actionLabel = "Start";
    } else if ([WORKFLOW_STATUS.ACTIVE, WORKFLOW_STATUS.RUNNING, "Running", "Success", "Completed"].includes(s)) {
        displayStatus = "Running";
        statusKey = "running";
        actionLabel = "Pause";
    } else if (s === WORKFLOW_STATUS.PAUSED) {
        displayStatus = "Paused";
        statusKey = "idle";
        actionLabel = "Start";
    }

    const steps = LIFECYCLE_STEPS.map((step) => ({
        ...step,
        state: step.id < stepIndex ? "done" : step.id === stepIndex ? "current" : "upcoming",
    })) as Array<(typeof LIFECYCLE_STEPS)[number] & { state: "done" | "current" | "upcoming" }>;

    const currentStep = LIFECYCLE_STEPS.find((st) => st.id === stepIndex) || LIFECYCLE_STEPS[0];

    return {
        displayStatus,
        statusKey,
        actionLabel,
        actionHref,
        stepIndex,
        progressPercent,
        steps,
        currentStepLabel: currentStep.label,
        rawStatus: s,
    };
}
