import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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

                const rows = await db.query(
                    'SELECT id, email, name, "firmName", password FROM "User" WHERE email = $1 LIMIT 1',
                    [credentials.email],
                ) as any[];

                const user = rows?.[0];
                if (!user) return null;

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    firmName: user.firmName,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.firmName = (user as any).firmName;
            }
            // If OAuth signup, ensure the user exists in our DB
            if (account?.provider === 'google' && user?.email) {
                const existing = await db.query('SELECT id FROM "User" WHERE email = $1', [user.email]) as any[];
                if (existing.length === 0) {
                    await db.query(
                        'INSERT INTO "User" (email, name, "firmName", plan) VALUES ($1, $2, $3, $4)',
                        [user.email, user.name, 'Google Individual', 'Starter']
                    );
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).firmName = token.firmName;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
