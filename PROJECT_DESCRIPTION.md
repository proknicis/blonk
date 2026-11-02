# BLONK | Project Documentation & System Architecture

Welcome to the master architectural guide for **BLONK**, a sovereign, decoupled workflow execution platform built specifically for professional services firms. This document details the system design, codebase maps, core services, database schemas, and integration engines that power the platform.

---

## 📖 Table of Contents
1. [Core Philosophy & Architecture](#-core-philosophy--architecture)
2. [Key Features & Modules](#-key-features--modules)
3. [Technology Stack](#-technology-stack)
4. [Directory Map](#-directory-map)
5. [Database Schema Definition](#-database-schema-definition)
6. [Sovereign Infrastructure & n8n Sync](#-sovereign-infrastructure--n8n-sync)
7. [Credentials & Provider Registry](#-credentials--provider-registry)
8. [Human-in-the-Loop Approvals Engine](#-human-in-the-loop-approvals-engine)
9. [Framer Motion Design System](#-framer-motion-design-system)
10. [Local Development & Operations Runbook](#-local-development--operations-runbook)

---

## 🎯 Core Philosophy & Architecture

BLONK is modeled as an **A.I. Operating System (Business OS)** for modern enterprises. The core architectural principle is:

> **Company Brain is the company's operating system and source of truth. AI Employees are hired from the Marketplace, receive their permissions, knowledge, and credentials from Company Brain, and execute their work through n8n. The user never interacts with workflows—only with AI Employees that perform business tasks on their behalf.**

The codebase is designed around three pillars:

*   **Sovereign Intelligence (Company Brain)**: The central source of truth storing organizational credentials, custom rules, memory patterns, and department vectors. It dictates exactly what each digital worker knows and what operations they are authorized to perform.
*   **Invisible Execution (n8n Engine)**: n8n functions strictly as a background execution engine. All workflow setups, webhook triggers, node graphs, and raw API responses are kept completely invisible to the client, who only interacts with active "AI Employees".
*   **Decoupled Permissions**: AI Employees query the Company Brain dynamically to fetch credentials (like Gmail or Stripe tokens) or retrieve policies (like refund structures). The Brain controls access, rejecting permission if an employee queries unauthorized files.

---

## ⚙️ Key Features & Modules

The application contains three isolated workspace layers:

### 1. Marketing & Showcase Platform (`/src/app/(marketing)`)
*   **Sovereign Showcases**: Landing layouts illustrating automated solutions for Finance, Legal, Health, and Operations.
*   **Live Simulation Canvas**: Graphical dashboard visualizers simulating workflow triggers, node activity, and system logs.
*   **Stripe License Checkout**: Secure invoice generation and lifetime license payments processed via the Stripe API.

### 2. Workspace Client Dashboard (`/src/app/dashboard`)
*   **Overview Panel**: Real-time stats showing active nodes, average latency, and recent actions.
*   **Drafts & Launcher**: View configurations awaiting connections or confirmation, with launch controls to trigger runs.
*   **Connected Apps**: Centralized console for linking and authenticating third-party services.
*   **Team & Access**: Administration tab for managing operators, assigning roles, and viewing recent audit logs.

### 3. Sovereign Administrator Center (`/src/app/admin`)
*   **Fleet Control (Cluster Nodes)**: Admin overview of active, provisioning, and unassigned servers in the infrastructure.
*   **Order Pipeline**: Direct view of customers purchasing licenses, allowing admin provisioning confirmation.
*   **Audit timeline**: Immutable log trace records tracking administrator decisions, security events, and diagnostic reports.

---

## 🛠️ Technology Stack

| Layer | Technology | Role & Integration |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router) | Client rendering, React Server Components (RSC), and serverless API endpoints. |
| **Logic & Types** | React 19 & TypeScript | Strong types for connection parameters, roles, and schema models. |
| **Database Connector** | PostgreSQL (`pg`) | Relational database, transactional queries, and connection pooling. |
| **Authentication** | NextAuth.js | Credentials-based secure login (bcrypt hashing) and session token validation. |
| **Styling** | Vanilla CSS Modules | Modular sheets scoping responsive layouts, tables, and dashboards. |
| **Animation Engine** | Framer Motion (`motion`) | Tactile micro-animations, active sidebar slides, counts, and modals. |
| **Billing Integration** | Stripe API | Checkout sessions, subscription webhook processing, and license ledgers. |
| **SMTP Delivery** | React Email & Nodemailer | HTML formatted email dispatching for user invitations and invoices. |

---

## 📁 Directory Map

```text
blonk/
├── .env                       # Local secret configurations (Database, Stripe, Auth tokens)
├── Dockerfile                 # Multi-stage production container configuration
├── docker-compose.yml         # Container orchestration configuration
├── components.json            # Configuration mappings for custom shared UI structures
├── scripts/                   # Seeding, migration, and hardening tools
│   ├── schema.sql             # SQL database schema declarations
│   ├── init-db.js             # Table setup and mock data seed script
│   ├── db-harden.js           # Password structure validation tool
│   └── migrate.js             # DB schema modifications and additions
├── src/
│   ├── app/                   # Next.js 16 app pages and server actions
│   │   ├── (marketing)/       # Landing page, showcases, sectors, and checkout pages
│   │   ├── admin/             # Operations dashboard for administrators
│   │   ├── api/               # Serverless API routes (connect endpoints, telemetry, webhooks)
│   │   ├── dashboard/         # Client operations console (Drafts, Team, Connections)
│   │   ├── layout.tsx         # Global provider wrapping (Auth, Theme variables)
│   │   └── globals.css        # Core style declarations and design tokens
│   ├── components/            # UI building blocks
│   │   ├── ui/                # Scoped inputs, tables, buttons, and badges
│   │   └── ModalPortal.tsx    # Portal wrapper rendering overlays outside active containers
│   ├── emails/                # Transactional email templates defined in React
│   └── lib/                   # Internal backend services and logic
│       ├── db.ts              # PostgreSQL database connection client pool
│       ├── auth.ts            # NextAuth providers list and JWT session wrappers
│       ├── encryption.ts      # AES-256-GCM credentials encryption helpers
│       ├── n8n-credentials.ts # Sync handlers deploying keys directly to n8n servers
│       ├── provider-registry.ts # Structured list of all Connected App metadata definitions
│       └── workflow-provision.ts # Server capacity mapping and setup logic
```

---

## 🗄️ Database Schema Definition

BLONK stores client data and execution telemetry using a relational PostgreSQL schema:

```mermaid
erDiagram
    User ||--o{ credentials : "creates"
    User ||--o{ Notification : "receives"
    User }|--|| Team : "belongs to"
    Team ||--o{ Workflow : "owns"
    Workflow }|--|| ClusterNode : "runs on"
    WorkflowTemplate ||--o{ Workflow : "blueprints"
    Workflow ||--o{ WorkflowLog : "records"
    Payment }|--|| User : "paid by"
```

### Core Tables Summary
1.  **`User`**: Account profiles containing email, hashed passwords, roles (`OWNER`, `ADMIN`, `MEMBER`), onboarding statuses, and linked `teamId`.
2.  **`Team`**: Organizational boundaries dividing multi-tenant user bases.
3.  **`credentials`**: Encrypted integrations access store. Has unique constraints on `(user_id, provider)` to enforce upserts and prevent orphaned credentials.
4.  **`ClusterNode`**: Sovereign VM inventory pool. Tracks server status (`Active`, `Offline`, `Pending`), URL, and verification API keys.
5.  **`Workflow`**: Client deployments matching templates to assigned `ClusterNode` servers, logging deployment states (`Ordered`, `Provisioning`, `Awaiting_Credentials`, `Ready`, `Error`).
6.  **`WorkflowTemplate`**: Catalog of blueprint metadata, detailed setup markdown, and required provider arrays.
7.  **`Event`**: User activity and attribution log mapping (e.g. workspace setups, connection events).

---

## 🚀 Sovereign Infrastructure & n8n Sync

When a client updates or registers their integration credentials (e.g., Slack, OpenAI, Stripe), BLONK automatically synchronizes these changes to the client's dedicated n8n VPS server:

```text
Dashboard Connect UI
      │
      ▼
POST /api/credentials/connect
      │
      ├──► Encrypt credentials locally using AES-256-GCM
      │
      └──► Trigger syncCredentialToN8n(teamId, provider, rawData)
                 │
                 ▼
          Lookup Active ClusterNode for Team
                 │
                 ├──► GET /api/v1/credentials (Check if credential exists by name)
                 │
                 ├──► If exists: PUT /api/v1/credentials/{id} (Update Key)
                 │
                 └──► If new: POST /api/v1/credentials (Create Key)
```

This architecture is orchestrated in [n8n-credentials.ts](file:///c:/Users/prokn/Desktop/blonk/src/lib/n8n-credentials.ts). It ensures that:
*   Credentials in the n8n container are kept up to date without manually opening the n8n GUI.
*   Workflows are matched to server nodes dynamically based on server load and capacity.
*   Existing n8n credentials are updated via `PUT` instead of recreating them, preventing database clutter and orphaned configurations.

---

## 🔑 Credentials & Provider Registry

The credentials system uses a unified metadata template mapping defined in [provider-registry.ts](file:///c:/Users/prokn/Desktop/blonk/src/lib/provider-registry.ts):

*   **Provider Entries**: Define authentication structures (e.g., `oauth2`, `bearerToken`, `apiKey`, `basicAuth`) and list the input forms required from users.
*   **Dynamic UI Construction**: The client connection modal maps over these field lists, rendering input boxes, show/hide eye-toggles, link referrals, and custom labels dynamically.
*   **Twenty CRM Integration**: Features a custom CRM provider mapping that supports Instance URL inputs for cloud and self-hosted instances.

### Connection Route (`/api/credentials/connect`)
1.  **URL Normalization**: Strips accidental path suffixes (like `/rest` or `/graphql`) and prefixes missing protocols.
2.  **API Verification**: Triggers an endpoint request (`GET {instanceUrl}/rest/people?limit=1`) to confirm connectivity and key authorization.
3.  **Error Propagation**: Captures failures and returns user-friendly explanations.
4.  **Local Encryption**: Encrypts credentials with [encryption.ts](file:///c:/Users/prokn/Desktop/blonk/src/lib/encryption.ts) using `AES-256-GCM` before database insertion.

---

## 🛡️ Human-in-the-Loop Approvals Engine

High-risk actions (e.g. executing large wire transfers, bulk database purges, or broadcast mailouts) require human confirmation before execution. This process is governed by the **Approvals Queue**:

```text
           n8n Automation Execution
                      │
                      ▼
        Post Event Details to BLONK REST
                      │
                      ▼
           Table: ApprovalEvidence
         Status: PENDING (Gate Blocked)
                      │
                      ▼
    Operator inspects payload on Dashboard
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
      [Approve]              [Dismiss/Reject]
           │                     │
           ▼                     ▼
   Dispatches webhook      Dispatches webhook
   triggering n8n loop     cancelling n8n run
```

*   **Review Queue Grid**: Displays incoming approval items on card stack decks showing the source customer, target employee, snippet previews, and time-stamps.
*   **Payload Inspector**: Allows developers and admins to inspect execution payloads, review variable states, and edit data inputs.
*   **Approval Dispatching**: Dispatching confirm decisions triggers webhook callbacks that tell the client's n8n workflow engine to continue the execution loop.

---

## 🎨 Framer Motion Design System

BLONK integrates **Motion** (`motion.dev` / Framer Motion v12) to provide fast, tactile micro-animations that improve the user experience:

1.  **Sidebar active state**: An active nav link highlight wrapped in `<motion.div layoutId="sidebar-active">` that slides between menu items as users navigate.
2.  **Route transitions**: The content container in `DashboardLayoutClient.tsx` uses route paths as animation keys, executing a subtle upward fade (`initial: { opacity: 0, y: 8 }` $\rightarrow$ `animate: { opacity: 1, y: 0 }`) on route changes.
3.  **KPI Stat Cards**: KPI numbers count up from 0 on page load using `useMotionValue` and `animate()`. Hover actions use `whileHover={{ scale: 1.02 }}` for feedback.
4.  **Empty states**: Smooth scale-in animations for empty lists and data tables.
5.  **List item deletions**: Approved or deleted items use `AnimatePresence` to fade and collapse (`height: 0`, `overflow: "hidden"`) for smooth list updates.
6.  **Spring dialogs**: Portalled modal windows scale and transition with spring dampening (`stiffness: 300, damping: 30`).

---

## 💻 Local Development & Operations Runbook

### 1. Requirements & Setup
Configure local settings in a root `.env` file:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blonk
NEXTAUTH_SECRET=my-super-secret-auth-key
STRIPE_SECRET_KEY=sk_test_...
```

### 2. Database Initialization
Create tables and populate initial metrics:
```bash
node scripts/init-db.js
```

### 3. Password Security Verification
Run check scripts to audit user password complexity:
```bash
node scripts/db-harden.js
```

### 4. Running the App
Start the Next.js development server:
```bash
npm run dev
```

Run typescript type checks:
```bash
npx tsc --noEmit
```
