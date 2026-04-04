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

        // Check for existing user (Postgres Syntax)
        const rows = await db.query(
            'SELECT id FROM "User" WHERE email = $1 LIMIT 1',
            [email]
        ) as any[];

        const existingUser = rows?.[0];

        if (existingUser) {
            // Institutional Profile Enrichment (Update)
            await db.execute(
                'UPDATE "User" SET name = $1, "firmName" = $2, industry = $3, "updatedAt" = CURRENT_TIMESTAMP WHERE email = $4',
                [name || email.split('@')[0], firmName, industry, email]
            );

            return { success: true, updated: true };
        } else {
            // New Identity Establishment (Register)
            if (!password) {
                return { error: 'Authentication credentials required for initial setup.' };
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = uuidv4();
            const displayName = name || email.split('@')[0];

            await db.execute(
                'INSERT INTO "User" (id, email, password, name, "firmName", industry, plan) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [userId, email, hashedPassword, displayName, firmName, industry, 'Starter']
            );

            return {
                success: true,
                user: {
                    id: userId,
                    email: email,
                    name: displayName
                }
            };
        }

    } catch (error: any) {
        console.error('Setup action error:', error);
        return { error: error.message || 'Internal server error' };
    }
}
