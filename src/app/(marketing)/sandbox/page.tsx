"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./sandbox.module.css";
import PremiumNav from "@/components/bundui/Nav";

// ── Icons ── //
const IconPlay = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const IconCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IconGmail = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" />
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#EA4335" />
    </svg>
);

const IconSheets = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9H21" />
        <path d="M9 21V9" />
    </svg>
);

const IconCRM = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconTelegram = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2CA5E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

// ── Mock Data Structure ── //
const workflows = [
    {
        id: "lead-intake",
        name: "Lead Intake & triage",
        description: "Captures new email inquiries, logs them in CRM, and drafts a categorized response automatically.",
        fields: [
            { id: "clientName", label: "Client Name", type: "text", placeholder: "e.g., John Smith", default: "Jane Doe" },
            { id: "clientEmail", label: "Client Email", type: "email", placeholder: "e.g., john@acme.com", default: "jane@acmefinance.com" },
            { id: "subject", label: "Inquiry Subject", type: "text", placeholder: "e.g., Need audit services", default: "Inquiry: Corporate Tax Audit" },
        ],
        steps: [
            { id: "receive", title: "Receive Email", desc: "Monitor inbox for new client inquiries." },
            { id: "extract", title: "Extract Data", desc: "Identify intent, name, and company via AI." },
            { id: "crm", title: "Update CRM", desc: "Create new lead profile in the database." },
            { id: "draft", title: "Draft Follow-up", desc: "Write tailored response based on intent." },
            { id: "alert", title: "Send Alert", desc: "Notify account manager to review draft." }
        ],
        outputs: [
            (inputs: any) => `Email received from ${inputs.clientEmail || 'client'}`,
            (inputs: any) => `AI Intent Extracted: "Tax Audit Services". Confidence: 98%`,
            (inputs: any) => `CRM Updated: New Lead Profile created for ${inputs.clientName || 'User'}`,
            (inputs: any) => `Gmail Draft ready: "Re: ${inputs.subject || 'Inquiry'}"`,
            (inputs: any) => `Telegram alert pushed to #sales-team`
        ],
        destinations: [
            { id: "crm", app: "Firm CRM", icon: IconCRM, action: "Lead count updated", triggerStep: 2 },
            { id: "gmail", app: "Gmail", icon: IconGmail, action: "Reply draft created", triggerStep: 3 },
            { id: "tg", app: "Telegram", icon: IconTelegram, action: "Pinged Account Manager", triggerStep: 4 },
        ]
    },
    {
        id: "invoice-chaser",
        name: "Invoice Auto-Chaser",
        description: "Scans for overdue accounts daily, matches with payment portals, and issues polite follow-ups.",
        fields: [
            { id: "clientName", label: "Client Name", type: "text", placeholder: "e.g., Acme Corp", default: "Acme Corp" },
            { id: "amount", label: "Invoice Amount", type: "text", placeholder: "e.g., $4,200", default: "$4,200.00" },
            { id: "daysOverdue", label: "Days Overdue", type: "number", placeholder: "e.g., 14", default: "14" },
        ],
        steps: [
            { id: "scan", title: "Scan Ledger", desc: "Check accounting DB for overdue tags." },
            { id: "verify", title: "Verify Payments", desc: "Cross-reference recent bank deposits." },
            { id: "draft", title: "Draft Reminder", desc: "Generate polite email with payment link." },
            { id: "log", title: "Update Sheets", desc: "Record chasing activity for reporting." }
        ],
        outputs: [
            (inputs: any) => `System scanned ledger. Identified overdue.`,
            (inputs: any) => `Verified ${inputs.amount} is unpaid for ${inputs.daysOverdue} days.`,
            (inputs: any) => `Reminder drafted for ${inputs.clientName}: "Invoice #402 Overdue"`,
            (inputs: any) => `Google Sheet log updated: Chaser Level 1 Sent.`
        ],
        destinations: [
            { id: "gmail", app: "Gmail", icon: IconGmail, action: "Reminder email staged", triggerStep: 2 },
            { id: "sheets", app: "Google Sheets", icon: IconSheets, action: "Chaser log updated", triggerStep: 3 },
        ]
    }
];

