import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/lib/email';
import WelcomeMFAEmail from '@/emails/WelcomeMFAEmail';

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

        // 1. Create a Team (Firm) for this user first
        const teamName = firmName || `${name || email.split('@')[0]}'s Command Node`;
        const teamRes = await db.query(
            'INSERT INTO "Team" (name, "firmName") VALUES ($1, $2) RETURNING id',
            [teamName, firmName || 'Institutional Firm']
        ) as any[];
        const teamId = teamRes[0].id;

        // 2. Insert new user as an OWNER
        await db.execute(
            'INSERT INTO "User" (id, email, password, name, "firmName", industry, plan, role, "onboardingStatus", "teamId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [userId, email, hashedPassword, name || email.split('@')[0], firmName || '', industry || '', 'Starter', 'OWNER', 'PENDING', teamId]
        );

        // 3. Anchor user as Team owner
        await db.execute('UPDATE "Team" SET "ownerId" = $1 WHERE id = $2', [userId, teamId]);

        // 4. Send Welcome MFA Email
        const mfaCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
        
        // In a real app we might store mfaCode in the DB here
        
        // Dispatch the email asynchronously
        const emailRes = await sendEmail(
            email,
            'Action Required: Complete your Blonk Identity Setup',
            <WelcomeMFAEmail userName={name || email.split('@')[0]} mfaCode={mfaCode} />
        );

        if (!emailRes.success) {
             console.error('Email Dispatch Error:', emailRes.error);
        }

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
