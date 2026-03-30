import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = (await connection.execute("SELECT * FROM Report WHERE id = ? LIMIT 1", [id])) as any[];
        await connection.end();

        const report = rows?.[0];
        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        const safeName = String(report.name || "report").replace(/[^a-z0-9_-]+/gi, "_");
        const body = `Report: ${report.name}\nType: ${report.type}\nGenerated: ${report.date}\nSize: ${report.size}\n\nContents:\n${report.content ?? ""}`;

        return new NextResponse(body, {
            headers: {
                "content-type": "text/plain; charset=utf-8",
                "content-disposition": `attachment; filename="${safeName}.txt"`,
            },
        });
    } catch (error) {
        console.error("Error downloading report:", error);
        return NextResponse.json({ error: "Failed to download report" }, { status: 500 });
    }
}

