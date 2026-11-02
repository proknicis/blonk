"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Search, Filter, Layers, Clock, Database, ChevronRight, 
    CheckCircle, AlertTriangle, Info, Mail, Trash2, ArrowRight,
    RefreshCw, ShieldAlert, Zap
} from "lucide-react";
import adminStyles from "../admin.module.css";

const BLUEPRINT_REQUIRED_TOOLS: Record<string, string[]> = {
    'invoice-parsing-billing': ['Gmail', 'OpenAI', 'Google Sheets'],
    'outbound-enrichment': ['Slack', 'OpenAI', 'Apollo.io'],
    'customer-intake-sync': ['Hubspot', 'Slack', 'Gmail'],
    'expense-compliance-audit': ['Gmail', 'OpenAI', 'Stripe'],
    'talent-screening-pipeline': ['Slack', 'OpenAI', 'Google Sheets'],
    'automated-contract-review': ['Stripe', 'Gmail', 'Slack'],
    'support-ticket-routing': ['Gmail', 'Slack', 'OpenAI'],
    'document-knowledge-search': ['Google Drive', 'Slack', 'Notion'],
    'devops-alert-triaging': ['Gmail', 'Slack', 'Jira'],
    'lead-nurturing-agent': ['Slack', 'OpenAI', 'Gmail'],
    'client-onboarding-tracker': ['Gmail', 'Slack', 'Google Sheets'],
    'subscription-churn-alert': ['Stripe', 'OpenAI', 'Slack'],
    'legal-contract-generator': ['Gmail', 'OpenAI', 'Slack'],
    'translation-localization': ['OpenAI', 'Google Sheets', 'Slack'],
    'social-media-scheduler': ['Gmail', 'Slack', 'OpenAI'],
    'it-asset-tracker': ['Gmail', 'OpenAI', 'Slack'],
    'compliance-reporting': ['OpenAI', 'Slack', 'Gmail'],
    'employee-performance-tracker': ['Gmail', 'OpenAI', 'Google Sheets'],
    'content-marketing-generator': ['Gmail', 'OpenAI', 'Slack'],
    'billing-collections-reminder': ['Slack', 'Stripe', 'Gmail'],
    'product-release-notifier': ['Slack', 'OpenAI', 'Gmail']
};

function getClientLifecycle(client: any) {
    if (client.onboardingStatus !== 'COMPLETED') return 'draft';
    
    const workflows = client.workflowsUsed || [];
    const hasFailedWorkflow = workflows.some((w: any) => w.status?.toLowerCase() === 'error' || w.status?.toLowerCase() === 'failed');
    if (hasFailedWorkflow) return 'failed';

    const status = client.activationStatus || 'NOT_STARTED';
    
    if (status === 'ACTIVATED') return 'deployed';
    if (status === 'DEPLOYING') return 'provisioning';
    if (status === 'READY_FOR_DEPLOY') return 'ready for review';
    if (status === 'CONNECTIONS_IN_PROGRESS') return 'awaiting credentials';
    if (status === 'SUMMARY_READY' || status === 'WORKFLOW_SELECTED') return 'matched';
    
    if (client.status === 'Suspended') return 'needs intervention';
    return 'draft';
}

