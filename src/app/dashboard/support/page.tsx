"use client";

import styles from "./help.module.css";
import React, { useState } from "react";
import { BookOpen, MessageSquare, Send } from "lucide-react";

export default function HelpPage() {
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, message }),
            });

            if (res.ok) {
                setSubject("");
                setMessage("");
                setShowTicketForm(false);
                alert("Ticket submitted successfully!");
            } else {
                alert("Failed to submit ticket");
            }
        } catch (err) {
            alert("Error submitting ticket");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>Support Center</h1>
                <p className={styles.headerSubtitle}>Get help with workflows, integrations, and account management.</p>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>
                        <BookOpen size={24} />
                        Documentation
                    </h3>
                    <p>Explore our comprehensive guides on agent deployment, loop optimization, and financial oversight structures.</p>
                </div>

                <div className={styles.card}>
                    <h3>
                        <MessageSquare size={24} />
                        Direct Support
                    </h3>
                    <p>Connect with our expert loop engineers for customized configurations and high-performance agent tuning.</p>
                </div>
            </div>

            <div className={styles.faqSection}>
                <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>

                <div className={styles.faqItem}>
                    <h4>How do I scale my agent workforce?</h4>
                    <p>Navigate to the Settings panel and adjust your Operational Capacity. New agents can be deployed through the "Digital Office" command interface.</p>
                </div>

                <div className={styles.faqItem}>
                    <h4>What are "Operational Loops"?</h4>
                    <p>Loops are the core autonomous units of work that agents execute. These can include document discovery, financial reconciliation, or market analysis.</p>
                </div>

                <div className={styles.faqItem}>
                    <h4>Can I export financial reports?</h4>
                    <p>Yes, visit the Reports section to generate PDF, CSV, or raw JSON exports of all autonomous financial data.</p>
                </div>
            </div>

            {showTicketForm ? (
                <div className={styles.ticketForm}>
                    <h2 className={styles.ticketFormTitle}>Submit a Support Ticket</h2>
                    <form onSubmit={handleTicketSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Subject</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                placeholder="Brief description of your issue"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Message</label>
                            <textarea
                                className={styles.formTextarea}
                                placeholder="Describe your issue in detail..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Ticket"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowTicketForm(false)}
                                style={{
                                    height: '52px',
                                    padding: '0 20px',
                                    background: 'transparent',
                                    color: '#64748B',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '12px',
                                    fontSize: '0.95rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setShowTicketForm(true)}
                    className={styles.submitButton}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                    <Send size={20} />
                    Create Support Ticket
                </button>
            )}
        </div>
    );
}
