# BLONK | SOVEREIGN UPTIME PROTOCOL 🛰️🛡️✅

To ensure your autonomous fleet remains operational 24/7, follow this institutional guide to deploy **PM2** and transition your fleet into **Production Mode**.

## Step 1: Install the Process Orchestrator (PM2)
Run this on your server to install the industry-standard process manager.
```bash
sudo npm install -g pm2
```

---

## Step 2: Provision the Production Build 🏗️⚡
Production mode is significantly faster and more stable than developer mode.
```bash
# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Build the institutional bundle
npm run build
```

---

## Step 3: Launch the Fleet 🚀
Launch your application with PM2. This ensures it stays up even if it crashes.
```bash
# Start the app from your blonk directory
pm2 start npm --name "blonk-fleet" -- start
```

---

## Step 4: Enforce Boot-Time Persistence 🔄🔓
Ensure your fleet starts automatically if your server undergoes a reboot.
```bash
# Tell PM2 to generate a startup script
pm2 startup

# (Copy-paste the command PM2 gives you into the terminal and press Enter)

# Freeze the current process list to memory
pm2 save
```

---

## Step 5: Command Center Diagnostics 🕵️‍♂️📈
Use these commands to monitor your fleet's health:
- `pm2 list` — View all active units.
- `pm2 logs blonk-fleet` — Stream real-time operational logs.
- `pm2 restart blonk-fleet` — Force a refresh of the entire fleet.
- `pm2 stop blonk-fleet` — Put the fleet into standby.

**Your Command Center is now hardened for 100% operational uptime! 🦾🚀⚡**
