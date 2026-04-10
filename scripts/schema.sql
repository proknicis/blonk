-- BLONK | SOVEREIGN ARCHITECTURAL SCHEMA
-- PostgreSQL Initialization Script

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
-- User: Institutional profiles and credentials
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(255),
    "firmName" VARCHAR(255),
    industry VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'Starter',
    role VARCHAR(50) DEFAULT 'MEMBER',
    "teamId" UUID,
    "onboardingStatus" VARCHAR(50) DEFAULT 'PENDING',
    "utmSource" VARCHAR(100),
    "utmMedium" VARCHAR(100),
    "utmCampaign" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics: Event tracking system
CREATE TABLE IF NOT EXISTS "Event" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID,
    "visitorId" VARCHAR(255),
    "sessionId" VARCHAR(255),
    "eventType" VARCHAR(100) NOT NULL, -- page_visit, signup, login, subscription_started, payment_completed, subscription_cancelled
    "source" VARCHAR(100), -- UTM source
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments: Real financial ledger
CREATE TABLE IF NOT EXISTS "Payment" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'USD',
    "status" VARCHAR(50) DEFAULT 'completed',
    "stripeSessionId" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MarketingSpend: Tracking CAC inputs
CREATE TABLE IF NOT EXISTS "MarketingSpend" (
    id SERIAL PRIMARY KEY,
    "date" DATE NOT NULL,
    "amount" DECIMAL(15,2) DEFAULT 0.00,
    "source" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow: Active autonomous loops
CREATE TABLE IF NOT EXISTS "Workflow" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    performance VARCHAR(50) DEFAULT '0',
    "tasksCount" INTEGER DEFAULT 0,
    inputs JSONB DEFAULT '{}',
    "requestedBy" VARCHAR(255),
    "userId" UUID,
    "lastRun" TIMESTAMP,
    "n8nWebhookUrl" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WorkflowTemplate: Marketplace blue-prints
CREATE TABLE IF NOT EXISTS "WorkflowTemplate" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    sector VARCHAR(100),
    description TEXT,
    savings VARCHAR(100),
    complexity VARCHAR(100),
    icon VARCHAR(100),
    color VARCHAR(100),
    featured BOOLEAN DEFAULT FALSE,
    requirements JSONB DEFAULT '[]', -- Updated to include API guides
    "setupGuide" JSONB DEFAULT '[]', -- Updated to include visual steps
    "productInfo" JSONB DEFAULT '{}', -- Value Prop, Target User, Pricing
    "webhookUrl" TEXT,
    status VARCHAR(50) DEFAULT 'Draft',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent: Legacy/Direct autonomous units
CREATE TABLE IF NOT EXISTS "Agent" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Idle',
    performance VARCHAR(50),
    "n8nWorkflow" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OperationalSetting: System-wide configuration
CREATE TABLE IF NOT EXISTS "OperationalSetting" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL
);

-- WorkflowLog: Immutable execution packets
CREATE TABLE IF NOT EXISTS "WorkflowLog" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "workflowName" VARCHAR(255),
    "workflowId" UUID,
    status VARCHAR(50),
    result JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification: High-stakes alerts
CREATE TABLE IF NOT EXISTS "Notification" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    message TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Report: Static institutional snapshots
CREATE TABLE IF NOT EXISTS "Report" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    type VARCHAR(100),
    date VARCHAR(100),
    size VARCHAR(100),
    content TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ChartData: Institutional performance metrics
CREATE TABLE IF NOT EXISTS "ChartData" (
    id SERIAL PRIMARY KEY,
    day VARCHAR(50) UNIQUE,
    revenue DECIMAL(15,2) DEFAULT 0.00,
    expenses DECIMAL(15,2) DEFAULT 0.00,
    profit DECIMAL(15,2) DEFAULT 0.00,
    sequence INTEGER
);

-- Kpi: Strategic high-level metrics
CREATE TABLE IF NOT EXISTS "Kpi" (
    label VARCHAR(100) PRIMARY KEY,
    value VARCHAR(100),
    "change" VARCHAR(50),
    positive BOOLEAN DEFAULT TRUE
);

-- Transaction: Sovereign ledger entries
CREATE TABLE IF NOT EXISTS "Transaction" (
    "trxId" VARCHAR(100) PRIMARY KEY,
    date VARCHAR(100),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    amount VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INITIAL SEED DATA (SAFE RE-RUNS)
INSERT INTO "OperationalSetting" (key, value) VALUES ('system_uptime', '99.98') 
ON CONFLICT (key) DO NOTHING;

INSERT INTO "Kpi" (label, value, "change", positive) VALUES 
('Total Revenue', '$124,500', '+12.4%', TRUE),
('Total Expenses', '$43,200', '-2.1%', FALSE),
('New Profit', '$81,300', '+18.7%', TRUE)
ON CONFLICT (label) DO NOTHING;

-- Seed ChartData only if empty
INSERT INTO "ChartData" (day, revenue, expenses, profit, sequence) 
SELECT d, r, e, p, s FROM (VALUES 
('Mon', 120.0, 40.0, 80.0, 1), 
('Tue', 150.0, 45.0, 105.0, 2), 
('Wed', 130.0, 42.0, 88.0, 3), 
('Thu', 170.0, 50.0, 120.0, 4), 
('Fri', 190.0, 52.0, 138.0, 5)
) AS t(d, r, e, p, s)
WHERE NOT EXISTS (SELECT 1 FROM "ChartData");
