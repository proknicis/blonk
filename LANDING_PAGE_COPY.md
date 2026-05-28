# BLONK | Landing Page Copy & Section Architecture

This document outlines the complete marketing copy, section structure, and visual/motion guidelines for the **BLONK** landing page. The tone is designed to be minimal, authoritative, structured, and enterprise-ready, drawing inspiration from high-end technical landing pages like Stripe, Linear, and Vercel.

---

## 🎨 Global Design & Motion System

*   **Color Palette**: Primary background is clean `#FFFFFF` with `#FAFADA` as an institutional light gray. Primary dark mode pages use `#09090B`. Body text is `#111111` (primary) and `#666666` (muted). Accent is `#34D186` (Sovereign Green).
*   **Typography**: Clean sans-serif (e.g., *Inter*, *Outfit*, or *Roboto*) with high letter-spacing on uppercase eyebrows and bold, tight line-heights on titles.
*   **Transitions**: Fluid `cubic-bezier(0.16, 1, 0.3, 1)` transitions for all hover states and scroll triggers.
*   **Micro-animations**: Dot glow loops, line tracing paths, and smooth tab cross-fades that reveal logical structure rather than decorative distraction.

---

## 🏛️ Section-by-Section Blueprint

### 1. The Hero Section (Primary Landing Visual)
*   **Eyebrow**: DECOUPLED OPERATIONS
*   **Headline**: Sovereign execution for critical workflows.
*   **Subheadline**: Run production-ready automation pipelines on your own private infrastructure. Own the logical code. Protect your proprietary data. Eliminate vendor seat-tax.
*   **Primary CTA**: Start saving time (Dark button, white text, hover green background)
*   **Secondary CTA**: Read Architecture (Subtle outline, arrow icon)
*   **Visual/Motion Concept**:
    *   A centered, text-dominant layout transitioning into a dark fading background where a video loops.
    *   **Animation**: When the page loads, the typography fades in with a slight vertical slide. A skeletal, clean node-graph diagram (representing input-process-output) fades in beneath the fold, drawing its connecting paths sequentially.

---

### 2. How It Works (The Operational Flow)
*   **Eyebrow**: OPERATIONAL FLOW
*   **Headline**: From incoming data to structured output.
*   **Subheadline**: BLONK standardizes spreadsheet-driven operations by routing fragmented inputs through a clean, repeatable execution layer.
*   **Process Steps**:
    1.  **01 / CAPTURE — Ingest raw inputs**
        *   *Copy*: Automatically monitor inbox submissions, API payloads, or spreadsheet uploads as they arrive. No manual downloads or CSV shuffling required.
    2.  **02 / STRUCTURE — Parse and validate**
        *   *Copy*: Standardize messy formats, resolve structural anomalies, and validate rows against custom corporate business rules in real-time.
    3.  **03 / DISPATCH — Write to target ledger**
        *   *Copy*: Route cleaned and formatted records directly into your core systems, CRMs, databases, or ERPs through secure, direct API integrations.
    4.  **04 / GRC AUDIT — Monitor & log exceptions**
        *   *Copy*: Track performance stats, download immutable audit trails, and manage edge-case exceptions through a single visual interface.
*   **Trust/Proof Strip (Underneath Grid)**:
    *   **Built for Scale**: Processes millions of rows without memory degradation or server lag.
    *   **Auditable Ledger**: Every database transaction is permanently logged with an immutable execution history.
    *   **Sovereign Execution**: Zero middleman routing. Your proprietary data never leaves your environment.
    *   **Enterprise Integrations**: Connects across Postgres, Stripe, HubSpot, Slack, and your existing custom toolset.
*   **Visual/Motion Concept**:
    *   Four sequential cards side-by-side. 
    *   **Animation**: As the user scrolls, a thin, subtle horizontal guide line draws itself across the cards from left to right. Once the line hits a card, the corresponding `flowNodeDot` glows with a soft green shadow, and the step copy transitions from 50% opacity to 100%.

---

### 3. Why It Matters (The Sovereignty Advantage)
*   **Eyebrow**: ARCHITECTURAL DESIGN
*   **Headline**: Decoupled for control. Secure by default.
*   **Subheadline**: Standard SaaS tools force you to route proprietary operations through their servers. BLONK splits the canvas: design visually in Next.js, execute securely on your own node.
*   **Pillars**:
    *   **100% Data Sovereignty**
        *   *Copy*: All workflows execute within your firewalls. Zero external caching, zero middleman data storage, and compliance with HIPAA, SOC-2, and GDPR from day one.
    *   **Zero API Markups**
        *   *Copy*: Communicate directly with OpenAI, Anthropic, or database endpoints. Pay the raw resource costs without middleman premiums or execution markups.
    *   **Logical Ownership**
        *   *Copy*: Every blueprint is licensed as open-standard JSON. Export, copy, fork, or run your logic on generic local containers without vendor dependency.
*   **Visual/Motion Concept**:
    *   Split-screen section. Left side is sticky copy. Right side is a comparative wireframe diagram showing:
        *   *SaaS Route*: Client Data → SaaS Server (Log Copy) → OpenAI → SaaS Server → Client DB (Vulnerable).
        *   *BLONK Route*: Client Data → Private VPS Node (Isolated) → OpenAI (Direct Key) → Client DB (Protected).
    *   **Animation**: Dashed particles represent data packets flowing down the paths. The SaaS Route shows a bottleneck at the SaaS Server, while the BLONK route shows a straight, uninterrupted local cycle.

---

