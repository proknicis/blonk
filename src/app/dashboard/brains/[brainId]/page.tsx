"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Brain as BrainIcon,
  Shield,
  FileText,
  Cpu,
  Activity as ActivityIcon,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  ChevronDown,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import styles from "./brains.module.css";

interface BrainData {
  id: string;
  name: string;
  department: string;
  description: string;
  status: "ACTIVE" | "LEARNING" | "PAUSED" | "ARCHIVED";
  system_prompt: string;
  ai_model: string;
  temperature: number;
  memory_context: Record<string, unknown>;
  learning_state: {
    totalLearnings?: number;
    confidenceScore?: number;
    status?: string;
    lastReflectionAt?: string;
  };
  company_id: string;
  companyName?: string;
  knowledgeCount?: number;
  rulesCount?: number;
  created_at: string;
  updated_at: string;
}

interface KnowledgeItem {
  id: string;
  brain_id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  status: string;
  confidence_score: number;
  created_at: string;
}

interface RuleItem {
  id: string;
  brain_id: string;
  rule_code: string | null;
  title: string;
  description: string | null;
  condition: Record<string, unknown>;
  action: { type: string; [key: string]: unknown };
  priority: number;
  is_hard_rule: boolean;
  status: "ACTIVE" | "PAUSED" | "DISABLED";
  execution_count: number;
  violation_count: number;
  created_at: string;
}

interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  detail: string;
  timestamp: string;
  badge: string;
}

interface AutomationItem {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "DRAFT" | "PAUSED";
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  metadata: {
    taskType?: string;
    requiredApps?: string[];
    permissions?: string[];
    config?: Record<string, unknown>;
    department?: string;
  };
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  created_at: string;
  updated_at: string;
  tasks?: Array<{ id: string; name: string; taskType: string; status: string }>;
}

interface TaskTemplate {
  key: string;
  name: string;
  description: string;
  department: string;
  requiredApps: string[];
  permissions: string[];
  defaultConfig: Record<string, unknown>;
}

const TASK_TEMPLATES: TaskTemplate[] = [
  // Finance & Accounting Templates
  {
    key: "PROCESS_INVOICES",
    name: "Process Invoices",
    description: "Extracts invoice line items from emails and uploads, validates vendor tax IDs, and posts verified drafts.",
    department: "FINANCE",
    requiredApps: ["Gmail / Email", "Stripe / Accounting ERP"],
    permissions: ["Read Invoices", "Extract OCR Data", "Draft Ledger Entries"],
    defaultConfig: { autoApproveLimit: 1000, defaultCurrency: "EUR", matchWithPo: true },
  },
  {
    key: "RECONCILE_PAYMENTS",
    name: "Reconcile Payments",
    description: "Three-way matches bank disbursements against open accounts payable, highlighting variance anomalies.",
    department: "FINANCE",
    requiredApps: ["Bank Feed / Stripe", "General Ledger"],
    permissions: ["Read Bank Transactions", "Match Open Invoices", "Flag Discrepancies"],
    defaultConfig: { varianceTolerance: 0.05, reconciliationFrequency: "DAILY" },
  },
  {
    key: "AUDIT_EXPENSES",
    name: "Audit Expenses",
    description: "Validates employee expense reports against corporate travel policies and spend caps, enforcing CFO approval gates.",
    department: "FINANCE",
    requiredApps: ["Expense Management", "Slack / Email"],
    permissions: ["Read Receipts", "Evaluate Spend Policy", "Trigger Approval Gate"],
    defaultConfig: { perDiemMealLimit: 75, requireReceiptAbove: 25 },
  },
  {
    key: "PAYMENT_APPROVAL",
    name: "Payment Approval Gate",
    description: "Enforces sovereign multi-signoff gates before releasing high-value vendor disbursements.",
    department: "FINANCE",
    requiredApps: ["Banking Portal", "Admin Slack / Email"],
    permissions: ["Generate Payment Orders", "Request Signature", "Block Unauthorized Wires"],
    defaultConfig: { approvalThreshold: 2500, requireDualApproval: true },
  },
  // Sales & Revenue Templates
  {
    key: "QUALIFY_LEADS",
    name: "Qualify Leads",
    description: "Analyzes inbound lead submissions against ideal customer profile and scores purchase intent.",
    department: "SALES",
    requiredApps: ["Website Webhook", "Twenty CRM"],
    permissions: ["Ingest Form Data", "Score Leads", "Assign Pipeline Tier"],
    defaultConfig: { minimumScoreThreshold: 70 },
  },
  {
    key: "ENRICH_LEADS",
    name: "Enrich Leads",
    description: "Enriches prospect company revenue, tech stack, and LinkedIn decision-maker details.",
    department: "SALES",
    requiredApps: ["Clearbit / Apollo", "CRM"],
    permissions: ["Query Firmographics", "Update Contact Record"],
    defaultConfig: { enrichDecisionMakers: true },
  },
  {
    key: "UPDATE_CRM",
    name: "Update CRM",
    description: "Logs meeting notes, deal updates, and touchpoints into CRM automatically.",
    department: "SALES",
    requiredApps: ["Twenty CRM", "Email / Calendar"],
    permissions: ["Sync Contacts", "Log Activities", "Update Deal Stage"],
    defaultConfig: { autoCreateCompany: true },
  },
  {
    key: "FOLLOW_UP",
    name: "Follow Up",
    description: "Drafts hyper-personalized follow-up emails based on prospect engagement signals.",
    department: "SALES",
    requiredApps: ["Gmail", "Calendar"],
    permissions: ["Draft Emails", "Track Replies"],
    defaultConfig: { delayHours: 24, maxFollowups: 3 },
  },
];

interface BacklogTaskItem {
  id: string;
  automationId: string;
  automationName: string;
  triggerType: string;
  name: string;
  taskType: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  sequence: number;
  config: Record<string, unknown>;
  metadata: {
    priority?: "HIGH" | "MEDIUM" | "LOW";
    inputPayload?: Record<string, unknown>;
    sourceAutomationName?: string;
    startedAt?: string;
    completedAt?: string;
    latestResultId?: string;
  };
  createdAt: string;
  updatedAt: string;
  result?: {
    id: string;
    status: string;
    outputPayload: Record<string, unknown>;
    durationMs: number;
    aiReflection: Record<string, unknown>;
    completedAt: string;
  } | null;
}

