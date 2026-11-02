"use client";

import React, { useState, useMemo, useId } from "react";
import {
    GitBranch, Check, X, Plus, Search,
    MoreHorizontal, Pause, Play, Info, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import styles from "./registry.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkflowSummary {
    id: string;
    name: string;
    status: string;
    trigger: string | null;
    updatedAt: Date | string;
}

type RequestStatus = "Pending" | "In Review" | "Building" | "Ready" | "Rejected";

interface WorkflowRequest {
    ticketId: string;
    name: string;
    category: string;
    priority: string;
    submittedAt: string;
    status: RequestStatus;
}

const CATEGORIES = [
    "Sales & CRM", "Finance & Invoicing", "Operations", "Support",
    "Recruiting", "Marketing", "Compliance", "Admin & Internal",
];
const PRIORITIES = ["Standard (7–14 days)", "Expedited (3–5 days)", "Critical (1–2 days)"];
const STATUS_FILTERS = ["All", "active", "draft", "archived"];

const STATUS_BADGE_CLASS: Record<string, string> = {
    active: styles.badgeActive,
    draft: styles.badgeDraft,
    archived: styles.badgeArchived,
};

const REQUEST_BADGE_CLASS: Record<RequestStatus, string> = {
    Pending: styles.reqPending,
    "In Review": styles.reqInReview,
    Building: styles.reqBuilding,
    Ready: styles.reqReady,
    Rejected: styles.reqRejected,
};

