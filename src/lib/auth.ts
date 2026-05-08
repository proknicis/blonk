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
                    'SELECT id, email, name, role, "teamId", password, tier FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1',
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
                    tier: user.tier || 'Starter',
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
                token.tier = (user as any).tier;
            }
            if (account?.provider === 'google' || (token.email && !token.teamId)) {
                const email = (user?.email || token.email || '').toLowerCase();
                if (email) {
                    const existing = await db.query(
                        'SELECT id, "teamId", role, tier, "onboardingStatus" FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1', 
                        [email]
                    ) as any[];
                    
                    if (existing.length === 0 && user) {
                        const userId = uuidv4();
                        // Google users start without a team but with OWNER role
                        await db.query(
                            'INSERT INTO "User" (id, email, name, role, plan, password, "onboardingStatus") VALUES ($1, $2, $3, $4, $5, $6, $7)',
                            [userId, email, user.name, 'OWNER', 'Starter', 'oauth_' + uuidv4(), 'TEAM_PENDING']
                        );
                        
                        token.id = userId;
                        token.role = 'OWNER';
                    } else if (existing.length > 0) {
                        const dbUser = existing[0];
                        token.id = dbUser.id;
                        token.role = dbUser.role;
                        token.tier = dbUser.tier || 'Starter';
                        token.teamId = dbUser.teamId;
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
                (session.user as any).tier = token.tier;
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