### 4. Enterprise Use Cases (Sector Blueprints)
*   **Eyebrow**: APPLICATION AREAS
*   **Headline**: Standardized workflows for complex operations.
*   **Subheadline**: We design and license pre-configured blueprints tailored to audit-heavy, data-intensive professional services.
*   **Use Cases**:
    *   **Intake Triage & AI Draft**
        *   *Copy*: Scans incoming client emails, classifies operational intent, extracts key document metadata via LLMs, updates CRM systems, and queues responses.
    *   **Invoice Auto-Chaser**
        *   *Copy*: Automates daily accounts receivable monitoring. Reconciles open ledger balances, checks Stripe receipts, and schedules reminders.
    *   **Client Onboarding Flow**
        *   *Copy*: Instantly triggers upon contract signature. Provisions Google Workspace folders, creates Slack channels, and issues setup tickets.
    *   **AI Invoice OCR Extractor**
        *   *Copy*: Extracts line items and metadata from raw scanned PDFs using vision models, syncing results directly to internal ledger schemas.
*   **Visual/Motion Concept**:
    *   A tabbed workspace mock. Clicking a tab swaps the active blueprint.
    *   **Animation**: When a use case tab is selected, a mock spreadsheet schema shifts and maps itself visually into a mock target API payload.

---

### 5. Telemetry & Verification (Live Console)
*   **Eyebrow**: REAL-TIME PERFORMANCE
*   **Headline**: Audit what works. Verify what doesn't.
*   **Subheadline**: Monitor database updates, processing latency, and execution loops in real-time. Full transparency over your operational pipeline.
*   **Metrics**:
    *   `99.98%` — Core Infrastructure Uptime
    *   `< 320ms` — Average Parsing Latency
    *   `0%` — External Middleman Routing
*   **Visual/Motion Concept**:
    *   A premium, simulated developer terminal/console mockup displaying active system logs.
    *   **Animation**: The console lists real-time mock events (e.g., `[info] Webhook received`, `[info] Document schema verified`, `[success] Sync complete`) scrolling continuously in a smooth loop. Toggling tabs filters logs between "Performance", "Security", and "Payloads".

---

### 6. Deployment Model (Hosting Agnostic)
*   **Eyebrow**: INFRASTRUCTURE
*   **Headline**: Your code. Your infrastructure.
*   **Subheadline**: Spin up dedicated nodes on local servers, cloud providers, or let us provision isolated environments for you in three minutes.
*   **Hosting Modes**:
    *   **Local Cluster**
        *   *Copy*: Deploy inside your physical corporate network. Complete isolation from the public internet for air-gapped security.
    *   **Private Cloud**
        *   *Copy*: Run on your dedicated virtual servers (AWS, Google Cloud, Azure, or Contabo) via secure Docker compose scripts.
    *   **BLONK Managed Nodes**
        *   *Copy*: Fully managed, single-tenant hosting on isolated servers, maintained by our GRC engineering team.
*   **Visual/Motion Concept**:
    *   A three-way interactive toggle panel (Local, Private, Managed).
    *   **Animation**: Selecting a mode moves a highlighted ring and dynamically restructures a 3D-layered architecture stack (Hardware Layer, OS Layer, Docker/n8n Layer, Application Layer) with smooth opacity fades.

---

### 7. Workflow Catalog (Direct License)
*   **Eyebrow**: AUTOMATION LIBRARY
*   **Headline**: Purchase the logic. Skip the build time.
*   **Subheadline**: Access our library of audited, ready-to-run workflows. Licensed as lifetime files, importable directly into your instance.
*   **Key Features**:
    *   Pre-integrated app tags showing compatible services (Stripe, HubSpot, Slack, Postgres).
    *   Lifetime updates, compatibility patches, and schema revisions.
    *   Complete step-by-step interactive setup guides.
*   **Visual/Motion Concept**:
    *   A visual directory grid of card blueprints.
    *   **Animation**: Hovering over a catalog card causes it to lift slightly, and its app integrations (e.g., Stripe, Gmail icons) slide out slightly with a subtle scale effect.

---

### 8. Pricing Model (Capital Expenditure over OpEx)
*   **Eyebrow**: CAPITAL INVESTMENT
*   **Headline**: One-time licensing. No recurring subscriptions.
*   **Subheadline**: Treat automations as core business assets. Buy the code once, run it forever. Zero usage-tier lock-in.
*   **Pricing Tiers**:
    *   **Single Blueprint License**
        *   *Price*: `$149 / one-time`
        *   *Included*: Single n8n JSON schema file, lifetime blueprint updates, technical setup guides, and email documentation support.
    *   **Full Sovereign Bundle (Recommended)**
        *   *Price*: `$1,499 / one-time`
        *   *Included*: Full catalog unlock, automatic future blueprint releases, 3 hours of direct engineering deployment support, and complete GRC compliance guides.
*   **Visual/Motion Concept**:
    *   Dual cards layout with the "Sovereign Bundle" card emphasized.
    *   **Animation**: The "Sovereign Bundle" has a subtle, breathing outer green border gradient that animates slowly over time, naturally focusing client attention on the enterprise tier.

---

### 9. Final Call to Action
*   **Eyebrow**: GET STARTED
*   **Headline**: Build a sovereign automation layer.
*   **Subheadline**: Break free from recurring seat-taxes. Secure your workflow licenses and deploy to your own servers today.
*   **Primary CTA**: Deploy automations now (Accent-themed button)
*   **Secondary CTA**: Speak to an engineer (Muted hover button)
*   **Visual/Motion Concept**:
    *   Deep charcoal `#09090B` container with a minimalist background grid.
    *   **Animation**: A very light, subtle matrix grid of green dot coordinates that shifts parallax-style relative to the user's cursor movements.