export default function WorkspacesPage() {
    const router = useRouter();
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    
    // Filters states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [employeeFilter, setEmployeeFilter] = useState("All");
    const [integrationsFilter, setIntegrationsFilter] = useState("All"); // All, Ready (all connected), Pending (some missing)
    const [approvalFilter, setApprovalFilter] = useState("All"); // All, Has Pending, No Pending

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const usersRes = await fetch("/api/admin/users");
            if (usersRes.ok) {
                const data = await usersRes.json();
                const filtered = data.filter((w: any) => w.role !== "SuperAdmin");
                setWorkspaces(filtered);
            }

            const approvalsRes = await fetch("/api/admin/approvals");
            if (approvalsRes.ok) {
                const data = await approvalsRes.json();
                setApprovals(data);
            }
        } catch (e) {
            console.error("Failed to load workspaces page data:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const filterParam = params.get("filter");
            if (filterParam) {
                if (filterParam.toLowerCase() === 'provisioning') {
                    setStatusFilter("Provisioning");
                } else if (filterParam.toLowerCase() === 'awaiting credentials') {
                    setStatusFilter("Awaiting Credentials");
                }
            }
        }
    }, []);

    // Actions
    const resetWorkspaceActivation = async (workspaceId: string) => {
        if (!confirm("Are you sure you want to reset this client's onboarding & activation state?")) return;
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "RESET_ACTIVATION", id: workspaceId })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Workspace state reset successfully.", "success");
                await fetchInitialData();
            } else {
                alert("Failed to reset activation status.");
            }
        } catch (err) {
            console.error("Action reset failed:", err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const forceRetryProvisioning = async (workspace: any) => {
        if (!confirm(`Trigger provisioning build for workspace "${workspace.firmName || workspace.name}"?`)) return;
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workflowName: workspace.workflowsUsed?.[0]?.name || "Autonomous Loop",
                    price: 0,
                    templateId: workspace.selectedWorkflowId
                })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Provisioning container loop re-triggered.", "success");
                await fetchInitialData();
            } else {
                alert("Failed to re-trigger provisioning.");
            }
        } catch (err) {
            console.error("Provisioning re-trigger failed:", err);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Filter logic
    const filteredWorkspaces = workspaces.filter(w => {
        // 1. Search term (company, email, workspace owner name)
        const matchesSearch = 
            (w.firmName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (w.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (w.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // 2. Status lifecycle filter
        const state = getClientLifecycle(w);
        if (statusFilter !== "All" && state.toLowerCase() !== statusFilter.toLowerCase()) return false;

        // 3. AI Employee filter
        if (employeeFilter !== "All" && (w.aiEmployee || "Unselected").toLowerCase() !== employeeFilter.toLowerCase()) return false;

        // 4. Integrations readiness filter
        const blueprintKey = w.selectedWorkflowId || "";
        const reqTools = BLUEPRINT_REQUIRED_TOOLS[blueprintKey] || [];
        const connCreds = w.connectedCredentials || [];
        const connCredNames = connCreds.map((c: any) => c.provider.toLowerCase());
        const allConnected = reqTools.length > 0 && reqTools.every(t => connCredNames.includes(t.toLowerCase()));
        
        if (integrationsFilter === "Ready" && !allConnected) return false;
        if (integrationsFilter === "Pending" && allConnected) return false;

        // 5. Approval state filter
        const hasPendingApproval = approvals.some(a => a.teamId === w.teamId && a.status === 'PENDING');
        if (approvalFilter === "Pending" && !hasPendingApproval) return false;
        if (approvalFilter === "None" && hasPendingApproval) return false;

        return true;
    });

    // Distinct AI Employee list
    const aiEmployeesList = Array.from(new Set(workspaces.map(w => w.aiEmployee || "Unselected")));

    const lifecycleBadgeColors: Record<string, { bg: string, color: string }> = {
        deployed: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
        provisioning: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' },
        'ready for review': { bg: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' },
        'awaiting credentials': { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
        matched: { bg: 'rgba(75, 85, 99, 0.15)', color: 'var(--muted-foreground)' },
        failed: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' },
        'needs intervention': { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' },
        draft: { bg: 'rgba(156, 163, 175, 0.15)', color: 'var(--muted-foreground)' }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* SEARCH AND FILTERS BAR */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--card)", padding: "24px", borderRadius: "24px", border: "1px solid var(--border)" }}>
                
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input 
                            type="text" 
                            placeholder="Search company, owner name, or contact email..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1px solid var(--border)', paddingLeft: '42px', fontSize: '0.85rem', fontWeight: 750, outline: 'none', background: 'var(--muted)', color: 'var(--foreground)' }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    
                    {/* Status filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Lifecycle Status</span>
                        <select 
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All States</option>
                            <option value="Deployed">Deployed</option>
                            <option value="Provisioning">Provisioning</option>
                            <option value="Ready for Review">Ready for Review</option>
                            <option value="Awaiting Credentials">Awaiting Credentials</option>
                            <option value="Matched">Matched</option>
                            <option value="Failed">Failed</option>
                            <option value="Needs Intervention">Needs Intervention</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>

                    {/* AI Employee filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>AI Employee</span>
                        <select 
                            value={employeeFilter} 
                            onChange={e => setEmployeeFilter(e.target.value)}
                            style={{ height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All Employees</option>
                            {aiEmployeesList.map((emp, i) => (
                                <option key={i} value={emp}>{emp}</option>
                            ))}
                        </select>
                    </div>

                    {/* Integrations readiness filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Integrations Sync</span>
                        <select 
                            value={integrationsFilter} 
                            onChange={e => setIntegrationsFilter(e.target.value)}
                            style={{ height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All Mappings</option>
                            <option value="Ready">All Connected</option>
                            <option value="Pending">Link Pending</option>
                        </select>
                    </div>

                    {/* Approvals filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Approval Queue</span>
                        <select 
                            value={approvalFilter} 
                            onChange={e => setApprovalFilter(e.target.value)}
                            style={{ height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All Queues</option>
                            <option value="Pending">Awaiting Override</option>
                            <option value="None">No Pending Override</option>
                        </select>
                    </div>

                </div>

            </div>

            {/* DENSE GRID TABLE CARD */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                <div style={{ overflowX: "auto" }}>
                    {isLoading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: "48px", background: "var(--muted)", borderRadius: "10px", animation: "pulse 1.5s infinite" }} />
                            ))}
                        </div>
                    ) : filteredWorkspaces.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "240px", color: "var(--muted-foreground)" }}>
                            <Layers size={36} style={{ opacity: 0.5, marginBottom: "12px" }} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>No workspaces found matching filters.</span>
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                             <thead>
                                <tr>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Customer (Company &amp; Lead)</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Billing Plan</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Assigned Server</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>AI Employees</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Integrations Sync</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Last Active</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'right' }}>Actions Override</th>
                                </tr>
                             </thead>
                             <tbody>
                                 {filteredWorkspaces.map((ws) => {
                                     const lifecycle = getClientLifecycle(ws);
                                     const badge = lifecycleBadgeColors[lifecycle] || { bg: 'var(--muted)', color: 'var(--foreground)' };
                                     
                                     const blueprintKey = ws.selectedWorkflowId || "";
                                     const reqTools = BLUEPRINT_REQUIRED_TOOLS[blueprintKey] || [];
                                     const connCreds = ws.connectedCredentials || [];
                                     const connCredNames = connCreds.map((c: any) => c.provider.toLowerCase());

                                     const hasPendingApproval = approvals.some(a => a.teamId === ws.teamId && a.status === 'PENDING');

                                     return (
                                         <tr 
                                             key={ws.id} 
                                             onClick={() => router.push(`/admin/workspaces/${ws.id}`)}
                                             style={{ background: "var(--muted)", cursor: "pointer", transition: "opacity 0.2s" }}
                                             onMouseEnter={(e) => e.currentTarget.style.opacity = '0.95'}
                                             onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                         >
                                             {/* Company & Lead */}
                                             <td style={{ padding: "16px", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}>
                                                 <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--foreground)" }}>
                                                     {ws.firmName || "Sovereign Firm"}
                                                 </div>
                                                 <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                                     {ws.name || ws.email}
                                                 </div>
                                             </td>

                                             {/* Billing Plan */}
                                             <td style={{ padding: "16px", fontSize: "0.8rem", fontWeight: 800 }}>
                                                 <span style={{ 
                                                     fontSize: "0.65rem", 
                                                     fontWeight: 950, 
                                                     padding: "4px 8px", 
                                                     borderRadius: "6px",
                                                     background: "rgba(15, 23, 42, 0.05)",
                                                     color: "var(--foreground)"
                                                 }}>
                                                     {ws.tier || "Starter"}
                                                 </span>
                                             </td>

                                             {/* Assigned Server */}
                                             <td style={{ padding: "16px", fontSize: "0.8rem", fontWeight: 800 }}>
                                                 {ws.serverName ? (
                                                     <span style={{ color: "var(--accent)" }}>{ws.serverName}</span>
                                                 ) : (
                                                     <span style={{ color: "var(--muted-foreground)" }}>None / Unallocated</span>
                                                 )}
                                             </td>

                                             {/* AI Employees count */}
                                             <td style={{ padding: "16px", fontSize: "0.8rem", fontWeight: 900 }}>
                                                 <span style={{ 
                                                     fontSize: "0.75rem", 
                                                     fontWeight: 900,
                                                     color: (ws.activeEmployeesCount || 0) > 0 ? "var(--foreground)" : "var(--muted-foreground)"
                                                 }}>
                                                     {ws.activeEmployeesCount || 0} active
                                                 </span>
                                             </td>

                                             {/* Status */}
                                             <td style={{ padding: "16px" }}>
                                                 <span style={{ 
                                                     fontSize: "0.65rem", 
                                                     fontWeight: 950, 
                                                     padding: "4px 10px", 
                                                     borderRadius: "100px",
                                                     background: ws.status === 'Active' ? 'rgba(16, 185, 129, 0.12)' : ws.status === 'Suspended' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)', 
                                                     color: ws.status === 'Active' ? '#10B981' : ws.status === 'Suspended' ? '#EF4444' : '#F59E0B', 
                                                     textTransform: "uppercase"
                                                 }}>
                                                     {ws.status || "Active"}
                                                 </span>
                                             </td>

                                            {/* Integrations checklist */}
                                            <td style={{ padding: "16px" }}>
                                                {reqTools.length > 0 ? (
                                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                        {reqTools.map((tool, tIdx) => {
                                                            const isConnected = connCredNames.includes(tool.toLowerCase());
                                                            return (
                                                                <span 
                                                                    key={tIdx} 
                                                                    style={{ 
                                                                        fontSize: '0.6rem', 
                                                                        padding: '2px 6px', 
                                                                        borderRadius: '4px', 
                                                                        background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                                                                        color: isConnected ? '#10B981' : '#EF4444',
                                                                        border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.1)'}`,
                                                                        fontWeight: 900
                                                                    }}
                                                                >
                                                                    {tool}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>—</span>
                                                )}
                                            </td>

                                            {/* Approval pending status */}
                                            <td style={{ padding: "16px" }}>
                                                {hasPendingApproval ? (
                                                    <span style={{ 
                                                        fontSize: "0.65rem", 
                                                        fontWeight: 950, 
                                                        padding: "4px 10px", 
                                                        borderRadius: "4px",
                                                        background: "rgba(239, 68, 68, 0.15)",
                                                        color: "#EF4444",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px"
                                                    }}>
                                                        <ShieldAlert size={12} /> Needs review
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 700 }}>Nominal</span>
                                                )}
                                            </td>

                                            {/* Last Active */}
                                            <td style={{ padding: "16px", fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                                {ws.lastActive ? new Date(ws.lastActive).toLocaleDateString() : "Never"}
                                            </td>

                                            {/* Quick action buttons */}
                                            <td style={{ padding: "16px", borderTopRightRadius: "12px", borderBottomRightRadius: "12px", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                                                <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                                    <button 
                                                        onClick={() => resetWorkspaceActivation(ws.id)}
                                                        disabled={isActionLoading}
                                                        style={{ width: "28px", height: "28px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "6px", cursor: "pointer", color: "var(--foreground)" }}
                                                        title="Reset activation lifecycle"
                                                    >
                                                        <RefreshCw size={12} style={{ margin: "auto" }} />
                                                    </button>
                                                    <button 
                                                        onClick={() => forceRetryProvisioning(ws)}
                                                        disabled={isActionLoading}
                                                        style={{ width: "28px", height: "28px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "6px", cursor: "pointer", color: "var(--foreground)" }}
                                                        title="Retry provisioning build"
                                                    >
                                                        <Zap size={12} style={{ margin: "auto" }} />
                                                    </button>
                                                    <button 
                                                        onClick={() => router.push(`/admin/workspaces/${ws.id}`)}
                                                        style={{ width: "28px", height: "28px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "6px", cursor: "pointer", color: "var(--foreground)" }}
                                                        title="Open dedicated detail page"
                                                    >
                                                        <ChevronRight size={12} style={{ margin: "auto" }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
}
