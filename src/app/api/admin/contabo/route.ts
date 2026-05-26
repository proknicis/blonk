import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Contabo API Integration for Automatic Server Provisioning
 * 
 * POST - Provision a new server from Contabo
 * GET - List available Contabo instance types
 */

const CONTABO_API_BASE = "https://api.contabo.com/v1/compute";

async function ensureSchema() {
    await db.execute(`
        ALTER TABLE "ClusterNode" 
        ADD COLUMN IF NOT EXISTS url TEXT,
        ADD COLUMN IF NOT EXISTS api_key TEXT,
        ADD COLUMN IF NOT EXISTS max_workflows INTEGER DEFAULT 100,
        ADD COLUMN IF NOT EXISTS "customerId" TEXT,
        ADD COLUMN IF NOT EXISTS "customerName" TEXT,
        ADD COLUMN IF NOT EXISTS "customerEmail" TEXT,
        ADD COLUMN IF NOT EXISTS "instanceId" TEXT,
        ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT 'manual',
        ADD COLUMN IF NOT EXISTS "region" TEXT,
        ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
        ADD COLUMN IF NOT EXISTS "sshKeyId" TEXT,
        ADD COLUMN IF NOT EXISTS "contaboInstanceId" TEXT
    `);
}

async function getContaboToken() {
    const clientId = process.env.CONTABO_CLIENT_ID;
    const clientSecret = process.env.CONTABO_CLIENT_SECRET;
    const username = process.env.CONTABO_API_USERNAME;
    const password = process.env.CONTABO_API_PASSWORD;

    if (!clientId || !clientSecret || !username || !password) {
        throw new Error("Contabo OAuth2 API credentials not fully configured in environment variables");
    }

    const tokenUrl = "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token";
    const body = new URLSearchParams();
    body.append("grant_type", "password");
    body.append("client_id", clientId);
    body.append("client_secret", clientSecret);
    body.append("username", username);
    body.append("password", password);

    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Contabo Token authentication failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function callContaboAPI(endpoint: string, method: string = "GET", body?: any) {
    const accessToken = await getContaboToken();

    const response = await fetch(`${CONTABO_API_BASE}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "x-request-id": typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Contabo API error: ${response.status} - ${error}`);
    }

    return response.json();
}

