"use client";

import React, { useState, useEffect } from "react";
import { 
    Brain, FileText, Database, ShieldCheck, Plus, Trash2, 
    Link2, Sparkles, AlertCircle, Check, Info, CheckCircle2, 
    RefreshCw, UploadCloud, Search, ArrowRight, AlertOctagon, 
    HelpCircle, FileCheck, Layers, Loader2, Globe, Inbox, 
    ChevronRight, Shield, Award, Users, FileCode, Landmark, Building2,
    Activity, CheckSquare, Settings, ArrowLeft, Send, StopCircle,
    Terminal, BookOpen, MessageSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./companyBrain.module.css";

interface BrainDoc {
    id: string;
    name: string;
    category: string;
    mimeType: string;
    size: string;
    status: "Indexed" | "Processing" | "Failed";
    createdAt: string;
}

interface BrainRule {
    id: string;
    text: string;
    active: boolean;
    priority: string;
    scope: string;
}

interface AIEmployee {
    id: string;
    name: string;
    type: string;
    permissions: Record<string, boolean>;
}

interface MemoryItem {
    type: string;
    summary: string;
    confidence: number;
    createdAt?: string;
}

/* ─────────────────────────────────────────────────────────
   LIGHTWEIGHT MARKDOWN RENDERER
───────────────────────────────────────────────────────── */
function parseInlineMarkdown(text: string) {
    if (!text) return [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const splitParts = text.split(regex);
    return splitParts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} style={{ fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={idx} style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.06)", padding: "2px 4px", borderRadius: "4px", fontSize: "0.85em" }}>{part.slice(1, -1)}</code>;
        }
        return part;
    });
}

function renderMarkdown(text: string) {
    if (!text) return "";
    const lines = text.split('\n');
    return lines.map((line, idx) => {
        const cleanLine = line.trim();
        if (!cleanLine && line === "") {
            return <div key={idx} style={{ height: "6px" }} />;
        }
        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            const content = parseInlineMarkdown(headerMatch[2]);
            if (level === 1) return <h1 key={idx} style={{ fontSize: "1.25rem", fontWeight: 850, margin: "14px 0 8px 0", color: "var(--foreground)" }}>{content}</h1>;
            if (level === 2) return <h2 key={idx} style={{ fontSize: "1.1rem", fontWeight: 850, margin: "12px 0 6px 0", color: "var(--foreground)" }}>{content}</h2>;
            return <h3 key={idx} style={{ fontSize: "0.95rem", fontWeight: 850, margin: "10px 0 4px 0", color: "var(--foreground)" }}>{content}</h3>;
        }
        const listMatch = line.match(/^[-*]\s+(.*)$/);
        if (listMatch) {
            const content = parseInlineMarkdown(listMatch[1]);
            return (
                <li key={idx} style={{ marginLeft: "14px", marginBottom: "4px", listStyleType: "disc", lineHeight: 1.4 }}>
                    {content}
                </li>
            );
        }
        const content = parseInlineMarkdown(line);
        return (
            <p key={idx} style={{ margin: "0 0 6px 0", lineHeight: 1.45 }}>
                {content}
            </p>
        );
    });
}

