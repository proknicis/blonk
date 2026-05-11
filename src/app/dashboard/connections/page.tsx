import React from "react";
import ConnectionsClient from "./ConnectionsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Connections | Sovereign Blonk",
};

export const dynamic = 'force-dynamic';

export default async function ConnectionsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    // Static mock data to perfectly match the requested design
    const initialConnections = [
        {
            id: '1',
            app: 'Gmail',
            category: 'Email',
            status: 'EXPIRED',
            statusKey: 'expired',
            workflows: ['Support Ticket Triage', 'Weekly Ops Digest', '+1'],
            lastChecked: '16m ago',
            health: 'Action required',
            action: 'Reconnect',
            color: '#EF4444'
        },
        {
            id: '2',
            app: 'Google Sheets',
            category: 'Spreadsheets',
            status: 'NEEDS RECONNECT',
            statusKey: 'needs_reconnect',
            workflows: ['Report Generation', 'Finance Reconciliation'],
            lastChecked: '2h ago',
            health: 'Reconnect needed',
            action: 'Reconnect',
            color: '#10B981'
        },
        {
            id: '3',
            app: 'Slack',
            category: 'Communication',
            status: 'CONNECTED',
            statusKey: 'connected',
            workflows: ['Support Ticket Triage', 'Incident Alerts'],
            lastChecked: '5m ago',
            health: 'Healthy',
            action: 'Configure',
            color: '#8B5CF6'
        },
        {
            id: '4',
            app: 'HubSpot',
            category: 'CRM',
            status: 'CONNECTED',
            statusKey: 'connected',
            workflows: ['Lead Nurture', 'Customer Onboarding'],
            lastChecked: '1h ago',
            health: 'Healthy',
            action: 'View Details',
            color: '#F97316'
        },
        {
            id: '5',
            app: 'Airtable',
            category: 'Database',
            status: 'NOT CONNECTED',
            statusKey: 'not_connected',
            workflows: ['-'],
            lastChecked: '-',
            health: 'Not connected',
            action: 'Connect',
            color: '#F59E0B'
        },
        {
            id: '6',
            app: 'Notion',
            category: 'Documentation',
            status: 'CONNECTED',
            statusKey: 'connected',
            workflows: ['Product Docs Sync'],
            lastChecked: '3h ago',
            health: 'Healthy',
            action: 'Configure',
            color: '#0F172A'
        }
    ];

    const needsAttention = [
        { id: '1', app: 'Gmail', issue: 'Token expired', time: '16m ago', color: '#EF4444' },
        { id: '2', app: 'Google Sheets', issue: 'Re-auth required', time: '2h ago', color: '#10B981' },
        { id: '3', app: 'Mailchimp', issue: 'Connection expired', time: '1d ago', color: '#F59E0B' }
    ];

    return (
        <ConnectionsClient 
            initialConnections={initialConnections} 
            needsAttention={needsAttention}
        />
    );
}
