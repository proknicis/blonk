"use client";

import React, { useState } from "react";
import { 
    Shield, Settings as SettingsIcon, Filter, Search, 
    MoreHorizontal, ExternalLink, Check, AlertTriangle, X,
    User, Activity, LayoutDashboard
} from "lucide-react";
import styles from "./incidents.module.css";

const incidentsData = [
    {
        id: "INC-2024-0517-0001",
        severity: "CRITICAL",
        incident: "Workflow Execution Failed",
        client: "Acme Corp",
        tenant: "acme-corp.io",
        node: "NODE-03",
        region: "AWS Europe (Frankfurt)",
        workflow: "Invoice Automator",
        version: "v1.9.0",
        wfId: "wf_6f7d2a1c3b4e",
        error: "Function node failed",
        errorSub: "TypeError: Cannot read property...",
        fullError: "Function node failed\nTypeError: Cannot read property 'map' of undefined\n  at Function.process (/data/nodes/function.js:45:18)",
        status: "NEEDS ACTION",
        detected: "2m ago"
    },
    {
        id: "INC-2024-0517-0002",
        severity: "HIGH",
        incident: "Webhook Response Timeout",
        client: "Nova Analytics",
        tenant: "nova.ai",
        node: "NODE-02",
        region: "AWS Europe (London)",
        workflow: "Lead Intake",
        version: "v1.6.2",
        error: "Timeout after 30s",
        errorSub: "No response from webhook URL",
        status: "ACKNOWLEDGED",
        detected: "11m ago"
    },
    {
        id: "INC-2024-0517-0003",
        severity: "HIGH",
        incident: "Database Connection Error",
        client: "HealthPlus",
        tenant: "healthplus.io",
        node: "NODE-04",
        region: "AWS Asia (Singapore)",
        workflow: "Daily Sync",
        version: "v2.3.1",
        error: "ECONNREFUSED",
        errorSub: "database:5432",
        status: "NEEDS ACTION",
        detected: "18m ago"
    },
    {
        id: "INC-2024-0517-0004",
        severity: "CRITICAL",
        incident: "Workflow Execution Failed",
        client: "FinEdge Ltd",
        tenant: "finedge.com",
        node: "NODE-01",
        region: "AWS Europe (Frankfurt)",
        workflow: "Financial Report Gen",
        version: "v1.4.0",
        error: "SyntaxError",
        errorSub: "Unexpected token '}'",
        status: "NEEDS ACTION",
        detected: "22m ago"
    },
    {
        id: "INC-2024-0517-0005",
        severity: "HIGH",
        incident: "API Rate Limit Exceeded",
        client: "LexFlow LLC",
        tenant: "lexflow.com",
        node: "NODE-05",
        region: "AWS Europe (Frankfurt)",
        workflow: "Content Monitor",
        version: "v1.7.6",
        error: "429 Too Many Requests",
        errorSub: "Rate limit exceeded",
        status: "ACKNOWLEDGED",
        detected: "35m ago"
    },
    {
        id: "INC-2024-0517-0006",
        severity: "HIGH",
        incident: "File Processing Failed",
        client: "Acme Corp",
        tenant: "acme-corp.io",
        node: "NODE-03",
        region: "AWS Europe (Frankfurt)",
        workflow: "Document Parser",
        version: "v1.2.4",
        error: "Invalid file format",
        errorSub: "Unsupported file type",
        status: "NEEDS ACTION",
        detected: "1h ago"
    },
    {
        id: "INC-2024-0517-0007",
        severity: "MEDIUM",
        incident: "Workflow Stuck in Loop",
        client: "Marketify",
        tenant: "marketify.io",
        node: "NODE-02",
        region: "AWS Europe (London)",
        workflow: "Data Enrichment",
        version: "v1.3.0",
        error: "Loop detected",
        errorSub: "Execution exceeded 100 iterations",
        status: "PENDING",
        detected: "1h ago"
    },
    {
        id: "INC-2024-0517-0008",
        severity: "CRITICAL",
        incident: "Authentication Failed",
        client: "SupportPro",
        tenant: "supportpro.io",
        node: "NODE-04",
        region: "AWS Asia (Singapore)",
        workflow: "Ticket Sync",
        version: "v2.1.0",
        error: "401 Unauthorized",
        errorSub: "Invalid or expired token",
        status: "NEEDS ACTION",
        detected: "2h ago"
    }
];