export async function POST(req: Request) {
    try {
        await ensureSchema();
        const { customerId, customerName, customerEmail, instanceType, region, sshKeyId } = await req.json();

        if (!customerId || !customerName || !instanceType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate 1:1 customer-server relationship
        const existingCustomerNode = await db.query(
            'SELECT * FROM "ClusterNode" WHERE "customerId" = $1',
            [customerId]
        ) as any[];
        
        if (existingCustomerNode.length > 0) {
            return NextResponse.json({ 
                error: "Customer already has an assigned server",
                existingNode: existingCustomerNode[0]
            }, { status: 400 });
        }

        // Provision server via Contabo API
        try {
            const hasCredentials = 
                process.env.CONTABO_CLIENT_ID && 
                !process.env.CONTABO_CLIENT_ID.includes("placeholder") &&
                process.env.CONTABO_CLIENT_SECRET &&
                !process.env.CONTABO_CLIENT_SECRET.includes("placeholder") &&
                process.env.CONTABO_API_USERNAME &&
                !process.env.CONTABO_API_USERNAME.includes("placeholder") &&
                process.env.CONTABO_API_PASSWORD &&
                !process.env.CONTABO_API_PASSWORD.includes("placeholder");

            let instanceId = "ctb-" + Math.random().toString(36).substring(2, 10);
            let ipAddress = `154.56.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;

            if (hasCredentials) {
                // Region normalization: Contabo regions are typically "EU", "US-central", "US-east", "US-west", "SIN"
                let contaboRegion = "EU";
                if (region) {
                    if (region.includes("EU") || region.includes("Frankfurt") || region.includes("Rotterdam")) contaboRegion = "EU";
                    else if (region.includes("US-EAST") || region.includes("New York")) contaboRegion = "US-east";
                    else if (region.includes("US-WEST") || region.includes("Los Angeles")) contaboRegion = "US-west";
                    else if (region.includes("US-CENTRAL") || region.includes("Dallas")) contaboRegion = "US-central";
                    else if (region.includes("ASIA") || region.includes("Singapore")) contaboRegion = "SIN";
                    else contaboRegion = region;
                }

                let productId = instanceType;
                if (instanceType === "VPS-1" || instanceType === "VPS 1") productId = "v1";
                else if (instanceType === "VPS-2" || instanceType === "VPS 2") productId = "v2";
                else if (instanceType === "VPS-3" || instanceType === "VPS 3") productId = "v3";
                else if (instanceType === "VPS-4" || instanceType === "VPS 4") productId = "v4";

                const payload: any = {
                    displayName: `${customerName.replace(/\s+/g, '-').toLowerCase()}-n8n-server`,
                    imageId: process.env.CONTABO_IMAGE_ID || "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                    productId: productId,
                    region: contaboRegion,
                    period: 1,
                };

                if (sshKeyId) {
                    payload.sshKeys = [parseInt(sshKeyId) || sshKeyId];
                }

                const provisionResponse = await callContaboAPI("/instances", "POST", payload);

                const apiInstanceId = provisionResponse.data?.[0]?.instanceId;
                if (!apiInstanceId) {
                    throw new Error("Failed to get instance ID from Contabo response: " + JSON.stringify(provisionResponse));
                }
                instanceId = apiInstanceId.toString();

                // Wait for instance to be ready and get IP
                let polledIp = null;
                let attempts = 0;
                while (!polledIp && attempts < 15) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const instanceData = await callContaboAPI(`/instances/${instanceId}`);
                    polledIp = instanceData.data?.[0]?.ipConfig?.[0]?.ipAddress;
                    attempts++;
                }

                if (polledIp) {
                    ipAddress = polledIp;
                } else {
                    throw new Error("Failed to retrieve assigned IP configuration from Contabo after polling");
                }
            } else {
                console.log("[Contabo API Sandbox] Missing credentials. Simulating VPS provisioning.");
            }

            // Create node record
            const nodeName = `${customerName} n8n Server`;
            const nodeUrl = `https://${ipAddress}:5678`;
            const apiKey = "n8n_" + Math.random().toString(36).substring(2, 15);

            const res = await db.execute(
                'INSERT INTO "ClusterNode" (name, url, api_key, status, max_workflows, "customerId", "customerName", "customerEmail", provider, region, "ipAddress", "contaboInstanceId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
                [nodeName, nodeUrl, apiKey, 'Active', 100, customerId, customerName, customerEmail, 'contabo', region || 'EU', ipAddress, instanceId]
            );

            return NextResponse.json({ 
                success: true,
                node: res.rows[0],
                instanceId,
                ipAddress,
                simulated: !hasCredentials
            });

        } catch (contaboError: any) {
            console.error("Contabo provisioning error:", contaboError);
            return NextResponse.json({ 
                error: "Failed to provision server from Contabo",
                details: contaboError.message
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Contabo API error:", error);
        return NextResponse.json({ 
            error: "Internal server error",
            details: error.message
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        // List available instance types from Contabo
        const instanceTypes = await callContaboAPI("/products");
        
        return NextResponse.json({
            instanceTypes: instanceTypes.data || [],
            regions: [
                { id: "EU-CENTRAL-1", name: "Frankfurt, Germany" },
                { id: "EU-WEST-1", name: "Rotterdam, Netherlands" },
                { id: "US-EAST-1", name: "New York, USA" },
                { id: "US-WEST-1", name: "Los Angeles, USA" },
                { id: "ASIA-EAST-1", name: "Singapore" },
            ]
        });

    } catch (error: any) {
        console.error("Contabo API error:", error);
        return NextResponse.json({ 
            error: "Failed to fetch Contabo options",
            details: error.message
        }, { status: 500 });
    }
}