export default function BrainDashboardPage({
  params,
}: {
  params: Promise<{ brainId: string }>;
}) {
  const resolvedParams = use(params);
  const brainId = resolvedParams.brainId;
  const router = useRouter();

  // State
  const [brain, setBrain] = useState<BrainData | null>(null);
  const [allBrains, setAllBrains] = useState<Array<{ id: string; name: string; department: string; status: string }>>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "automations" | "backlog" | "knowledge" | "rules" | "memory" | "training" | "activity">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Switcher state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Modal states
  const [isCreateBrainOpen, setIsCreateBrainOpen] = useState(false);
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  // Automations state
  const [automationsList, setAutomationsList] = useState<AutomationItem[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationItem | null>(null);
  const [isAddAutomationOpen, setIsAddAutomationOpen] = useState(false);
  const [addAutoStep, setAddAutoStep] = useState<1 | 2 | 3>(1);
  const [selectedTaskTemplate, setSelectedTaskTemplate] = useState<TaskTemplate>(TASK_TEMPLATES[0]);
  const [automationForm, setAutomationForm] = useState({
    name: "",
    description: "",
    triggerType: "WEBHOOK" as "WEBHOOK" | "SCHEDULE" | "EVENT" | "MANUAL",
    status: "ACTIVE" as "ACTIVE" | "DRAFT",
    config: {} as Record<string, unknown>,
  });

  // AI Backlog state
  const [backlogTasks, setBacklogTasks] = useState<BacklogTaskItem[]>([]);
  const [backlogFilter, setBacklogFilter] = useState<"ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [selectedTask, setSelectedTask] = useState<BacklogTaskItem | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskForm, setCreateTaskForm] = useState({
    automationId: "",
    name: "",
    priority: "MEDIUM" as "HIGH" | "MEDIUM" | "LOW",
    inputAmount: "1450.00",
    inputVendor: "Acquirer Cloud Services",
    inputInvoiceNumber: "INV-2026-089",
  });

  // Tab Data
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [rulesList, setRulesList] = useState<RuleItem[]>([]);
  const [activityList, setActivityList] = useState<ActivityEvent[]>([]);

  // Forms
  const [newBrainForm, setNewBrainForm] = useState({
    name: "Finance & Accounting Brain",
    department: "FINANCE",
    description: "Sovereign intelligence for invoice reconciliation, spend governance, and ledger auditing.",
    systemPrompt: "You are the Finance & Accounting Sovereign Brain. Your mandate is to enforce spend limits, audit ledgers, verify invoices against purchase orders, and validate financial compliance without human intervention unless approvals are triggered.",
    aiModel: "gpt-4o",
    temperature: 0.1,
  });

  const [newKnowledgeForm, setNewKnowledgeForm] = useState({
    title: "",
    category: "POLICY",
    content: "",
    confidenceScore: 1.0,
  });

  // Training Studio State
  const [healthData, setHealthData] = useState<{
    healthScore: number;
    readinessStatus: string;
    confidenceRating: number;
    totalLearnings: number;
    breakdown: {
      knowledgeScore: { current: number; max: number; count: number; categories: number };
      rulesScore: { current: number; max: number; count: number; hardRules: number };
      memoryScore: { current: number; max: number; keys: number };
      confidenceScore: { current: number; max: number; raw: number };
    };
    recommendations: string[];
  } | null>(null);

  const [trainingStep, setTrainingStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [trainForm, setTrainForm] = useState({
    title: "",
    category: "POLICY",
    content: "",
    instructions: "",
  });
  const [isProcessingTraining, setIsProcessingTraining] = useState(false);
  const [proposedTraining, setProposedTraining] = useState<{
    learnedKnowledge: { title: string; category: string; content: string; keyTakeaways: string[] };
    proposedRules: Array<{
      ruleCode: string;
      title: string;
      description: string;
      condition: Record<string, unknown>;
      action: { type: string; [key: string]: unknown };
      priority: number;
      isHardRule: boolean;
    }>;
    proposedMemory: Record<string, unknown>;
    executiveSummary: string;
    healthDelta: number;
  } | null>(null);
  const [acceptedRuleMap, setAcceptedRuleMap] = useState<Record<number, boolean>>({});
  const [applyKnowledgeFlag, setApplyKnowledgeFlag] = useState(true);
  const [trainingNotification, setTrainingNotification] = useState<string | null>(null);

  const [newRuleForm, setNewRuleForm] = useState({
    ruleCode: "",
    title: "",
    description: "",
    actionType: "REQUIRE_APPROVAL",
    priority: 100,
    isHardRule: true,
    conditionField: "amount",
    conditionOperator: ">",
    conditionValue: "1000",
  });

  const [memoryJson, setMemoryJson] = useState<string>("{}");
  const [memoryEditError, setMemoryEditError] = useState<string | null>(null);

  // Load Brain Details
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // 1. Fetch Brain details
        const res = await fetch(`/api/brains/${brainId}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load Brain");
        }
        const data: BrainData = await res.json();
        setBrain(data);
        setMemoryJson(JSON.stringify(data.memory_context || {}, null, 2));

        // 2. Fetch all brains for company switcher
        const brainsRes = await fetch("/api/brains");
        if (brainsRes.ok) {
          const brainsData = await brainsRes.json();
          setAllBrains(brainsData.brains || []);
        }

        // 3. Fetch sub-items
        fetchKnowledge();
        fetchRules();
        fetchActivity();
        fetchHealth();
        fetchAutomations();
        fetchBacklogTasks();
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (brainId) {
      loadData();
    }
  }, [brainId]);

  async function fetchAutomations() {
    try {
      const res = await fetch(`/api/brains/${brainId}/automations`);
      if (res.ok) {
        const data = await res.json();
        setAutomationsList(data);
      }
    } catch (e) {
      console.error('Automations fetch error:', e);
    }
  }

  // --- AUTOMATIONS FLOW HANDLERS ---
  function handleOpenAddAutomation() {
    // Select default task template based on Brain's department
    const matchingTemplate =
      TASK_TEMPLATES.find((t) => t.department === brain?.department) || TASK_TEMPLATES[0];

    setSelectedTaskTemplate(matchingTemplate);
    setAutomationForm({
      name: matchingTemplate.name,
      description: matchingTemplate.description,
      triggerType: "WEBHOOK",
      status: "ACTIVE",
      config: { ...matchingTemplate.defaultConfig },
    });
    setAddAutoStep(1);
    setIsAddAutomationOpen(true);
  }

  function handleSelectTaskTemplate(template: TaskTemplate) {
    setSelectedTaskTemplate(template);
    setAutomationForm((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      config: { ...template.defaultConfig },
    }));
    setAddAutoStep(2); // Progress to Configure step
  }

  async function handleCreateAutomation(e: React.FormEvent) {
    e.preventDefault();
    if (!automationForm.name.trim()) {
      alert("Please enter an automation name.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`/api/brains/${brainId}/automations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: automationForm.name,
          description: automationForm.description,
          taskType: selectedTaskTemplate.key,
          requiredApps: selectedTaskTemplate.requiredApps,
          permissions: selectedTaskTemplate.permissions,
          triggerType: automationForm.triggerType,
          triggerConfig: {
            endpoint: `/webhook/brain/${brainId}/${selectedTaskTemplate.key.toLowerCase()}`,
            mode: automationForm.triggerType === "SCHEDULE" ? "HOURLY" : "INSTANT",
          },
          status: automationForm.status,
          config: automationForm.config,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create automation");
      }

      setIsAddAutomationOpen(false);
      fetchAutomations();
      fetchActivity();
      alert(`Automation "${automationForm.name}" created and set to ${automationForm.status}!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleAutomationStatus(automationId: string, currentStatus: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/brains/${brainId}/automations/${automationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setAutomationsList((prev) =>
          prev.map((a) => (a.id === automationId ? { ...a, status: nextStatus as any } : a))
        );
        if (selectedAutomation?.id === automationId) {
          setSelectedAutomation((prev) => (prev ? { ...prev, status: nextStatus as any } : null));
        }
        fetchActivity();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteAutomation(automationId: string) {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    try {
      const res = await fetch(`/api/brains/${brainId}/automations/${automationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAutomationsList((prev) => prev.filter((a) => a.id !== automationId));
        if (selectedAutomation?.id === automationId) {
          setSelectedAutomation(null);
        }
        fetchActivity();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // --- AI BACKLOG & TASKS HANDLERS ---
  async function fetchBacklogTasks(filter?: string) {
    try {
      const activeF = filter || backlogFilter;
      const url = activeF === "ALL"
        ? `/api/brains/${brainId}/backlog`
        : `/api/brains/${brainId}/backlog?status=${activeF}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBacklogTasks(data);
      }
    } catch (e) {
      console.error("Backlog fetch error:", e);
    }
  }

  function handleOpenCreateTask() {
    // Pre-select first automation if available
    const autoId = automationsList.length > 0 ? automationsList[0].id : "";
    setCreateTaskForm({
      automationId: autoId,
      name: `Invoice #INV-${Date.now().toString().slice(-6)} — Supplier Disbursement`,
      priority: "MEDIUM",
      inputAmount: "1450.00",
      inputVendor: "Acquirer Cloud Services",
      inputInvoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    });
    setIsCreateTaskOpen(true);
  }

  async function handleCreateBacklogTask(e: React.FormEvent) {
    e.preventDefault();
    if (!createTaskForm.automationId) {
      alert("Please select a source automation. If you haven't created one yet, please add an automation first.");
      return;
    }
    if (!createTaskForm.name.trim()) {
      alert("Please enter a task name.");
      return;
    }

    try {
      setIsSaving(true);
      const inputPayload = {
        invoiceNumber: createTaskForm.inputInvoiceNumber,
        vendor: createTaskForm.inputVendor,
        amount: parseFloat(createTaskForm.inputAmount) || 1450.00,
        currency: "EUR",
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/brains/${brainId}/backlog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          automationId: createTaskForm.automationId,
          name: createTaskForm.name,
          priority: createTaskForm.priority,
          inputPayload,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create task in backlog");
      }

      setIsCreateTaskOpen(false);
      fetchBacklogTasks();
      fetchActivity();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExecuteTask(taskId: string) {
    try {
      const res = await fetch(`/api/brains/${brainId}/backlog/${taskId}/execute`, {
        method: "POST",
      });
      if (res.ok) {
        setBacklogTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: "IN_PROGRESS" } : t))
        );
        if (selectedTask?.id === taskId) {
          setSelectedTask((prev) => (prev ? { ...prev, status: "IN_PROGRESS" } : null));
        }
        fetchActivity();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCompleteTask(taskId: string) {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/brains/${brainId}/backlog/${taskId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        fetchBacklogTasks();
        fetchAutomations(); // Updates run counts
        fetchActivity();

        if (selectedTask?.id === taskId) {
          setSelectedTask((prev) =>
            prev
              ? {
                  ...prev,
                  status: "COMPLETED",
                  result: data.taskResult
                    ? {
                        id: data.taskResult.id,
                        status: data.taskResult.status,
                        outputPayload: data.taskResult.output_payload,
                        durationMs: data.taskResult.duration_ms,
                        aiReflection: data.taskResult.ai_reflection,
                        completedAt: data.taskResult.completed_at,
                      }
                    : null,
                }
              : null
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/brains/${brainId}/backlog/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBacklogTasks((prev) => prev.filter((t) => t.id !== taskId));
        if (selectedTask?.id === taskId) {
          setSelectedTask(null);
        }
        fetchActivity();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchHealth() {
    try {
      const res = await fetch(`/api/brains/${brainId}/health`);
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (e) {
      console.error('Health fetch error:', e);
    }
  }

  async function fetchKnowledge() {
    try {
      const res = await fetch(`/api/brains/${brainId}/knowledge`);
      if (res.ok) {
        const data = await res.json();
        setKnowledgeList(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchRules() {
    try {
      const res = await fetch(`/api/brains/${brainId}/rules`);
      if (res.ok) {
        const data = await res.json();
        setRulesList(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchActivity() {
    try {
      const res = await fetch(`/api/brains/${brainId}/activity`);
      if (res.ok) {
        const data = await res.json();
        setActivityList(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // --- TRAINING STUDIO HANDLERS ---
  async function handleStartProcessing(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!trainForm.content && !trainForm.instructions) {
      alert("Please provide document content or rules/instructions.");
      return;
    }

    try {
      setTrainingStep(3); // Move to Processing step
      setIsProcessingTraining(true);
      setTrainingNotification(null);

      const res = await fetch(`/api/brains/${brainId}/train/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainForm),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Brain processing failed");
      }

      const result = await res.json();
      setProposedTraining(result);

      // Default all extracted rules to accepted
      const ruleMap: Record<number, boolean> = {};
      (result.proposedRules || []).forEach((_: any, idx: number) => {
        ruleMap[idx] = true;
      });
      setAcceptedRuleMap(ruleMap);
      setApplyKnowledgeFlag(true);

      setTrainingStep(4); // Move to Review What Brain Learned
    } catch (err: any) {
      alert(err.message);
      setTrainingStep(2); // Go back to instructions on error
    } finally {
      setIsProcessingTraining(false);
    }
  }

  function toggleRuleSelection(idx: number) {
    setAcceptedRuleMap((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }

  async function handleApplyTraining() {
    if (!proposedTraining) return;

    try {
      setIsSaving(true);
      const selectedRules = (proposedTraining.proposedRules || []).filter(
        (_: any, idx: number) => acceptedRuleMap[idx] !== false
      );

      const res = await fetch(`/api/brains/${brainId}/train/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: "APPLY",
          applyKnowledge: applyKnowledgeFlag,
          knowledge: proposedTraining.learnedKnowledge,
          rules: selectedRules,
          memoryUpdates: proposedTraining.proposedMemory,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to apply training changes");
      }

      const result = await res.json();
      setTrainingNotification(`Applied successfully! Persisted ${result.createdKnowledgeIds?.length || 0} knowledge doc(s) and ${result.createdRuleIds?.length || 0} rule(s) to PostgreSQL.`);
      
      // Reset training studio
      setTrainingStep(1);
      setTrainForm({ title: "", category: "POLICY", content: "", instructions: "" });
      setProposedTraining(null);

      // Reload all sub-state
      fetchKnowledge();
      fetchRules();
      fetchActivity();
      fetchHealth();

      // Refresh brain details
      const brainRes = await fetch(`/api/brains/${brainId}`);
      if (brainRes.ok) {
        const bData = await brainRes.json();
        setBrain(bData);
        setMemoryJson(JSON.stringify(bData.memory_context || {}, null, 2));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDenyTraining() {
    try {
      setIsSaving(true);
      await fetch(`/api/brains/${brainId}/train/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "DENY" }),
      });

      setTrainingNotification("Proposed changes were denied. Nothing was saved to the database.");
      setTrainingStep(1);
      setTrainForm({ title: "", category: "POLICY", content: "", instructions: "" });
      setProposedTraining(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Update Brain Status
  async function handleStatusChange(newStatus: BrainData["status"]) {
    if (!brain) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/brains/${brainId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");
      const updated = await res.json();
      setBrain((prev) => (prev ? { ...prev, status: updated.status } : null));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Update Brain Prompt
  async function handlePromptSave(newPrompt: string) {
    if (!brain) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/brains/${brainId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: newPrompt }),
      });
      if (!res.ok) throw new Error("System prompt update failed");
      const updated = await res.json();
      setBrain((prev) => (prev ? { ...prev, system_prompt: updated.system_prompt } : null));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Create New Brain
  async function handleCreateBrain(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch("/api/brains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBrainForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create brain");
      }
      const created = await res.json();
      setIsCreateBrainOpen(false);
      router.push(`/dashboard/brains/${created.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Add Knowledge
  async function handleAddKnowledge(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch(`/api/brains/${brainId}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newKnowledgeForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add knowledge");
      }
      setIsAddKnowledgeOpen(false);
      setNewKnowledgeForm({ title: "", category: "POLICY", content: "", confidenceScore: 1.0 });
      fetchKnowledge();
      fetchActivity();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Delete Knowledge
  async function handleDeleteKnowledge(knowledgeId: string) {
    if (!confirm("Are you sure you want to remove this knowledge document?")) return;
    try {
      const res = await fetch(`/api/brains/${brainId}/knowledge/${knowledgeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setKnowledgeList((prev) => prev.filter((k) => k.id !== knowledgeId));
        fetchActivity();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Add Rule
  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSaving(true);
      const conditionPayload = {
        field: newRuleForm.conditionField,
        operator: newRuleForm.conditionOperator,
        value: newRuleForm.conditionValue,
      };

      const res = await fetch(`/api/brains/${brainId}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleCode: newRuleForm.ruleCode,
          title: newRuleForm.title,
          description: newRuleForm.description,
          priority: Number(newRuleForm.priority),
          isHardRule: newRuleForm.isHardRule,
          condition: conditionPayload,
          action: { type: newRuleForm.actionType },
          status: "ACTIVE",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create rule");
      }

      setIsAddRuleOpen(false);
      setNewRuleForm({
        ruleCode: "",
        title: "",
        description: "",
        actionType: "REQUIRE_APPROVAL",
        priority: 100,
        isHardRule: true,
        conditionField: "amount",
        conditionOperator: ">",
        conditionValue: "1000",
      });
      fetchRules();
      fetchActivity();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Toggle Rule Status
  async function handleToggleRuleStatus(ruleId: string, currentStatus: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/brains/${brainId}/rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setRulesList((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, status: nextStatus as any } : r))
        );
        fetchActivity();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Delete Rule
  async function handleDeleteRule(ruleId: string) {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      const res = await fetch(`/api/brains/${brainId}/rules/${ruleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRulesList((prev) => prev.filter((r) => r.id !== ruleId));
        fetchActivity();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Save Memory Context
  async function handleSaveMemory() {
    setMemoryEditError(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(memoryJson);
    } catch {
      setMemoryEditError("Invalid JSON structure. Please check syntax.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`/api/brains/${brainId}/memory`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryContext: parsed }),
      });
      if (!res.ok) throw new Error("Failed to save memory context");
      const data = await res.json();
      setBrain((prev) => (prev ? { ...prev, memory_context: data.memoryContext } : null));
      alert("Memory context updated successfully.");
      fetchActivity();
    } catch (err: any) {
      setMemoryEditError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Recalibrate Training
  async function handleTriggerCalibration() {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/brains/${brainId}/training`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Calibration failed");
      const updated = await res.json();
      setBrain((prev) =>
        prev
          ? {
              ...prev,
              learning_state: {
                ...prev.learning_state,
                confidenceScore: updated.confidenceScore,
                totalLearnings: updated.totalLearnings,
                status: updated.trainingStatus,
                lastReflectionAt: updated.lastReflectionAt,
              },
            }
          : null
      );
      alert("Neural calibration cycle completed successfully.");
      fetchActivity();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#64748B" }}>
          <RefreshCw size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
          Loading sovereign Brain intelligence...
        </div>
      </div>
    );
  }

  if (errorMessage || !brain) {
    return (
      <div className={styles.container}>
        <div className={styles.card} style={{ maxWidth: 500, margin: "60px auto", textAlign: "center" }}>
          <AlertCircle size={36} color="#DC2626" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Brain System Offline</h2>
          <p style={{ color: "#64748B", fontSize: 13, marginBottom: 20 }}>
            {errorMessage || "Brain not found for this company."}
          </p>
          <button
            className={styles.btnPrimary}
            onClick={() => setIsCreateBrainOpen(true)}
          >
            <Plus size={14} /> Provision Finance & Accounting Brain
          </button>
        </div>

        {/* Create Modal */}
        {renderCreateBrainModal()}
      </div>
    );
  }

  const confidenceScore = brain.learning_state?.confidenceScore ?? 0.98;
  const confidencePercent = (confidenceScore * 100).toFixed(1);

  return (
    <div className={styles.container}>
      {/* 1. Header Area */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.departmentBadge}>
            <Shield size={12} color="#020617" />
            {brain.department} BRAIN
          </div>
          <div className={styles.brainHeading}>
            <h1 className={styles.brainTitle}>{brain.name}</h1>
            <span
              className={`${styles.statusPill} ${
                brain.status === "ACTIVE"
                  ? styles.statusActive
                  : brain.status === "LEARNING"
                  ? styles.statusLearning
                  : styles.statusPaused
              }`}
            >
              <span className={styles.statusDot} />
              {brain.status}
            </span>
          </div>
          <p className={styles.brainDescription}>{brain.description}</p>
        </div>

        <div className={styles.headerActions}>
          {/* Status selector */}
          <select
            className={styles.select}
            style={{ width: "auto", fontSize: 12, padding: "6px 12px", background: "#FFFFFF" }}
            value={brain.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            disabled={isSaving}
          >
            <option value="ACTIVE">Status: ACTIVE</option>
            <option value="LEARNING">Status: LEARNING</option>
            <option value="PAUSED">Status: PAUSED</option>
            <option value="ARCHIVED">Status: ARCHIVED</option>
          </select>

          {/* Brain Switcher Dropdown */}
          <div className={styles.switcherContainer}>
            <button
              className={styles.btnSecondary}
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            >
              <BrainIcon size={14} />
              Switch Brain
              <ChevronDown size={12} />
            </button>

            {isSwitcherOpen && (
              <div className={styles.switcherDropdown}>
                <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Company Brains ({allBrains.length})
                </div>
                {allBrains.map((b) => (
                  <button
                    key={b.id}
                    className={`${styles.switcherItem} ${b.id === brain.id ? styles.switcherItemActive : ""}`}
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      if (b.id !== brain.id) router.push(`/dashboard/brains/${b.id}`);
                    }}
                  >
                    <span>{b.name}</span>
                    <span style={{ fontSize: 11, color: "#64748B" }}>{b.department}</span>
                  </button>
                ))}
                <div className={styles.switcherDivider} />
                <button
                  className={styles.switcherItem}
                  style={{ color: "#020617", fontWeight: 600 }}
                  onClick={() => {
                    setIsSwitcherOpen(false);
                    setIsCreateBrainOpen(true);
                  }}
                >
                  <Plus size={13} style={{ marginRight: 6 }} />
                  Create New Brain
                </button>
              </div>
            )}
          </div>

          <button className={styles.btnPrimary} onClick={() => setIsCreateBrainOpen(true)}>
            <Plus size={14} />
            New Brain
          </button>
        </div>
      </header>

      {/* 2. Navigation Tabs */}
      <nav className={styles.tabsBar}>
        <button
          className={`${styles.tabButton} ${activeTab === "overview" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Cpu size={14} />
          Overview
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "automations" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("automations")}
        >
          <Sparkles size={14} />
          Automations
          <span className={`${styles.tabBadge} ${activeTab === "automations" ? styles.tabBadgeActive : ""}`}>
            {automationsList.length}
          </span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "backlog" ? styles.tabButtonActive : ""}`}
          onClick={() => {
            setActiveTab("backlog");
            fetchBacklogTasks();
          }}
        >
          <Layers size={14} />
          AI Backlog
          <span className={`${styles.tabBadge} ${activeTab === "backlog" ? styles.tabBadgeActive : ""}`}>
            {backlogTasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length}
          </span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "knowledge" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("knowledge")}
        >
          <FileText size={14} />
          Knowledge
          <span className={`${styles.tabBadge} ${activeTab === "knowledge" ? styles.tabBadgeActive : ""}`}>
            {knowledgeList.length}
          </span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "rules" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("rules")}
        >
          <Lock size={14} />
          Rules & Governance
          <span className={`${styles.tabBadge} ${activeTab === "rules" ? styles.tabBadgeActive : ""}`}>
            {rulesList.length}
          </span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "memory" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("memory")}
        >
          <Database size={14} />
          Memory Context
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "training" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("training")}
        >
          <Sliders size={14} />
          Training Status
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "activity" ? styles.tabButtonActive : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          <ActivityIcon size={14} />
          Activity Log
        </button>
      </nav>

      {/* 3. Tab Contents */}

      {/* --- TAB: OVERVIEW --- */}
      {activeTab === "overview" && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>
                <FileText size={14} />
                Knowledge Base
              </div>
              <div className={styles.statValue}>{knowledgeList.length}</div>
              <div className={styles.statSubtext}>Policies, SOPs & Docs</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>
                <Lock size={14} />
                Active Rules
              </div>
              <div className={styles.statValue}>{rulesList.filter((r) => r.status === "ACTIVE").length}</div>
              <div className={styles.statSubtext}>{rulesList.filter((r) => r.is_hard_rule).length} hard constraints</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>
                <Sliders size={14} />
                Confidence Score
              </div>
              <div className={styles.statValue} style={{ color: "#059669" }}>{confidencePercent}%</div>
              <div className={styles.statSubtext}>Neural accuracy rating</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>
                <Cpu size={14} />
                AI Model
              </div>
              <div className={styles.statValue}>{brain.ai_model}</div>
              <div className={styles.statSubtext}>Temp: {brain.temperature} | Zero hallucination</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <Shield size={16} />
                  Core Mandate & System Directive
                </h3>
                <p className={styles.cardSubtitle}>
                  Defines the sovereign operational boundary and execution principles for {brain.name}.
                </p>
              </div>
              <button
                className={styles.btnSecondary}
                onClick={() => handlePromptSave(brain.system_prompt)}
                disabled={isSaving}
              >
                Save Prompt
              </button>
            </div>

            <textarea
              className={styles.textarea}
              value={brain.system_prompt}
              onChange={(e) => setBrain({ ...brain, system_prompt: e.target.value })}
              placeholder="Enter system prompt and instructions for this Brain..."
              style={{ minHeight: 160 }}
            />
          </div>
        </>
      )}

      {/* --- TAB: AUTOMATIONS --- */}
      {activeTab === "automations" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>
                <Sparkles size={16} />
                Sovereign Automations ({automationsList.length})
              </h3>
              <p className={styles.cardSubtitle}>
                Turnkey business tasks executing autonomously under {brain.name}&apos;s governance rules.
              </p>
            </div>
            <button className={styles.btnAccent} onClick={handleOpenAddAutomation}>
              <Plus size={14} /> Add Automation
            </button>
          </div>

          {automationsList.length === 0 ? (
            <div className={styles.emptyState}>
              <Sparkles size={36} color="#64748B" style={{ margin: "0 auto" }} />
              <div className={styles.emptyTitle}>No automations active yet</div>
              <div className={styles.emptySubtitle}>
                Choose a task (e.g. Process Invoices, Reconcile Payments, Audit Expenses, Payment Approval) to automate under this Brain.
              </div>
              <button className={styles.btnAccent} onClick={handleOpenAddAutomation}>
                <Plus size={14} /> Add First Automation
              </button>
            </div>
          ) : (
            <div className={styles.automationGrid}>
              {automationsList.map((auto) => {
                const taskType = auto.metadata?.taskType || "CUSTOM_TASK";
                const apps = auto.metadata?.requiredApps || [];
                const permissions = auto.metadata?.permissions || [];

                return (
                  <div key={auto.id} className={styles.automationCard}>
                    <div>
                      <div className={styles.automationCardHeader}>
                        <div className={styles.automationTitleArea}>
                          <div className={styles.automationIconBox}>
                            <Cpu size={18} />
                          </div>
                          <div>
                            <h4 className={styles.automationName}>{auto.name}</h4>
                            <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                              {taskType.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`${styles.statusPill} ${
                            auto.status === "ACTIVE"
                              ? styles.statusActive
                              : auto.status === "PAUSED"
                              ? styles.statusPaused
                              : styles.statusDraft
                          }`}
                        >
                          <span className={styles.statusDot} />
                          {auto.status}
                        </span>
                      </div>

                      <p className={styles.automationDesc}>{auto.description}</p>

                      {/* Required Apps Chips */}
                      {apps.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>
                            Required Apps:
                          </div>
                          <div className={styles.chipRow}>
                            {apps.map((app, idx) => (
                              <span key={idx} className={styles.appChip}>
                                <Layers size={11} />
                                {app}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Permissions Granted */}
                      {permissions.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>
                            Permissions:
                          </div>
                          <div className={styles.chipRow}>
                            {permissions.map((perm, idx) => (
                              <span key={idx} className={styles.permissionTag}>
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles.automationFooter}>
                      <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, background: "#F1F5F9", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                          {auto.trigger_type}
                        </span>
                        <span>{auto.total_runs || 0} runs</span>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className={styles.btnSecondary}
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          onClick={() => handleToggleAutomationStatus(auto.id, auto.status)}
                        >
                          {auto.status === "ACTIVE" ? "Pause" : "Activate"}
                        </button>

                        <button
                          className={styles.btnSecondary}
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          onClick={() => setSelectedAutomation(auto)}
                        >
                          Details
                        </button>

                        <button
                          className={styles.btnDanger}
                          onClick={() => handleDeleteAutomation(auto.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB: AI BACKLOG & TASKS --- */}
      {activeTab === "backlog" && (
        <>
          {/* Quick Metrics Bar */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Pending Queue</div>
              <div className={styles.statValue} style={{ color: "#D97706" }}>
                {backlogTasks.filter((t) => t.status === "PENDING").length}
              </div>
              <div className={styles.statSubtext}>Awaiting Brain execution</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>In Progress</div>
              <div className={styles.statValue} style={{ color: "#2563EB" }}>
                {backlogTasks.filter((t) => t.status === "IN_PROGRESS").length}
              </div>
              <div className={styles.statSubtext}>Active execution pipeline</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Completed Tasks</div>
              <div className={styles.statValue} style={{ color: "#059669" }}>
                {backlogTasks.filter((t) => t.status === "COMPLETED").length}
              </div>
              <div className={styles.statSubtext}>Telemetry &amp; results saved</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Backlog Volume</div>
              <div className={styles.statValue}>{backlogTasks.length}</div>
              <div className={styles.statSubtext}>From {automationsList.length} active automations</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <Layers size={16} />
                  AI Task Execution Backlog ({backlogTasks.length})
                </h3>
                <p className={styles.cardSubtitle}>
                  Operational task queue executing under {brain.name}&apos;s governance rules.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => fetchBacklogTasks()}
                  disabled={isSaving}
                >
                  <RefreshCw size={13} style={{ animation: isSaving ? "spin 1s linear infinite" : "none" }} />
                  Refresh
                </button>

                <button
                  className={styles.btnAccent}
                  onClick={handleOpenCreateTask}
                >
                  <Plus size={14} />
                  Add Task to Backlog
                </button>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className={styles.backlogFilterBar}>
              {(["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"] as const).map((filter) => {
                const count =
                  filter === "ALL"
                    ? backlogTasks.length
                    : backlogTasks.filter((t) => t.status === filter).length;

                return (
                  <button
                    key={filter}
                    className={`${styles.filterBtn} ${backlogFilter === filter ? styles.filterBtnActive : ""}`}
                    onClick={() => {
                      setBacklogFilter(filter);
                      fetchBacklogTasks(filter);
                    }}
                  >
                    <span>{filter.replace(/_/g, " ")}</span>
                    <span className={styles.filterBadge}>{count}</span>
                  </button>
                );
              })}
            </div>

            {backlogTasks.length === 0 ? (
              <div className={styles.emptyState}>
                <Layers size={36} color="#64748B" style={{ margin: "0 auto" }} />
                <div className={styles.emptyTitle}>No tasks in the Backlog</div>
                <div className={styles.emptySubtitle}>
                  Queue up tasks from your active Automations to test autonomous processing and governance evaluation.
                </div>
                <button className={styles.btnAccent} onClick={handleOpenCreateTask}>
                  <Plus size={14} /> Add First Task
                </button>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Source Automation</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backlogTasks.map((task) => {
                      const priority = task.metadata?.priority || "MEDIUM";

                      return (
                        <tr key={task.id}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{task.name}</div>
                            <div style={{ fontSize: 11, color: "#64748B" }}>
                              Type: <code>{task.taskType}</code>
                            </div>
                          </td>

                          <td>
                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                              {task.automationName || "Automation"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`${styles.priorityBadge} ${
                                priority === "HIGH"
                                  ? styles.priorityHigh
                                  : priority === "MEDIUM"
                                  ? styles.priorityMedium
                                  : styles.priorityLow
                              }`}
                            >
                              {priority}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`${styles.statusPill} ${
                                task.status === "COMPLETED"
                                  ? styles.statusCompleted
                                  : task.status === "IN_PROGRESS"
                                  ? styles.statusInProgress
                                  : styles.statusPending
                              }`}
                            >
                              <span className={styles.statusDot} />
                              {task.status.replace(/_/g, " ")}
                            </span>
                          </td>

                          <td style={{ fontSize: 12, color: "#64748B" }}>
                            {new Date(task.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>

                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                              {task.status === "PENDING" && (
                                <button
                                  className={styles.btnPrimary}
                                  style={{ padding: "4px 8px", fontSize: 11 }}
                                  onClick={() => handleExecuteTask(task.id)}
                                >
                                  Execute
                                </button>
                              )}

                              {task.status === "IN_PROGRESS" && (
                                <button
                                  className={styles.btnAccent}
                                  style={{ padding: "4px 8px", fontSize: 11 }}
                                  onClick={() => handleCompleteTask(task.id)}
                                  disabled={isSaving}
                                >
                                  <CheckCircle2 size={11} /> Complete
                                </button>
                              )}

                              <button
                                className={styles.btnSecondary}
                                style={{ padding: "4px 8px", fontSize: 11 }}
                                onClick={() => setSelectedTask(task)}
                              >
                                Details
                              </button>

                              <button
                                className={styles.btnDanger}
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* --- TAB: KNOWLEDGE --- */}
      {activeTab === "knowledge" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>
                <FileText size={16} />
                Institutional Knowledge Repository
              </h3>
              <p className={styles.cardSubtitle}>
                Policies, SOPs, financial thresholds, and documentation indexed into {brain.name}.
              </p>
            </div>
            <button className={styles.btnPrimary} onClick={() => setIsAddKnowledgeOpen(true)}>
              <Plus size={14} /> Add Knowledge
            </button>
          </div>

          {knowledgeList.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={36} color="#64748B" style={{ margin: "0 auto" }} />
              <div className={styles.emptyTitle}>No knowledge documents indexed yet</div>
              <div className={styles.emptySubtitle}>
                Add institutional policies (e.g. Travel Spend Limits, Invoice Matching Rules, Chart of Accounts) to teach the brain.
              </div>
              <button className={styles.btnSecondary} onClick={() => setIsAddKnowledgeOpen(true)}>
                <Plus size={14} /> Index First Document
              </button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Source</th>
                    <th>Confidence</th>
                    <th>Date Added</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {knowledgeList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: "#64748B", maxWidth: 460, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.content}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#F1F5F9", borderRadius: 4 }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "#64748B" }}>{item.source}</td>
                      <td>
                        <span style={{ color: "#059669", fontWeight: 600, fontSize: 12 }}>
                          {(item.confidence_score * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "#64748B" }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className={styles.btnDanger}
                          onClick={() => handleDeleteKnowledge(item.id)}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB: RULES --- */}
      {activeTab === "rules" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>
                <Lock size={16} />
                Governance & Decision Rules
              </h3>
              <p className={styles.cardSubtitle}>
                Deterministic constraints and human-in-the-loop approval gates evaluated on every action.
              </p>
            </div>
            <button className={styles.btnPrimary} onClick={() => setIsAddRuleOpen(true)}>
              <Plus size={14} /> Add Rule
            </button>
          </div>

          {rulesList.length === 0 ? (
            <div className={styles.emptyState}>
              <Lock size={36} color="#64748B" style={{ margin: "0 auto" }} />
              <div className={styles.emptyTitle}>No governance rules configured</div>
              <div className={styles.emptySubtitle}>
                Establish safety boundaries such as &quot;Invoices above €1,000 require CFO approval&quot; or &quot;Never modify closed fiscal periods&quot;.
              </div>
              <button className={styles.btnSecondary} onClick={() => setIsAddRuleOpen(true)}>
                <Plus size={14} /> Create First Rule
              </button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Rule</th>
                    <th>Condition / Criteria</th>
                    <th>Enforced Action</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rulesList.map((rule) => (
                    <tr key={rule.id}>
                      <td style={{ fontWeight: 700, fontSize: 12, color: "#64748B" }}>
                        #{rule.priority}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{rule.title}</div>
                        {rule.rule_code && (
                          <span style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>
                            {rule.rule_code}
                          </span>
                        )}
                      </td>
                      <td>
                        <code style={{ fontSize: 11, background: "#F1F5F9", padding: "2px 6px", borderRadius: 4 }}>
                          {JSON.stringify(rule.condition)}
                        </code>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#F1F5F9", borderRadius: 4 }}>
                          {rule.action?.type || "REQUIRE_APPROVAL"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: rule.is_hard_rule ? "#DC2626" : "#020617",
                          }}
                        >
                          {rule.is_hard_rule ? "Hard Constraint" : "Heuristic"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.btnSecondary}
                          style={{
                            padding: "4px 8px",
                            fontSize: 11,
                            color: rule.status === "ACTIVE" ? "#059669" : "#64748B",
                          }}
                          onClick={() => handleToggleRuleStatus(rule.id, rule.status)}
                        >
                          {rule.status}
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className={styles.btnDanger}
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB: MEMORY --- */}
      {activeTab === "memory" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>
                <Database size={16} />
                Working Memory Context
              </h3>
              <p className={styles.cardSubtitle}>
                Live state parameters, financial variables, and company reconciliation thresholds.
              </p>
            </div>
            <button className={styles.btnPrimary} onClick={handleSaveMemory} disabled={isSaving}>
              Save Memory
            </button>
          </div>

          {memoryEditError && (
            <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FEE2E2", color: "#DC2626", borderRadius: 6, fontSize: 13, marginBottom: 14 }}>
              {memoryEditError}
            </div>
          )}

          <textarea
            className={`${styles.textarea} ${styles.codeArea}`}
            value={memoryJson}
            onChange={(e) => setMemoryJson(e.target.value)}
            style={{ minHeight: 280 }}
          />

          <div style={{ marginTop: 12, fontSize: 12, color: "#64748B" }}>
            Format: Valid JSON object. Stored directly in the <code>memory_context</code> field of this Brain.
          </div>
        </div>
      )}

      {/* --- TAB: TRAINING STATUS & TRAINING STUDIO --- */}
      {activeTab === "training" && (
        <>
          {/* 1. Knowledge Health & Training Progress Card */}
          <div className={styles.healthCard}>
            <div className={styles.healthHeader}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                    <Sliders size={16} />
                    Knowledge Health & Operational Readiness
                  </h3>
                  <span
                    className={`${styles.statusPill} ${
                      (healthData?.healthScore ?? 0) >= 80
                        ? styles.statusActive
                        : (healthData?.healthScore ?? 0) >= 50
                        ? styles.statusLearning
                        : styles.statusPaused
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {healthData?.readinessStatus || "CALIBRATING"}
                  </span>
                </div>
                <p className={styles.cardSubtitle}>
                  Real-time competence rating derived from indexed documents, deterministic safety rules, and operational memory.
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className={styles.healthScoreLarge}>
                  {healthData?.healthScore ?? 0}
                  <span className={styles.healthScoreDenominator}>/100</span>
                </div>
              </div>
            </div>

            {/* Health Bar */}
            <div className={styles.healthBarTrack}>
              <div
                className={styles.healthBarFill}
                style={{ width: `${healthData?.healthScore ?? 0}%` }}
              />
            </div>

            {/* Sub-Metrics Breakdown */}
            <div className={styles.healthSubGrid}>
              <div className={styles.healthSubItem}>
                <div className={styles.healthSubLabel}>Policy Breadth</div>
                <div className={styles.healthSubVal}>
                  {healthData?.breakdown.knowledgeScore.current ?? 0} / 30 pts
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                  {knowledgeList.length} doc(s) across {healthData?.breakdown.knowledgeScore.categories ?? 0} categories
                </div>
              </div>

              <div className={styles.healthSubItem}>
                <div className={styles.healthSubLabel}>Governance Density</div>
                <div className={styles.healthSubVal}>
                  {healthData?.breakdown.rulesScore.current ?? 0} / 35 pts
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                  {rulesList.length} rules ({rulesList.filter((r) => r.is_hard_rule).length} hard constraints)
                </div>
              </div>

              <div className={styles.healthSubItem}>
                <div className={styles.healthSubLabel}>Memory Context</div>
                <div className={styles.healthSubVal}>
                  {healthData?.breakdown.memoryScore.current ?? 0} / 15 pts
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                  {Object.keys(brain.memory_context || {}).length} parameter(s) configured
                </div>
              </div>

              <div className={styles.healthSubItem}>
                <div className={styles.healthSubLabel}>Neural Calibration</div>
                <div className={styles.healthSubVal}>
                  {healthData?.breakdown.confidenceScore.current ?? 0} / 20 pts
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                  {confidencePercent}% accuracy index
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {healthData?.recommendations && healthData.recommendations.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748B" }}>
                <CheckCircle2 size={14} color="#059669" />
                <span><strong>Recommendation:</strong> {healthData.recommendations[0]}</span>
              </div>
            )}
          </div>

          {/* Training Notification Banner */}
          {trainingNotification && (
            <div style={{ padding: "12px 18px", background: "#F1F5F9", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#020617", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{trainingNotification}</span>
              <button
                className={styles.btnSecondary}
                style={{ padding: "3px 8px", fontSize: 11 }}
                onClick={() => setTrainingNotification(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 2. 5-Step Brain Training Studio */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>
                  <BrainIcon size={16} />
                  Sovereign Brain Training Studio
                </h3>
                <p className={styles.cardSubtitle}>
                  Teach {brain.name} institutional documentation, processes, and governance rules with strict human review.
                </p>
              </div>

              <button
                className={styles.btnSecondary}
                onClick={handleTriggerCalibration}
                disabled={isSaving}
              >
                <RefreshCw size={13} style={{ animation: isSaving ? "spin 1s linear infinite" : "none" }} />
                Recalibrate Brain
              </button>
            </div>

            {/* Stepper Header */}
            <div className={styles.stepperContainer}>
              <div className={`${styles.stepItem} ${trainingStep === 1 ? styles.stepItemActive : trainingStep > 1 ? styles.stepItemCompleted : ""}`}>
                <div className={`${styles.stepCircle} ${trainingStep === 1 ? styles.stepCircleActive : trainingStep > 1 ? styles.stepCircleCompleted : ""}`}>
                  {trainingStep > 1 ? "✓" : "1"}
                </div>
                <span>1. Knowledge &amp; Docs</span>
              </div>

              <div className={styles.stepLine} />

              <div className={`${styles.stepItem} ${trainingStep === 2 ? styles.stepItemActive : trainingStep > 2 ? styles.stepItemCompleted : ""}`}>
                <div className={`${styles.stepCircle} ${trainingStep === 2 ? styles.stepCircleActive : trainingStep > 2 ? styles.stepCircleCompleted : ""}`}>
                  {trainingStep > 2 ? "✓" : "2"}
                </div>
                <span>2. Rules &amp; Directives</span>
              </div>

              <div className={styles.stepLine} />

              <div className={`${styles.stepItem} ${trainingStep === 3 ? styles.stepItemActive : trainingStep > 3 ? styles.stepItemCompleted : ""}`}>
                <div className={`${styles.stepCircle} ${trainingStep === 3 ? styles.stepCircleActive : trainingStep > 3 ? styles.stepCircleCompleted : ""}`}>
                  {trainingStep > 3 ? "✓" : "3"}
                </div>
                <span>3. Synthesis</span>
              </div>

              <div className={styles.stepLine} />

              <div className={`${styles.stepItem} ${trainingStep === 4 ? styles.stepItemActive : trainingStep > 4 ? styles.stepItemCompleted : ""}`}>
                <div className={`${styles.stepCircle} ${trainingStep === 4 ? styles.stepCircleActive : trainingStep > 4 ? styles.stepCircleCompleted : ""}`}>
                  {trainingStep > 4 ? "✓" : "4"}
                </div>
                <span>4. What Brain Learned</span>
              </div>

              <div className={styles.stepLine} />

              <div className={`${styles.stepItem} ${trainingStep === 5 ? styles.stepItemActive : ""}`}>
                <div className={`${styles.stepCircle} ${trainingStep === 5 ? styles.stepCircleActive : ""}`}>
                  5
                </div>
                <span>5. Apply / Deny</span>
              </div>
            </div>

            {/* --- STEP 1: ADD KNOWLEDGE & DOCUMENTS --- */}
            {trainingStep === 1 && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#020617" }}>Step 1: Company Knowledge &amp; Processes</div>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    Paste an operational document, policy, SOP, or business context for this {brain.department} Brain.
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Document Title</label>
                  <input
                    className={styles.input}
                    placeholder="e.g. Accounts Payable Disbursement Policy 2026"
                    value={trainForm.title}
                    onChange={(e) => setTrainForm({ ...trainForm, title: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <select
                    className={styles.select}
                    value={trainForm.category}
                    onChange={(e) => setTrainForm({ ...trainForm, category: e.target.value })}
                  >
                    <option value="POLICY">Policy &amp; Spend Governance</option>
                    <option value="SOP">Standard Operating Procedure (SOP)</option>
                    <option value="PROCESS">Business Process Specification</option>
                    <option value="GLOSSARY">Chart of Accounts / Glossary</option>
                    <option value="GENERAL">General Operational Context</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Document Content</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Paste full documentation, guidelines, policies, approval hierarchies, or process flows here..."
                    value={trainForm.content}
                    onChange={(e) => setTrainForm({ ...trainForm, content: e.target.value })}
                    style={{ minHeight: 180 }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => {
                      if (!trainForm.content.trim() && !trainForm.title.trim()) {
                        alert("Please enter a document title or paste document content.");
                        return;
                      }
                      setTrainingStep(2);
                    }}
                  >
                    Next: Add Rules &amp; Instructions
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 2: ADD RULES & INSTRUCTIONS --- */}
            {trainingStep === 2 && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#020617" }}>Step 2: Operating Rules &amp; Strict Instructions</div>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    Define concrete constraints, approval thresholds, mandatory verifications, or forbidden actions.
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Operating Rules &amp; Directives (Bullet points or natural language)</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Example rules:&#10;- Require CFO approval for invoices above €1,000&#10;- Never process payments on weekends or holidays&#10;- Mandatory three-way match between PO, receipt, and invoice&#10;- Vendor payment terms must default to Net 30"
                    value={trainForm.instructions}
                    onChange={(e) => setTrainForm({ ...trainForm, instructions: e.target.value })}
                    style={{ minHeight: 180 }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => setTrainingStep(1)}
                  >
                    Back to Knowledge
                  </button>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className={styles.btnSecondary}
                      onClick={() => {
                        setTrainForm((prev) => ({
                          ...prev,
                          instructions: prev.instructions
                            ? `${prev.instructions}\n- Require approval above €1,000\n- Strict three-way invoice matching mandatory`
                            : `- Require approval above €1,000\n- Strict three-way invoice matching mandatory\n- Default payment terms Net 30`,
                        }));
                      }}
                    >
                      Insert Standard Finance Rules
                    </button>

                    <button
                      className={styles.btnAccent}
                      onClick={handleStartProcessing}
                      disabled={isProcessingTraining}
                    >
                      <Sparkles size={14} />
                      Process &amp; Teach Brain
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 3: PROCESSING & SYNTHESIS --- */}
            {trainingStep === 3 && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <RefreshCw
                  size={32}
                  color="#020617"
                  style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }}
                />
                <div style={{ fontSize: 16, fontWeight: 700, color: "#020617", marginBottom: 6 }}>
                  Brain is Processing Information...
                </div>
                <div style={{ fontSize: 13, color: "#64748B", maxWidth: 440, margin: "0 auto" }}>
                  Synthesizing institutional knowledge, extracting deterministic governance rules, and calibrating memory parameters.
                </div>
              </div>
            )}

            {/* --- STEP 4 & 5: WHAT THE BRAIN LEARNED & DECISION GATE --- */}
            {(trainingStep === 4 || trainingStep === 5) && proposedTraining && (
              <div className={styles.reviewBox}>
                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#020617" }}>Step 4 &amp; 5: What the Brain Learned &amp; Review Gate</div>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                    Review the extracted knowledge, governance rules, and memory parameters before applying them to the sovereign database.
                  </div>
                </div>

                {/* Executive Summary Callout */}
                <div className={styles.summaryCallout}>
                  <strong>Executive Synthesis:</strong> {proposedTraining.executiveSummary}
                  <div style={{ marginTop: 6, display: "flex", gap: 14, fontSize: 12, color: "#059669", fontWeight: 600 }}>
                    <span>✓ Projected Health Impact: +{proposedTraining.healthDelta}%</span>
                    <span>✓ {proposedTraining.proposedRules.length} Rule(s) Formulated</span>
                    <span>✓ {Object.keys(proposedTraining.proposedMemory).length} Memory Parameter(s) Detected</span>
                  </div>
                </div>

                {/* Section A: Synthesized Knowledge */}
                {proposedTraining.learnedKnowledge && (
                  <div className={styles.reviewSection}>
                    <div className={styles.reviewSectionHeader}>
                      <h4 className={styles.reviewSectionTitle}>
                        <FileText size={15} />
                        Proposed Knowledge Document
                      </h4>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={applyKnowledgeFlag}
                          onChange={(e) => setApplyKnowledgeFlag(e.target.checked)}
                        />
                        Include Knowledge
                      </label>
                    </div>

                    <div style={{ opacity: applyKnowledgeFlag ? 1 : 0.4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{proposedTraining.learnedKnowledge.title}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, background: "#F1F5F9", padding: "2px 8px", borderRadius: 4 }}>
                          {proposedTraining.learnedKnowledge.category}
                        </span>
                      </div>

                      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12, maxHeight: 120, overflowY: "auto", padding: "8px 12px", background: "#F8FAFC", borderRadius: 6 }}>
                        {proposedTraining.learnedKnowledge.content}
                      </div>

                      {proposedTraining.learnedKnowledge.keyTakeaways && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>Key Takeaways Learned:</div>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#020617" }}>
                            {proposedTraining.learnedKnowledge.keyTakeaways.map((point, i) => (
                              <li key={i} style={{ marginBottom: 4 }}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section B: Proposed Governance Rules */}
                <div className={styles.reviewSection}>
                  <div className={styles.reviewSectionHeader}>
                    <h4 className={styles.reviewSectionTitle}>
                      <Lock size={15} />
                      Proposed Governance Rules ({proposedTraining.proposedRules.length})
                    </h4>
                    <span style={{ fontSize: 12, color: "#64748B" }}>
                      Select rules to enforce
                    </span>
                  </div>

                  {proposedTraining.proposedRules.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#64748B" }}>No explicit rules were extracted from this input.</div>
                  ) : (
                    <div>
                      {proposedTraining.proposedRules.map((rule, idx) => {
                        const isChecked = acceptedRuleMap[idx] !== false;
                        return (
                          <div
                            key={idx}
                            className={`${styles.ruleCheckboxCard} ${isChecked ? styles.ruleCheckboxCardSelected : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleRuleSelection(idx)}
                              style={{ marginTop: 3, cursor: "pointer" }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{rule.title}</span>
                                {rule.ruleCode && (
                                  <code style={{ fontSize: 11, background: "#E5E7EB", padding: "1px 5px", borderRadius: 3 }}>
                                    {rule.ruleCode}
                                  </code>
                                )}
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 6px",
                                    borderRadius: 3,
                                    background: rule.isHardRule ? "#FEF2F2" : "#F1F5F9",
                                    color: rule.isHardRule ? "#DC2626" : "#020617",
                                  }}
                                >
                                  {rule.isHardRule ? "HARD RULE" : "SOFT RULE"}
                                </span>
                              </div>

                              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                                {rule.description}
                              </div>

                              <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: "#64748B" }}>
                                <span>Condition: <code>{JSON.stringify(rule.condition)}</code></span>
                                <span>Action: <strong>{rule.action?.type}</strong></span>
                                <span>Priority: <strong>#{rule.priority}</strong></span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section C: Proposed Memory Parameters */}
                {Object.keys(proposedTraining.proposedMemory).length > 0 && (
                  <div className={styles.reviewSection}>
                    <div className={styles.reviewSectionHeader}>
                      <h4 className={styles.reviewSectionTitle}>
                        <Database size={15} />
                        Extracted Operational Memory
                      </h4>
                    </div>

                    <pre className={styles.codeArea} style={{ margin: 0 }}>
                      {JSON.stringify(proposedTraining.proposedMemory, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Decision Gate Action Bar */}
                <div className={styles.decisionBar}>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => setTrainingStep(2)}
                  >
                    Back to Edit
                  </button>

                  <button
                    className={styles.btnSecondary}
                    style={{ color: "#DC2626", borderColor: "#FEE2E2" }}
                    onClick={handleDenyTraining}
                    disabled={isSaving}
                  >
                    Deny &amp; Discard All
                  </button>

                  <button
                    className={styles.btnAccent}
                    onClick={handleApplyTraining}
                    disabled={isSaving}
                  >
                    <CheckCircle2 size={15} />
                    {isSaving ? "Persisting to Database..." : "Apply to Sovereign Brain"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* --- TAB: ACTIVITY LOG --- */}
      {activeTab === "activity" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>
                <ActivityIcon size={16} />
                Operational Audit Trail
              </h3>
              <p className={styles.cardSubtitle}>
                Immutable record of configuration changes, knowledge indexing, and governance events.
              </p>
            </div>
            <button className={styles.btnSecondary} onClick={fetchActivity}>
              <RefreshCw size={13} />
              Refresh Log
            </button>
          </div>

          {activityList.length === 0 ? (
            <div className={styles.emptyState}>
              <ActivityIcon size={36} color="#64748B" style={{ margin: "0 auto" }} />
              <div className={styles.emptyTitle}>No activity events logged yet</div>
              <div className={styles.emptySubtitle}>Operational events will appear here automatically.</div>
            </div>
          ) : (
            <div className={styles.activityList}>
              {activityList.map((item) => (
                <div key={item.id} className={styles.activityItem}>
                  <div className={styles.activityIconArea}>
                    <ActivityIcon size={15} />
                  </div>
                  <div className={styles.activityBody}>
                    <div className={styles.activityTitle}>{item.title}</div>
                    <div className={styles.activityDetail}>{item.detail}</div>
                    <div className={styles.activityMeta}>
                      <span className={styles.activityBadge}>{item.badge}</span>
                      <span className={styles.activityTime}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {renderCreateBrainModal()}
      {renderAddKnowledgeModal()}
      {renderAddRuleModal()}
      {renderAddAutomationModal()}
      {renderAutomationDetailsDrawer()}
      {renderCreateTaskModal()}
      {renderTaskDetailsDrawer()}
    </div>
  );

  // --- RENDER MODALS ---

  function renderCreateBrainModal() {
    if (!isCreateBrainOpen) return null;
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Provision Sovereign Brain</h3>
            <button className={styles.btnSecondary} style={{ padding: 4 }} onClick={() => setIsCreateBrainOpen(false)}>
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleCreateBrain}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Department</label>
              <select
                className={styles.select}
                value={newBrainForm.department}
                onChange={(e) => {
                  const dept = e.target.value;
                  if (dept === "FINANCE") {
                    setNewBrainForm({
                      ...newBrainForm,
                      department: dept,
                      name: "Finance & Accounting Brain",
                      description: "Sovereign intelligence for invoice reconciliation, spend governance, and ledger auditing.",
                    });
                  } else {
                    setNewBrainForm({
                      ...newBrainForm,
                      department: dept,
                      name: `${dept.charAt(0) + dept.slice(1).toLowerCase()} Brain`,
                      description: `Dedicated sovereign intelligence for ${dept.toLowerCase()} operations.`,
                    });
                  }
                }}
              >
                <option value="FINANCE">FINANCE & ACCOUNTING</option>
                <option value="OPERATIONS">OPERATIONS</option>
                <option value="LEGAL">LEGAL & COMPLIANCE</option>
                <option value="SALES">SALES & REVENUE</option>
                <option value="GENERAL">GENERAL ENTERPRISE</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Brain Name</label>
              <input
                className={styles.input}
                value={newBrainForm.name}
                onChange={(e) => setNewBrainForm({ ...newBrainForm, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <input
                className={styles.input}
                value={newBrainForm.description}
                onChange={(e) => setNewBrainForm({ ...newBrainForm, description: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>System Mandate / Prompt</label>
              <textarea
                className={styles.textarea}
                value={newBrainForm.systemPrompt}
                onChange={(e) => setNewBrainForm({ ...newBrainForm, systemPrompt: e.target.value })}
                style={{ minHeight: 90 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>AI Model</label>
                <select
                  className={styles.select}
                  value={newBrainForm.aiModel}
                  onChange={(e) => setNewBrainForm({ ...newBrainForm, aiModel: e.target.value })}
                >
                  <option value="gpt-4o">gpt-4o (Enterprise High-Reasoning)</option>
                  <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                  <option value="llama-3.3-70b">llama-3.3-70b</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Temperature</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  className={styles.input}
                  value={newBrainForm.temperature}
                  onChange={(e) => setNewBrainForm({ ...newBrainForm, temperature: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setIsCreateBrainOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
                {isSaving ? "Provisioning..." : "Provision Brain"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderAddKnowledgeModal() {
    if (!isAddKnowledgeOpen) return null;
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Index Knowledge Document</h3>
            <button className={styles.btnSecondary} style={{ padding: 4 }} onClick={() => setIsAddKnowledgeOpen(false)}>
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleAddKnowledge}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Title</label>
              <input
                className={styles.input}
                placeholder="e.g. Accounts Payable Standard Operating Procedure"
                value={newKnowledgeForm.title}
                onChange={(e) => setNewKnowledgeForm({ ...newKnowledgeForm, title: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.select}
                value={newKnowledgeForm.category}
                onChange={(e) => setNewKnowledgeForm({ ...newKnowledgeForm, category: e.target.value })}
              >
                <option value="POLICY">Policy & Governance</option>
                <option value="SOP">Standard Operating Procedure (SOP)</option>
                <option value="GLOSSARY">Chart of Accounts / Glossary</option>
                <option value="API_DOCS">API Specification</option>
                <option value="GENERAL">General Reference</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Document Content</label>
              <textarea
                className={styles.textarea}
                placeholder="Enter exact rules, thresholds, vendor policies or instructions..."
                value={newKnowledgeForm.content}
                onChange={(e) => setNewKnowledgeForm({ ...newKnowledgeForm, content: e.target.value })}
                style={{ minHeight: 140 }}
                required
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setIsAddKnowledgeOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
                {isSaving ? "Indexing..." : "Index Document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderAddRuleModal() {
    if (!isAddRuleOpen) return null;
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Configure Governance Rule</h3>
            <button className={styles.btnSecondary} style={{ padding: 4 }} onClick={() => setIsAddRuleOpen(false)}>
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleAddRule}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Rule Title</label>
              <input
                className={styles.input}
                placeholder="e.g. Flag wire transfers exceeding €5,000 for CFO signoff"
                value={newRuleForm.title}
                onChange={(e) => setNewRuleForm({ ...newRuleForm, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Rule Code (Optional)</label>
                <input
                  className={styles.input}
                  placeholder="RULE_SPEND_5K"
                  value={newRuleForm.ruleCode}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, ruleCode: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Priority (1-1000)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={newRuleForm.priority}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, priority: parseInt(e.target.value) || 100 })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Field</label>
                <input
                  className={styles.input}
                  value={newRuleForm.conditionField}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, conditionField: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Operator</label>
                <select
                  className={styles.select}
                  value={newRuleForm.conditionOperator}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, conditionOperator: e.target.value })}
                >
                  <option value=">">&gt; (Greater than)</option>
                  <option value=">=">&gt;= (Greater or equal)</option>
                  <option value="<">&lt; (Less than)</option>
                  <option value="==">== (Equals)</option>
                  <option value="!=">!= (Not equals)</option>
                  <option value="contains">contains</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Value</label>
                <input
                  className={styles.input}
                  value={newRuleForm.conditionValue}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, conditionValue: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Enforced Action</label>
                <select
                  className={styles.select}
                  value={newRuleForm.actionType}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, actionType: e.target.value })}
                >
                  <option value="REQUIRE_APPROVAL">Require Human Approval</option>
                  <option value="BLOCK">Block Execution</option>
                  <option value="ALLOW">Allow Explicitly</option>
                  <option value="NOTIFY_ADMIN">Notify Administrator</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Constraint Type</label>
                <select
                  className={styles.select}
                  value={newRuleForm.isHardRule ? "HARD" : "SOFT"}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, isHardRule: e.target.value === "HARD" })}
                >
                  <option value="HARD">Hard Constraint (Strict Safety)</option>
                  <option value="SOFT">Soft Heuristic (Warning)</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setIsAddRuleOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Rule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderAddAutomationModal() {
    if (!isAddAutomationOpen) return null;

    const departmentTemplates = TASK_TEMPLATES.filter(
      (t) => t.department === brain?.department || t.department === "GENERAL"
    );
    const displayTemplates = departmentTemplates.length > 0 ? departmentTemplates : TASK_TEMPLATES;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent} style={{ maxWidth: 640 }}>
          <div className={styles.modalHeader}>
            <div>
              <h3 className={styles.modalTitle}>Add Sovereign Automation</h3>
              <p className={styles.cardSubtitle} style={{ marginTop: 2, marginBottom: 0 }}>
                Step {addAutoStep} of 3 — {addAutoStep === 1 ? "Select Task" : addAutoStep === 2 ? "Configure" : "Review & Activate"}
              </p>
            </div>
            <button className={styles.btnSecondary} style={{ padding: 4 }} onClick={() => setIsAddAutomationOpen(false)}>
              <X size={14} />
            </button>
          </div>

          {/* Stepper Bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: addAutoStep >= step ? "#020617" : "#E5E7EB",
                  transition: "background 0.2s ease",
                }}
              />
            ))}
          </div>

          {/* STEP 1: SELECT TASK */}
          {addAutoStep === 1 && (
            <div>
              <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
                Choose what business task to automate under this Brain. No workflow building required.
              </div>

              <div className={styles.taskSelectGrid}>
                {displayTemplates.map((template) => {
                  const isSelected = selectedTaskTemplate.key === template.key;
                  return (
                    <div
                      key={template.key}
                      className={`${styles.taskSelectCard} ${isSelected ? styles.taskSelectCardActive : ""}`}
                      onClick={() => handleSelectTaskTemplate(template)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className={styles.taskSelectTitle}>{template.name}</span>
                        {isSelected && <CheckCircle2 size={14} color="#059669" />}
                      </div>
                      <p className={styles.taskSelectDesc}>{template.description}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                        {template.requiredApps.map((app, i) => (
                          <span key={i} style={{ fontSize: 10, background: "#FFFFFF", border: "1px solid #E5E7EB", padding: "1px 5px", borderRadius: 3 }}>
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setIsAddAutomationOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => setAddAutoStep(2)}
                >
                  Next: Configure
                  <ArrowRight size={13} style={{ marginLeft: 6 }} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURE */}
          {addAutoStep === 2 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Automation Name</label>
                <input
                  className={styles.input}
                  value={automationForm.name}
                  onChange={(e) => setAutomationForm({ ...automationForm, name: e.target.value })}
                  placeholder="e.g. Daily Accounts Payable Processing"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={automationForm.description}
                  onChange={(e) => setAutomationForm({ ...automationForm, description: e.target.value })}
                  placeholder="Operational details and goals for this automation..."
                  style={{ minHeight: 70 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Trigger Type</label>
                  <select
                    className={styles.select}
                    value={automationForm.triggerType}
                    onChange={(e) => setAutomationForm({ ...automationForm, triggerType: e.target.value as any })}
                  >
                    <option value="WEBHOOK">Inbound Webhook (Real-time)</option>
                    <option value="SCHEDULE">Scheduled Cron (Batch)</option>
                    <option value="EVENT">Event Ingestion (App Hook)</option>
                    <option value="MANUAL">Manual Trigger Only</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Initial Status</label>
                  <select
                    className={styles.select}
                    value={automationForm.status}
                    onChange={(e) => setAutomationForm({ ...automationForm, status: e.target.value as any })}
                  >
                    <option value="ACTIVE">ACTIVE (Ready to run)</option>
                    <option value="DRAFT">DRAFT (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Task-specific configurations */}
              <div style={{ padding: "12px 16px", background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 6, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#020617", marginBottom: 8 }}>
                  Required Integrations &amp; Permissions:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {selectedTaskTemplate.requiredApps.map((app, i) => (
                    <span key={i} className={styles.appChip}>
                      <Layers size={11} />
                      {app}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {selectedTaskTemplate.permissions.map((perm, i) => (
                    <span key={i} className={styles.permissionTag}>
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setAddAutoStep(1)}
                >
                  Back to Task Selection
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => setAddAutoStep(3)}
                >
                  Next: Review &amp; Activate
                  <ArrowRight size={13} style={{ marginLeft: 6 }} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & ACTIVATE */}
          {addAutoStep === 3 && (
            <div>
              <div style={{ padding: "16px 20px", background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#020617" }}>{automationForm.name}</div>
                  <span
                    className={`${styles.statusPill} ${
                      automationForm.status === "ACTIVE" ? styles.statusActive : styles.statusDraft
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {automationForm.status}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>
                  {automationForm.description || selectedTaskTemplate.description}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, borderTop: "1px solid #E5E7EB", paddingTop: 12 }}>
                  <div>
                    <span style={{ color: "#64748B" }}>Task Type:</span>{" "}
                    <strong>{selectedTaskTemplate.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Trigger:</span>{" "}
                    <strong>{automationForm.triggerType}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Governing Brain:</span>{" "}
                    <strong>{brain?.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Safety Governance:</span>{" "}
                    <strong>{rulesList.length} Active Rule(s) Enforced</strong>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setAddAutoStep(2)}
                >
                  Back to Configure
                </button>
                <button
                  type="button"
                  className={styles.btnAccent}
                  onClick={handleCreateAutomation}
                  disabled={isSaving}
                >
                  <CheckCircle2 size={14} />
                  {isSaving ? "Activating..." : `Confirm & Activate Automation`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAutomationDetailsDrawer() {
    if (!selectedAutomation) return null;

    const apps = selectedAutomation.metadata?.requiredApps || [];
    const permissions = selectedAutomation.metadata?.permissions || [];
    const config = selectedAutomation.metadata?.config || {};

    return (
      <div className={styles.drawerOverlay} onClick={() => setSelectedAutomation(null)}>
        <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
          <div>
            <div className={styles.drawerHeader}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 className={styles.modalTitle} style={{ margin: 0 }}>{selectedAutomation.name}</h3>
                  <span
                    className={`${styles.statusPill} ${
                      selectedAutomation.status === "ACTIVE"
                        ? styles.statusActive
                        : selectedAutomation.status === "PAUSED"
                        ? styles.statusPaused
                        : styles.statusDraft
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {selectedAutomation.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                  Task: {selectedAutomation.metadata?.taskType?.replace(/_/g, " ") || "Custom Task"}
                </div>
              </div>
              <button className={styles.btnSecondary} style={{ padding: 4 }} onClick={() => setSelectedAutomation(null)}>
                <X size={14} />
              </button>
            </div>

            <div className={styles.detailFieldGroup}>
              <div className={styles.detailFieldLabel}>Description</div>
              <div className={styles.detailFieldValue}>{selectedAutomation.description || "No description provided."}</div>
            </div>

            <div className={styles.detailFieldGroup}>
              <div className={styles.detailFieldLabel}>Trigger Mechanism</div>
              <div className={styles.detailFieldValue}>
                <code>{selectedAutomation.trigger_type}</code>
                {selectedAutomation.trigger_config && Object.keys(selectedAutomation.trigger_config).length > 0 && (
                  <pre className={styles.codeArea} style={{ marginTop: 6, fontSize: 11 }}>
                    {JSON.stringify(selectedAutomation.trigger_config, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <div className={styles.detailFieldGroup}>
              <div className={styles.detailFieldLabel}>Required Applications</div>
              <div className={styles.chipRow} style={{ marginTop: 6 }}>
                {apps.length > 0 ? (
                  apps.map((app, i) => (
                    <span key={i} className={styles.appChip}>
                      <Layers size={11} />
                      {app}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: "#64748B" }}>No external apps configured</span>
                )}
              </div>
            </div>

            <div className={styles.detailFieldGroup}>
              <div className={styles.detailFieldLabel}>Assigned Permissions</div>
              <div className={styles.chipRow} style={{ marginTop: 6 }}>
                {permissions.length > 0 ? (
                  permissions.map((perm, i) => (
                    <span key={i} className={styles.permissionTag}>
                      {perm}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: "#64748B" }}>Standard Brain Permissions</span>
                )}
              </div>
            </div>

            {Object.keys(config).length > 0 && (
              <div className={styles.detailFieldGroup}>
                <div className={styles.detailFieldLabel}>Task Parameters</div>
                <pre className={styles.codeArea} style={{ marginTop: 6, fontSize: 11 }}>
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            )}

            <div className={styles.detailFieldGroup}>
              <div className={styles.detailFieldLabel}>Execution Statistics</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6 }}>
                <div style={{ padding: "8px 12px", background: "#F8FAFC", borderRadius: 6, border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: 10, color: "#64748B" }}>Total Runs</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedAutomation.total_runs || 0}</div>
                </div>
                <div style={{ padding: "8px 12px", background: "#F8FAFC", borderRadius: 6, border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: 10, color: "#059669" }}>Success</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}>{selectedAutomation.successful_runs || 0}</div>
                </div>
                <div style={{ padding: "8px 12px", background: "#F8FAFC", borderRadius: 6, border: "1px solid #E5E7EB" }}>
                  <div style={{ fontSize: 10, color: "#DC2626" }}>Failed</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#DC2626" }}>{selectedAutomation.failed_runs || 0}</div>
                </div>
              </div>
            </div>

            <div className={styles.detailFieldGroup}>
              <div className={styles.detailFieldLabel}>Timestamps</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>
                Created: {new Date(selectedAutomation.created_at).toLocaleString()}
                <br />
                Last Updated: {new Date(selectedAutomation.updated_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 18, borderTop: "1px solid #E5E7EB" }}>
            <button
              className={styles.btnDanger}
              onClick={() => handleDeleteAutomation(selectedAutomation.id)}
            >
              <Trash2 size={13} />
              Delete Automation
            </button>

            <button
              className={styles.btnPrimary}
              onClick={() => handleToggleAutomationStatus(selectedAutomation.id, selectedAutomation.status)}
            >
              {selectedAutomation.status === "ACTIVE" ? "Pause Automation" : "Activate Automation"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderCreateTaskModal() {
    if (!isCreateTaskOpen) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent} style={{ maxWidth: 540 }}>
          <div className={styles.modalHeader}>
            <div>
              <h3 className={styles.modalTitle}>Add Task to AI Backlog</h3>
              <p className={styles.cardSubtitle} style={{ marginTop: 2, marginBottom: 0 }}>
                Queue a business task for autonomous {brain?.name} execution.
              </p>
            </div>
            <button className={styles.btnSecondary} style={{ padding: 4 }} onClick={() => setIsCreateTaskOpen(false)}>
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleCreateBacklogTask}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Source Automation</label>
              {automationsList.length === 0 ? (
                <div style={{ fontSize: 13, color: "#DC2626", padding: "8px 12px", background: "#FEF2F2", borderRadius: 6 }}>
                  No active automations found for this Brain. Please create an automation first.
                </div>
              ) : (
                <select
                  className={styles.select}
                  value={createTaskForm.automationId}
                  onChange={(e) => setCreateTaskForm({ ...createTaskForm, automationId: e.target.value })}
                  required
                >
                  <option value="">-- Select Source Automation --</option>
                  {automationsList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.metadata?.taskType || a.trigger_type})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Task Title</label>
              <input
                className={styles.input}
                value={createTaskForm.name}
                onChange={(e) => setCreateTaskForm({ ...createTaskForm, name: e.target.value })}
                placeholder="e.g. Invoice #INV-2026-089 — Vendor Disbursement"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Execution Priority</label>
              <select
                className={styles.select}
                value={createTaskForm.priority}
                onChange={(e) => setCreateTaskForm({ ...createTaskForm, priority: e.target.value as any })}
              >
                <option value="HIGH">HIGH (Immediate / Critical Threshold)</option>
                <option value="MEDIUM">MEDIUM (Standard Operational Queue)</option>
                <option value="LOW">LOW (Batch / Non-urgent)</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Vendor / Source</label>
                <input
                  className={styles.input}
                  value={createTaskForm.inputVendor}
                  onChange={(e) => setCreateTaskForm({ ...createTaskForm, inputVendor: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Transaction Amount (€)</label>
                <input
                  className={styles.input}
                  type="number"
                  step="0.01"
                  value={createTaskForm.inputAmount}
                  onChange={(e) => setCreateTaskForm({ ...createTaskForm, inputAmount: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setIsCreateTaskOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.btnAccent}
                disabled={isSaving || automationsList.length === 0}
              >
                <Plus size={14} />
                {isSaving ? "Adding..." : "Add to Backlog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderTaskDetailsDrawer() {
    if (!selectedTask) return null;

    const priority = selectedTask.metadata?.priority || "MEDIUM";
    const inputPayload = selectedTask.metadata?.inputPayload || {};
    const result = selectedTask.result;

    return (
      <div className={styles.drawerOverlay} onClick={() => setSelectedTask(null)}>
        <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
          <div>
            <div className={styles.drawerHeader}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 className={styles.modalTitle} style={{ margin: 0 }}>{selectedTask.name}</h3>
                  <span
                    className={`${styles.priorityBadge} ${
                      priority === "HIGH"
                        ? styles.priorityHigh
                        : priority === "MEDIUM"
                        ? styles.priorityMedium
                        : styles.priorityLow
                    }`}
                  >
                    {priority}
                  </span>
                  <span
                    className={`${styles.statusPill} ${
                      selectedTask.status === "COMPLETED"
                        ? styles.statusCompleted
                        : selectedTask.status === "IN_PROGRESS"
                        ? styles.statusInProgress
                        : styles.statusPending
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {selectedTask.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                  Source: <strong>{selectedTask.automationName}</strong> | Type: <code>{selectedTask.taskType}</code>
                </div>
              </div>
              <button className={styles.btnSecondary} style={{ padding: 4 }} onClick={() => setSelectedTask(null)}>
                <X size={14} />
              </button>
            </div>

            {/* Input Payload */}
            <div className={styles.detailFieldGroup}>
              <div className={styles.detailFieldLabel}>Task Input Payload</div>
              <pre className={styles.codeArea} style={{ marginTop: 6, fontSize: 11 }}>
                {JSON.stringify(inputPayload, null, 2)}
              </pre>
            </div>

            {/* Task Result Section */}
            {result ? (
              <div className={styles.detailFieldGroup}>
                <div className={styles.detailFieldLabel} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Execution Result</span>
                  <span style={{ color: "#059669" }}>
                    Duration: {result.durationMs}ms
                  </span>
                </div>

                <pre className={styles.codeArea} style={{ marginTop: 6, fontSize: 11, background: "#F0FDF4", borderColor: "#BBF7D0" }}>
                  {JSON.stringify(result.outputPayload, null, 2)}
                </pre>

                {result.aiReflection && Object.keys(result.aiReflection).length > 0 && (
                  <div className={styles.reflectionCallout}>
                    <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={13} color="#059669" />
                      AI Reflection &amp; Governance Notes:
                    </div>
                    <div>{result.aiReflection.notes as string || JSON.stringify(result.aiReflection)}</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: "12px 14px", background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 12, color: "#64748B", marginBottom: 16 }}>
                Task has not finished execution yet. Results and telemetry will appear here once completed.
              </div>
            )}

            <div className={styles.detailFieldGroup}>
              <div className={styles.detailFieldLabel}>Timestamps</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>
                Created: {new Date(selectedTask.createdAt).toLocaleString()}
                {selectedTask.metadata?.startedAt && (
                  <>
                    <br />
                    Started: {new Date(selectedTask.metadata.startedAt).toLocaleString()}
                  </>
                )}
                {result?.completedAt && (
                  <>
                    <br />
                    Completed: {new Date(result.completedAt).toLocaleString()}
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 18, borderTop: "1px solid #E5E7EB" }}>
            <button
              className={styles.btnDanger}
              onClick={() => handleDeleteTask(selectedTask.id)}
            >
              <Trash2 size={13} />
              Delete Task
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              {selectedTask.status === "PENDING" && (
                <button
                  className={styles.btnPrimary}
                  onClick={() => handleExecuteTask(selectedTask.id)}
                >
                  Start Execution
                </button>
              )}

              {selectedTask.status === "IN_PROGRESS" && (
                <button
                  className={styles.btnAccent}
                  onClick={() => handleCompleteTask(selectedTask.id)}
                  disabled={isSaving}
                >
                  <CheckCircle2 size={13} />
                  Complete Task
                </button>
              )}

              {selectedTask.status === "COMPLETED" && (
                <button
                  className={styles.btnSecondary}
                  onClick={() => setSelectedTask(null)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

