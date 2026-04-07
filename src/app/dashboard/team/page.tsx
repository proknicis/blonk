"use client";

import React, { useState, useEffect } from "react";
import styles from "../settings/settings.module.css";

export default function TeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTeamData();
    }, []);

    const fetchTeamData = async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            if (data.members) setMembers(data.members);
        } catch (error) {
            console.error("Team fetch failure", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className={styles.container}><p>Synchronizing fleet data...</p></div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Team Directory</h1>
                <p>View all operators connected to your firm's sovereign instance.</p>
            </div>

            <div className={styles.section}>
                <h2>Active Roster</h2>
                {members.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <p style={{ fontWeight: 800, fontSize: '1rem' }}>No team members connected.</p>
                    </div>
                ) : (
                    <table className={styles.billTable}>
                        <thead>
                            <tr>
                                <th>Operator</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member: any) => (
                                <tr key={member.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                                                background: member.role === 'OWNER' ? '#0A0A0A' : member.role === 'ADMIN' ? '#EEF2FF' : '#F0FAF5',
                                                color: member.role === 'OWNER' ? '#FFFFFF' : member.role === 'ADMIN' ? '#6366F1' : '#34D186',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 950, fontSize: '0.9rem'
                                            }}>
                                                {(member.name || 'O').charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 950, color: '#0A0A0A' }}>{member.name || 'Anonymous Operator'}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#64748B' }}>{member.email}</td>
                                    <td>
                                        <span style={{
                                            padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 950,
                                            textTransform: 'uppercase', letterSpacing: '0.08em',
                                            background: member.role === 'OWNER' ? '#0A0A0A' : member.role === 'ADMIN' ? '#EEF2FF' : '#F0FAF5',
                                            color: member.role === 'OWNER' ? '#FFFFFF' : member.role === 'ADMIN' ? '#6366F1' : '#34D186',
                                        }}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
