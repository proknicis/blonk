"use client";

import React, { useState } from "react";
import { 
    Search, Filter, ChevronDown, Plus, ExternalLink, MessageSquare, 
    Paperclip, Star, MoreVertical, X, LayoutDashboard, Activity, User, AlertTriangle,
    Image as ImageIcon, Code, AtSign, Smile
} from "lucide-react";
import styles from "./support.module.css";

const tickets = [
    {
        id: "INC-2024-0517-0001",
        avatar: "AC",
        title: "Workflow failing on Data Sync",
        preview: "Daily Sync workflow is failing with a 500 error when processing invoices greater than 100. See screenshot and logs below.",
        client: "Acme Corp",
        node: "NODE-03",
        workflow: "Invoice Automator",
        time: "2m ago",
        priority: "HIGH",
        comments: 3
    },
    {
        id: "INC-2024-0517-0002",
        avatar: "NA",
        title: "Webhook not receiving data",
        preview: "Our webhook endpoint stopped receiving data from...",
        client: "Nova Analytics",
        node: "NODE-02",
        workflow: "Lead Intake",
        time: "11m ago",
        priority: "MEDIUM",
        comments: 1
    },
    {
        id: "INC-2024-0517-0003",
        avatar: "HP",
        title: "Slow execution times",
        preview: "Workflows are running slower than usual since this morning.",
        client: "HealthPlus",
        node: "NODE-04",
        workflow: "Daily Sync",
        time: "18m ago",
        priority: "MEDIUM",
        comments: 4
    },
    {
        id: "INC-2024-0517-0004",
        avatar: "FE",
        title: "API authentication error",
        preview: "Receiving 401 unauthorized when calling the API node.",
        client: "FinEdge Ltd",
        node: "NODE-01",
        workflow: "Financial Report Gen",
        time: "22m ago",
        priority: "HIGH",
        comments: 2
    },
    {
        id: "INC-2024-0517-0005",
        avatar: "LX",
        title: "Missing data in report",
        preview: "Some records are missing from the generated report.",
        client: "LexFlow LLC",
        node: "NODE-05",
        workflow: "Content Monitor",
        time: "35m ago",
        priority: "LOW",
        comments: 1
    },
    {
        id: "INC-2024-0517-0006",
        avatar: "SS",
        title: "File upload failing",
        preview: "Files larger than 10MB are failing to upload.",
        client: "SupportPro",
        node: "NODE-04",
        workflow: "Ticket Sync",
        time: "1h ago",
        priority: "MEDIUM",
        comments: 2
    },
    {
        id: "INC-2024-0517-0007",
        avatar: "MT",
        title: "Credentials expired",
        preview: "Our Google Sheets credentials expired, workflow stopped.",
        client: "Marketify",
        node: "NODE-02",
        workflow: "Data Enrichment",
        time: "2h ago",
        priority: "HIGH",
        comments: 1
    },
    {
        id: "INC-2024-0517-0008",
        avatar: "AI",
        title: "Need help with workflow setup",
        preview: "Can you assist us with setting up the Gmail trigger?",
        client: "Acme Corp",
        node: "NODE-03",
        workflow: "Email Processor",
        time: "3h ago",
        priority: "LOW",
        comments: 1
    }
];

