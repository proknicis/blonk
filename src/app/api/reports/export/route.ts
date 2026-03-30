import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = (await connection.execute("SELECT * FROM Report ORDER BY createdAt DESC")) as any[];
        await connection.end();

        const payload = JSON.stringify(rows, null, 2);
        const fileName = `BLONK_Reports_Backup_${new Date().toISOString().split("T")[0]}.json`;

        return new NextResponse(payload, {
            headers: {
                "content-type": "application/json; charset=utf-8",
                "content-disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error("Error exporting reports:", error);
        return NextResponse.json({ error: "Failed to export reports" }, { status: 500 });
    }
}

