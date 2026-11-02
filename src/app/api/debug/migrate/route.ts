import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Query columns
        const columns = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'Team'
        `);

        // Query constraints
        const constraints = await db.query(`
            SELECT conname, contype, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = '"Team"'::regclass
        `);

        // Query indexes
        const indexes = await db.query(`
            SELECT schemaname, tablename, indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'Team'
        `);

        return NextResponse.json({ 
            success: true, 
            columns,
            constraints,
            indexes
        });
    } catch (error: any) {
        console.error("Schema sync failure:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
