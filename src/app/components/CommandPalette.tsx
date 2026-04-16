"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Zap, Terminal, Shield, Command as CommandIcon } from "lucide-react";
import styles from "./CommandPalette.module.css";

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setInput("");
            setResult(null);
        }
    }, [isOpen]);

    const executeCommand = async () => {
        if (!input.trim() || isLoading) return;
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai/command", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: input }),
            });
            const data = await res.json();
            setResult(data);

            if (data.action === "NAVIGATE" && data.url) {
                router.push(data.url);
                setTimeout(() => setIsOpen(false), 1000);
            }
            
            if (data.action === "MESSAGE") {
                window.dispatchEvent(new CustomEvent('OPEN_AI_CHAT', { detail: { prompt: data.content } }));
                setIsOpen(false);
            }

        } catch (err) {
            console.error("Command execution failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <div className={styles.searchBar}>
                    <Terminal size={20} className={styles.terminalIcon} />
                    <input
                        ref={inputRef}
                        className={styles.input}
                        placeholder="Issue fleet command (e.g. 'Show audit logs', 'Go to mission control')..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && executeCommand()}
                    />
                    <div className={styles.shortcut}>
                        <CommandIcon size={12} /> K
                    </div>
                </div>

                <div className={styles.content}>
                    {isLoading ? (
                        <div className={styles.loading}>
                            <Zap size={20} className={styles.pulse} />
                            <span>B-SOS Intercepting...</span>
                        </div>
                    ) : result ? (
                        <div className={styles.result}>
                            <div className={styles.resultHeader}>
                                <Shield size={14} /> Command Output
                            </div>
                            <div className={styles.resultBody}>{result.message || "Command executed."}</div>
                        </div>
                    ) : (
                        <div className={styles.hints}>
                            <div className={styles.hint}>
                                <Zap size={14} /> "Analyze our mission status"
                            </div>
                            <div className={styles.hint}>
                                <Search size={14} /> "Jump to audit records"
                            </div>
                            <div className={styles.hint}>
                                <Zap size={14} /> "Help me optimize loops"
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