export default function SupportPage() {
    const [selectedTicket, setSelectedTicket] = useState(tickets[0]);

    return (
        <div className={styles.container}>
            {/* LEFT PANEL - TICKET LIST */}
            <div className={styles.leftPanel}>
                <div className={styles.panelHeader}>
                    <h1 className={styles.title}>SUPPORT TICKETS</h1>
                    <span className={styles.titleBadge}>23 TOTAL</span>
                </div>

                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${styles.tabActive}`}>Open <span className={styles.tabCount}>8</span></button>
                    <button className={styles.tab}>Waiting on Client <span className={styles.tabCount}>6</span></button>
                    <button className={styles.tab}>Waiting on Admin <span className={styles.tabCount}>5</span></button>
                    <button className={styles.tab}>Closed <span className={styles.tabCount}>4</span></button>
                </div>

                <div className={styles.controlsBar}>
                    <div className={styles.searchBox}>
                        <Search size={14} color="#94A3B8" />
                        <input type="text" placeholder="Search tickets..." />
                    </div>
                    <button className={styles.btnFilter}><Filter size={14} /> Filters</button>
                    <select className={styles.sortSelect}>
                        <option>Newest first</option>
                    </select>
                </div>

                <div className={styles.ticketList}>
                    {tickets.map(ticket => (
                        <div 
                            key={ticket.id} 
                            className={`${styles.ticketCard} ${selectedTicket.id === ticket.id ? styles.ticketCardActive : ''}`}
                            onClick={() => setSelectedTicket(ticket)}
                        >
                            <div className={styles.avatar}>{ticket.avatar}</div>
                            <div className={styles.ticketContent}>
                                <div className={styles.ticketTitleRow}>
                                    <h3 className={styles.ticketTitle}>{ticket.title}</h3>
                                    <span className={styles.ticketTime}>{ticket.time}</span>
                                </div>
                                <div className={styles.ticketPreview}>{ticket.preview}</div>
                                <div className={styles.ticketMetaText}>{ticket.client} • {ticket.node} • {ticket.workflow}</div>
                                <div className={styles.ticketMetaRow}>
                                    <span className={`${styles.priorityBadge} ${
                                        ticket.priority === 'HIGH' ? styles.priorityHigh : 
                                        ticket.priority === 'MEDIUM' ? styles.priorityMedium : styles.priorityLow
                                    }`}>{ticket.priority}</span>
                                    <span className={styles.commentCount}>
                                        <MessageSquare size={12} /> {ticket.comments}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textAlign: 'center', marginTop: '16px' }}>
                        Showing 1 to 8 of 8 tickets
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                            <button className={styles.iconBtn}>&lt;</button>
                            <button className={styles.iconBtn} style={{ color: '#10B981', fontWeight: 800 }}>1</button>
                            <button className={styles.iconBtn}>&gt;</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - DETAILS */}
            <div className={styles.rightPanel}>
                <div className={styles.mainView}>
                    <button className={styles.btnNewTicket}><Plus size={16} /> New Ticket <ChevronDown size={14}/></button>
                    
                    <div className={styles.detailsHeader}>
                        <div className={styles.detailsHeaderLeft}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span className={`${styles.priorityBadge} ${styles.priorityHigh}`}>{selectedTicket.priority}</span>
                                <span className={styles.ticketMetaText}>{selectedTicket.id}</span>
                            </div>
                            <div className={styles.detailsTitleRow}>
                                <h2 className={styles.detailsTitle}>{selectedTicket.title}</h2>
                            </div>
                            <a href="#" className={styles.ticketLink}>{selectedTicket.client} <ExternalLink size={12}/></a>
                            <div className={styles.ticketSubText}>{selectedTicket.node} • {selectedTicket.workflow} v1.9.0</div>
                            <div className={styles.ticketSubText}>Detected 2 minutes ago • Last updated just now</div>
                        </div>
                        <div className={styles.detailsActions}>
                            <button className={styles.iconBtn}><Star size={18} /></button>
                            <button className={styles.iconBtn}><MoreVertical size={18} /></button>
                            <button className={styles.iconBtn}><X size={18} /></button>
                        </div>
                    </div>

                    <div className={styles.innerTabs}>
                        <span className={styles.tabActive}>Conversation</span>
                        <span className={styles.tab}>Details</span>
                        <span className={styles.tab}>Workflow</span>
                        <span className={styles.tab}>Run Logs</span>
                        <span className={styles.tab}>Notes</span>
                        <span className={styles.tab}>History</span>
                    </div>

                    <div className={styles.conversation}>
                        {/* Message 1 */}
                        <div className={styles.messageRow}>
                            <div className={styles.avatar} style={{background: '#F1F5F9', color: '#64748B'}}>A</div>
                            <div className={styles.messageContent}>
                                <div className={styles.msgHeader}>
                                    <div className={styles.msgAuthor}>Acme Corp (aa@acmecorp.io) <span className={`${styles.authorRole} ${styles.roleClient}`}>CLIENT</span></div>
                                    <div className={styles.msgTime}>2m ago</div>
                                </div>
                                <p className={styles.msgText}>
                                    Daily Sync workflow is failing with a 500 error when processing invoices greater than 100. See screenshot and logs below.
                                </p>
                                <div className={styles.attachment}>
                                    <div className={styles.attachIcon}><ImageIcon size={16} color="#64748B"/></div>
                                    <div className={styles.attachInfo}>
                                        <span className={styles.attachName}>error-screenshot.png</span>
                                        <span className={styles.attachSize}>245 KB</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message 2 */}
                        <div className={styles.messageRow}>
                            <div className={styles.avatar} style={{background: '#FEF2F2', color: '#EF4444'}}><AlertTriangle size={18}/></div>
                            <div className={`${styles.messageContent} ${styles.msgSystem}`}>
                                <div className={styles.msgHeader}>
                                    <div className={styles.msgAuthor}>System Alert <span className={`${styles.authorRole} ${styles.roleSystem}`}>SYSTEM</span></div>
                                    <div className={styles.msgTime}>2m ago</div>
                                </div>
                                <p className={styles.msgText} style={{fontWeight: 600, color: '#0F172A'}}>
                                    Incident created automatically due to workflow error threshold exceeded (5 failures in 10 minutes).
                                </p>
                            </div>
                        </div>

                        {/* Message 3 */}
                        <div className={styles.messageRow}>
                            <div className={styles.avatar} style={{background: '#ECFDF5', color: '#10B981'}}>R</div>
                            <div className={`${styles.messageContent} ${styles.msgAdmin}`}>
                                <div className={styles.msgHeader}>
                                    <div className={styles.msgAuthor}>Blonk Admin (platform.owner@blonk.com) <span className={`${styles.authorRole} ${styles.roleAdmin}`}>ADMIN</span></div>
                                    <div className={styles.msgTime}>Just now</div>
                                </div>
                                <p className={styles.msgText}>
                                    We're on it! Our engineers are investigating the issue now.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.replyBox}>
                        <div className={styles.replyTabs}>
                            <button className={`${styles.replyTab} ${styles.replyTabActive}`}>Public Reply</button>
                            <button className={styles.replyTab}>Internal Note</button>
                        </div>
                        <textarea className={styles.replyTextarea} placeholder="Type your reply..."></textarea>
                        <div className={styles.replyToolbar}>
                            <div className={styles.toolbarIcons}>
                                <Paperclip size={16} style={{cursor: 'pointer'}} />
                                <Code size={16} style={{cursor: 'pointer'}} />
                                <AtSign size={16} style={{cursor: 'pointer'}} />
                                <Smile size={16} style={{cursor: 'pointer'}} />
                            </div>
                            <button className={styles.btnSend}>Send Reply <ChevronDown size={14}/></button>
                        </div>
                    </div>
                </div>

                <div className={styles.infoSidebar}>
                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionLabel}>TICKET INFO</div>
                        <div className={styles.kvList}>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Status</span>
                                <span className={styles.kvValue} style={{color: '#EF4444'}}>Needs Action <AlertTriangle size={12}/></span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Priority</span>
                                <span className={styles.kvValue} style={{color: '#EF4444'}}>High</span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Category</span>
                                <span className={styles.kvValue}>Workflow Error</span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Created</span>
                                <span className={styles.kvValue}>May 17, 2024 10:42 AM</span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Assigned To</span>
                                <span className={styles.kvValue}><div style={{width:16,height:16,borderRadius:'50%',background:'#DBEAFE',color:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.5rem'}}>MK</div> Markus Kukkens</span>
                            </div>
                            <div className={styles.kvItem} style={{flexDirection: 'column', alignItems: 'flex-start', gap: 4}}>
                                <span className={styles.kvKey}>SLA</span>
                                <span className={styles.ticketMetaText}>Response in 58m</span>
                                <div className={styles.slaBar}><div className={styles.slaProgress}></div></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionLabel}>CLIENT & ENVIRONMENT</div>
                        <div className={styles.kvList}>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Client</span>
                                <a href="#" className={styles.ticketLink}>Acme Corp <ExternalLink size={10}/></a>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Tenant ID</span>
                                <a href="#" className={styles.ticketLink}>acme-corp.io <ExternalLink size={10}/></a>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Node / Cluster</span>
                                <span className={styles.kvValue}>NODE-03</span>
                            </div>
                            <div className={styles.kvItem}>
                                <span className={styles.kvKey}>Region</span>
                                <span className={styles.kvValue}>AWS Europe (Frankfurt)</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionLabel}>QUICK ACTIONS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className={styles.linkBtn}><ExternalLink size={14} /> Open in Workflow Viewer</button>
                            <button className={styles.linkBtn}><Activity size={14} /> View Run Logs</button>
                            <button className={styles.linkBtn}><User size={14} /> Contact Client</button>
                            <button className={`${styles.linkBtn} ${styles.linkBtnEscalate}`}><AlertTriangle size={14} /> Escalate Ticket</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
