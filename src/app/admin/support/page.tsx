"use client";

import React, { useState, useEffect, useRef } from "react";
import adminStyles from "../admin.module.css";
import { MessageSquare, Send, User, Clock, CheckCircle, AlertCircle, Search, Inbox, Filter } from "lucide-react";

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
    senderRole: 'user' | 'admin';
    senderName: string;
    content: string;
    createdAt: string;
}

export default function SupportInboxPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [filter, setFilter] = useState<string>('open');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 10000); // Poll for new tickets
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id);
            const interval = setInterval(() => fetchMessages(selectedTicket.id), 5000); // Poll for new messages
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
            const res = await fetch('/api/admin/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: selectedTicket.id,
                    message: input
                })
            });

            if (res.ok) {
                setInput("");
                fetchMessages(selectedTicket.id);
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

    const filteredTickets = tickets.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div className={adminStyles.supportInboxGrid}>
                
                {/* TICKET LIST */}
                <div className={adminStyles.ticketList}>
                    <div className={adminStyles.ticketListHeader}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 950, margin: 0 }}>Support Tickets</h3>
                            <div className={adminStyles.hubMetrics}>
                                <span className={adminStyles.hubLabel}>{tickets.filter(t => t.status === 'open').length} ACTIVE</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button 
                                onClick={() => setFilter('open')}
                                style={{ flex: '1 1 calc(50% - 4px)', height: '36px', borderRadius: '10px', border: 'none', background: filter === 'open' ? 'var(--foreground)' : 'var(--muted)', color: filter === 'open' ? 'var(--background)' : 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Open
                            </button>
                            <button 
                                onClick={() => setFilter('waiting_for_client')}
                                style={{ flex: '1 1 calc(50% - 4px)', height: '36px', borderRadius: '10px', border: 'none', background: filter === 'waiting_for_client' ? 'var(--foreground)' : 'var(--muted)', color: filter === 'waiting_for_client' ? 'var(--background)' : 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Waiting for Client
                            </button>
                            <button 
                                onClick={() => setFilter('waiting_for_admin')}
                                style={{ flex: '1 1 calc(50% - 4px)', height: '36px', borderRadius: '10px', border: 'none', background: filter === 'waiting_for_admin' ? 'var(--foreground)' : 'var(--muted)', color: filter === 'waiting_for_admin' ? 'var(--background)' : 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Waiting for Admin
                            </button>
                            <button 
                                onClick={() => setFilter('closed')}
                                style={{ flex: '1 1 calc(50% - 4px)', height: '36px', borderRadius: '10px', border: 'none', background: filter === 'closed' ? 'var(--foreground)' : 'var(--muted)', color: filter === 'closed' ? 'var(--background)' : 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Closed
                            </button>
                        </div>
                    </div>

                    <div className={adminStyles.ticketItems}>
                        {filteredTickets.length === 0 ? (
                            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                <Inbox size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>No open support tickets</div>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => (
                                <div 
                                    key={ticket.id} 
                                    className={`${adminStyles.ticketItem} ${selectedTicket?.id === ticket.id ? adminStyles.ticketItemActive : ''}`}
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className={adminStyles.ticketMeta}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)' }}>#{ticket.id.substring(0, 8)}</span>
                                        <span className={`${adminStyles.ticketStatus} ${ticket.status === 'open' ? adminStyles.ticketStatusOpen : adminStyles.ticketStatusClosed}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div style={{ fontWeight: 950, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--foreground)' }}>{ticket.userName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '8px', fontWeight: 700 }}>{ticket.userEmail}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: 0.8 }}>
                                        {ticket.lastMessage || ticket.subject}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* CHAT PANEL */}
                <div className={adminStyles.chatPanel}>
                    {selectedTicket ? (
                        <>
                            <div className={adminStyles.chatHeader}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 950, margin: 0 }}>{selectedTicket.userName}</h3>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted-foreground)' }}>• {selectedTicket.userEmail}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>Ticket created: {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {selectedTicket.status === 'open' && (
                                        <button 
                                            className={adminStyles.actionIconBtn} 
                                            title="Close Ticket"
                                            onClick={() => handleCloseTicket(selectedTicket.id)}
                                            style={{ color: '#34D186' }}
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                    <button className={adminStyles.actionIconBtn} title="View User Logs"><Filter size={18} /></button>
                                </div>
                            </div>

                            <div className={adminStyles.chatMessages}>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`${adminStyles.msgWrapper} ${msg.senderRole === 'admin' ? adminStyles.msgAdmin : adminStyles.msgUser}`}>
                                        <div className={adminStyles.msgBubble}>
                                            {msg.content}
                                        </div>
                                        <div className={adminStyles.msgMeta}>
                                            {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className={adminStyles.chatInputArea}>
                                <input 
                                    className={adminStyles.chatInput}
                                    placeholder="Type your response to the user..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isSending || selectedTicket.status === 'closed'}
                                />
                                <button 
                                    className={adminStyles.sendBtn}
                                    onClick={handleSendMessage}
                                    disabled={isSending || !input.trim() || selectedTicket.status === 'closed'}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', padding: '48px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '32px', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                <MessageSquare size={32} />
                            </div>
                            <h3 style={{ color: 'var(--foreground)', fontWeight: 950, marginBottom: '8px' }}>No Ticket Selected</h3>
                            <p style={{ textAlign: 'center', maxWidth: '320px', lineHeight: 1.6, fontWeight: 700, fontSize: '0.9rem' }}>
                                Select a support ticket to view the conversation and reply
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
