"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
    Layers, Shield, Activity, Clock, AlertTriangle, 
    ArrowLeft, CheckCircle, RefreshCcw, Mail, Key, Trash2, 
    Settings, FileText, Database, UserCheck, Play, ArrowRight, User,
    FileCheck, Compass, HelpCircle, HardDrive, ListCollapse, BookOpen, ChevronRight
} from "lucide-react";
import adminStyles from "../../admin.module.css";

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

export default function WorkspaceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params.id as string;

    const [workspace, setWorkspace] = useState<any>(null);
    const [hostedServer, setHostedServer] = useState<any>(null);
    const [auditEvents, setAuditEvents] = useState<any[]>([]);
    const [workspaceApprovals, setWorkspaceApprovals] = useState<any[]>([]);
    const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Operator changes states
    const [newPassword, setNewPassword] = useState("");
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    
    // Notes state
    const [internalNote, setInternalNote] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Notice notification state
    const [emailSubject, setEmailSubject] = useState("");
    const [emailTitle, setEmailTitle] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Reassign server states
    const [allNodes, setAllNodes] = useState<any[]>([]);
    const [selectedReassignServerId, setSelectedReassignServerId] = useState("");
    const [isReassigningServer, setIsReassigningServer] = useState(false);

    // AI Employees & Workflow templates states
    const [employees, setEmployees] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [newEmpName, setNewEmpName] = useState("");
    const [newEmpType, setNewEmpType] = useState("Support Manager");
    const [newEmpTemplateId, setNewEmpTemplateId] = useState("");

    // Brain templates states
    const [brainTemplates, setBrainTemplates] = useState<any[]>([]);
    const [installedBrains, setInstalledBrains] = useState<any[]>([]);
    const [selectedInstallBrainId, setSelectedInstallBrainId] = useState("");
    const [isInstallingBrain, setIsInstallingBrain] = useState(false);

    const handleInstallBrain = async () => {
        if (!selectedInstallBrainId) return;
        if (!workspace?.teamId) return;
        
        setIsInstallingBrain(true);
        try {
            const res = await fetch("/api/admin/customer-brains", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamId: workspace.teamId,
                    brainTemplateId: selectedInstallBrainId
                })
            });

            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Brain Template successfully installed and provisioned.", "success");
                setSelectedInstallBrainId("");
                
                // Refresh lists
                const ibRes = await fetch(`/api/admin/customer-brains?teamId=${workspace.teamId}`);
                if (ibRes.ok) setInstalledBrains(await ibRes.json());
                
                const empRes = await fetch(`/api/admin/employees?teamId=${workspace.teamId}`);
                if (empRes.ok) setEmployees(await empRes.json());
            } else {
                alert("Failed to install Brain Template");
            }
        } catch (e) {
            console.error("Install brain failed:", e);
        } finally {
            setIsInstallingBrain(false);
        }
    };

    const handleReassignServer = async () => {
        if (!selectedReassignServerId) return;
        const targetNode = allNodes.find(n => n.id === selectedReassignServerId);
        const confirmMsg = `Are you sure you want to reassign this workspace to server "${targetNode?.name || 'Selected server'}"? All deployments and runtime data will point to this execution environment.`;
        if (!confirm(confirmMsg)) return;

        setIsReassigningServer(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: workspaceId,
                    action: "REASSIGN_SERVER",
                    targetServerId: selectedReassignServerId
                })
            });

            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Server reassignment complete.", "success");
                setSelectedReassignServerId("");
                fetchWorkspaceDetails();
            } else {
                const errData = await res.json();
                alert(`Reassignment failed: ${errData.error || "Unknown server response"}`);
            }
        } catch (e) {
            console.error("Reassign server failed:", e);
            alert("Network error while trying to reassign server.");
        } finally {
            setIsReassigningServer(false);
        }
    };

    const fetchWorkspaceDetails = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch user workspace details
            const usersRes = await fetch("/api/admin/users");
            if (usersRes.ok) {
                const workspacesData = await usersRes.json();
                const current = workspacesData.find((w: any) => w.id === workspaceId);
                setWorkspace(current || null);
                
                if (current?.notes) {
                    setInternalNote(current.notes);
                }

                // Fetch linked approvals if workspace has a team
                if (current?.teamId) {
                    const approvalsRes = await fetch("/api/admin/approvals");
                    if (approvalsRes.ok) {
                        const allApprovals = await approvalsRes.json();
                        const filtered = allApprovals.filter((a: any) => a.teamId === current.teamId);
                        setWorkspaceApprovals(filtered);
                    }

                    // Fetch hosted server info
                    const nodesRes = await fetch("/api/admin/nodes");
                    if (nodesRes.ok) {
                        const nodesData = await nodesRes.json();
                        setAllNodes(nodesData);
                        const matchedServer = nodesData.find((s: any) => s.id === current.assignedServerId || s.teamId === current.teamId);
                        setHostedServer(matchedServer || null);
                    }

                    // Fetch AI Employees
                    const empRes = await fetch(`/api/admin/employees?teamId=${current.teamId}`);
                    if (empRes.ok) {
                        setEmployees(await empRes.json());
                    }

                    // Fetch templates master list
                    const templatesRes = await fetch("/api/admin/templates");
                    if (templatesRes.ok) {
                        setTemplates(await templatesRes.json());
                    }

                    // Fetch Brain Templates
                    const brainTemplatesRes = await fetch("/api/admin/brain-templates");
                    if (brainTemplatesRes.ok) {
                        setBrainTemplates(await brainTemplatesRes.json());
                    }

                    // Fetch installed brains for this workspace team
                    const installedBrainsRes = await fetch(`/api/admin/customer-brains?teamId=${current.teamId}`);
                    if (installedBrainsRes.ok) {
                        setInstalledBrains(await installedBrainsRes.json());
                    }
                }
            }

            // 2. Fetch specific audit activities
            const activityRes = await fetch(`/api/admin/users?id=${workspaceId}&activity=true`);
            if (activityRes.ok) {
                const data = await activityRes.json();
                setAuditEvents(data);
            }

            // 3. Fetch telemetry logs
            const telemetryRes = await fetch("/api/admin/logs");
            if (telemetryRes.ok) {
                const allLogs = await telemetryRes.json();
                // Filter logs matching current workspace teamId
                const filteredLogs = allLogs.filter((l: any) => l.teamId === workspace?.teamId || l.workflowName?.toLowerCase().includes((workspace?.aiEmployee || "").toLowerCase()));
                setTelemetryLogs(filteredLogs);
            }
        } catch (e) {
            console.error("Failed to load workspace detail:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (workspaceId) {
            fetchWorkspaceDetails();
        }
    }, [workspaceId]);

    // AI Employees Management Handlers
    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmpName.trim()) {
            alert("Please enter a name for the AI Employee");
            return;
        }
        if (!newEmpTemplateId) {
            alert("Please select an automation package to deploy.");
            return;
        }
        if (!workspace?.teamId) {
            alert("This customer context does not have an active teamId mapped.");
            return;
        }

        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/customer-brains", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamId: workspace.teamId,
                    brainTemplateId: newEmpTemplateId,
                    employeeName: newEmpName,
                    employeeType: newEmpType
                })
            });

            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("AI Employee hired and automation deployed successfully.", "success");
                setNewEmpName("");
                setNewEmpTemplateId("");
                
                // Refresh lists
                const ibRes = await fetch(`/api/admin/customer-brains?teamId=${workspace.teamId}`);
                if (ibRes.ok) setInstalledBrains(await ibRes.json());
                
                const empRes = await fetch(`/api/admin/employees?teamId=${workspace.teamId}`);
                if (empRes.ok) setEmployees(await empRes.json());
            } else {
                const errData = await res.json();
                alert(`Failed to hire AI Employee: ${errData.error || "Unknown server error"}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdateEmployeeAssignment = async (employeeId: string, templateId: string, currentStatus: string) => {
        if (!workspace?.teamId) return;
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "UPDATE_ASSIGNMENT",
                    teamId: workspace.teamId,
                    employeeId,
                    workflowTemplateId: templateId || null,
                    status: currentStatus
                })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Automation template reassigned.", "success");
                // Refresh list
                const empRes = await fetch(`/api/admin/employees?teamId=${workspace.teamId}`);
                if (empRes.ok) setEmployees(await empRes.json());
            } else {
                alert("Failed to reassign template");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggleEmployeeStatus = async (employeeId: string, currentTemplateId: string, currentStatus: string) => {
        if (!workspace?.teamId) return;
        const targetStatus = currentStatus === 'active' ? 'paused' : 'active';
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "UPDATE_ASSIGNMENT",
                    teamId: workspace.teamId,
                    employeeId,
                    workflowTemplateId: currentTemplateId || null,
                    status: targetStatus
                })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast(`AI Employee status updated to ${targetStatus}.`, "success");
                // Refresh list
                const empRes = await fetch(`/api/admin/employees?teamId=${workspace.teamId}`);
                if (empRes.ok) setEmployees(await empRes.json());
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteEmployee = async (employeeId: string) => {
        if (!confirm("Are you sure you want to delete this AI Employee context?")) return;
        if (!workspace?.teamId) return;
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "DELETE",
                    teamId: workspace.teamId,
                    employeeId
                })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("AI Employee deleted.", "success");
                // Refresh list
                const empRes = await fetch(`/api/admin/employees?teamId=${workspace.teamId}`);
                if (empRes.ok) setEmployees(await empRes.json());
            } else {
                alert("Failed to delete AI Employee");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Actions: Reset Activation
    const handleResetActivation = async () => {
        if (!confirm("Are you sure you want to reset this client's onboarding & activation state? This will clear credentials checks.")) return;
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "RESET_ACTIVATION", id: workspaceId })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Workspace state reset successfully.", "success");
                await fetchWorkspaceDetails();
            } else {
                alert("Failed to reset activation status.");
            }
        } catch (err) {
            console.error("Action reset failed:", err);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Actions: Retry Provisioning
    const handleRetryProvisioning = async () => {
        if (!confirm("Trigger retry provisioning for active container?")) return;
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
                await fetchWorkspaceDetails();
            } else {
                alert("Failed to re-trigger provisioning.");
            }
        } catch (err) {
            console.error("Provisioning re-trigger failed:", err);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Action: Update Password
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }
        setIsResettingPassword(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "RESET_PASSWORD", id: workspaceId, newPassword })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Operator password reset successfully.", "success");
                setNewPassword("");
            } else {
                alert("Failed to update password.");
            }
        } catch (err) {
            console.error("Password reset failed:", err);
        } finally {
            setIsResettingPassword(false);
        }
    };

    // Action: Save note
    const handleSaveNote = async () => {
        setIsSavingNote(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "SAVE_NOTE", id: workspaceId, notes: internalNote })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Internal note updated successfully.", "success");
                await fetchWorkspaceDetails();
            } else {
                alert("Failed to save note.");
            }
        } catch (e) {
            console.error("Failed to save internal note:", e);
        } finally {
            setIsSavingNote(false);
        }
    };

    // Action: Toggle suspend state
    const handleToggleSuspend = async () => {
        const actionText = workspace.status === 'Suspended' ? 'Unsuspend' : 'Suspend';
        if (!confirm(`Are you sure you want to ${actionText} workspace account access?`)) return;
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: workspace.status === 'Suspended' ? "UNSUSPEND" : "SUSPEND", 
                    id: workspaceId 
                })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast(`Workspace account has been ${actionText}ed.`, "success");
                await fetchWorkspaceDetails();
            } else {
                alert("Failed to update suspend state.");
            }
        } catch (e) {
            console.error("Failed to toggle suspend status:", e);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Action: Resend onboarding invite
    const handleResendInvite = async () => {
        if (!confirm("Are you sure you want to dispatch a fresh onboarding invitation email?")) return;
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "RESEND_INVITE", id: workspaceId })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Onboarding invitation email dispatched.", "success");
            } else {
                alert("Failed to resend onboarding invitation.");
            }
        } catch (e) {
            console.error("Failed to resend invite:", e);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Action: Send custom email notice
    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailSubject || !emailTitle || !emailMessage) {
            alert("All fields are required");
            return;
        }
        setIsSendingEmail(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "SEND_EMAIL",
                    id: workspaceId,
                    subject: emailSubject,
                    title: emailTitle,
                    message: emailMessage
                })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Notice notice dispatched successfully.", "success");
                setEmailSubject("");
                setEmailTitle("");
                setEmailMessage("");
                await fetchWorkspaceDetails();
            } else {
                alert("Failed to dispatch email.");
            }
        } catch (err) {
            console.error("Email dispatch failed:", err);
        } finally {
            setIsSendingEmail(false);
        }
    };

    // Action: Delete Workspace
    const handleDeleteWorkspace = async () => {
        if (!confirm(`CRITICAL WARNING: Permanently delete workspace "${workspace.firmName || workspace.name}"? This action is irreversible.`)) return;
        if (!confirm(`Please type 'CONFIRM DELETE' in the next prompt if you are absolutely sure.`)) return;
        
        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/admin/users?id=${workspaceId}`, { method: 'DELETE' });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Workspace deleted.", "success");
                router.replace("/admin/workspaces");
            }
        } catch (e) {
            console.error("Delete failed:", e);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ height: '30px', width: '200px', background: 'var(--muted)', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '340px', background: 'var(--muted)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
            </div>
        );
    }

    if (!workspace) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", color: "var(--muted-foreground)", gap: "12px" }}>
                <AlertTriangle size={36} />
                <span style={{ fontSize: "1rem", fontWeight: 800 }}>Workspace index not found.</span>
                <Link href="/admin/workspaces" style={{ fontSize: "0.85rem", color: "var(--accent)", textDecoration: "none", fontWeight: 900 }}>
                    Return to Workspaces Directory
                </Link>
            </div>
        );
    }

    const lifecycle = getClientLifecycle(workspace);
    const reqTools = BLUEPRINT_REQUIRED_TOOLS[workspace.selectedWorkflowId || ""] || [];
    const connCreds = workspace.connectedCredentials || [];
    const connCredNames = connCreds.map((c: any) => c.provider.toLowerCase());
    
    // Capacity Calculations
    const activeEmployeesCount = employees.filter(e => e.status === "active").length;
    const employeeLimit = (hostedServer?.tier || "Standard") === "Pro" ? 15 : 5;
    const isNearCapacity = activeEmployeesCount >= employeeLimit - 1;
    const isAtOrOverCapacity = activeEmployeesCount >= employeeLimit;
    
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
    const badge = lifecycleBadgeColors[lifecycle] || { bg: 'var(--muted)', color: 'var(--foreground)' };

    // Grouping activation status steps
    const currentStepNum = (() => {
        const steps = ["NOT_STARTED", "SUMMARY_READY", "CONNECTIONS_IN_PROGRESS", "READY_FOR_DEPLOY", "DEPLOYING", "ACTIVATED"];
        const index = steps.indexOf(workspace.activationStatus || "");
        return index >= 0 ? index : 0;
    })();

    const stepLabelText = (step: string) => {
        if (step === 'ACTIVATED') return 'Nominal Loop Running';
        if (step === 'DEPLOYING') return 'Node Container Initializing';
        if (step === 'READY_FOR_DEPLOY') return 'Awaiting Admin Deploy Command';
        if (step === 'CONNECTIONS_IN_PROGRESS') return 'Awaiting Owner Api Credentials';
        if (step === 'SUMMARY_READY') return 'strategic Context Synced';
        return 'Draft Workspace Init';
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link 
                    href="/admin/workspaces" 
                    style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 950, color: "var(--accent)" }}
                >
                    <ArrowLeft size={16} /> Back to Workspaces
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 950, color: "var(--muted-foreground)" }}>STATE:</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 950, padding: "4px 12px", borderRadius: "100px", background: badge.bg, color: badge.color, textTransform: "uppercase" }}>
                        {lifecycle}
                    </span>
                </div>
            </div>

            {/* DEDICATED RUNTIME SERVER NODE */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <HardDrive size={18} style={{ color: "var(--accent)" }} />
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>DEDICATED RUNTIME SERVER NODE</h3>
                    </div>
                    {hostedServer && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 950, color: "var(--muted-foreground)" }}>SERVER TIER:</span>
                            <span style={{ 
                                fontSize: "0.65rem", 
                                fontWeight: 950, 
                                padding: "4px 10px", 
                                borderRadius: "100px", 
                                background: hostedServer.tier === 'Pro' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(75, 85, 99, 0.15)', 
                                color: hostedServer.tier === 'Pro' ? '#8B5CF6' : 'var(--muted-foreground)',
                                textTransform: "uppercase" 
                            }}>
                                {hostedServer.tier || "Standard"} Tier
                            </span>
                        </div>
                    )}
                </div>

                {hostedServer ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", alignItems: "start" }}>
                        
                        {/* Column 1: Server Identity & Uptime */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.8rem", fontWeight: 800 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                <span style={{ color: "var(--muted-foreground)" }}>Assigned Node ID</span>
                                <Link 
                                    href={`/admin/servers/${hostedServer.id}`}
                                    style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 900 }}
                                >
                                    {hostedServer.name}
                                </Link>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                <span style={{ color: "var(--muted-foreground)" }}>IP / Endpoints</span>
                                <span style={{ color: "var(--foreground)" }}>{hostedServer.ipAddress || "Custom Host URL"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--muted-foreground)" }}>Location Region</span>
                                <span style={{ color: "var(--foreground)" }}>{hostedServer.provider || "manual"} / {hostedServer.region || "Default"}</span>
                            </div>
                        </div>

                        {/* Column 2: Capacity Slots Used */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>EMPLOYEE CAPACITY SLOTS USED</span>
                                <span style={{ fontSize: "0.85rem", fontWeight: 950, color: isAtOrOverCapacity ? "#EF4444" : "var(--foreground)" }}>
                                    {activeEmployeesCount} of {employeeLimit} slots
                                </span>
                            </div>
                            
                            {/* Capacity progress bar */}
                            <div style={{ height: "8px", background: "var(--muted)", borderRadius: "10px", overflow: "hidden", marginTop: "4px" }}>
                                <div style={{ 
                                    width: `${Math.min((activeEmployeesCount / employeeLimit) * 100, 100)}%`, 
                                    height: "100%", 
                                    background: isAtOrOverCapacity ? "#EF4444" : isNearCapacity ? "#F59E0B" : "var(--accent)" 
                                }} />
                            </div>

                            <div style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontWeight: 750, marginTop: "2px" }}>
                                Limit determined by assigned node cluster tier ({hostedServer.tier || "Standard"})
                            </div>
                        </div>

                        {/* Column 3: Migration panel */}
                        <div style={{ padding: "16px", background: "var(--muted)", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
                                REASSIGN SERVER NODE (MIGRATE ALL CLIENT EMPLOYEES)
                            </span>
                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                <select
                                    value={selectedReassignServerId}
                                    onChange={e => setSelectedReassignServerId(e.target.value)}
                                    style={{ 
                                        flex: 1, 
                                        height: "36px", 
                                        padding: "0 10px", 
                                        borderRadius: "8px", 
                                        border: "1px solid var(--border)", 
                                        background: "var(--card)", 
                                        color: "var(--foreground)", 
                                        fontSize: "0.75rem", 
                                        fontWeight: 800,
                                        outline: "none"
                                    }}
                                >
                                    <option value="">Choose target node...</option>
                                    {allNodes
                                        .filter(n => n.id !== hostedServer.id && n.status === 'Active')
                                        .map((n, idx) => (
                                            <option key={idx} value={n.id}>
                                                {n.name} ({n.tier || 'Standard'} Tier)
                                            </option>
                                        ))
                                    }
                                </select>
                                <button
                                    onClick={handleReassignServer}
                                    disabled={isReassigningServer || !selectedReassignServerId}
                                    style={{ 
                                        height: "36px", 
                                        padding: "0 14px", 
                                        background: "var(--foreground)", 
                                        color: "var(--background)", 
                                        border: "none", 
                                        borderRadius: "8px", 
                                        cursor: "pointer", 
                                        fontSize: "0.75rem", 
                                        fontWeight: 950, 
                                        opacity: (!selectedReassignServerId || isReassigningServer) ? 0.5 : 1 
                                    }}
                                >
                                    {isReassigningServer ? "Moving..." : "Reassign"}
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "16px", padding: "20px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <AlertTriangle size={24} style={{ color: "#EF4444" }} />
                            <div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 950, color: "var(--foreground)" }}>No dedicated server node allocated to this customer!</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 700, marginTop: "2px" }}>Allocate a node workspace server to start automated provisioning.</div>
                            </div>
                        </div>
                        <div style={{ width: "240px" }}>
                            <select
                                value={selectedReassignServerId}
                                onChange={e => setSelectedReassignServerId(e.target.value)}
                                style={{ 
                                    width: "100%",
                                    height: "36px", 
                                    padding: "0 10px", 
                                    borderRadius: "8px", 
                                    border: "1px solid var(--border)", 
                                    background: "var(--card)", 
                                    color: "var(--foreground)", 
                                    fontSize: "0.75rem", 
                                    fontWeight: 800,
                                    outline: "none",
                                    marginBottom: "8px"
                                }}
                            >
                                <option value="">Choose node server...</option>
                                {allNodes
                                    .filter(n => n.status === 'Active')
                                    .map((n, idx) => (
                                        <option key={idx} value={n.id}>
                                            {n.name} ({n.tier || 'Standard'} Tier)
                                        </option>
                                    ))
                                }
                            </select>
                            <button
                                onClick={handleReassignServer}
                                disabled={isReassigningServer || !selectedReassignServerId}
                                style={{ 
                                    width: "100%",
                                    height: "36px", 
                                    background: "var(--foreground)", 
                                    color: "var(--background)", 
                                    border: "none", 
                                    borderRadius: "8px", 
                                    cursor: "pointer", 
                                    fontSize: "0.75rem", 
                                    fontWeight: 950, 
                                    opacity: (!selectedReassignServerId || isReassigningServer) ? 0.5 : 1 
                                }}
                            >
                                {isReassigningServer ? "Allocating..." : "Allocate Node Server"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isNearCapacity && (
                <div style={{ 
                    background: "rgba(245, 158, 11, 0.08)", 
                    border: "1px solid rgba(245, 158, 11, 0.3)", 
                    borderRadius: "16px", 
                    padding: "16px", 
                    display: "flex", 
                    gap: "12px", 
                    alignItems: "center", 
                    color: "#D97706", 
                    fontSize: "0.85rem", 
                    fontWeight: 800,
                    animation: "fadeIn 0.3s ease-out" 
                }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                    <div>
                        <strong>Warning: Running near server slot capacity limits!</strong>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, marginTop: "2px", color: "rgba(217, 119, 6, 0.95)" }}>
                            This customer has provisioned {activeEmployeesCount} active employees out of a maximum of {employeeLimit} slots allowed for the {hostedServer?.tier || "Standard"} tier. Upgrade this customer to a Pro Tier server before provisioning additional AI Employee slots.
                        </div>
                    </div>
                </div>
            )}

            {/* TWO COLUMN GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1.1fr", gap: "32px", alignItems: "start" }}>
                
                {/* LEFT COLUMN (OPERATIONAL ACTIVITY SUMMARY) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    
                    {/* SECTION 1: WORKSPACE SUMMARY */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <FileCheck size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>WORKSPACE SUMMARY</h3>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr", gap: "20px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", fontWeight: 800 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Company Name</span>
                                    <span style={{ color: "var(--foreground)" }}>{workspace.firmName || "Sovereign Workspace"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Operator Lead</span>
                                    <span style={{ color: "var(--foreground)" }}>{workspace.name || "—"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Contact Email</span>
                                    <span style={{ color: "var(--foreground)" }}>{workspace.email}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Hosted Node Server</span>
                                    {hostedServer ? (
                                        <Link 
                                            href={`/admin/servers/${hostedServer.id}`}
                                            style={{ color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: "2px" }}
                                        >
                                            {hostedServer.name} <ChevronRight size={12} />
                                        </Link>
                                    ) : (
                                        <span style={{ color: "var(--foreground)" }}>Manual Node</span>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", fontWeight: 800 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Industry Sector</span>
                                    <span style={{ color: "var(--foreground)" }}>{workspace.industry || "Consulting"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Account Plan Tier</span>
                                    <span style={{ color: "var(--foreground)" }}>{workspace.tier || "Starter"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Last Active Timestamp</span>
                                    <span style={{ color: "var(--foreground)" }}>{workspace.lastActive ? new Date(workspace.lastActive).toLocaleString() : "Never"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: BUSINESS CONTEXT */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Compass size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>BUSINESS STRATEGIC CONTEXT</h3>
                        </div>

                        <div>
                            <div style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: "6px" }}>Problem Statement summary</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--foreground)", fontWeight: 700, background: "var(--muted)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", lineHeight: "1.4" }}>
                                {workspace.problemDescription || "No custom onboarding statement parsed."}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "4px" }}>
                            <div>
                                <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>selected AI Employee persona</span>
                                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--foreground)", marginTop: "4px" }}>{workspace.aiEmployee || "Not selected"}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Recommended AI employee direction</span>
                                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--muted-foreground)", marginTop: "4px" }}>
                                    {workspace.aiEmployee ? `${workspace.aiEmployee} matches standard ${workspace.industry || 'General'} automations.` : "Awaiting selection"}
                                </div>
                            </div>
                        </div>
                    </div>                    {/* SECTION 3: HIRED AI EMPLOYEES */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <UserCheck size={18} style={{ color: "var(--accent)" }} />
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>HIRED AI EMPLOYEES</h3>
                            </div>
                            <span style={{ fontSize: "0.7rem", fontWeight: 900, background: "var(--muted)", color: "var(--muted-foreground)", padding: "2px 8px", borderRadius: "6px" }}>
                                Hired: {employees.length}
                            </span>
                        </div>

                        {/* List of active hired employees */}
                        {employees.length === 0 ? (
                            <div style={{ padding: "20px", background: "var(--muted)", borderRadius: "16px", border: "1px solid var(--border)", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.8rem", fontWeight: 700 }}>
                                No AI Employees hired yet for this workspace. Use the onboarding panel below to hire one.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {employees.map((emp) => {
                                    const isActive = emp.status === "active";
                                    return (
                                        <div key={emp.id} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <div style={{ fontSize: "0.85rem", fontWeight: 950, color: "var(--foreground)" }}>
                                                        {emp.name}
                                                    </div>
                                                    <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 750 }}>
                                                        Role: {emp.type}
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{ 
                                                        fontSize: "0.65rem", 
                                                        fontWeight: 950, 
                                                        padding: "2px 8px", 
                                                        borderRadius: "100px", 
                                                        background: isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                                        color: isActive ? "#10B981" : "#F59E0B",
                                                        textTransform: "uppercase"
                                                    }}>
                                                        {isActive ? "Active" : "Paused"}
                                                    </span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleToggleEmployeeStatus(emp.id, emp.activeTemplateId, emp.status)}
                                                        style={{ 
                                                            fontSize: "0.65rem", 
                                                            fontWeight: 900, 
                                                            background: "var(--card)", 
                                                            border: "1px solid var(--border)", 
                                                            padding: "4px 8px", 
                                                            borderRadius: "6px", 
                                                            cursor: "pointer",
                                                            color: "var(--foreground)"
                                                        }}
                                                    >
                                                        {isActive ? "Pause" : "Activate"}
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteEmployee(emp.id)}
                                                        style={{ 
                                                            background: "rgba(239, 68, 68, 0.05)", 
                                                            border: "1px solid rgba(239, 68, 68, 0.2)", 
                                                            color: "#EF4444",
                                                            padding: "4px", 
                                                            borderRadius: "6px", 
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}
                                                        title="Fire employee / Remove context"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Deployed Automation Package Selector */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <label style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)" }}>
                                                    DEPLOYED AUTOMATION PACKAGE
                                                </label>
                                                <select
                                                    value={emp.activeTemplateId || ""}
                                                    onChange={(e) => handleUpdateEmployeeAssignment(emp.id, e.target.value, emp.status)}
                                                    style={{ 
                                                        height: "34px", 
                                                        padding: "0 10px", 
                                                        borderRadius: "8px", 
                                                        border: "1px solid var(--border)", 
                                                        background: "var(--card)", 
                                                        color: "var(--foreground)", 
                                                        fontSize: "0.75rem", 
                                                        fontWeight: 800,
                                                        outline: "none"
                                                    }}
                                                >
                                                    <option value="">No active automation package</option>
                                                    {brainTemplates.map((bt) => (
                                                        <option key={bt.id} value={bt.id}>
                                                            {bt.name} (v{bt.version})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Add new employee form */}
                        <form onSubmit={handleAddEmployee} style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <h4 style={{ fontSize: "0.8rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>
                                HIRE / PROVISION NEW AI EMPLOYEE
                            </h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                                        EMPLOYEE NAME
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Finance AI" 
                                        value={newEmpName}
                                        onChange={e => setNewEmpName(e.target.value)}
                                        style={{ width: "100%", height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                                        EMPLOYEE ROLE / PERSONA
                                    </label>
                                    <select 
                                        value={newEmpType}
                                        onChange={e => setNewEmpType(e.target.value)}
                                        style={{ width: "100%", height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.75rem", fontWeight: 800, background: "var(--muted)", color: "var(--foreground)", outline: "none" }}
                                    >
                                        <option value="Finance Assistant">Finance Assistant</option>
                                        <option value="Customer Support">Customer Support</option>
                                        <option value="Sales Assistant">Sales Assistant</option>
                                        <option value="Marketing Assistant">Marketing Assistant</option>
                                        <option value="HR Assistant">HR Assistant</option>
                                        <option value="Operations Lead">Operations Lead</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                                    DEPLOY AUTOMATION PACKAGE
                                </label>
                                <select 
                                    value={newEmpTemplateId}
                                    onChange={e => setNewEmpTemplateId(e.target.value)}
                                    style={{ width: "100%", height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.75rem", fontWeight: 800, background: "var(--muted)", color: "var(--foreground)", outline: "none" }}
                                >
                                    <option value="">Awaiting setup / Not selected</option>
                                    {brainTemplates.map((bt) => (
                                        <option key={bt.id} value={bt.id}>
                                            {bt.name} (v{bt.version})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isActionLoading}
                                style={{ height: "38px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950 }}
                            >
                                Hire AI Employee
                            </button>
                        </form>
                    </div>

                    {/* SECTION 4: ACTIVATION & LIFECYCLE PROGRESS */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Clock size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>ACTIVATION LIFECYCLE STATE</h3>
                        </div>

                        {/* Progress Checklist Bar */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 900, marginBottom: "8px" }}>
                                <span>Current step: {workspace.activationStatus || "NOT_STARTED"}</span>
                                <span>{Math.round((currentStepNum / 5) * 100)}% Complete</span>
                            </div>
                            <div style={{ height: "8px", background: "var(--muted)", borderRadius: "10px", overflow: "hidden" }}>
                                <div style={{ width: `${(currentStepNum / 5) * 100}%`, height: "100%", background: "var(--accent)" }} />
                            </div>
                        </div>

                        {/* Blocked reasons */}
                        {lifecycle === 'failed' || lifecycle === 'needs intervention' ? (
                            <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", padding: "16px", display: "flex", gap: "12px" }}>
                                <AlertTriangle size={18} style={{ color: "#EF4444", flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: "0.8rem", fontWeight: 950, color: "#EF4444" }}>Activation block identified</div>
                                    <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 700 }}>
                                        Deployment container loop exited with failure or expired integration connections. Inspect gateway logs or re-trigger build.
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* SECTION 5: TELEMETRY SNAPSHOT */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Activity size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>EXECUTION TELEMETRY SNAPSHOT</h3>
                        </div>

                        {telemetryLogs.length === 0 ? (
                            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>No active telemetry logs captured.</span>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: "6px 12px", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", textAlign: "left" }}>Workflow Name</th>
                                        <th style={{ padding: "6px 12px", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", textAlign: "left" }}>Status</th>
                                        <th style={{ padding: "6px 12px", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", textAlign: "right" }}>Executed At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {telemetryLogs.slice(0, 4).map((log, lIdx) => {
                                        const isSuccess = log.status?.toLowerCase() === 'success' || log.status?.toLowerCase() === 'active';
                                        return (
                                            <tr key={lIdx} style={{ background: "var(--muted)" }}>
                                                <td style={{ padding: "12px", borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px", fontSize: "0.8rem", fontWeight: 900 }}>{log.workflowName}</td>
                                                <td style={{ padding: "12px" }}>
                                                    <span style={{ 
                                                        fontSize: "0.6rem", 
                                                        fontWeight: 950, 
                                                        padding: "2px 6px", 
                                                        borderRadius: "4px",
                                                        background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: isSuccess ? '#10B981' : '#EF4444'
                                                    }}>{log.status}</span>
                                                </td>
                                                <td style={{ padding: "12px", borderTopRightRadius: "8px", borderBottomRightRadius: "8px", textAlign: "right", fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                                    {new Date(log.executedAt || log.createdAt).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* SECTION 6: GOVERNANCE AUDIT TIMELINE */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <FileText size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>GOVERNANCE AUDIT TIMELINE</h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {auditEvents.length === 0 ? (
                                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>No audit logs trace compiled.</span>
                            ) : (
                                auditEvents.map((evt, idx) => (
                                    <div key={idx} style={{ display: "flex", gap: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 900, minWidth: "120px" }}>
                                            {new Date(evt.createdAt).toLocaleString()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: 950, color: "var(--foreground)" }}>{evt.title}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 700, marginTop: "2px" }}>{evt.description}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (SIDEBAR CREDENTIALS & ADMIN OVERRIDES) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    
                    {/* Section 7 placeholder removed and moved to the top */}

                    {/* SECTION 7: INTEGRATIONS CHECKLIST */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Settings size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>INTEGRATIONS CREDENTIALS</h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {reqTools.length === 0 ? (
                                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>No blueprint integrations connected.</span>
                            ) : (
                                reqTools.map((tool, idx) => {
                                    const isConnected = connCredNames.includes(tool.toLowerCase());
                                    return (
                                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{tool}</span>
                                            <span style={{ 
                                                fontSize: "0.65rem", 
                                                fontWeight: 950, 
                                                color: isConnected ? "#10B981" : "#EF4444"
                                            }}>
                                                {isConnected ? "CONNECTED" : "MISSING"}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* SECTION 8: COMPLIANCE APPROVAL EVIDENCE */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Shield size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>GOVERNANCE APPROVALS</h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {workspaceApprovals.length === 0 ? (
                                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>No compliance requests registered.</span>
                            ) : (
                                workspaceApprovals.map((app, idx) => (
                                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 900 }}>
                                            <span>Policy: {app.policyName}</span>
                                            <span style={{ 
                                                fontSize: "0.6rem", 
                                                fontWeight: 950, 
                                                color: app.status === 'APPROVED' ? '#10B981' : app.status === 'PENDING' ? '#F59E0B' : '#EF4444' 
                                            }}>{app.status}</span>
                                        </div>
                                        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            Output: {app.outputPreview}
                                        </span>
                                        {app.approvedBy && (
                                            <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                                Decided By: {app.approvedBy}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* SECTION 9: ADMINISTRATIVE ACTION COMMANDS */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Settings size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>ADMINISTRATIVE ACTIONS</h3>
                        </div>

                        {/* Note area */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "6px" }}>INTERNAL OPERATOR NOTE</label>
                            <textarea 
                                placeholder="Enter specific diagnostic notes regarding client node config details."
                                rows={3}
                                value={internalNote}
                                onChange={e => setInternalNote(e.target.value)}
                                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)", resize: "none" }}
                            />
                            <button 
                                onClick={handleSaveNote}
                                disabled={isSavingNote}
                                style={{ width: "100%", height: "36px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, marginTop: "8px", color: "var(--foreground)" }}
                            >
                                {isSavingNote ? "Saving..." : "Save Note"}
                            </button>
                        </div>

                        {/* Reset retry invites */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                            <button 
                                onClick={handleResendInvite}
                                disabled={isActionLoading}
                                style={{ width: "100%", height: "40px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, color: "var(--foreground)" }}
                            >
                                Resend Onboarding Invitation
                            </button>
                            <button 
                                onClick={handleResetActivation}
                                disabled={isActionLoading}
                                style={{ width: "100%", height: "40px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, color: "var(--foreground)" }}
                            >
                                Reset Onboarding Activation
                            </button>
                            <button 
                                onClick={handleRetryProvisioning}
                                disabled={isActionLoading}
                                style={{ width: "100%", height: "40px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, color: "var(--foreground)" }}
                            >
                                Retry Node Provisioning
                            </button>
                            <button 
                                onClick={handleToggleSuspend}
                                disabled={isActionLoading}
                                style={{ 
                                    width: "100%", 
                                    height: "40px", 
                                    border: `1px solid ${workspace.status === 'Suspended' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, 
                                    background: workspace.status === 'Suspended' ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.05)', 
                                    borderRadius: "10px", 
                                    cursor: "pointer", 
                                    fontSize: "0.75rem", 
                                    fontWeight: 950, 
                                    color: workspace.status === 'Suspended' ? '#10B981' : '#F59E0B' 
                                }}
                            >
                                {workspace.status === 'Suspended' ? "Restore Access (Unsuspend)" : "Disable Workspace (Suspend)"}
                            </button>
                        </div>

                        {/* Reset password */}
                        <form onSubmit={handleUpdatePassword} style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "4px" }}>UPDATE OPERATOR CREDENTIALS</label>
                                <input 
                                    type="password" 
                                    placeholder="Minimum 6 characters password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)" }}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isResettingPassword}
                                style={{ width: "100%", height: "38px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950 }}
                            >
                                {isResettingPassword ? "Updating..." : "Update Password"}
                            </button>
                        </form>

                        {/* Dispatch notification */}
                        <form onSubmit={handleSendEmail} style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)" }}>DISPATCH CUSTOM SYSTEM EMAIL NOTICE</div>
                            
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Subject text"
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                    style={{ width: "100%", height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)" }}
                                />
                            </div>
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Banner Header"
                                    value={emailTitle}
                                    onChange={e => setEmailTitle(e.target.value)}
                                    style={{ width: "100%", height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)" }}
                                />
                            </div>
                            <div>
                                <textarea 
                                    placeholder="Enter custom message instructions..."
                                    rows={3}
                                    value={emailMessage}
                                    onChange={e => setEmailMessage(e.target.value)}
                                    style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)", resize: "none" }}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSendingEmail}
                                style={{ width: "100%", height: "38px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950 }}
                            >
                                {isSendingEmail ? "Dispatched..." : "Send custom notice"}
                            </button>
                        </form>

                        {/* Delete account */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                            <button 
                                onClick={handleDeleteWorkspace}
                                disabled={isActionLoading}
                                style={{ width: "100%", height: "40px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#EF4444", borderRadius: "10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                            >
                                <Trash2 size={12} /> Permanently Delete Account
                            </button>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
