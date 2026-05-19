import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Contabo API Integration for Automatic Server Provisioning
 * 
 * POST - Provision a new server from Contabo
 * GET - List available Contabo instance types
 */

const CONTABO_API_BASE = "https://api.contabo.com/v1";

async function ensureSchema() {
    await db.execute(`
        ALTER TABLE "ClusterNode" 
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

async function callContaboAPI(endpoint: string, method: string = "GET", body?: any) {
    const apiKey = process.env.CONTABO_API_KEY;
    const clientId = process.env.CONTABO_CLIENT_ID;
    const clientSecret = process.env.CONTABO_CLIENT_SECRET;

    if (!apiKey || !clientId || !clientSecret) {
        throw new Error("Contabo API credentials not configured");
    }

    const response = await fetch(`${CONTABO_API_BASE}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": apiKey,
            "X-Client-Id": clientId,
            "X-Client-Secret": clientSecret,
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
            const provisionResponse = await callContaboAPI("/instances", "POST", {
                name: `${customerName.replace(/\s+/g, '-').toLowerCase()}-n8n-server`,
                imageId: process.env.CONTABO_IMAGE_ID || "ubuntu-22-04",
                productId: instanceType,
                region: region || "EU-CENTRAL-1",
                sshKeyId: sshKeyId || null,
                defaultUser: "root",
            });

            const instanceId = provisionResponse.data?.[0]?.instanceId;
            if (!instanceId) {
                throw new Error("Failed to get instance ID from Contabo");
            }

            // Wait for instance to be ready and get IP
            let ipAddress = null;
            let attempts = 0;
            while (!ipAddress && attempts < 30) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                const instanceData = await callContaboAPI(`/instances/${instanceId}`);
                ipAddress = instanceData.data?.[0]?.ipConfig?.[0]?.ipAddress;
                attempts++;
            }

            if (!ipAddress) {
                throw new Error("Failed to get IP address from Contabo");
            }

            // Create node record
            const nodeName = `${customerName} n8n Server`;
            const nodeUrl = `https://${ipAddress}:5678`;
            const apiKey = "n8n_api_key_placeholder"; // This should be generated or configured

            const res = await db.execute(
                'INSERT INTO "ClusterNode" (name, url, api_key, status, max_workflows, "customerId", "customerName", "customerEmail", provider, region, "ipAddress", "contaboInstanceId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
                [nodeName, nodeUrl, apiKey, 'Provisioning', 100, customerId, customerName, customerEmail, 'contabo', region, ipAddress, instanceId]
            );

            return NextResponse.json({ 
                success: true,
                node: res.rows[0],
                instanceId,
                ipAddress
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