function generateTicketId() {
    return "REQ-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegistryClient({ workflows }: { workflows: WorkflowSummary[] }) {
    // --- Workflow list state ---
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [pausedIds, setPausedIds] = useState<Set<string>>(new Set());
    const [inspectedId, setInspectedId] = useState<string | null>(null);

    // --- Form state ---
    const [form, setForm] = useState({
        name: "", category: "", priority: "",
        description: "", trigger: "", targetOutcome: "",
        integrations: "", dataPrivacyLevel: "standard",
    });
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});
    const [requests, setRequests] = useState<WorkflowRequest[]>([]);
    const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const descId = useId();
    const outcomeId = useId();

    // --- Filtered workflow list ---
    const filteredWorkflows = useMemo(() =>
        workflows.filter(wf => {
            const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || wf.status === statusFilter;
            return matchesSearch && matchesStatus;
        }),
    [workflows, searchQuery, statusFilter]);

    // --- Workflow actions ---
    const togglePause = (id: string) => {
        setPausedIds(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
        setOpenMenu(null);
    };

    const toggleInspect = (id: string) => {
        setInspectedId(prev => prev === id ? null : id);
        setOpenMenu(null);
    };

    // --- Form handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (formErrors[name as keyof typeof form]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
        setTagInput("");
    };

    const validate = () => {
        const errors: Partial<typeof form> = {};
        if (!form.name.trim()) errors.name = "Workflow name is required.";
        if (!form.category) errors.category = "Please select a category.";
        if (!form.description.trim()) errors.description = "Problem description is required.";
        return errors;
    };

    // Wire to /api/orders — creates a real DB-persisted order record.
    // Falls back to local-only ticket if the API call fails (surfaces the error honestly).
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

        setIsSubmitting(true);
        setSubmitError(null);

        let orderId: string | null = null;
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workflowName: form.name,
                    price: 0,
                    templateId: null,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                orderId = data.orderId;
            } else {
                // API returned an error — fall back to local, surface warning
                setSubmitError(`Request saved locally only. Backend: ${data.error || "Unknown error"}.`);
            }
        } catch (err: any) {
            setSubmitError(`Request saved locally only. Network: ${err.message || "Unreachable"}.`);
        }

        // Ticket ID: use orderId prefix if backend succeeded, else generate local
        const ticketId = orderId
            ? "REQ-" + orderId.toString().slice(0, 6).toUpperCase()
            : generateTicketId();

        const newRequest: WorkflowRequest = {
            ticketId,
            name: form.name,
            category: form.category,
            priority: form.priority || "Standard (7\u201314 days)",
            submittedAt: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
            status: "Pending",
        };
        setRequests(prev => [newRequest, ...prev]);
        setLastSubmitted(ticketId);
        setForm({ name: "", category: "", priority: "", description: "", trigger: "", targetOutcome: "", integrations: "", dataPrivacyLevel: "standard" });
        setTags([]);
        setFormErrors({});
        setIsSubmitting(false);
    };

    const handleClear = () => {
        setForm({ name: "", category: "", priority: "", description: "", trigger: "", targetOutcome: "", integrations: "", dataPrivacyLevel: "standard" });
        setTags([]);
        setFormErrors({});
        setLastSubmitted(null);
    };

    return (
        <main className={styles.container} aria-label="Workflow Registry and Request Management">
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Workflow Registry</h1>
                    <p className={styles.subtitle}>
                        View, inspect, and manage deployed workflow specs. Submit new custom workflow requests
                        directly to the BLONK engineering queue with full SLA tracking.
                    </p>
                </div>
                <div className={styles.headerStats}>
                    <span className={styles.statPill}>{workflows.length} Deployed</span>
                    {requests.length > 0 && <span className={styles.statPill}>{requests.length} Request{requests.length > 1 ? "s" : ""}</span>}
                </div>
            </header>

            {/* Deployed Workflows */}
            <section className={styles.listSection} aria-labelledby="deployed-heading">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle} id="deployed-heading">Deployed Workflows</h2>
                    {/* Search + filter */}
                    <div className={styles.listControls}>
                        <div className={styles.searchWrap} role="search">
                            <Search size={14} className={styles.searchIcon} aria-hidden="true" />
                            <input
                                type="search"
                                className={styles.searchInput}
                                placeholder="Search workflows..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                aria-label="Search deployed workflows"
                            />
                        </div>
                        <div className={styles.filterTabs} role="group" aria-label="Filter by status">
                            {STATUS_FILTERS.map(f => (
                                <button
                                    key={f}
                                    className={`${styles.filterTab} ${statusFilter === f ? styles.filterTabActive : ""}`}
                                    onClick={() => setStatusFilter(f)}
                                    aria-pressed={statusFilter === f}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredWorkflows.length === 0 ? (
                    <div className={styles.emptyWorkflows}>
                        {searchQuery || statusFilter !== "All"
                            ? `No workflows match "${searchQuery || statusFilter}".`
                            : "No workflows deployed yet. Submit a request below to get started."}
                    </div>
                ) : (
                    filteredWorkflows.map(wf => {
                        const isPaused = pausedIds.has(wf.id);
                        const effectiveStatus = isPaused ? "draft" : wf.status;
                        const isInspected = inspectedId === wf.id;
                        const isMenuOpen = openMenu === wf.id;

                        return (
                            <article
                                key={wf.id}
                                className={styles.workflowCard}
                                aria-label={`Workflow: ${wf.name}, Status: ${effectiveStatus}`}
                            >
                                <div className={styles.workflowCardMain}>
                                    <div className={styles.workflowIcon} aria-hidden="true">
                                        <GitBranch size={16} color="#10B981" />
                                    </div>
                                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                                        <div className={styles.workflowName}>{wf.name}</div>
                                        <div className={styles.workflowMeta}>
                                            Trigger: {wf.trigger || "Manual"} &middot; Updated: {new Date(wf.updatedAt).toLocaleDateString("en-GB")}
                                        </div>
                                    </div>
                                    <span className={`${styles.workflowBadge} ${STATUS_BADGE_CLASS[effectiveStatus] || styles.badgeArchived}`}>
                                        {isPaused ? "Paused" : effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)}
                                    </span>

                                    {/* Action menu */}
                                    <div className={styles.menuWrap}>
                                        <button
                                            className={styles.menuBtn}
                                            onClick={() => setOpenMenu(prev => prev === wf.id ? null : wf.id)}
                                            aria-label={`Actions for ${wf.name}`}
                                            aria-expanded={isMenuOpen}
                                            aria-haspopup="menu"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                        {isMenuOpen && (
                                            <div className={styles.dropdownMenu} role="menu" aria-label={`Actions for ${wf.name}`}>
                                                <button
                                                    className={styles.dropdownItem}
                                                    role="menuitem"
                                                    onClick={() => toggleInspect(wf.id)}
                                                >
                                                    <Info size={13} />
                                                    {isInspected ? "Hide Spec" : "Inspect Spec"}
                                                </button>
                                                <button
                                                    className={styles.dropdownItem}
                                                    role="menuitem"
                                                    onClick={() => togglePause(wf.id)}
                                                >
                                                    {isPaused ? <Play size={13} /> : <Pause size={13} />}
                                                    {isPaused ? "Resume" : "Pause"}
                                                </button>
                                                <button
                                                    className={styles.dropdownItem}
                                                    role="menuitem"
                                                    onClick={() => {
                                                        setForm(prev => ({ ...prev, name: `Update: ${wf.name}`, description: `Requesting updates to the deployed workflow: ${wf.name}` }));
                                                        setOpenMenu(null);
                                                        document.getElementById("request-form-section")?.scrollIntoView({ behavior: "smooth" });
                                                    }}
                                                >
                                                    <RefreshCw size={13} /> Request Update
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Inspect expanded spec */}
                                {isInspected && (
                                    <div className={styles.specPanel} role="region" aria-label={`Spec for ${wf.name}`}>
                                        <div className={styles.specGrid}>
                                            <div className={styles.specRow}><span className={styles.specKey}>Workflow ID</span><span className={styles.specVal}><code>{wf.id}</code></span></div>
                                            <div className={styles.specRow}><span className={styles.specKey}>Trigger</span><span className={styles.specVal}>{wf.trigger || "Manual"}</span></div>
                                            <div className={styles.specRow}><span className={styles.specKey}>Status</span><span className={styles.specVal}>{isPaused ? "Paused" : effectiveStatus}</span></div>
                                            <div className={styles.specRow}><span className={styles.specKey}>Last Updated</span><span className={styles.specVal}>{new Date(wf.updatedAt).toLocaleString("en-GB")}</span></div>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })
                )}
            </section>

            {/* My Requests */}
            {requests.length > 0 && (
                <section className={styles.requestsSection} aria-labelledby="my-requests-heading">
                    <h2 className={styles.sectionTitle} id="my-requests-heading">My Submitted Requests</h2>
                    <table className={styles.requestsTable} aria-label="Submitted workflow requests">
                        <thead>
                            <tr>
                                <th scope="col">Ticket</th>
                                <th scope="col">Workflow Name</th>
                                <th scope="col">Category</th>
                                <th scope="col">Priority</th>
                                <th scope="col">Submitted</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.ticketId}>
                                    <td><code className={styles.ticketId}>{req.ticketId}</code></td>
                                    <td style={{ fontWeight: 700, color: "#0F172A" }}>{req.name}</td>
                                    <td style={{ color: "#64748B" }}>{req.category}</td>
                                    <td style={{ color: "#64748B" }}>{req.priority.split(" ")[0]}</td>
                                    <td style={{ color: "#94A3B8", fontVariantNumeric: "tabular-nums" }}>{req.submittedAt}</td>
                                    <td>
                                        <span className={`${styles.requestBadge} ${REQUEST_BADGE_CLASS[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Request form */}
            <section id="request-form-section" className={styles.formSection} aria-labelledby="form-heading">
                <h2 className={styles.formTitle} id="form-heading">Submit Custom Workflow Request</h2>

                {lastSubmitted && (
                    <div className={styles.successBanner} role="status" aria-live="polite">
                        <Check size={16} aria-hidden="true" />
                        <div>
                            <strong>Request submitted — Ticket {lastSubmitted}</strong>
                            <br />
                            Your BLONK engineer will review and respond within the selected SLA window.
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate aria-label="Custom workflow request form">
                    <div className={styles.fieldGroup}>
                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="reg-name">
                                Workflow Name <span aria-hidden="true" style={{ color: "#EF4444" }}>*</span>
                            </label>
                            <input
                                id="reg-name" name="name" type="text"
                                className={`${styles.fieldInput} ${formErrors.name ? styles.fieldError : ""}`}
                                placeholder="e.g. Client Invoice Auto-Approval Loop"
                                value={form.name} onChange={handleChange}
                                required aria-required="true"
                                aria-invalid={!!formErrors.name}
                                aria-describedby={formErrors.name ? "name-error" : undefined}
                            />
                            {formErrors.name && <span id="name-error" className={styles.errorMsg} role="alert">{formErrors.name}</span>}
                        </div>
                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="reg-category">
                                Category <span aria-hidden="true" style={{ color: "#EF4444" }}>*</span>
                            </label>
                            <select
                                id="reg-category" name="category"
                                className={`${styles.fieldSelect} ${formErrors.category ? styles.fieldError : ""}`}
                                value={form.category} onChange={handleChange}
                                required aria-required="true"
                                aria-invalid={!!formErrors.category}
                                aria-describedby={formErrors.category ? "category-error" : undefined}
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {formErrors.category && <span id="category-error" className={styles.errorMsg} role="alert">{formErrors.category}</span>}
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="reg-trigger">Trigger Type</label>
                            <input id="reg-trigger" name="trigger" type="text" className={styles.fieldInput}
                                placeholder="e.g. Webhook, Schedule, Email receipt"
                                value={form.trigger} onChange={handleChange} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="reg-priority">Delivery Priority</label>
                            <select id="reg-priority" name="priority" className={styles.fieldSelect}
                                value={form.priority} onChange={handleChange}>
                                <option value="">Select priority</option>
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label className={styles.fieldLabel} htmlFor="reg-description">
                                Problem Description <span aria-hidden="true" style={{ color: "#EF4444" }}>*</span>
                            </label>
                            <textarea
                                id="reg-description" name="description"
                                className={`${styles.fieldTextarea} ${formErrors.description ? styles.fieldError : ""}`}
                                placeholder="Describe the current manual process or operational bottleneck this workflow should solve."
                                value={form.description} onChange={handleChange}
                                rows={4} required aria-required="true"
                                aria-invalid={!!formErrors.description}
                                aria-describedby={`${descId}${formErrors.description ? " description-error" : ""}`}
                            />
                            <span id={descId} className={styles.fieldHint}>Be specific about inputs, outputs, and systems involved.</span>
                            {formErrors.description && <span id="description-error" className={styles.errorMsg} role="alert">{formErrors.description}</span>}
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label className={styles.fieldLabel} htmlFor="reg-outcome">Target Outcome</label>
                            <textarea id="reg-outcome" name="targetOutcome" className={styles.fieldTextarea}
                                placeholder="What does success look like? What is the expected output or automated action?"
                                value={form.targetOutcome} onChange={handleChange}
                                rows={3}
                                aria-describedby={outcomeId}
                            />
                            <span id={outcomeId} className={styles.fieldHint}>Include measurable success criteria where possible.</span>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="reg-integrations">Required Integrations</label>
                            <input id="reg-integrations" name="integrations" type="text" className={styles.fieldInput}
                                placeholder="e.g. Salesforce, Stripe, Slack, Google Sheets"
                                value={form.integrations} onChange={handleChange} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="reg-privacy">Data Privacy Level</label>
                            <select id="reg-privacy" name="dataPrivacyLevel" className={styles.fieldSelect}
                                value={form.dataPrivacyLevel} onChange={handleChange}>
                                <option value="standard">Standard</option>
                                <option value="confidential">Confidential (no external APIs)</option>
                                <option value="restricted">Restricted (air-gapped only)</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className={styles.fieldGroup}>
                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label className={styles.fieldLabel} htmlFor="reg-tag-input">Labels / Tags</label>
                            {tags.length > 0 && (
                                <div className={styles.tagsRow} role="list" aria-label="Selected tags">
                                    {tags.map(t => (
                                        <span key={t} className={styles.tag} role="listitem">
                                            {t}
                                            <button type="button" className={styles.tagRemove}
                                                onClick={() => setTags(prev => prev.filter(x => x !== t))}
                                                aria-label={`Remove tag ${t}`}><X size={11} /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "8px" }}>
                                <input id="reg-tag-input" type="text" className={styles.fieldInput}
                                    placeholder="Add tag and press Enter"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                    style={{ flexGrow: 1 }} />
                                <button type="button" onClick={addTag} className={styles.btnSecondary}
                                    aria-label="Add tag" style={{ flexShrink: 0, padding: "0 12px" }}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Backend error banner — surfaces API failures honestly */}
                    {submitError && (
                        <div style={{
                            display: "flex", alignItems: "flex-start", gap: "8px",
                            background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E",
                            borderRadius: "8px", padding: "10px 14px",
                            fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.45,
                            marginBottom: "12px",
                        }} role="alert" aria-live="assertive">
                            {submitError}
                        </div>
                    )}

                    <div className={styles.formActions}>
                        <button type="button" className={styles.btnSecondary} onClick={handleClear} aria-label="Clear form">
                            Clear
                        </button>
                        <button
                            type="submit"
                            className={styles.btnPrimary}
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                            aria-label={isSubmitting ? "Submitting request..." : "Submit workflow request"}
                        >
                            <Check size={14} aria-hidden="true" />
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
