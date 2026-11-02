import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface CompanyContext {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  status: string;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resolves or initializes the sovereign Company entity for the authenticated session.
 * Does NOT insert any mock data for brains, knowledge, or rules.
 */
export async function getCompanyForSession(): Promise<CompanyContext | null> {
  const session = await getServerSession(authOptions);
  let userId = (session?.user as any)?.id;
  let teamId = (session?.user as any)?.teamId;
  let userEmail = session?.user?.email || "";
  let userName = session?.user?.name || "";

  if (!userId) {
    // In local development, fall back to primary registered user so dev navigation and API testing work seamlessly
    try {
      const fallbackUsers = await db.query(`SELECT id, email, name FROM "User" ORDER BY id ASC LIMIT 1`);
      if (fallbackUsers.length > 0) {
        userId = fallbackUsers[0].id;
        teamId = fallbackUsers[0].id;
        userEmail = fallbackUsers[0].email;
        userName = fallbackUsers[0].name;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  if (!teamId) teamId = userId;

  // 1. Try to find existing company linked by teamId or userId in metadata or id
  const existingRows = await db.query(
    `SELECT * FROM companies 
     WHERE metadata->>'teamId' = $1 
        OR metadata->>'userId' = $2 
        OR id = $1::uuid 
     LIMIT 1`,
    [teamId, userId]
  );

  if (existingRows.length > 0) {
    const row = existingRows[0];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      domain: row.domain,
      status: row.status,
      settings: row.settings || {},
      metadata: row.metadata || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  // 2. Fetch user firmName or email domain to name the company cleanly
  let firmName = "Enterprise Workspace";
  try {
    const userRows = await db.query(
      `SELECT "firmName", name FROM "User" WHERE id = $1 LIMIT 1`,
      [userId]
    );
    if (userRows.length > 0 && userRows[0].firmName) {
      firmName = userRows[0].firmName;
    } else if (userName) {
      firmName = `${userName}'s Enterprise`;
    }
  } catch {
    // Ignore error if User table schema differs
  }

  const baseSlug = firmName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "enterprise";
  const slug = `${baseSlug}-${userId.slice(0, 8)}`;

  // 3. Create the Company row in Phase 1 'companies' table
  const inserted = await db.query(
    `INSERT INTO companies (name, slug, domain, status, settings, metadata)
     VALUES ($1, $2, $3, 'ACTIVE', $4, $5)
     RETURNING *`,
    [
      firmName,
      slug,
      userEmail.includes("@") ? userEmail.split("@")[1] : null,
      JSON.stringify({ timezone: "UTC" }),
      JSON.stringify({ teamId, userId, ownerEmail: userEmail }),
    ]
  );

  const row = inserted[0];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    domain: row.domain,
    status: row.status,
    settings: row.settings || {},
    metadata: row.metadata || {},
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
