"use server";

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function completeSetup(formData: any) {
    try {
        const { password, name, firmName, industry } = formData;
        const email = formData.email?.toLowerCase();

        if (!email) {
            return { error: 'Institutional email is required' };
        }

        // Check for existing user (PostgreSQL Syntax)
        const rows = await db.query(
            'SELECT id FROM "User" WHERE email = $1 LIMIT 1',
            [email]
        ) as any[];

        const existingUser = rows?.[0];

        if (existingUser) {
            // Update existing profile (UPSERT-style for firm context)
            await db.execute(
                'UPDATE "User" SET name = $1, "firmName" = $2, industry = $3, "onboardingStatus" = $4 WHERE id = $5',
                [name || 'Institutional Operator', firmName, industry, 'COMPLETED', existingUser.id]
            );
        } else {
            // New Identity Establishment or Re-provisioning After Reset
            // If we have no password (Google or DB cleared), generate a protect-token
            const finalPassword = password ? await bcrypt.hash(password, 10) : `oauth_restoration_token_${Math.random().toString(36).slice(2)}`;
            const userId = uuidv4();
            const displayName = name || 'Institutional Operator';
            
            await db.execute(
                'INSERT INTO "User" (id, email, password, name, "firmName", industry, plan, "onboardingStatus") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [userId, email, finalPassword, displayName, firmName, industry, 'FREE', 'COMPLETED']
            );
        }

        return { success: true };
    } catch (error: any) {
        console.error('Setup action error:', error);
        return { error: error.message || 'Internal server error' };
    }
}
