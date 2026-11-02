"use client";

import React, { useState } from "react";
import styles from "./tasks.module.css";
import { Check, Info, AlertTriangle, Play, CheckCircle2, Server, Key, Eye } from "lucide-react";

interface TaskItem {
    id: string;
    title: string;
    priority: "High" | "Medium" | "Low";
    time: string;
    source: string;
    completed: boolean;
    type: "credential" | "approval" | "check" | "general";
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskItem[]>([
        {
            id: "1",
            title: "Approve outgoing transaction notification draft to client #8210",
            priority: "High",
            time: "2 min ago",
            source: "Marcus AI",
            completed: false,
            type: "approval"
        },
        {
            id: "2",
            title: "Reconnect expired Google Workspace OAuth permission grant",
            priority: "High",
            time: "10 min ago",
            source: "System Core",
            completed: false,
            type: "credential"
        },
        {
            id: "3",
            title: "Review flagged discrepancy in supplier invoice Acme Corp €3,120",
            priority: "Medium",
            time: "1 hour ago",
            source: "Marcus AI",
            completed: false,
            type: "approval"
        },
        {
            id: "4",
            title: "Authorize HubSpot lead automation pipeline trigger activation",
            priority: "Medium",
            time: "3 hours ago",
            source: "Sophia AI",
            completed: false,
            type: "check"
        },
        {
            id: "5",
            title: "Verify SSL certification node bindings for private server cluster",
            priority: "Low",
            time: "Today",
            source: "Infrastructure Monitor",
            completed: false,
            type: "check"
        }
    ]);

    const toggleComplete = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const activeTasksCount = tasks.filter(t => !t.completed).length;

    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <div className={styles.headerLeft}>
                    <h1>Operations Tasks</h1>
                    <p>Approve AI decisions, reconnect credentials, and resolve infrastructure alerts.</p>
                </div>
                <div className={styles.taskCountBadge}>
                    {activeTasksCount} Pending
                </div>
            </div>

            <div className={styles.taskList}>
                {tasks.length === 0 ? (
                    <div className={styles.emptyState}>
                        <CheckCircle2 size={44} style={{ color: "#10B981" }} />
                        <h3 className={styles.emptyStateTitle}>All systems clear</h3>
                        <p className={styles.emptyStateDesc}>
                            No tasks require attention. Your autonomous business servers are running normally.
                        </p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div 
                            key={task.id} 
                            className={styles.taskRow}
                            onClick={() => toggleComplete(task.id)}
                        >
                            <div className={styles.taskLeft}>
                                <div className={`${styles.checkbox} ${task.completed ? styles.checkboxChecked : ''}`}>
                                    {task.completed && <Check size={14} />}
                                </div>
                                <div className={styles.taskMeta}>
                                    <span className={`${styles.title} ${task.completed ? styles.titleCompleted : ''}`}>
                                        {task.title}
                                    </span>
                                    <div className={styles.subRow}>
                                        <span className={styles.sourceBadge}>
                                            {task.type === "approval" && <Eye size={12} style={{ color: "#3B82F6" }} />}
                                            {task.type === "credential" && <Key size={12} style={{ color: "#EF4444" }} />}
                                            {task.type === "check" && <Server size={12} style={{ color: "#F59E0B" }} />}
                                            {task.source}
                                        </span>
                                        <span className={styles.time}>{task.time}</span>
                                    </div>
                                </div>
                            </div>

                            <span className={`${styles.priorityBadge} ${
                                task.priority === "High" ? styles.priorityHigh :
                                task.priority === "Medium" ? styles.priorityMedium :
                                styles.priorityLow
                            }`}>
                                {task.priority}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
