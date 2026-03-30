"use client";

import styles from "../../dashboard/dashboard.module.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // In a real app we'd use cookies/JWT. For this demo, we'll use localStorage
                localStorage.setItem("admin_token", "secure_session_" + Date.now());
                router.push("/admin");
            } else {
                setError(data.error || "Authentication failed");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F8F9FA"
        }}>
            <div className={styles.card} style={{ width: "400px", padding: "48px" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1 className={styles.logo}>BLONK<span>.</span></h1>
                    <p style={{ fontWeight: 700, color: "#949A97", marginTop: "8px" }}>CONTROL CENTER LOGIN</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Admin Email</label>
                        <input
                            type="email"
                            className={styles.searchInput}
                            style={{ paddingLeft: "20px" }}
                            placeholder="admin@blonk.ai"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Password</label>
                        <input
                            type="password"
                            className={styles.searchInput}
                            style={{ paddingLeft: "20px" }}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: "#FF5252", fontSize: "0.85rem", fontWeight: 700 }}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.btnDark}
                        style={{ width: "100%", padding: "16px", marginTop: "12px" }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Authenticating..." : "Access Control Center"}
                    </button>
                </form>
            </div>
        </div>
    );
}
