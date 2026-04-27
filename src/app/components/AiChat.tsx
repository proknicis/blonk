"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./AiChat.module.css";
import { MessageSquare, Shield, Zap, Send, X, Terminal, User, AlertCircle, LifeBuoy } from "lucide-react";

type Message = {
    id: string;
    role: "user" | "assistant" | "admin";
    content: string;
    reasoning?: string;
};

const SUGGESTED_CHIPS = [
    { label: "Analyze Recent Ops", prompt: "Summarize today's logs and flag any anomalies." },
    { label: "Check System Health", prompt: "Perform a system snapshot and tell me our fleet integrity status." },
    { label: "How to invite team?", prompt: "How do I invite a new team member to my firm?" },
    { label: "Audit logs?", prompt: "Where can I find the audit logs for compliance?" }
];

export default function AiChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "0",
            role: "assistant",
            content: "👋 Hey! I'm **BLONK AI** — your automation co-pilot. Ask me anything about setting up workflows, connecting tools, or saving your firm time.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [modelTier, setModelTier] = useState<string>("Ready");
    const [isEscalated, setIsEscalated] = useState(false);
    const [ticketId, setTicketId] = useState<string | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Check for existing open tickets on mount
    useEffect(() => {
        const checkActiveTickets = async () => {
            try {
                const res = await fetch('/api/support');
                if (!res.ok) return;
                const tickets = await res.json();
                const openTicket = tickets.find((t: any) => t.status === 'open');
                if (openTicket) {
                    setTicketId(openTicket.id);
                    setIsEscalated(true);
                    
                    // Load ticket messages
                    const detailsRes = await fetch(`/api/support?ticketId=${openTicket.id}`);
                    const { messages: ticketMsgs } = await detailsRes.json();
                    
                    if (ticketMsgs && ticketMsgs.length > 0) {
                        const converted = ticketMsgs.map((m: any) => ({
                            id: m.id,
                            role: m.senderRole === 'admin' ? 'admin' : (m.senderRole === 'user' ? 'user' : 'assistant'),
                            content: m.content
                        }));
                        setMessages(converted);
                    }
                }
            } catch (err) {
                console.error("Failed to sync support status", err);
            }
        };
        checkActiveTickets();
    }, []);

    useEffect(() => {
        const handleOpenAi = (e: any) => {
            const prompt = e.detail?.prompt;
            setIsOpen(true);
            if (prompt) {
                setTimeout(() => sendMessage(prompt), 300);
            }
        };
        window.addEventListener('OPEN_AI_CHAT', handleOpenAi);
        return () => window.removeEventListener('OPEN_AI_CHAT', handleOpenAi);
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        // If we are in an escalated ticket state, we send to the support API instead of the general AI
        if (isEscalated && ticketId) {
            try {
                const res = await fetch("/api/support", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ticketId,
                        message: text
                    }),
                });

                if (res.ok) {
                    // Message sent to admin. In a full system, we might poll for responses.
                }
            } catch (err) {
                console.error("Support message failed", err);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setModelTier(text.length > 100 ? "Analytical (Gemini)" : "Fast (Llama)");

        const assistantId = (Date.now() + 1).toString();
        let assistantMessageAdded = false;
        let fullContent = "";

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const rawChunk = decoder.decode(value, { stream: true });
                    
                    const chunks = rawChunk.split(/THINKING:|(?=THINKING:)/).filter(Boolean);

                    for (let chunk of chunks) {
                        const isReasoning = chunk.startsWith("THINKING:") || rawChunk.startsWith("THINKING:");
                        const cleanToken = chunk.replace("THINKING:", "");

                        if (isReasoning) {
                            if (!assistantMessageAdded) {
                                setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "", reasoning: cleanToken }]);
                                assistantMessageAdded = true;
                            } else {
                                setMessages(prev =>
                                    prev.map(m => m.id === assistantId ? { ...m, reasoning: (m.reasoning || "") + cleanToken } : m)
                                );
                            }
                        } else {
                            fullContent += chunk;
                            if (!assistantMessageAdded) {
                                setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: chunk, reasoning: "" }]);
                                assistantMessageAdded = true;
                            } else {
                                setMessages(prev =>
                                    prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
                                );
                            }
                        }
                    }
                }
            }

            // Check for escalation marker
            if (fullContent.includes("[ESCALATE]")) {
                setIsEscalated(true);
            }

        } catch (err) {
            console.error("[AI] Send error:", err);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "⚠️ Connection error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEscalate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: "Technical Support Escalation",
                    message: messages[messages.length - 2]?.content || "I need help with the platform."
                }),
            });
            const data = await res.json();
            if (data.ticketId) {
                setTicketId(data.ticketId);
                setMessages(prev => [...prev, { 
                    id: Date.now().toString(), 
                    role: 'assistant', 
                    content: "✅ **Support Ticket Created.** An administrator has been notified and will respond here shortly. You can continue typing to provide more details." 
                }]);
            }
        } catch (err) {
            console.error("Escalation failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const renderContent = (text: string) => {
        return text
            .replace(/\[ESCALATE\]/g, "")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br/>");
    };

    return (
        <>
            <button
                className={`${styles.fab} ${isOpen ? styles.fabOpen : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open AI Assistant"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && <span className={styles.badge}>AI</span>}
            </button>

            {isOpen && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div className={styles.headerLeft}>
                            <div className={styles.avatar}>
                                <Zap size={18} fill="currentColor" />
                            </div>
                            <div>
                                <div className={styles.headerName}>{isEscalated ? "Support Hub" : "BLONK AI"}</div>
                                <div className={styles.headerStatus}>
                                    <span className={styles.statusDot}></span>
                                    {isEscalated ? "Admin Bridge Active" : "Online & ready"}
                                </div>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    {!isEscalated && (
                        <div className={styles.snapshot}>
                            <div className={styles.snapshotItem}>
                                <label>Fleet Health</label>
                                <div className={styles.snapshotValue}>99.8% Success</div>
                            </div>
                            <div className={styles.snapshotItem}>
                                <label>Intelligence</label>
                                <div className={styles.snapshotValue}>{modelTier}</div>
                            </div>
                        </div>
                    )}

                    <div className={styles.messages}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.assistantMessage} ${msg.role === 'admin' ? styles.adminMessage : ''}`}
                            >
                                {msg.role !== "user" && (
                                    <div className={styles.msgAvatar}>{msg.role === 'admin' ? 'ADM' : 'AI'}</div>
                                )}
                                <div className={styles.bubble}>
                                    {msg.reasoning && (
                                        <div className={styles.reasoningBlock}>
                                            <div className={styles.reasoningHeader}>
                                                <AlertCircle size={12} />
                                                Strategic Thinking Process
                                            </div>
                                            <div className={styles.reasoningContent} dangerouslySetInnerHTML={{ __html: renderContent(msg.reasoning) }} />
                                        </div>
                                    )}
                                    <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                                    
                                    {msg.content.includes("[ESCALATE]") && !ticketId && (
                                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(52, 209, 134, 0.1)', borderRadius: '12px', border: '1px dashed var(--accent)' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '12px' }}>I'll connect you with our technical team to resolve this.</p>
                                            <button 
                                                className={styles.suggestionChip} 
                                                onClick={handleEscalate}
                                                style={{ width: '100%', background: 'var(--accent)', color: 'white', border: 'none', justifyContent: 'center' }}
                                            >
                                                <LifeBuoy size={14} /> Connect to Support
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className={`${styles.message} ${styles.assistantMessage}`}>
                                <div className={styles.msgAvatar}>...</div>
                                <div className={styles.bubble}>
                                    <div className={styles.typing}>
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isEscalated && (
                            <div className={styles.suggestions}>
                                <div className={styles.suggestionLabel}>Operational Commands:</div>
                                <div className={styles.chipGrid}>
                                    {SUGGESTED_CHIPS.map((chip, i) => (
                                        <button key={i} className={styles.suggestionChip} onClick={() => sendMessage(chip.prompt)}>
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    <div className={styles.inputBar}>
                        <input
                            ref={inputRef}
                            className={styles.input}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isEscalated ? "Type message to support..." : "Ask BLONK AI anything..."}
                            disabled={isLoading}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
