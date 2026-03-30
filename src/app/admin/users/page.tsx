"use client";

import styles from "../../dashboard/page.module.css";
import React, { useState, useEffect } from "react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateRole = async (id: string, newRole: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, role: newRole })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Platform User Management</h2>
                    <p style={{ color: '#949A97', fontSize: '0.9rem', fontWeight: 600 }}>Manage access levels and firm identities.</p>
                </div>

                {isLoading ? (
                    <div className={styles.loading}>Accessing user directory...</div>
                ) : (
                    <table className={styles.historyTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Firm</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td><strong>{u.name}</strong></td>
                                    <td>{u.email}</td>
                                    <td>{u.firmName}</td>
                                    <td>
                                        <select
                                            className={styles.select}
                                            value={u.role}
                                            disabled={u.role === 'SuperAdmin' || updatingId === u.id}
                                            onChange={(e) => updateRole(u.id, e.target.value)}
                                            style={{ padding: '4px 8px', height: '32px' }}
                                        >
                                            <option value="User">User</option>
                                            <option value="Admin">Admin</option>
                                            <option value="SuperAdmin" disabled>SuperAdmin</option>
                                        </select>
                                    </td>
                                    <td>
                                        {u.role !== 'SuperAdmin' && (
                                            <button
                                                className={styles.btnOutline}
                                                style={{ color: '#FF5252', borderColor: '#FFEDED', padding: '6px 12px', fontSize: '0.8rem' }}
                                                onClick={() => deleteUser(u.id)}
                                            >
                                                Ban User
                                            </button>
                                        )}
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
