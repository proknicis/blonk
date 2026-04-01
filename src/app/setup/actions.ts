"use server";

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function registerUser(formData: any) {
    try {
        const { email, password, name, firmName, industry } = formData;

        if (!email || !password) {
            return { error: 'Email and password are required' };
        }

        // Use sovereign DB helper for PostgreSQL compatibility
        // Check for existing user
        const rows = await db.query(
            'SELECT * FROM "User" WHERE email = $1 LIMIT 1',
            [email]
        );

        if (rows.length > 0) {
            return { error: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const displayName = name || email.split('@')[0];

        // Insert new user
        // Postgres uses $N for placeholders, NOW() for current timestamp
        await db.execute(
            'INSERT INTO "User" (id, email, password, name, "firmName", industry, "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
            [userId, email, hashedPassword, displayName, firmName, industry]
        );

        return {
            success: true,
            user: {
                id: userId,
                email: email,
                name: displayName
            }
        };

    } catch (error: any) {
        console.error('Registration action error:', error);
        return { error: error.message || 'Internal server error' };
    }
}
