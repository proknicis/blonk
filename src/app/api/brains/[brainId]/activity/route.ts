import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

export interface ActivityEvent {
  id: string;
  type: 'BRAIN_CREATED' | 'KNOWLEDGE_ADDED' | 'RULE_ADDED' | 'RULE_UPDATED' | 'CALIBRATION_PERFORMED' | 'MEMORY_UPDATED';
  title: string;
  detail: string;
  timestamp: string;
  badge: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brainId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId } = await params;

    // Fetch brain
    const brainRows = await db.query(
      `SELECT * FROM brains WHERE id = $1 AND company_id = $2`,
      [brainId, company.id]
    );

    if (brainRows.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const brain = brainRows[0];
    const activities: ActivityEvent[] = [];

    // 1. Brain created event
    activities.push({
      id: `brain-created-${brain.id}`,
      type: 'BRAIN_CREATED',
      title: `${brain.name} Provisioned`,
      detail: `Department: ${brain.department}, Model: ${brain.ai_model}, Status: ${brain.status}`,
      timestamp: brain.created_at,
      badge: 'SYSTEM',
    });

    // 2. Knowledge items
    const knowledgeRows = await db.query(
      `SELECT id, title, category, created_at FROM brain_knowledge 
       WHERE brain_id = $1 ORDER BY created_at DESC LIMIT 15`,
      [brainId]
    );

    for (const k of knowledgeRows) {
      activities.push({
        id: `knowledge-${k.id}`,
        type: 'KNOWLEDGE_ADDED',
        title: `Indexed Knowledge: ${k.title}`,
        detail: `Category: ${k.category}`,
        timestamp: k.created_at,
        badge: 'KNOWLEDGE',
      });
    }

    // 3. Rules
    const ruleRows = await db.query(
      `SELECT id, title, rule_code, status, priority, is_hard_rule, created_at, updated_at 
       FROM brain_rules 
       WHERE brain_id = $1 ORDER BY created_at DESC LIMIT 15`,
      [brainId]
    );

    for (const r of ruleRows) {
      activities.push({
        id: `rule-${r.id}`,
        type: 'RULE_ADDED',
        title: `Policy Active: ${r.title}`,
        detail: `Priority: ${r.priority}, Hard Rule: ${r.is_hard_rule ? 'Yes' : 'No'}, Code: ${r.rule_code || 'N/A'}`,
        timestamp: r.created_at,
        badge: 'GOVERNANCE',
      });
    }

    // Sort chronologically (latest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(activities);
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/activity Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
