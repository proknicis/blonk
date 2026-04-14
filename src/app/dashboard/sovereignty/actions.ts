"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSetting(key: string, value: string) {
    try {
        const updateRes = await db.query(`UPDATE "OperationalSetting" SET value = $1 WHERE key = $2 RETURNING id`, [value, key]) as any[];
        if (updateRes.length === 0) {
            await db.query(`
                INSERT INTO "OperationalSetting" (id, key, value)
                VALUES (gen_random_uuid(), $1, $2)
            `, [key, value]);
        }
        revalidatePath("/dashboard/sovereignty");
    } catch (error) {
        console.error("Failed to update setting:", error);
    }
}

export async function addApiKey(entry: any) {
    try {
        // We store API keys in OperationalSetting with prefix "apikey_"
        const dbKey = `apikey_${entry.id}`;
        const dbValue = JSON.stringify(entry);
        await db.query(`
            INSERT INTO "OperationalSetting" (id, key, value)
            VALUES (gen_random_uuid(), $1, $2)
        `, [dbKey, dbValue]);
        revalidatePath("/dashboard/sovereignty");
    } catch (error) {
        console.error("Failed to add API key:", error);
    }
}

export async function removeApiKey(id: string) {
    try {
        const dbKey = `apikey_${id}`;
        await db.query(`DELETE FROM "OperationalSetting" WHERE key = $1`, [dbKey]);
        revalidatePath("/dashboard/sovereignty");
    } catch(e) {
        console.error("Failed to remove API key:", e);
    }
}
