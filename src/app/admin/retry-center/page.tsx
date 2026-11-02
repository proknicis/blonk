"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

export default function RetryCenterPlaceholder() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", background: "var(--card)", border: "1px dashed var(--border)", borderRadius: "24px", color: "var(--muted-foreground)", padding: "40px", textAlign: "center", gap: "16px" }}>
            <div style={{ width: "64px", height: "64px", background: "var(--muted)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                <RefreshCw size={28} />
            </div>
            <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>EXECUTION RETRY CENTER</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: "6px 0 0", fontWeight: 750, maxWidth: "340px", lineHeight: "1.4" }}>
                    Console segment reserved for scheduling bulk execution retries or resuming interrupted state engines. Workspace operations detail allows individual triggers.
                </p>
            </div>
        </div>
    );
}
