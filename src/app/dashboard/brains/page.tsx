"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain as BrainIcon, Plus, RefreshCw, Shield, Sparkles } from "lucide-react";
import styles from "./[brainId]/brains.module.css";

export default function BrainsRootPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function checkBrains() {
      try {
        const res = await fetch("/api/brains");
        if (res.ok) {
          const data = await res.json();
          if (data.brains && data.brains.length > 0) {
            router.replace(`/dashboard/brains/${data.brains[0].id}`);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load brains", e);
      } finally {
        setIsLoading(false);
      }
    }
    checkBrains();
  }, [router]);

  async function handleProvisionFinanceBrain() {
    try {
      setIsCreating(true);
      const res = await fetch("/api/brains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Finance & Accounting Brain",
          department: "FINANCE",
          description: "Sovereign intelligence for invoice reconciliation, spend governance, and ledger auditing.",
          systemPrompt: "You are the Finance & Accounting Sovereign Brain. Your mandate is to enforce spend limits, audit ledgers, verify invoices against purchase orders, and validate financial compliance without human intervention unless approvals are triggered.",
          aiModel: "gpt-4o",
          temperature: 0.1,
          memoryContext: {
            defaultCurrency: "EUR",
            maxAutoApproveInvoiceAmount: 1000,
            reconciliationPeriod: "DAILY",
            strictVatValidation: true,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to provision brain");
      }

      const created = await res.json();
      router.push(`/dashboard/brains/${created.id}`);
    } catch (e: any) {
      alert(e.message);
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#64748B" }}>
          <RefreshCw size={20} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
          Verifying sovereign Brain instances...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: 560, margin: "80px auto", textAlign: "center", padding: "40px 32px" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Shield size={28} color="#020617" />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px", color: "#020617" }}>
          Initialize Sovereign Company Brain
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          Every enterprise workspace operates sovereign Brains. Start by provisioning the foundational 
          <strong> Finance &amp; Accounting Brain</strong> to govern invoice workflows, spend compliance, and ledger checks.
        </p>

        <button
          className={styles.btnAccent}
          style={{ width: "100%", justifyContent: "center", padding: "12px 20px", fontSize: 14 }}
          onClick={handleProvisionFinanceBrain}
          disabled={isCreating}
        >
          <Plus size={16} />
          {isCreating ? "Provisioning Sovereign Intelligence..." : "Provision Finance & Accounting Brain"}
        </button>

        <div style={{ marginTop: 20, fontSize: 12, color: "#64748B" }}>
          Powered by Phase 1 PostgreSQL schema • Multi-brain architecture
        </div>
      </div>
    </div>
  );
}
