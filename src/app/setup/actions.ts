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

        // Check for existing user
        const [rows]: any = await db.execute(
            'SELECT * FROM User WHERE email = ? LIMIT 1',
            [email]
        );

        if (rows.length > 0) {
            return { error: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const displayName = name || email.split('@')[0];

        // Insert new user
        await db.execute(
            'INSERT INTO User (id, email, password, name, firmName, industry, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
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
