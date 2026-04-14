import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Institutional Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "name@firm.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const email = credentials.email.toLowerCase();

                const rows = await db.query(
                    'SELECT id, email, name, role, "teamId", password FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1',
                    [email],
                ) as any[];

                const user = rows?.[0];
                if (!user) return null;

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    teamId: user.teamId,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.teamId = (user as any).teamId;
            }
            if (account?.provider === 'google' || (token.email && !token.teamId)) {
                const email = (user?.email || token.email || '').toLowerCase();
                if (email) {
                    const existing = await db.query(
                        'SELECT id, "teamId", role, "onboardingStatus" FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1', 
                        [email]
                    ) as any[];
                    
                    if (existing.length === 0 && user) {
                        const userId = uuidv4();
                        const teamRes = await db.query(
                            'INSERT INTO "Team" (name, "firmName") VALUES ($1, $2) RETURNING id',
                            [`${user.name || 'Operator'}'s Command`, 'Legacy Firm Hub']
                        ) as any[];
                        const teamId = teamRes[0].id;

                        await db.query(
                            'INSERT INTO "User" (id, email, name, role, "teamId", plan, password, "onboardingStatus") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                            [userId, email, user.name, 'OWNER', teamId, 'Starter', 'oauth_' + uuidv4(), 'PENDING']
                        );

                        await db.query('UPDATE "Team" SET "ownerId" = $1 WHERE id = $2', [userId, teamId]);
                        
                        token.id = userId;
                        token.teamId = teamId;
                        token.role = 'OWNER';
                    } else if (existing.length > 0) {
                        const dbUser = existing[0];
                        token.id = dbUser.id;
                        token.role = dbUser.role;

                        if (!dbUser.teamId) {
                            // Backfill Team for accounts caught in the zombie registration bug
                            const teamRes = await db.query(
                                'INSERT INTO "Team" (name, "firmName", "ownerId") VALUES ($1, $2, $3) RETURNING id',
                                [`Orphan ${email.split('@')[0]}'s Command`, 'Recovered Institutional Firm', dbUser.id]
                            ) as any[];
                            const newTeamId = teamRes[0].id;
                            
                            await db.execute('UPDATE "User" SET "teamId" = $1 WHERE id = $2', [newTeamId, dbUser.id]);
                            token.teamId = newTeamId;
                        } else {
                            token.teamId = dbUser.teamId;
                        }
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).teamId = token.teamId;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    secret: process.env.NEXTAUTH_SECRET,
};