export default function InteractiveSandbox() {
    const [selectedWfIndex, setSelectedWfIndex] = useState(0);
    const workflow = workflows[selectedWfIndex];
    
    // Simulation state
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<"idle" | "running" | "completed">("idle");
    const [activeStep, setActiveStep] = useState(-1);
    const [logs, setLogs] = useState<{ time: string, msg: string }[]>([]);
    
    const consoleRef = useRef<HTMLDivElement>(null);

    // Reset when switching workflows
    useEffect(() => {
        const initialForm: Record<string, string> = {};
        workflows[selectedWfIndex].fields.forEach(f => {
            initialForm[f.id] = f.default;
        });
        setFormValues(initialForm);
        setStatus("idle");
        setActiveStep(-1);
        setLogs([]);
    }, [selectedWfIndex]);

    // Auto scroll logs
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [logs]);

    const handleInputChange = (id: string, val: string) => {
        setFormValues(prev => ({ ...prev, [id]: val }));
    };

    const runSimulation = () => {
        setStatus("running");
        setActiveStep(0);
        setLogs([{ time: new Date().toLocaleTimeString(), msg: "Simulation started..." }]);

        let currentStep = 0;
        
        const nextStep = () => {
            if (currentStep < workflow.steps.length) {
                setActiveStep(currentStep);
                
                // Add log for this step
                const msg = workflow.outputs[currentStep](formValues);
                setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
                
                currentStep++;
                setTimeout(nextStep, 1000); // 1 second per step
            } else {
                setStatus("completed");
                setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: "Workflow completed successfully." }]);
            }
        };

        setTimeout(nextStep, 600); // slight delay before starting step 0
    };

    const getProgressHeight = () => {
        if (activeStep === -1) return 0;
        if (status === "completed") return 100;
        const percent = (activeStep / (workflow.steps.length - 1)) * 100;
        return percent;
    };

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                
                <div className={styles.header}>
                    <span className={styles.eyebrow}>Interactive Sandbox</span>
                    <h1 className={styles.title}>See how the engine works.</h1>
                    <p className={styles.subtitle}>
                        Enter some sample data and watch Blonk process the workflow in real-time. No coding, no complicated canvas. Just results.
                    </p>
                </div>

                <div className={styles.selectorList}>
                    {workflows.map((wf, idx) => (
                        <button
                            key={wf.id}
                            className={styles.selectorBtn}
                            data-active={selectedWfIndex === idx}
                            onClick={() => setSelectedWfIndex(idx)}
                            disabled={status === "running"}
                        >
                            {wf.name}
                        </button>
                    ))}
                </div>

                <div className={styles.layoutGrid}>
                    
                    {/* PANEL A: INPUT */}
                    <div className={`${styles.panel} ${styles.panelGlass}`}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelLabel}>Panel A.</span>
                            <div className={styles.panelTitle}>Sample Input Data</div>
                            <p className={styles.stepDesc}>Mimics the data triggering the workflow.</p>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            {workflow.fields.map(field => (
                                <div key={field.id} className={styles.formGroup}>
                                    <label className={styles.label}>{field.label}</label>
                                    <input 
                                        type={field.type}
                                        className={styles.input}
                                        placeholder={field.placeholder}
                                        value={formValues[field.id] || ""}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        disabled={status === "running"}
                                    />
                                </div>
                            ))}
                        </div>

                        <button 
                            className={styles.ctaBtn} 
                            onClick={runSimulation}
                            disabled={status === "running"}
                        >
                            {status === "completed" ? "Run Again" : "Test Workflow"}
                            {status !== "running" && <IconPlay />}
                        </button>
                    </div>

                    {/* PANEL B: WORKFLOW PROCESS */}
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelLabel}>Panel B.</span>
                            <div className={styles.panelTitle}>Workflow Process</div>
                            <p className={styles.stepDesc}>The automated sequence.</p>
                        </div>
                        
                        <div className={styles.flowContainer}>
                            <div className={styles.flowTrack}>
                                <div className={styles.flowFill} style={{ height: `${getProgressHeight()}%` }} />
                            </div>

                            {workflow.steps.map((step, idx) => {
                                const isActive = activeStep === idx && status === "running";
                                const isCompleted = status === "completed" || activeStep > idx;

                                return (
                                    <div 
                                        key={step.id} 
                                        className={styles.stepNode}
                                        data-active={isActive}
                                        data-completed={isCompleted}
                                    >
                                        <div className={styles.stepIndicator}>
                                            {isCompleted ? <IconCheck /> : (idx + 1)}
                                        </div>
                                        <div className={styles.stepContent}>
                                            <div className={styles.stepTitle}>{step.title}</div>
                                            <div className={styles.stepDesc}>{step.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Stacked Panels C & D */}
                    <div className={styles.rightCol}>
                        
                        {/* PANEL D: DESTINATIONS */}
                        <div className={styles.panel} style={{ flex: 'none' }}>
                            <div className={styles.panelHeader} style={{ marginBottom: 12 }}>
                                <span className={styles.panelLabel}>Panel D.</span>
                                <div className={styles.panelTitle}>Data Destinations</div>
                            </div>
                            
                            <div className={styles.destGrid}>
                                {workflow.destinations.map(dest => {
                                    const isActive = status === "completed" || activeStep >= dest.triggerStep;
                                    return (
                                        <div key={dest.id} className={styles.destItem} data-active={isActive}>
                                            <div className={styles.destIcon}>
                                                <dest.icon />
                                            </div>
                                            <div className={styles.destInfo}>
                                                <div className={styles.destApp}>{dest.app}</div>
                                                <div className={styles.destAction}>
                                                    {isActive ? dest.action : "Waiting..."}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* PANEL C: OUTPUT */}
                        <div className={`${styles.panel} ${styles.panelGlass}`} style={{ flex: 1, padding: 20 }}>
                            <div className={styles.panelHeader} style={{ marginBottom: 16 }}>
                                <span className={styles.panelLabel}>Panel C.</span>
                                <div className={styles.panelTitle}>Output & Results</div>
                            </div>
                            
                            <div className={styles.outputConsole} ref={consoleRef}>
                                {logs.length === 0 && (
                                    <div style={{ color: '#555', fontStyle: 'italic', padding: 10 }}>
                                        Awaiting input constraints...
                                    </div>
                                )}
                                {logs.map((log, i) => (
                                    <div key={i} className={styles.outputRow}>
                                        <span className={styles.outputTime}>[{log.time}]</span>
                                        <span className={styles.outputMsg}>{log.msg}</span>
                                    </div>
                                ))}
                                {status === "running" && (
                                    <div className={styles.outputRow} style={{ opacity: 0.6 }}>
                                        <span className={styles.outputTime}>[{new Date().toLocaleTimeString()}]</span>
                                        <span className={styles.outputMsg}>Processing...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
