"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    MessageSquare, Send, User, Clock, CheckCircle, AlertCircle, Search, Inbox, 
    Filter, Paperclip, Smile, Bold, Italic, List, Link2, ExternalLink, 
    AlertTriangle, Bookmark, MoreVertical, X, ChevronDown, Download, 
    Play, FileText, Phone, ArrowUpRight
} from "lucide-react";
import styles from "./admin-support.module.css";

interface Ticket {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    subject: string;
    status: 'open' | 'closed' | 'waiting_for_client' | 'waiting_for_admin' | string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    lastMessage?: string;
    lastSenderRole?: string;
    messageCount?: number;
}

interface Message {
    id: string;
    ticketId: string;
    senderId: string;
    senderRole: 'user' | 'admin' | 'system' | string;
    senderName: string;
    content: string;
    createdAt: string;
}

export default function SupportInboxPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [activeTab, setActiveTab] = useState<'open' | 'waiting_for_client' | 'waiting_for_admin' | 'closed'>('open');
    const [activeSubTab, setActiveSubTab] = useState<'conversation' | 'details' | 'workflow' | 'logs' | 'notes' | 'history'>('conversation');
    const [editorTab, setEditorTab] = useState<'public' | 'note'>('public');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id);
            const interval = setInterval(() => fetchMessages(selectedTicket.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedTicket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/admin/support');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTickets(data);
                // Auto-select first ticket if none selected
                if (data.length > 0 && !selectedTicket) {
                    setSelectedTicket(data[0]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        }
    };

    const fetchMessages = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/support?ticketId=${id}`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !selectedTicket || isSending) return;
        setIsSending(true);

        try {
            const nextStatus = editorTab === 'public' ? 'waiting_for_client' : selectedTicket.status;
            const res = await fetch('/api/admin/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: selectedTicket.id,
                    message: input,
                    status: nextStatus
                })
            });

            if (res.ok) {
                setInput("");
                fetchTickets();
                fetchMessages(selectedTicket.id);
                setSelectedTicket({ ...selectedTicket, status: nextStatus });
            }
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setIsSending(false);
        }
    };

    const handleCloseTicket = async (id: string) => {
        try {
            const res = await fetch('/api/admin/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: id,
                    status: 'closed'
                })
            });
            if (res.ok) {
                fetchTickets();
                if (selectedTicket?.id === id) {
                    setSelectedTicket(prev => prev ? { ...prev, status: 'closed' } : null);
                }
            }
        } catch (err) {
            console.error("Failed to close ticket", err);
        }
    };

    // Derived counts
    const counts = {
        open: tickets.filter(t => t.status === 'open').length,
        waiting_for_client: tickets.filter(t => t.status === 'waiting_for_client').length,
        waiting_for_admin: tickets.filter(t => t.status === 'waiting_for_admin').length,
        closed: tickets.filter(t => t.status === 'closed').length,
    };

    const filteredTickets = tickets.filter(t => {
        const matchesTab = t.status === activeTab;
        const matchesSearch = 
            t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return { bg: 'rgba(239,68,68,0.08)', text: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' };
            case 'medium': return { bg: 'rgba(245,158,11,0.08)', text: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' };
            default: return { bg: 'rgba(16,185,129,0.08)', text: '#10B981', border: '1px solid rgba(16,185,129,0.15)' };
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainLayout}>
                
                {/* 1. LEFT COLUMN: SUPPORT TICKETS LIST */}
                <div className={styles.ticketsList}>
                    {/* Header */}
                    <div className={styles.ticketsListHeader}>
                        <div className={styles.ticketsListHeaderTop}>
                            <h3 className={styles.ticketsListTitle}>Support Tickets</h3>
                            <span className={styles.ticketCountBadge}>
                                {tickets.length} Total
                            </span>
                        </div>

                        {/* Tabs */}
                        <div className={styles.tabs}>
                            {[
                                { key: 'open', label: 'Open', count: counts.open },
                                { key: 'waiting_for_client', label: 'Client', count: counts.waiting_for_client },
                                { key: 'waiting_for_admin', label: 'Admin', count: counts.waiting_for_admin },
                                { key: 'closed', label: 'Closed', count: counts.closed }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                                >
                                    {tab.label}
                                    <span className={styles.tabCount}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search and Filters */}
                        <div className={styles.searchContainer}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={14} />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                            <button className={styles.filterButton}>
                                <Filter size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable list */}
                    <div className={styles.ticketItems}>
                        {filteredTickets.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Inbox size={32} className={styles.emptyStateIcon} />
                                <div className={styles.emptyStateText}>No matching tickets</div>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => {
                                const pStyle = getPriorityColor(ticket.priority);
                                return (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`${styles.ticketItem} ${selectedTicket?.id === ticket.id ? styles.ticketItemActive : ''}`}
                                    >
                                        <div className={styles.ticketItemHeader}>
                                            <span className={styles.ticketId}>
                                                {ticket.id.substring(0, 13)}
                                            </span>
                                            <span className={styles.ticketTime}>
                                                {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className={styles.ticketUserName}>
                                            <div className={`${styles.ticketStatusDot} ${ticket.status === 'open' ? '' : 'hidden'}`} />
                                            {ticket.userName}
                                        </div>

                                        <div className={styles.ticketSubject}>
                                            {ticket.subject}
                                        </div>

                                        <div className={styles.ticketFooter}>
                                            <span className={`${styles.priorityBadge} ${
                                                ticket.priority === 'high' ? styles.priorityHigh :
                                                ticket.priority === 'medium' ? styles.priorityMedium :
                                                styles.priorityLow
                                            }`}>
                                                {ticket.priority}
                                            </span>
                                            
                                            {ticket.messageCount !== undefined && (
                                                <div className={styles.ticketMessageCount}>
                                                    <MessageSquare size={12} />
                                                    {ticket.messageCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination / Footer */}
                    <div className={styles.ticketsListFooter}>
                        <span>Showing {filteredTickets.length} tickets</span>
                        <div className={styles.pagination}>
                            <button className={styles.paginationButton}>&lt;</button>
                            <span>1</span>
                            <button className={styles.paginationButton}>&gt;</button>
                        </div>
                    </div>
                </div>

                {/* 2. CENTER COLUMN: TICKET DETAIL & TIMELINE CHAT */}
                <div className={styles.ticketDetail}>
                    {selectedTicket ? (
                        <>
                            {/* Header */}
                            <div className={styles.ticketDetailHeader}>
                                <div className={styles.ticketDetailHeaderTop}>
                                    <div>
                                        <div className={styles.ticketDetailMeta}>
                                            <span className={styles.ticketIdBadge}>
                                                {selectedTicket.id}
                                            </span>
                                            <span className={`${styles.ticketIdBadge} ${
                                                selectedTicket.priority === 'high' ? styles.priorityHigh :
                                                selectedTicket.priority === 'medium' ? styles.priorityMedium :
                                                styles.priorityLow
                                            }`}>
                                                {selectedTicket.priority} PRIORITY
                                            </span>
                                        </div>
                                        <h2 className={styles.ticketDetailTitle}>
                                            {selectedTicket.subject}
                                        </h2>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className={styles.actionButtons}>
                                        <button className={styles.iconButton}>
                                            <Bookmark size={16} />
                                        </button>
                                        <button className={styles.iconButton}>
                                            <MoreVertical size={16} />
                                        </button>
                                        
                                        {/* Status dropdown */}
                                        <div style={{ position: 'relative' }}>
                                            <button 
                                                onClick={() => handleCloseTicket(selectedTicket.id)}
                                                className={`${styles.statusButton} ${selectedTicket.status === 'closed' ? styles.statusButtonClosed : ''}`}
                                            >
                                                {selectedTicket.status === 'closed' ? 'CLOSED' : 'NEEDS ACTION'}
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Meta subheader */}
                                <div className={styles.ticketDetailSubheader}>
                                    <span className={styles.ticketDetailSubheaderHighlight}>
                                        {selectedTicket.userName} 
                                        <ArrowUpRight size={12} style={{ opacity: 0.6 }} />
                                    </span>
                                    <span>•</span>
                                    <span>NODE-03 • Invoice Automator • v1.9.0</span>
                                    <span>•</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} />
                                        Detected 2 minutes ago
                                    </span>
                                </div>

                                {/* Inner Sub tabs */}
                                <div className={styles.subTabs}>
                                    {[
                                        { key: 'conversation', label: 'Conversation' },
                                        { key: 'details', label: 'Details' },
                                        { key: 'workflow', label: 'Workflow' },
                                        { key: 'logs', label: 'Run Logs' },
                                        { key: 'notes', label: 'Notes' },
                                        { key: 'history', label: 'History' }
                                    ].map(subTab => (
                                        <button
                                            key={subTab.key}
                                            onClick={() => setActiveSubTab(subTab.key as any)}
                                            className={`${styles.subTab} ${activeSubTab === subTab.key ? styles.subTabActive : ''}`}
                                        >
                                            {subTab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Conversation thread timeline */}
                            <div className={styles.conversationArea}>
                                {activeSubTab === 'conversation' ? (
                                    <div className={styles.messageThread}>
                                        {messages.map((msg) => {
                                            const isSystem = msg.senderRole === 'system' || msg.senderId === 'system';
                                            const isAdmin = msg.senderRole === 'admin';
                                            
                                            if (isSystem) {
                                                return (
                                                    <div key={msg.id} className={styles.systemAlert}>
                                                        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                                        <div>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>System Alert • Incident Triggered</div>
                                                            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{msg.content}</div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={msg.id} className={styles.message}>
                                                    {/* Avatar */}
                                                    <div className={`${styles.messageAvatar} ${isAdmin ? '' : styles.messageAvatarUser}`}>
                                                        {isAdmin ? 'PO' : 'AC'}
                                                    </div>

                                                    <div style={{ flex: 1 }}>
                                                        {/* Header info */}
                                                        <div className={styles.messageHeader}>
                                                            <div>
                                                                <span className={styles.messageSenderName}>{msg.senderName}</span>
                                                                <span className={styles.messageSenderRole}>
                                                                    {isAdmin ? 'Blonk Support' : 'Client'}
                                                                </span>
                                                            </div>
                                                            <span className={styles.messageTime}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>

                                                        {/* Message bubble */}
                                                        <div className={styles.messageBubble}>
                                                            {msg.content}

                                                            {/* Add attachment mockup for first client message */}
                                                            {!isAdmin && msg.content.includes("failing with a 500 error") && (
                                                                <div className={styles.attachment}>
                                                                    <div className={styles.attachmentInfo}>
                                                                        <FileText size={24} style={{ color: '#94A3B8' }} />
                                                                        <div>
                                                                            <div className={styles.attachmentName}>error-screenshot.png</div>
                                                                            <div className={styles.attachmentMeta}>245 KB • PNG Image</div>
                                                                        </div>
                                                                    </div>
                                                                    <button className={styles.downloadButton}>
                                                                        <Download size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <FileText size={32} className={styles.emptyStateIcon} />
                                        <span className={styles.emptyStateText}>This tab is synchronized with live fleet environment variables.</span>
                                    </div>
                                )}
                            </div>

                            {/* Reply Textarea Editor */}
                            <div className={styles.messageInputArea}>
                                {/* Reply type tabs */}
                                <div className={styles.messageInputTabs}>
                                    <button 
                                        onClick={() => setEditorTab('public')}
                                        className={`${styles.messageInputTab} ${editorTab === 'public' ? styles.messageInputTabActive : ''}`}
                                    >
                                        <MessageSquare size={14} />
                                        Public Reply
                                    </button>
                                    <button 
                                        onClick={() => setEditorTab('note')}
                                        className={`${styles.messageInputTab} ${editorTab === 'note' ? styles.messageInputTabActive : ''}`}
                                    >
                                        <AlertCircle size={14} />
                                        Internal Note
                                    </button>
                                </div>

                                {/* Text input area */}
                                <div style={{ 
                                    border: '1px solid #E2E8F0', 
                                    borderRadius: '16px', 
                                    padding: '12px', 
                                    background: editorTab === 'note' ? '#FFFBEB' : '#F8FAFC', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '12px' 
                                }}>
                                    <textarea
                                        placeholder={editorTab === 'note' ? "Internal notes are only visible to operators..." : "Type your reply to the client..."}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isSending || selectedTicket.status === 'closed'}
                                        className={styles.messageInput}
                                    />

                                    {/* Formatting toolbar footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', color: '#94A3B8' }}>
                                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'inherit' }}><Paperclip size={14} /></button>
                                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'inherit' }}><Smile size={14} /></button>
                                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'inherit' }}><Bold size={14} /></button>
                                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'inherit' }}><Italic size={14} /></button>
                                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'inherit' }}><List size={14} /></button>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={isSending || !input.trim() || selectedTicket.status === 'closed'}
                                                className={styles.sendMessageButton}
                                            >
                                                Send Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <MessageSquare size={48} className={styles.emptyStateIcon} />
                            <h3 style={{ fontWeight: 950, color: '#0F172A', marginBottom: '4px' }}>No ticket selected</h3>
                            <span className={styles.emptyStateText}>Please select a ticket from the left panel to load the thread.</span>
                        </div>
                    )}
                </div>

                {/* 3. RIGHT COLUMN: SOVEREIGN METADATA PANEL */}
                <div className={styles.ticketInfo}>
                    {selectedTicket ? (
                        <>
                            {/* Panel 1: Ticket Info */}
                            <div className={styles.infoSection}>
                                <h4 className={styles.infoSectionTitle}>Ticket Info</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'Status', value: selectedTicket.status === 'closed' ? 'Closed' : 'Needs Action', color: selectedTicket.status === 'closed' ? '#94A3B8' : '#10B981' },
                                        { label: 'Priority', value: selectedTicket.priority, color: selectedTicket.priority === 'High' ? '#EF4444' : '#F59E0B' },
                                        { label: 'Category', value: 'Workflow Error' },
                                        { label: 'Created', value: new Date(selectedTicket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                                        { label: 'Assigned To', value: 'Markus Kaknens' }
                                    ].map((item, idx) => (
                                        <div key={idx} className={styles.infoItem}>
                                            <span className={styles.infoLabel}>{item.label}</span>
                                            <span className={styles.infoValue} style={{ color: item.color || '#0F172A' }}>{item.value}</span>
                                        </div>
                                    ))}

                                    <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '8px', paddingTop: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 900, marginBottom: '6px' }}>
                                            <span style={{ color: '#94A3B8' }}>SLA Guarantee</span>
                                            <span style={{ color: '#10B981' }}>Response in 58m</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{ width: '75%', height: '100%', background: '#10B981', borderRadius: '100px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 2: Client & Environment */}
                            <div className={styles.infoSection}>
                                <h4 className={styles.infoSectionTitle}>Client & Environment</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'Client Name', value: selectedTicket.userName },
                                        { label: 'Tenant ID', value: 'acme-corp.io' },
                                        { label: 'Cluster / Node', value: 'NODE-03' },
                                        { label: 'Region', value: 'AWS Europe (Frankfurt)' }
                                    ].map((item, idx) => (
                                        <div key={idx} className={styles.infoItem}>
                                            <span className={styles.infoLabel}>{item.label}</span>
                                            <span className={styles.infoValue}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Panel 3: Quick Actions */}
                            <div className={styles.infoSection}>
                                <h4 className={styles.infoSectionTitle}>Quick Actions</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button style={{ height: '36px', width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Play size={12} />
                                        Open in Workflow Viewer
                                    </button>
                                    <button style={{ height: '36px', width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <FileText size={12} />
                                        View Run Logs
                                    </button>
                                    <button style={{ height: '36px', width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Phone size={12} />
                                        Contact Client
                                    </button>
                                    <button style={{ height: '36px', width: '100%', background: 'none', border: '1px dashed rgba(239,68,68,0.3)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900, color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <AlertTriangle size={12} />
                                        Escalate Ticket
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <Clock size={24} className={styles.emptyStateIcon} />
                            <div className={styles.emptyStateText}>No environment logs loaded</div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
