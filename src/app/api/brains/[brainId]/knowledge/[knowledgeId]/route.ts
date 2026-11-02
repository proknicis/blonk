import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ brainId: string; knowledgeId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId, knowledgeId } = await params;

    const result = await db.query(
      `DELETE FROM brain_knowledge bk
       USING brains b
       WHERE bk.id = $1 
         AND bk.brain_id = $2 
         AND b.id = bk.brain_id 
         AND b.company_id = $3
       RETURNING bk.id`,
      [knowledgeId, brainId, company.id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Knowledge entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: knowledgeId });
  } catch (error: any) {
    console.error('[DELETE /api/brains/[brainId]/knowledge/[knowledgeId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