export default function IncidentsPage() {
    const [selectedIncident, setSelectedIncident] = useState(incidentsData[0]);

    return (
        <div className={styles.container}>
            {/* TOP BLACK HEADER */}
            <div className={styles.topHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <div className={styles.headerTitleMain}>INCIDENT MANAGEMENT</div>
                        <p className={styles.headerSubtitle}>Real-time detection and response to workflow and infrastructure issues.</p>
                    </div>
                </div>
                <div className={styles.headerStats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>ACTIVE INCIDENTS</span>
                        <span className={styles.statValue}>20</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={`${styles.statLabel} ${styles.colorCritical}`}>CRITICAL</span>
                        <span className={`${styles.statValue} ${styles.colorCritical}`}>7</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={`${styles.statLabel} ${styles.colorHigh}`}>HIGH</span>
                        <span className={`${styles.statValue} ${styles.colorHigh}`}>13</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={`${styles.statLabel} ${styles.colorMedium}`}>MEDIUM</span>
                        <span className={`${styles.statValue} ${styles.colorMedium}`}>0</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={`${styles.statLabel} ${styles.colorResolved}`}>RESOLVED (24H)</span>
                        <span className={`${styles.statValue} ${styles.colorResolved}`}>32</span>
                    </div>
                    <button className={styles.settingsBtn}>
                        <SettingsIcon size={16} /> Incident Settings
                    </button>
                </div>
            </div>

            <div className={styles.mainContent}>
                {/* LEFT PANEL: TABLE */}
                <div className={styles.leftPanel}>
                    <div className={styles.controlsBar}>
                        <div className={styles.tabs}>
                            <button className={`${styles.tab} ${styles.tabActive}`}>All Incidents <span className={styles.tabCount}>20</span></button>
                            <button className={styles.tab}>Needs Action <span style={{color: '#64748B'}}>7</span></button>
                            <button className={styles.tab}>Acknowledged <span style={{color: '#64748B'}}>6</span></button>
                            <button className={styles.tab}>Resolved <span style={{color: '#64748B'}}>32</span></button>
                        </div>
                        <div className={styles.filters}>
                            <select className={styles.filterSelect}>
                                <option>All Severities</option>
                            </select>
                            <select className={styles.filterSelect}>
                                <option>All Clusters</option>
                            </select>
                            <select className={styles.filterSelect}>
                                <option>All Clients</option>
                            </select>
                            <select className={styles.filterSelect}>
                                <option>All Statuses</option>
                            </select>
                            <div className={styles.searchBox}>
                                <Search size={14} color="#94A3B8" />
                                <input type="text" placeholder="Search incidents..." />
                            </div>
                            <button className={styles.btnFilter}><Filter size={14} /> Filters</button>
                        </div>
                    </div>

                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>SEVERITY</th>
                                <th>INCIDENT</th>
                                <th>CLIENT / TENANT</th>
                                <th>NODE / CLUSTER</th>
                                <th>WORKFLOW</th>
                                <th>ERROR MESSAGE</th>
                                <th>STATUS</th>
                                <th>DETECTED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidentsData.map((inc) => (
                                <tr key={inc.id} onClick={() => setSelectedIncident(inc)} style={{cursor: 'pointer'}}>
                                    <td>
                                        <div className={styles.severityBadge} style={{
                                            color: inc.severity === 'CRITICAL' ? '#EF4444' : inc.severity === 'HIGH' ? '#F97316' : '#EAB308'
                                        }}>
                                            <Shield size={12} fill="currentColor" /> {inc.severity}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.tdIncidentTitle}>{inc.incident}</div>
                                        <div className={styles.tdIncidentId}>{inc.id}</div>
                                    </td>
                                    <td>
                                        <div className={styles.tdMain}>{inc.client}</div>
                                        <div className={styles.tdSub}>{inc.tenant}</div>
                                    </td>
                                    <td>
                                        <div className={styles.tdMain}>{inc.node}</div>
                                        <div className={styles.tdSub}>{inc.region}</div>
                                    </td>
                                    <td>
                                        <div className={styles.tdMain}>{inc.workflow}</div>
                                        <div className={styles.tdSub}>{inc.version}</div>
                                    </td>
                                    <td>
                                        <div className={styles.tdMain}>{inc.error}</div>
                                        <div className={styles.tdSub}>{inc.errorSub}</div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${
                                            inc.status === 'NEEDS ACTION' ? styles.statusNeedsAction : 
                                            inc.status === 'ACKNOWLEDGED' ? styles.statusAcknowledged : styles.statusPending
                                        }`}>{inc.status}</span>
                                    </td>
                                    <td>
                                        <div className={styles.tdMain}>{inc.detected}</div>
                                    </td>
                                    <td>
                                        <div className={styles.actionBtns}>
                                            <button className={styles.actionBtn}><ExternalLink size={14} /></button>
                                            <button className={styles.actionBtn}><User size={14} /></button>
                                            <button className={styles.actionBtn}><MoreHorizontal size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Showing 1 to 8 of 20 incidents</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className={styles.actionBtn}>&lt;</button>
                            <button className={styles.actionBtn} style={{ background: '#F8FAFC', color: '#0F172A', fontWeight: 800 }}>1</button>
                            <button className={styles.actionBtn}>2</button>
                            <button className={styles.actionBtn}>3</button>
                            <button className={styles.actionBtn}>&gt;</button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: DETAILS */}
                <div className={styles.rightPanel}>
                    <div>
                        <div className={styles.panelHeader}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span className={styles.severityBadge} style={{
                                    color: selectedIncident.severity === 'CRITICAL' ? '#EF4444' : selectedIncident.severity === 'HIGH' ? '#F97316' : '#EAB308',
                                    background: selectedIncident.severity === 'CRITICAL' ? 'rgba(239,68,68,0.1)' : selectedIncident.severity === 'HIGH' ? 'rgba(249,115,22,0.1)' : 'rgba(234,179,8,0.1)',
                                    padding: '2px 6px'
                                }}>{selectedIncident.severity}</span>
                                <span className={styles.statusBadge} style={{
                                    color: '#EF4444', padding: 0
                                }}>{selectedIncident.status}</span>
                            </div>
                            <button style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={16} color="#94A3B8" /></button>
                        </div>
                        <h2 className={styles.panelTitle}>{selectedIncident.incident}</h2>
                        <p className={styles.panelSubtitle}>{selectedIncident.id} • Detected {selectedIncident.detected}</p>
                    </div>

                    <div className={styles.panelActions}>
                        <button className={styles.btnAcknowledge}><Check size={16} /> Acknowledge</button>
                        <div className={styles.btnSecondaryRow}>
                            <button className={styles.btnSecondary}><Check size={14} /> Resolve</button>
                            <button className={styles.btnSecondary}><AlertTriangle size={14} /> Escalate</button>
                        </div>
                    </div>

                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionLabel}>CLIENT & ENVIRONMENT</div>
                        <div className={styles.kvList}>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Client</span>
                                <span className={styles.linkValue}>{selectedIncident.client} <ExternalLink size={12}/></span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Tenant ID</span>
                                <span className={styles.linkValue}>{selectedIncident.tenant} <ExternalLink size={12}/></span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Node / Cluster</span>
                                <span className={styles.kvValue}>{selectedIncident.node}</span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Region</span>
                                <span className={styles.kvValue}>{selectedIncident.region}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionLabel}>WORKFLOW CONTEXT</div>
                        <div className={styles.kvList}>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Workflow</span>
                                <span className={styles.linkValue}>{selectedIncident.workflow} <ExternalLink size={12}/></span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Version</span>
                                <span className={styles.kvValue}>{selectedIncident.version}</span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Workflow ID</span>
                                <span className={styles.kvValue}>{selectedIncident.wfId || '-'}</span>
                            </div>
                        </div>
                        <button className={styles.linkBtn}>Open in Workflow Viewer <ExternalLink size={14}/></button>
                    </div>

                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionLabel}>ERROR SUMMARY</div>
                        <div className={styles.errorTerminal}>
                            {selectedIncident.fullError || selectedIncident.error + "\n" + selectedIncident.errorSub}
                        </div>
                        <button className={styles.linkBtn} style={{border: 'none'}}>View Full Stack Trace</button>
                    </div>

                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionLabel}>TIMELINE</div>
                        <div className={styles.timeline}>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot} style={{background: '#3B82F6'}}></div>
                                <div className={styles.timelineText}>Incident detected</div>
                                <div className={styles.timelineTime}>{selectedIncident.detected}</div>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot} style={{background: '#EF4444'}}></div>
                                <div className={styles.timelineText}>Alert triggered</div>
                                <div className={styles.timelineTime}>{selectedIncident.detected}</div>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineDot} style={{background: '#F97316'}}></div>
                                <div className={styles.timelineText}>Severity set to {selectedIncident.severity}</div>
                                <div className={styles.timelineTime}>{selectedIncident.detected}</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionLabel}>QUICK ACTIONS</div>
                        <div className={styles.quickActions}>
                            <button className={styles.btnSecondary}><User size={14} /> Contact Client</button>
                            <button className={styles.btnSecondary}><Activity size={14} /> Open Run Logs</button>
                            <button className={styles.linkBtn} style={{border: 'none', margin: 0}}><LayoutDashboard size={14} /> View Node Metrics</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
