import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

export async function GET() {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized. No company context found.' }, { status: 401 });
    }

    const brains = await db.query(
      `SELECT b.*,
              (SELECT count(*)::int FROM brain_knowledge bk WHERE bk.brain_id = b.id) as "knowledgeCount",
              (SELECT count(*)::int FROM brain_rules br WHERE br.brain_id = b.id) as "rulesCount"
       FROM brains b
       WHERE b.company_id = $1
       ORDER BY b.created_at ASC`,
      [company.id]
    );

    return NextResponse.json({
      company: { id: company.id, name: company.name },
      brains,
    });
  } catch (error: any) {
    console.error('[GET /api/brains Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized. No company context found.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name = 'Finance & Accounting Brain',
      department = 'FINANCE',
      description = 'Sovereign intelligence for invoice reconciliation, spend governance, and ledger auditing.',
      systemPrompt = 'You are the Finance & Accounting Sovereign Brain. Your mandate is to enforce spend limits, audit ledgers, verify invoices against purchase orders, and validate financial compliance without human intervention unless approvals are triggered.',
      aiModel = 'gpt-4o',
      temperature = 0.2,
      memoryContext = {},
    } = body;

    const inserted = await db.query(
      `INSERT INTO brains (
         company_id, name, department, description, status, 
         system_prompt, ai_model, temperature, memory_context, learning_state, metadata
       ) VALUES (
         $1, $2, $3, $4, 'ACTIVE', 
         $5, $6, $7, $8, $9, $10
       ) RETURNING *`,
      [
        company.id,
        name,
        department,
        description,
        systemPrompt,
        aiModel,
        temperature,
        JSON.stringify(memoryContext),
        JSON.stringify({ totalLearnings: 0, confidenceScore: 0.98, status: 'CALIBRATED' }),
        JSON.stringify({ createdVia: 'dashboard_ui' }),
      ]
    );

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/brains Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