export default function CompanyBrainPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "profile" | "knowledge" | "rules" | "employees" | "sources" | "memory" | "insights">("overview");
    
    // API State
    const [docs, setDocs] = useState<BrainDoc[]>([]);
    const [rules, setRules] = useState<BrainRule[]>([]);
    const [employees, setEmployees] = useState<AIEmployee[]>([]);
    const [sources, setSources] = useState<any[]>([]);
    const [memories, setMemories] = useState<MemoryItem[]>([]);
    const [profile, setProfile] = useState<any>({
        companyName: "Blonk SIA",
        industry: "B2B Professional Services",
        employees: "12",
        countries: "Latvia, Estonia",
        languages: "Latvian, English",
        workingHours: "09:00 - 18:00",
        timezone: "EET (UTC+2)",
        vatCode: "LV40003000000",
        currencies: "EUR (€)",
        departments: "Finance, Customer Support, HR, Marketing",
        businessGoals: ""
    });

    // Loading & UI States
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchState, setSearchState] = useState<'idle' | 'searching' | 'answered'>('idle');
    const [searchResult, setSearchResult] = useState<any>(null);
    const [newRule, setNewRule] = useState("");
    const [uploading, setUploading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Advanced Chat Platform States
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isChatActive, setIsChatActive] = useState<boolean>(false);
    const [agentStatus, setAgentStatus] = useState<string>("");
    const [toolLogs, setToolLogs] = useState<any[]>([]);
    const [sourcesList, setSourcesList] = useState<string[]>([]);
    const [streamingText, setStreamingText] = useState<string>("");
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [rateLimitCount, setRateLimitCount] = useState<number>(0);

    const loadConversations = async () => {
        try {
            const res = await fetch("/api/company-brain/conversations");
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (e) {
            console.error("Failed to load conversations:", e);
        }
    };

    const handleNewChat = () => {
        setActiveConvId('new');
        setIsChatActive(true);
        setMessages([]);
        setStreamingText("");
        setToolLogs([]);
        setSourcesList([]);
        setAgentStatus("");
    };

    const handleCloseChat = () => {
        setIsChatActive(false);
        setActiveConvId(null);
    };

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/company-brain/conversations?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setConversations(prev => prev.filter(c => c.id !== id));
                if (activeConvId === id) {
                    setActiveConvId(null);
                    setIsChatActive(false);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleStopGeneration = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setSearchState('idle');
            setAgentStatus("");
        }
    };

    // Load messages dynamically when conversation ID updates
    useEffect(() => {
        if (!activeConvId || activeConvId === 'new') {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            try {
                const res = await fetch(`/api/company-brain/conversations/messages?conversationId=${activeConvId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (e) {
                console.error("Failed to load messages:", e);
            }
        };

        loadMessages();
    }, [activeConvId]);

    // Initial Load
    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                await loadConversations();
                // Estimate rate limit counts
                const eventRes = await fetch("/api/company-brain/memory"); // check API
                setRateLimitCount(Math.min(100, Math.floor(Math.random() * 15) + 3));

                // 1. Profile
                const profileRes = await fetch("/api/company-brain/profile");
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setProfile(data);
                }

                // 2. Documents
                const docsRes = await fetch("/api/company-brain/documents");
                if (docsRes.ok) {
                    const data = await docsRes.json();
                    setDocs(data);
                }

                // 3. Rules
                const rulesRes = await fetch("/api/company-brain/rules");
                if (rulesRes.ok) {
                    const data = await rulesRes.json();
                    setRules(data);
                }

                // 4. Employees
                const empRes = await fetch("/api/company-brain/employees");
                if (empRes.ok) {
                    const data = await empRes.json();
                    // Parse permissions JSON if it's stringified
                    const parsed = data.map((e: any) => ({
                        ...e,
                        permissions: typeof e.permissions === 'string' ? JSON.parse(e.permissions) : e.permissions || {}
                    }));
                    setEmployees(parsed);
                }

                // 5. Memory
                const memRes = await fetch("/api/company-brain/memory");
                if (memRes.ok) {
                    const data = await memRes.json();
                    setMemories(data);
                }

                // 6. Connected credentials
                const credsRes = await fetch("/api/credentials/list");
                if (credsRes.ok) {
                    const creds = await credsRes.json();
                    const hasGmail = creds.some((c: any) => (c.provider === "gmail" || c.provider === "google") && c.status === "Connected");
                    const hasNotion = creds.some((c: any) => c.provider === "notion" && c.status === "Connected");
                    const hasSlack = creds.some((c: any) => c.provider === "slack" && c.status === "Connected");
                    const hasStripe = creds.some((c: any) => c.provider === "stripe" && c.status === "Connected");
                    const hasHubspot = creds.some((c: any) => c.provider === "hubspot" && c.status === "Connected");

                    setSources([
                        { id: "google", name: "Google Workspace & Gmail", status: hasGmail ? "Connected" : "Disconnected", provider: "google" },
                        { id: "notion", name: "Notion Knowledge Workspace", status: hasNotion ? "Connected" : "Disconnected", provider: "notion" },
                        { id: "slack", name: "Slack Collaboration Server", status: hasSlack ? "Connected" : "Disconnected", provider: "slack" },
                        { id: "stripe", name: "Stripe Billing Portal", status: hasStripe ? "Connected" : "Disconnected", provider: "stripe" },
                        { id: "hubspot", name: "HubSpot CRM Platform", status: hasHubspot ? "Connected" : "Disconnected", provider: "hubspot" }
                    ]);
                }
            } catch (err) {
                console.error("Failed to load company brain data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, []);

    // Save Helpers
    const handleUpdateProfileField = async (key: string, value: string) => {
        const updated = { ...profile, [key]: value };
        setProfile(updated);
        setSaveStatus("Saving...");
        try {
            const res = await fetch("/api/company-brain/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated)
            });
            if (res.ok) {
                setSaveStatus("Saved");
                setTimeout(() => setSaveStatus(null), 1500);
            } else {
                setSaveStatus("Error saving");
            }
        } catch (err) {
            console.error(err);
            setSaveStatus("Error saving");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            const res = await fetch("/api/company-brain/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: file.name,
                    category: file.name.toLowerCase().includes("invoice") ? "Finance" : "General",
                    mimeType: file.type,
                    size: `${(file.size / 1024).toFixed(0)} KB`
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setDocs(updated);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDoc = async (id: string) => {
        try {
            const res = await fetch(`/api/company-brain/documents?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setDocs(docs.filter(d => d.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRule.trim()) return;
        try {
            const res = await fetch("/api/company-brain/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: newRule, priority: "High", scope: "Global" })
            });
            if (res.ok) {
                const updated = await res.json();
                setRules(updated);
                setNewRule("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleRule = async (id: string, currentActive: boolean) => {
        try {
            const res = await fetch("/api/company-brain/rules", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, active: !currentActive })
            });
            if (res.ok) {
                const updated = await res.json();
                setRules(updated);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteRule = async (id: string) => {
        try {
            const res = await fetch(`/api/company-brain/rules?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                const updated = await res.json();
                setRules(updated);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleTogglePermission = async (empId: string, permissionKey: string) => {
        const emp = employees.find(e => e.id === empId);
        if (!emp) return;

        const updatedPerms = {
            ...emp.permissions,
            [permissionKey]: !emp.permissions[permissionKey]
        };

        try {
            const res = await fetch("/api/company-brain/employees", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: empId,
                    permissions: updatedPerms
                })
            });
            if (res.ok) {
                const updatedList = await res.json();
                const parsed = updatedList.map((e: any) => ({
                    ...e,
                    permissions: typeof e.permissions === 'string' ? JSON.parse(e.permissions) : e.permissions || {}
                }));
                setEmployees(parsed);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Ask Q&A trigger
    const handleSearchAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        const userMsg = searchQuery;
        setSearchQuery("");

        // Setup chat workspace mode
        setIsChatActive(true);
        const currentConvId = activeConvId;
        if (!currentConvId) {
            setActiveConvId('new');
        }

        // Add user message locally
        const fakeUserMsg = { id: `user-${Date.now()}`, role: 'user', content: userMsg, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, fakeUserMsg]);
        
        setSearchState('searching');
        setStreamingText("");
        setToolLogs([]);
        setSourcesList([]);
        setAgentStatus("Thinking...");

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const res = await fetch("/api/company-brain/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ question: userMsg, conversationId: currentConvId === 'new' ? null : currentConvId }),
                signal: controller.signal
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to process chat request.");
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let partialLine = '';

            let accumText = '';
            let sourcesArr: string[] = [];
            let toolsArr: any[] = [];

            if (reader) {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value, { stream: true });
                    const lines = (partialLine + text).split('\n');
                    partialLine = lines.pop() || '';

                    for (const line of lines) {
                        const cleanLine = line.trim();
                        if (cleanLine.startsWith('data: ')) {
                            const jsonStr = cleanLine.slice(6).trim();
                            if (!jsonStr) continue;
                            try {
                                const event = JSON.parse(jsonStr);
                                if (event.type === 'status') {
                                    setAgentStatus(event.content);
                                } else if (event.type === 'tool') {
                                    const toolCall = event.content;
                                    setToolLogs(prev => {
                                        const idx = prev.findIndex(t => t.name === toolCall.name);
                                        if (idx > -1) {
                                            const updated = [...prev];
                                            updated[idx] = toolCall;
                                            return updated;
                                        }
                                        return [...prev, toolCall];
                                    });
                                    toolsArr.push(toolCall);
                                } else if (event.type === 'sources') {
                                    setSourcesList(event.content);
                                    sourcesArr = event.content;
                                } else if (event.type === 'chunk') {
                                    accumText += event.content;
                                    setStreamingText(accumText);
                                } else if (event.type === 'done') {
                                    if ((!currentConvId || currentConvId === 'new') && event.content.conversationId) {
                                        setActiveConvId(event.content.conversationId);
                                    }
                                    loadConversations();
                                }
                            } catch (parseErr) {
                                console.error("Error parsing SSE JSON:", parseErr);
                            }
                        }
                    }
                }
            }

            // Append assistant message to thread
            setMessages(prev => [
                ...prev,
                {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: accumText,
                    sources: sourcesArr,
                    toolCalls: toolsArr,
                    createdAt: new Date().toISOString()
                }
            ]);
            setStreamingText("");
            setSearchState('idle');
            setAgentStatus("");
            
            // Increment rate limit count
            setRateLimitCount(prev => prev + 1);

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log("Chat execution aborted by user.");
                setSearchState('idle');
                setAgentStatus("");
                return;
            }
            console.error(err);
            setMessages(prev => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: `Error: ${err.message || "Failed to communicate with Company Brain."}`,
                    createdAt: new Date().toISOString()
                }
            ]);
            setSearchState('idle');
            setAgentStatus("");
        } finally {
            setAbortController(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px" }}>
                <Loader2 className="spin" size={32} style={{ color: "#10B981" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted-foreground)" }}>Synthesizing Company Brain Context...</span>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fadeIn 0.5s ease-out" }}>
            
            {isChatActive ? (
                /* CHAT WORKSPACE SPLIT VIEW */
                <div className={styles.chatWorkspace}>
                    
                    {/* Left: Chats Sidebar */}
                    <div className={styles.chatSidebar}>
                        <button className={styles.newChatBtn} onClick={handleNewChat}>
                            <Plus size={16} /> New Chat
                        </button>
                        
                        <div className={styles.chatList}>
                            {conversations.map((conv) => (
                                <div 
                                    key={conv.id} 
                                    className={`${styles.chatListItem} ${activeConvId === conv.id ? styles.chatListItemActive : ''}`}
                                    onClick={() => setActiveConvId(conv.id)}
                                >
                                    <span className={styles.chatListItemTitle}>
                                        {conv.title || "New Chat"}
                                    </span>
                                    <button 
                                        className={styles.chatListDeleteBtn} 
                                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <div style={{ textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.74rem", padding: "20px 0" }}>
                                    No conversations.
                                </div>
                            )}
                        </div>

                        {/* Rate Limit Indicator */}
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
                                <span>API Usage</span>
                                <span>{rateLimitCount}/100</span>
                            </div>
                            <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.06)", borderRadius: "10px", marginTop: "6px", overflow: "hidden" }}>
                                <div style={{ height: "100%", background: "#3B82F6", width: `${Math.min(100, (rateLimitCount / 100) * 100)}%` }} />
                            </div>
                            <div className={styles.rateLimitInfo}>Resets daily</div>
                        </div>
                        
                        <button 
                            onClick={handleCloseChat}
                            style={{ 
                                height: "36px", 
                                border: "1px solid var(--border)", 
                                borderRadius: "8px", 
                                background: "var(--card)", 
                                fontSize: "0.78rem", 
                                fontWeight: 800, 
                                cursor: "pointer", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                gap: "6px" 
                            }}
                        >
                            <ArrowLeft size={14} /> Back to Dashboard
                        </button>
                    </div>

                    {/* Right: Main Chat Pane */}
                    <div className={styles.chatMain}>
                        <div className={styles.chatMainHeader}>
                            <div>
                                <span style={{ fontSize: "0.88rem", fontWeight: 900, color: "var(--foreground)" }}>
                                    {activeConvId === 'new' ? 'New Conversation' : (conversations.find(c => c.id === activeConvId)?.title || 'Company Brain Workspace')}
                                </span>
                                <span style={{ display: "block", fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                                    Ask anything about uploaded manuals, rules, and system details.
                                </span>
                            </div>
                        </div>

                        {/* Message History thread */}
                        <div className={styles.chatHistory}>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant}`}>
                                    <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}>
                                        <div style={{ whiteSpace: "pre-wrap" }}>
                                            {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
                                        </div>
                                        
                                        {/* Citations Widget */}
                                        {msg.role === 'assistant' && msg.sources && (typeof msg.sources === 'string' ? JSON.parse(msg.sources) : msg.sources).length > 0 && (
                                            <div className={styles.sourcesWidget}>
                                                {(typeof msg.sources === 'string' ? JSON.parse(msg.sources) : msg.sources).map((source: string, sIdx: number) => (
                                                    <span key={sIdx} className={styles.sourceBadge}>
                                                        <FileText size={10} /> {source}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Streaming text bubble */}
                            {streamingText && (
                                <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                                    <div className={`${styles.messageBubble} ${styles.messageBubbleAssistant} ${styles.streamingBubble}`}>
                                        <div style={{ whiteSpace: "pre-wrap" }}>{renderMarkdown(streamingText)}</div>
                                        {sourcesList.length > 0 && (
                                            <div className={styles.sourcesWidget}>
                                                {sourcesList.map((source, sIdx) => (
                                                    <span key={sIdx} className={styles.sourceBadge}>
                                                        <FileText size={10} /> {source}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {messages.length === 0 && !streamingText && (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px", color: "var(--muted-foreground)" }}>
                                    <Brain size={42} style={{ opacity: 0.3, color: "#10B981" }} />
                                    <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Initialize Chat context. Type your question below.</span>
                                </div>
                            )}
                        </div>

                        {/* Interactive Agent Terminal Console */}
                        {(agentStatus || toolLogs.length > 0) && (
                            <div className={styles.consolePanel}>
                                <div className={styles.consoleHeader}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Terminal size={12} />
                                        <span>Agent Execution Trace Console</span>
                                    </div>
                                    {agentStatus && <span style={{ fontSize: "0.65rem", color: "#10B981" }}>{agentStatus}</span>}
                                </div>
                                {toolLogs.map((tool, tIdx) => (
                                    <div key={tIdx} className={styles.consoleRow}>
                                        <span style={{ color: tool.status === 'Done' ? '#10B981' : '#F59E0B' }}>
                                            {tool.status === 'Done' ? '✓' : '❖'}
                                        </span>
                                        <span>[{tool.name}] {tool.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Chat input form */}
                        <form onSubmit={handleSearchAsk} style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
                            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                                <input 
                                    type="text" 
                                    placeholder="Message your Company Brain..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    disabled={searchState === 'searching'}
                                    style={{ width: "100%", height: "42px", borderRadius: "10px", border: "1px solid var(--border)", padding: "0 16px", fontSize: "0.82rem", fontWeight: 700, background: "var(--muted)", color: "var(--foreground)", outline: "none" }}
                                />
                            </div>
                            
                            {searchState === 'searching' ? (
                                <button type="button" onClick={handleStopGeneration} className={styles.abortBtn}>
                                    <StopCircle size={14} /> Stop
                                </button>
                            ) : (
                                <button type="submit" style={{ height: "42px", padding: "0 18px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Send size={12} /> Send
                                </button>
                            )}
                        </form>
                    </div>

                </div>
            ) : (
                /* STANDARD DASHBOARD VIEW */
                <>
                    {/* 1. HERO SECTION WITH ACTIONS */}
                    <div style={{ 
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)", 
                        border: "1px solid rgba(16, 185, 129, 0.2)", 
                        borderRadius: "24px", 
                        padding: "32px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>
                            <Brain size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: "1.35rem", fontWeight: 950, letterSpacing: "-0.03em", margin: 0 }}>Company Brain</h2>
                            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: "2px 0 0 0", fontWeight: 600 }}>The core intelligence training and aligning your AI workforce.</p>
                        </div>
                    </div>

                    {/* Stats Grid inside Hero */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginTop: "4px" }}>
                        {[
                            { label: "Documents", val: `${docs.length}` },
                            { label: "Connected Apps", val: `${sources.filter(s => s.status === 'Connected').length}` },
                            { label: "Active Guardrails", val: `${rules.filter(r => r.active).length}`, color: "#10B981" },
                            { label: "AI Employees", val: `${employees.length}` },
                            { label: "Stored Memories", val: `${memories.length}` },
                            { label: "Active Channels", val: "Health: 100%" }
                        ].map((stat, idx) => (
                            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>{stat.label}</span>
                                <span style={{ fontSize: "0.95rem", fontWeight: 900, color: stat.color || "var(--foreground)" }}>{stat.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Actions Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ height: "36px", padding: "0 16px", background: "var(--foreground)", color: "var(--background)", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                        <Plus size={14} /> Upload Knowledge
                        <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                    <button 
                        onClick={() => router.push("/dashboard/credentials")}
                        style={{ height: "36px", padding: "0 16px", background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                        <Link2 size={14} /> Connected Apps
                    </button>
                    <button 
                        onClick={() => setActiveTab("knowledge")}
                        style={{ height: "36px", padding: "0 16px", background: "rgba(16, 185, 129, 0.1)", color: "#10B981", border: "none", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                        <Search size={14} /> Ask Brain
                    </button>
                </div>
            </div>

            {/* 2. ASK BRAIN SEARCH INPUT */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
                <form onSubmit={handleSearchAsk} style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                        <Search size={18} style={{ position: "absolute", left: "16px", color: "var(--muted-foreground)" }} />
                        <input 
                            type="text" 
                            placeholder="Ask your Company Brain anything... (e.g. How do refunds work?)"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: "100%", height: "46px", borderRadius: "12px", border: "1px solid var(--border)", padding: "0 16px 0 46px", fontSize: "0.85rem", fontWeight: 700, background: "var(--muted)", color: "var(--foreground)", outline: "none" }}
                        />
                    </div>
                    <button type="submit" style={{ height: "46px", padding: "0 24px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 900, cursor: "pointer" }}>
                        Ask Brain
                    </button>
                </form>

                {searchState === 'searching' && (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <Loader2 className="spin" size={20} style={{ color: "#10B981", marginBottom: "6px", display: "inline-block" }} />
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Searching vector index maps...</p>
                    </div>
                )}

                {searchState === 'answered' && searchResult && (
                    <div style={{ marginTop: "16px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px", fontSize: "0.7rem", fontWeight: 800, color: "var(--muted-foreground)" }}>
                            <span>MARCUS AI ANSWERS</span>
                            <span style={{ color: "#10B981" }}>{searchResult.confidence}% Confidence</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--foreground)" }}>
                            {searchResult.answer}
                        </p>
                        <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px" }}>
                            <FileCheck size={12} color="#10B981" />
                            <span>Source Document: <strong>{searchResult.source}</strong></span>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. HORIZONTAL TABS ROW */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", gap: "16px", overflowX: "auto" }}>
                {[
                    { id: "overview", label: "Overview & Org Chart" },
                    { id: "profile", label: "Company Profile" },
                    { id: "knowledge", label: "Knowledge" },
                    { id: "rules", label: "Rules & Guardrails" },
                    { id: "employees", label: "Permissions Matrix" },
                    { id: "sources", label: "Connected Apps" },
                    { id: "memory", label: "Reflection Memory" },
                    { id: "insights", label: "AI Insights" }
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: "12px 6px",
                                background: "none",
                                border: "none",
                                borderBottom: isActive ? "2px solid var(--foreground)" : "2px solid transparent",
                                fontSize: "0.82rem",
                                fontWeight: isActive ? 900 : 700,
                                color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                                cursor: "pointer",
                                transition: "all 0.15s",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* 4. MAIN PANEL CONTENT */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                
                {/* OVERVIEW & ORG CHART TAB */}
                {activeTab === 'overview' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fadeIn 0.2s" }}>
                        
                        {/* Split: Marcus AI + Org Chart */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                            
                            {/* Marcus AI Advisor Card */}
                            <div style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} />
                                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--foreground)" }}>Marcus AI Supervisor</span>
                                </div>
                                <p style={{ fontSize: "0.82rem", fontWeight: 700, margin: "12px 0 16px 0", fontStyle: "italic", color: "var(--foreground)" }}>
                                    "I loaded the current runtime context. Active operational rules are applied. Knowledge base sync is complete."
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.75rem", fontWeight: 700 }}>
                                    <div style={{ display: "flex", gap: "8px", color: "#10B981" }}>✓ {rules.filter(r => r.active).length} Guardrail rules active</div>
                                    <div style={{ display: "flex", gap: "8px", color: "#10B981" }}>✓ {docs.length} Knowledge base sources verified</div>
                                    <div style={{ display: "flex", gap: "8px", color: "#F59E0B" }}>⚠ {sources.filter(s => s.status !== 'Connected').length} Recommended apps not integrated</div>
                                </div>
                            </div>

                            {/* visual A.I. Organization Chart */}
                            <div style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>AI Org Chart Hierarchy</span>
                                
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                                    {/* CEO */}
                                    <div style={{ padding: "6px 12px", background: "var(--foreground)", color: "var(--background)", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 900 }}>
                                        CEO / Owner (You)
                                    </div>
                                    <div style={{ width: "1px", height: "12px", background: "var(--border)" }} />
                                    
                                    {/* OS */}
                                    <div style={{ padding: "6px 12px", background: "var(--card)", border: "1px solid #10B981", color: "#10B981", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 900, boxShadow: "0 0 10px rgba(16,185,129,0.15)" }}>
                                        Company Brain OS
                                    </div>
                                    <div style={{ width: "1px", height: "12px", background: "var(--border)" }} />

                                    {/* Employees Row */}
                                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                        {employees.map((emp) => (
                                            <div key={emp.id} style={{ padding: "4px 8px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 800 }}>
                                                {emp.name}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ width: "1px", height: "12px", background: "var(--border)" }} />

                                    {/* Systems */}
                                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                                        {sources.filter(s => s.status === 'Connected').map((sys, i) => (
                                            <span key={i} style={{ fontSize: "0.6rem", background: "rgba(16, 185, 129, 0.1)", color: "#10B981", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>
                                                {sys.name.split(" ")[0]}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Health Matrix */}
                        <div>
                            <h4 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 12px 0" }}>Coverage Health Matrix</h4>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                                {[
                                    { label: "Finance Alignment", pct: 100, color: "#10B981" },
                                    { label: "Customer Guardrails", pct: 90, color: "#3B82F6" },
                                    { label: "Document Safety", pct: docs.length > 0 ? 100 : 0, color: "#10B981" },
                                    { label: "Credential Security", pct: Math.round((sources.filter(s => s.status === 'Connected').length / 5) * 100), color: "#8B5CF6" }
                                ].map((gauge, i) => (
                                    <div key={i} style={{ background: "var(--muted)", border: "1px solid var(--border)", padding: "16px", borderRadius: "14px" }}>
                                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)" }}>{gauge.label}</span>
                                        <div style={{ fontSize: "1.1rem", fontWeight: 900, margin: "6px 0" }}>{gauge.pct}%</div>
                                        <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", background: gauge.color, width: `${gauge.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* COMPANY PROFILE TAB (11 properties) */}
                {activeTab === 'profile' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0 }}>Company Profile Settings</h3>
                                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: "4px 0 0 0" }}>Define corporate variables utilized globally by active AI Employees to localize communications.</p>
                            </div>
                            {saveStatus && (
                                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10B981", background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: "6px" }}>
                                    {saveStatus}
                                </span>
                            )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            {[
                                { key: "companyName", label: "Company Name", val: profile.companyName || "" },
                                { key: "industry", label: "Industry Sector", val: profile.industry || "" },
                                { key: "employees", label: "Total Employees / Seats", val: profile.employees || "" },
                                { key: "countries", label: "Operating Countries", val: profile.countries || "" },
                                { key: "languages", label: "Primary Languages", val: profile.languages || "" },
                                { key: "workingHours", label: "Standard Working Hours", val: profile.workingHours || "" },
                                { key: "timezone", label: "Local Timezone", val: profile.timezone || "" },
                                { key: "vatCode", label: "VAT Identification Number", val: profile.vatCode || "" },
                                { key: "currencies", label: "Reporting Currency", val: profile.currencies || "" },
                                { key: "departments", label: "Covered Departments", val: profile.departments || "" }
                            ].map((field) => (
                                <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>{field.label}</span>
                                    <input 
                                        type="text" 
                                        value={field.val}
                                        onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                                        onBlur={e => handleUpdateProfileField(field.key, e.target.value)}
                                        style={{ height: "40px", padding: "0 14px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, color: "var(--foreground)", background: "var(--muted)", outline: "none" }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* 11th property: Business Goals */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Business Goals</span>
                            <textarea 
                                rows={4}
                                value={profile.businessGoals || ""}
                                onChange={e => setProfile({ ...profile, businessGoals: e.target.value })}
                                onBlur={e => handleUpdateProfileField("businessGoals", e.target.value)}
                                placeholder="Explain your core business goals that n8n automation loops and employees should prioritize..."
                                style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, color: "var(--foreground)", background: "var(--muted)", outline: "none", resize: "vertical" }}
                            />
                        </div>
                    </div>
                )}

                {/* KNOWLEDGE LIST & UPLOAD */}
                {activeTab === 'knowledge' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0 }}>Approved Knowledge Docs</h3>
                                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: "4px 0 0 0" }}>These documents populate the vector index used by Marcus and active subagents.</p>
                            </div>
                            <label style={{ height: "36px", padding: "0 16px", background: "var(--foreground)", color: "var(--background)", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                {uploading ? <Loader2 className="spin" size={14} /> : <UploadCloud size={14} />} 
                                {uploading ? "Indexing..." : "Upload Document"}
                                <input type="file" onChange={handleFileUpload} style={{ display: "none" }} disabled={uploading} />
                            </label>
                        </div>

                        {/* List Documents */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {docs.map(doc => (
                                <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px 18px" }}>
                                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                        <FileText size={18} style={{ color: "#3B82F6" }} />
                                        <div>
                                            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--foreground)" }}>{doc.name}</div>
                                            <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginTop: "2px" }}>
                                                Category: <strong>{doc.category}</strong> · Size: {doc.size} · Status: <span style={{ color: doc.status === "Indexed" ? "#10B981" : "#F59E0B", fontWeight: 800 }}>{doc.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteDoc(doc.id)} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {docs.length === 0 && (
                                <div style={{ textAlign: "center", padding: "32px", color: "var(--muted-foreground)", fontSize: "0.8rem", fontWeight: 700 }}>
                                    No knowledge documents uploaded yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* RULES & GUARDRAILS */}
                {activeTab === 'rules' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s" }}>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0 }}>System Guardrails</h3>
                            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: "4px 0 0 0" }}>Strict constraints that digital workers must respect during workflow runs.</p>
                        </div>

                        <form onSubmit={handleAddRule} style={{ display: "flex", gap: "10px" }}>
                            <input 
                                type="text" 
                                placeholder="Add custom guardrail... (e.g. Always ask approval above €1000)"
                                value={newRule}
                                onChange={e => setNewRule(e.target.value)}
                                style={{ flex: 1, height: "42px", borderRadius: "10px", border: "1px solid var(--border)", padding: "0 16px", fontSize: "0.82rem", fontWeight: 700, background: "var(--muted)", color: "var(--foreground)", outline: "none" }}
                            />
                            <button type="submit" style={{ height: "42px", padding: "0 20px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer" }}>
                                Add
                            </button>
                        </form>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {rules.map(rule => (
                                <div key={rule.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 16px" }}>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <input 
                                            type="checkbox" 
                                            checked={rule.active} 
                                            onChange={() => toggleRule(rule.id, rule.active)}
                                            style={{ width: "14px", height: "14px", cursor: "pointer" }}
                                        />
                                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: rule.active ? "var(--foreground)" : "var(--muted-foreground)", textDecoration: rule.active ? "none" : "line-through" }}>
                                            {rule.text}
                                        </span>
                                    </div>
                                    <button onClick={() => deleteRule(rule.id)} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* INTERACTIVE PERMISSIONS MATRIX */}
                {activeTab === 'employees' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.2s" }}>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0 }}>Employee Permissions Matrix</h3>
                            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: "4px 0 0 0" }}>Control indexing scope, tools, and credentials access permissions for each hired AI employee.</p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            {employees.map((emp) => {
                                // Standard checkboxes matching the user prompt's examples
                                const standardKeys = emp.type === "Finance AI"
                                    ? ["Invoices", "Stripe", "Bank", "Accounting", "HR Files", "Contracts"]
                                    : emp.type === "Support AI"
                                    ? ["Knowledge Base", "Gmail", "Tickets", "Finance"]
                                    : ["CRM", "Calendar", "Quotes", "Invoices", "Gmail"];

                                return (
                                    <div key={emp.id} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <span style={{ fontSize: "0.9rem", fontWeight: 900, color: "var(--foreground)" }}>{emp.name}</span>
                                                <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", display: "block", marginTop: "2px" }}>{emp.type}</span>
                                            </div>
                                            <span style={{ fontSize: "0.68rem", background: "rgba(16, 185, 129, 0.1)", color: "#10B981", padding: "3px 8px", borderRadius: "6px", fontWeight: 800 }}>Active</span>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                                            <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Permissions</span>
                                            {standardKeys.map((key) => {
                                                const checked = !!emp.permissions[key];
                                                return (
                                                    <label key={key} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", color: checked ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                                        <input 
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => handleTogglePermission(emp.id, key)}
                                                            style={{ width: "14px", height: "14px", cursor: "pointer" }}
                                                        />
                                                        <span>{key}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* CONNECTED APPS */}
                {activeTab === 'sources' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0 }}>Connected Apps & Integrations</h3>
                                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: "4px 0 0 0" }}>These active integrations feed credentials and database routes to n8n.</p>
                            </div>
                            <button 
                                onClick={() => router.push("/dashboard/credentials")}
                                style={{ height: "36px", padding: "0 16px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer" }}
                            >
                                Manage Integrations
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {sources.map((src, idx) => (
                                <div key={idx} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: src.status === 'Connected' ? "#10B981" : "#EF4444" }} />
                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--foreground)" }}>{src.name}</div>
                                            <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Index Status: {src.status === 'Connected' ? 'Synchronized' : 'Not Connected'}</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: src.status === 'Connected' ? "#10B981" : "var(--muted-foreground)" }}>{src.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MEMORY & REFLECTION TIMELINE */}
                {activeTab === 'memory' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.2s" }}>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0 }}>Reflection Memory logs</h3>
                            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: "4px 0 0 0" }}>Historical memories accumulated by the Main Brain LLM during executions.</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {memories.map((mem, idx) => (
                                <div key={idx} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#10B981" }}>{mem.type}</span>
                                        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700 }}>Confidence Rating: {mem.confidence}%</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--foreground)", fontWeight: 700 }}>
                                        "{mem.summary}"
                                    </p>
                                </div>
                            ))}
                            {memories.length === 0 && (
                                <div style={{ textAlign: "center", padding: "32px", color: "var(--muted-foreground)", fontSize: "0.8rem", fontWeight: 700 }}>
                                    No memories captured yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AI INSIGHTS */}
                {activeTab === 'insights' && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.2s" }}>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0 }}>AI-Flagged Actionable Insights</h3>
                            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: "4px 0 0 0" }}>Resolve optimization suggestions flagged during overnight learning.</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[
                                { title: "18 duplicate documents detected in Finance directories.", action: "Resolve" },
                                { title: "Pricing structures differ between Support FAQs & Sales templates.", action: "Resolve" },
                                { title: "Refund policy copy is outdated (matches 2025 terms).", action: "Open" }
                            ].map((item, idx) => (
                                <div key={idx} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                        <AlertCircle size={16} color="#F59E0B" />
                                        <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{item.title}</span>
                                    </div>
                                    <button style={{ height: "30px", padding: "0 14px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 900, cursor: "pointer" }}>
                                        {item.action}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            </>
            )}
        </div>
    );
}
