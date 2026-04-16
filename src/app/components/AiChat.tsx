"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./AiChat.module.css";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    reasoning?: string;
};

const SUGGESTED_CHIPS = [
    { label: "Analyze Recent Ops", prompt: "Summarize today's logs and flag any anomalies." },
    { label: "Check System Health", prompt: "Perform a system snapshot and tell me our fleet integrity status." },
    { label: "Optimize ROI", prompt: "How can I optimize the ROI of my current active loops?" },
    { label: "Support Protocol", prompt: "Technical support: I need help with a workflow configuration." }
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
    const [healthSummary, setHealthSummary] = useState({ ops: 1240, success: 99.8 });
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

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
        setModelTier(text.length > 100 ? "Analytical (Gemini)" : "Fast (Llama)");

        const assistantId = (Date.now() + 1).toString();
        let assistantMessageAdded = false;

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("[AI] API error:", res.status, errText);
                throw new Error(`HTTP ${res.status}`);
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";
            let buffer = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const rawChunk = decoder.decode(value, { stream: true });
                    
                    // OpenRouter Reasoning Protocol: Split chunk in case multiple tokens arrived
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
                            if (!assistantMessageAdded) {
                                setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: chunk, reasoning: "" }]);
                                assistantMessageAdded = true;
                            } else {
                                setMessages(prev =>
                                    prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
                                );
                            }
                            assistantContent += chunk;
                        }
                    }
                }
            }

            // If nothing came through, show a fallback
            if (!assistantContent) {
                setMessages(prev =>
                    prev.map(m => m.id === assistantId ? { ...m, content: "I received your message but couldn't generate a response. Please try again." } : m)
                );
            }
        } catch (err) {
            console.error("[AI] Send error:", err);
            setMessages(prev =>
                prev.map(m => m.id === assistantId
                    ? { ...m, content: "⚠️ Connection error. Please restart the dev server if this is the first time using the assistant." }
                    : m
                )
            );
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
        // Basic markdown conversion for **bold** and newlines
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br/>");
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className={`${styles.fab} ${isOpen ? styles.fabOpen : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open AI Assistant"
            >
                {isOpen ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/><path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth="2.5" strokeLinecap="round"/></svg>
                )}
                {!isOpen && <span className={styles.badge}>AI</span>}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className={styles.panel}>
                    {/* Header */}
                    <div className={styles.panelHeader}>
                        <div className={styles.headerLeft}>
                            <div className={styles.avatar}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/><path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth="2.5" strokeLinecap="round"/></svg>
                            </div>
                            <div>
                                <div className={styles.headerName}>BLONK AI</div>
                                <div className={styles.headerStatus}>
                                    <span className={styles.statusDot}></span>
                                    Online & ready
                                </div>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>

                    {/* System Snapshot */}
                    <div className={styles.snapshot}>
                        <div className={styles.snapshotItem}>
                            <label>Fleet Health</label>
                            <div className={styles.snapshotValue}>{healthSummary.success}% Success</div>
                        </div>
                        <div className={styles.snapshotItem}>
                            <label>Intelligence</label>
                            <div className={styles.snapshotValue}>{modelTier}</div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={styles.messages}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.assistantMessage}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className={styles.msgAvatar}>AI</div>
                                )}
                                <div className={styles.bubble}>
                                    {msg.reasoning && (
                                        <div className={styles.reasoningBlock}>
                                            <div className={styles.reasoningHeader}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                                Strategic Thinking Process
                                            </div>
                                            <div className={styles.reasoningContent} dangerouslySetInnerHTML={{ __html: renderContent(msg.reasoning) }} />
                                        </div>
                                    )}
                                    <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                                </div>
                            </div>
                        ))}

                        {isLoading && messages[messages.length - 1]?.role === "user" && (
                            <div className={`${styles.message} ${styles.assistantMessage}`}>
                                <div className={styles.msgAvatar}>AI</div>
                                <div className={styles.bubble}>
                                    <div className={styles.typing}>
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actionable Suggestions */}
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

                        <div ref={bottomRef} />
                    </div>

                    {/* Input Bar */}
                    <div className={styles.inputBar}>
                        <input
                            ref={inputRef}
                            className={styles.input}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask BLONK AI anything..."
                            disabled={isLoading}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
