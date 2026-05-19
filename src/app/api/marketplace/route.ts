import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

/**
 * Marketplace API
 * 
 * GET - Fetch published marketplace templates
 */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');

        let query = 'SELECT * FROM "WorkflowTemplate" WHERE status = $1';
        const params: any[] = ['Published'];

        if (category && category !== 'All') {
            query += ' AND sector = $2';
            params.push(category);
        }

        if (featured === 'true') {
            query += ' AND featured = true';
        }

        query += ' ORDER BY "createdAt" DESC';

        const rows = await db.query(query, params);
        
        // Add computed fields
        const templates = rows.map((t: any) => {
            // Price can be in either direct price field or productInfo.price
            const directPrice = parseFloat(t.price || 0);
            const productInfoPrice = t.productInfo ? parseFloat(t.productInfo.price || 0) : 0;
            const finalPrice = productInfoPrice > 0 ? productInfoPrice : directPrice;
            
            return {
                ...t,
                price: finalPrice,
                purchases: t.purchases || 0,
                revenue: t.revenue || 0
            };
        });

        return NextResponse.json(templates || []);
    } catch (error) {
        console.error('Error fetching marketplace templates:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
