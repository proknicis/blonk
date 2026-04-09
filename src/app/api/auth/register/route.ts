import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = body.email?.toLowerCase();
        const { password, name, firmName, industry } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Check for existing user (PostgreSQL Syntax)
        const rows = await db.query(
            'SELECT id FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1',
            [email]
        );

        if (rows.length > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        // Insert new user as an OWNER with PENDING status (PostgreSQL Syntax)
        await db.execute(
            'INSERT INTO "User" (id, email, password, name, "firmName", industry, plan, role, "onboardingStatus") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [userId, email, hashedPassword, name || email.split('@')[0], firmName || '', industry || '', 'Starter', 'OWNER', 'PENDING']
        );

        return NextResponse.json({
            message: 'User registered successfully',
            user: {
                id: userId,
                email: email,
                name: name
            }
        });

    } catch (error: any) {
        console.error('Registration API error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message || 'Unknown error'
        }, { status: 500 });
    }
}
