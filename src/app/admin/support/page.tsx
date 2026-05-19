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
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className={styles.ticketItems}>
                        {filteredTickets.length === 0 ? (
                            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                <Inbox size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>No matching tickets</div>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => {
                                const pStyle = getPriorityColor(ticket.priority);
                                return (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '16px',
                                            background: selectedTicket?.id === ticket.id ? 'var(--muted)' : 'transparent',
                                            border: '1px solid',
                                            borderColor: selectedTicket?.id === ticket.id ? 'var(--border)' : 'transparent',
                                            cursor: 'pointer',
                                            marginBottom: '8px',
                                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
                                                {ticket.id.substring(0, 13)}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                                                {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div style={{ fontWeight: 950, fontSize: '0.85rem', color: 'var(--foreground)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ticket.status === 'open' ? 'var(--accent)' : 'transparent' }} />
                                            {ticket.userName}
                                        </div>

                                        <div style={{ fontSize: '0.8rem', color: 'var(--foreground)', opacity: 0.8, fontWeight: 700, marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {ticket.subject}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '0.6rem',
                                                fontWeight: 950,
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                textTransform: 'uppercase',
                                                background: pStyle.bg,
                                                color: pStyle.text,
                                                border: pStyle.border
                                            }}>
                                                {ticket.priority}
                                            </span>
                                            
                                            {ticket.messageCount !== undefined && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 800 }}>
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
                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted-foreground)' }}>
                        <span>Showing {filteredTickets.length} tickets</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 950 }}>&lt;</button>
                            <span>1</span>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 950 }}>&gt;</button>
                        </div>
                    </div>
                </div>

                {/* 2. CENTER COLUMN: TICKET DETAIL & TIMELINE CHAT */}
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    {selectedTicket ? (
                        <>
                            {/* Header */}
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: '#FFFFFF' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-foreground)', background: 'var(--muted)', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                                                {selectedTicket.id}
                                            </span>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 950,
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                textTransform: 'uppercase',
                                                ...getPriorityColor(selectedTicket.priority)
                                            }}>
                                                {selectedTicket.priority} PRIORITY
                                            </span>
                                        </div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                                            {selectedTicket.subject}
                                        </h2>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                                            <Bookmark size={16} />
                                        </button>
                                        <button style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                                            <MoreVertical size={16} />
                                        </button>
                                        
                                        {/* Status dropdown */}
                                        <div style={{ position: 'relative' }}>
                                            <button 
                                                onClick={() => handleCloseTicket(selectedTicket.id)}
                                                style={{
                                                    height: '36px',
                                                    padding: '0 16px',
                                                    borderRadius: '10px',
                                                    border: '1px solid var(--border)',
                                                    background: selectedTicket.status === 'closed' ? 'var(--muted)' : 'var(--accent)',
                                                    color: selectedTicket.status === 'closed' ? 'var(--foreground)' : '#FFFFFF',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 950,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {selectedTicket.status === 'closed' ? 'CLOSED' : 'NEEDS ACTION'}
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Meta subheader */}
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.78rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                                    <span style={{ color: 'var(--foreground)', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border)', marginTop: '20px', paddingBottom: '2px' }}>
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
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: '8px 0',
                                                fontSize: '0.8rem',
                                                fontWeight: activeSubTab === subTab.key ? 950 : 700,
                                                color: activeSubTab === subTab.key ? 'var(--foreground)' : 'var(--muted-foreground)',
                                                borderBottom: activeSubTab === subTab.key ? '2px solid var(--accent)' : '2px solid transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {subTab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Conversation thread timeline */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--background)' }}>
                                {activeSubTab === 'conversation' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {messages.map((msg) => {
                                            const isSystem = msg.senderRole === 'system' || msg.senderId === 'system';
                                            const isAdmin = msg.senderRole === 'admin';
                                            
                                            if (isSystem) {
                                                return (
                                                    <div key={msg.id} style={{ display: 'flex', gap: '12px', background: 'rgba(239,68,68,0.05)', border: '1px dashed rgba(239,68,68,0.2)', padding: '16px', borderRadius: '16px', color: '#EF4444' }}>
                                                        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                                        <div>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>System Alert • Incident Triggered</div>
                                                            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{msg.content}</div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={msg.id} style={{ display: 'flex', gap: '16px', flexDirection: 'row' }}>
                                                    {/* Avatar */}
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '12px',
                                                        background: isAdmin ? 'var(--foreground)' : 'var(--muted)',
                                                        color: isAdmin ? 'var(--background)' : 'var(--foreground)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 950,
                                                        fontSize: '0.85rem',
                                                        flexShrink: 0
                                                    }}>
                                                        {isAdmin ? 'PO' : 'AC'}
                                                    </div>

                                                    <div style={{ flex: 1 }}>
                                                        {/* Header info */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                            <div>
                                                                <span style={{ fontWeight: 950, fontSize: '0.85rem', color: 'var(--foreground)' }}>{msg.senderName}</span>
                                                                <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginLeft: '8px', fontWeight: 700 }}>
                                                                    {isAdmin ? 'Blonk Support' : 'Client'}
                                                                </span>
                                                            </div>
                                                            <span style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>

                                                        {/* Message bubble */}
                                                        <div style={{
                                                            background: '#FFFFFF',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '16px',
                                                            padding: '16px',
                                                            fontSize: '0.85rem',
                                                            lineHeight: 1.5,
                                                            color: 'var(--foreground)',
                                                            fontWeight: 700
                                                        }}>
                                                            {msg.content}

                                                            {/* Add attachment mockup for first client message */}
                                                            {!isAdmin && msg.content.includes("failing with a 500 error") && (
                                                                <div style={{ 
                                                                    marginTop: '16px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    background: 'var(--muted)',
                                                                    border: '1px solid var(--border)',
                                                                    borderRadius: '12px',
                                                                    padding: '12px 16px'
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                        <FileText size={24} style={{ color: 'var(--muted-foreground)' }} />
                                                                        <div>
                                                                            <div style={{ fontWeight: 950, fontSize: '0.8rem', color: 'var(--foreground)' }}>error-screenshot.png</div>
                                                                            <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>245 KB • PNG Image</div>
                                                                        </div>
                                                                    </div>
                                                                    <button style={{ width: '32px', height: '32px', border: '1px solid var(--border)', background: '#FFFFFF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)', cursor: 'pointer' }}>
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
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', color: 'var(--muted-foreground)' }}>
                                        <FileText size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>This tab is synchronized with live fleet environment variables.</span>
                                    </div>
                                )}
                            </div>

                            {/* Reply Textarea Editor */}
                            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: '#FFFFFF' }}>
                                {/* Reply type tabs */}
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                    <button 
                                        onClick={() => setEditorTab('public')}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            fontSize: '0.8rem',
                                            fontWeight: editorTab === 'public' ? 950 : 700,
                                            color: editorTab === 'public' ? 'var(--accent)' : 'var(--muted-foreground)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <MessageSquare size={14} />
                                        Public Reply
                                    </button>
                                    <button 
                                        onClick={() => setEditorTab('note')}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            fontSize: '0.8rem',
                                            fontWeight: editorTab === 'note' ? 950 : 700,
                                            color: editorTab === 'note' ? '#F59E0B' : 'var(--muted-foreground)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <AlertCircle size={14} />
                                        Internal Note
                                    </button>
                                </div>

                                {/* Text input area */}
                                <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '12px', background: editorTab === 'note' ? '#FFFBEB' : 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <textarea
                                        placeholder={editorTab === 'note' ? "Internal notes are only visible to operators..." : "Type your reply to the client..."}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isSending || selectedTicket.status === 'closed'}
                                        style={{
                                            width: '100%',
                                            height: '70px',
                                            background: 'none',
                                            border: 'none',
                                            outline: 'none',
                                            resize: 'none',
                                            fontSize: '0.85rem',
                                            fontFamily: 'inherit',
                                            fontWeight: 700,
                                            color: 'var(--foreground)'
                                        }}
                                    />

                                    {/* Formatting toolbar footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', color: 'var(--muted-foreground)' }}>
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
                                                style={{
                                                    height: '36px',
                                                    padding: '0 16px',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    background: editorTab === 'note' ? '#F59E0B' : 'var(--accent)',
                                                    color: '#FFFFFF',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 950,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer',
                                                    opacity: (!input.trim() || isSending) ? 0.6 : 1
                                                }}
                                            >
                                                Send Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', padding: '48px' }}>
                            <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <h3 style={{ fontWeight: 950, color: 'var(--foreground)', marginBottom: '4px' }}>No ticket selected</h3>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Please select a ticket from the left panel to load the thread.</span>
                        </div>
                    )}
                </div>

                {/* 3. RIGHT COLUMN: SOVEREIGN METADATA PANEL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                    {selectedTicket ? (
                        <>
                            {/* Panel 1: Ticket Info */}
                            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', margin: '0 0 16px 0' }}>Ticket Info</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'Status', value: selectedTicket.status === 'closed' ? 'Closed' : 'Needs Action', color: selectedTicket.status === 'closed' ? 'var(--muted-foreground)' : 'var(--accent)' },
                                        { label: 'Priority', value: selectedTicket.priority, color: selectedTicket.priority === 'High' ? '#EF4444' : '#F59E0B' },
                                        { label: 'Category', value: 'Workflow Error' },
                                        { label: 'Created', value: new Date(selectedTicket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                                        { label: 'Assigned To', value: 'Markus Kaknens' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                                            <span style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                                            <span style={{ color: item.color || 'var(--foreground)', fontWeight: 950 }}>{item.value}</span>
                                        </div>
                                    ))}

                                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 950, marginBottom: '6px' }}>
                                            <span style={{ color: 'var(--muted-foreground)' }}>SLA Guarantee</span>
                                            <span style={{ color: '#10B981' }}>Response in 58m</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'var(--muted)', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{ width: '75%', height: '100%', background: '#10B981', borderRadius: '100px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 2: Client & Environment */}
                            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', margin: '0 0 16px 0' }}>Client & Environment</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'Client Name', value: selectedTicket.userName },
                                        { label: 'Tenant ID', value: 'acme-corp.io' },
                                        { label: 'Cluster / Node', value: 'NODE-03' },
                                        { label: 'Region', value: 'AWS Europe (Frankfurt)' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                                            <span style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                                            <span style={{ color: 'var(--foreground)', fontWeight: 950 }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Panel 3: Quick Actions */}
                            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', margin: '0 0 16px 0' }}>Quick Actions</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button style={{ height: '36px', width: '100%', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 950, color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Play size={12} />
                                        Open in Workflow Viewer
                                    </button>
                                    <button style={{ height: '36px', width: '100%', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 950, color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <FileText size={12} />
                                        View Run Logs
                                    </button>
                                    <button style={{ height: '36px', width: '100%', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 950, color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Phone size={12} />
                                        Contact Client
                                    </button>
                                    <button style={{ height: '36px', width: '100%', background: 'none', border: '1px dashed rgba(239,68,68,0.3)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 950, color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <AlertTriangle size={12} />
                                        Escalate Ticket
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            <Clock size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
                            <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>No environment logs loaded</div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
