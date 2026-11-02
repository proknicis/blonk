/**
 * Strict provisioning state machine statuses for Team.provisioningStatus
 */
export const PROVISIONING_STATUS = {
    UNASSIGNED: "UNASSIGNED",
    QUEUED: "QUEUED",
    RESERVED: "RESERVED",
    PREPARING: "PREPARING",
    READY: "READY",
    ACTIVE: "ACTIVE",
    DEGRADED: "DEGRADED",
    FAILED: "FAILED",
} as const;

export type ProvisioningStatus = typeof PROVISIONING_STATUS[keyof typeof PROVISIONING_STATUS];

const VALID_TRANSITIONS: Record<ProvisioningStatus, ProvisioningStatus[]> = {
    UNASSIGNED: ["QUEUED", "RESERVED"],
    QUEUED: ["RESERVED"],
    RESERVED: ["PREPARING", "QUEUED", "FAILED"],
    PREPARING: ["READY", "FAILED"],
    READY: ["ACTIVE", "DEGRADED", "FAILED"],
    ACTIVE: ["DEGRADED", "READY"],
    DEGRADED: ["READY", "ACTIVE", "FAILED"],
    FAILED: ["RESERVED", "QUEUED", "READY"]
};

export function isValidProvisioningTransition(from: ProvisioningStatus, to: ProvisioningStatus): boolean {
    if (from === to) return true;
    const allowed = VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
}

