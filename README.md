# BLONK | Sovereign Automation Platforms

BLONK is a sovereign, decoupled workflow execution platform built specifically for professional services firms. It allows teams to acquire, deploy, and manage automated workflow blueprints on their own private servers, guaranteeing 100% data sovereignty.

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js**: v20+ recommended
- **PostgreSQL**: Local or managed instance
- **Docker** (optional): For containerized deployments

### 🛠️ Installation & Setup

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root directory and populate it with your configuration (see `.env.example` or existing configuration variables):
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Authorization secret
   - `STRIPE_API_KEY`: Payment integration keys

3. **Initialize the Database**:
   Run the SQL schema setup and seed scripts:
   ```bash
   node scripts/init-db.js
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 📖 Project Documentation

For a detailed walkthrough of the technology stack, system features, database schema, and server provisioning workflows, see [PROJECT_DESCRIPTION.md](file:///c:/Users/prokn/Desktop/blonk/PROJECT_DESCRIPTION.md).
