import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ brainId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId } = await params;
    const body = await request.json();

    const {
      decision = 'APPLY', // 'APPLY' or 'DENY'
      applyKnowledge = true,
      knowledge,
      rules = [],
      memoryUpdates = {},
    } = body;

    // If user explicitly Denies, do NOT save anything to database
    if (decision === 'DENY') {
      return NextResponse.json({
        success: true,
        message: 'Proposed learning changes were denied. Database remains untouched.',
        applied: false,
      });
    }

    // Verify Brain belongs to company
    const brainRows = await db.query(
      `SELECT * FROM brains WHERE id = $1 AND company_id = $2`,
      [brainId, company.id]
    );

    if (brainRows.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const brain = brainRows[0];
    const createdKnowledgeIds: string[] = [];
    const createdRuleIds: string[] = [];

    // 1. Insert Knowledge (if applied)
    if (applyKnowledge && knowledge && knowledge.title && knowledge.content) {
      const kRes = await db.query(
        `INSERT INTO brain_knowledge (
           brain_id, title, content, category, source, status, confidence_score, metadata
         ) VALUES (
           $1, $2, $3, $4, 'LEARNED_FROM_TASK', 'ACTIVE', 1.0000, $5
         ) RETURNING id`,
        [
          brainId,
          knowledge.title,
          knowledge.content,
          knowledge.category || 'POLICY',
          JSON.stringify({ trainedAt: new Date().toISOString() }),
        ]
      );
      createdKnowledgeIds.push(kRes[0].id);
    }

    // 2. Insert Rules (only the accepted rules)
    if (Array.isArray(rules) && rules.length > 0) {
      for (const rule of rules) {
        if (!rule.title) continue;
        const rRes = await db.query(
          `INSERT INTO brain_rules (
             brain_id, rule_code, title, description, condition, action,
             priority, is_hard_rule, status, source, metadata
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', 'AI_DERIVED', $9
           ) RETURNING id`,
          [
            brainId,
            rule.ruleCode || null,
            rule.title,
            rule.description || '',
            JSON.stringify(rule.condition || {}),
            JSON.stringify(rule.action || { type: 'REQUIRE_APPROVAL' }),
            rule.priority ?? 100,
            rule.isHardRule ?? true,
            JSON.stringify({ learnedInTraining: true }),
          ]
        );
        createdRuleIds.push(rRes[0].id);
      }
    }

    // 3. Update Memory Context
    const currentMemory = brain.memory_context || {};
    const updatedMemory = { ...currentMemory, ...memoryUpdates };

    // 4. Update Learning State & Calibration
    const currentLearning = brain.learning_state || {};
    const totalLearnings = (currentLearning.totalLearnings || 0) + 1;
    const newConfidence = Math.min(
      Number(((currentLearning.confidenceScore || 0.95) + 0.005).toFixed(4)),
      0.9999
    );

    const updatedLearningState = {
      ...currentLearning,
      totalLearnings,
      confidenceScore: newConfidence,
      status: 'CALIBRATED',
      lastReflectionAt: new Date().toISOString(),
    };

    await db.query(
      `UPDATE brains 
       SET memory_context = $1, learning_state = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND company_id = $4`,
      [
        JSON.stringify(updatedMemory),
        JSON.stringify(updatedLearningState),
        brainId,
        company.id,
      ]
    );

    return NextResponse.json({
      success: true,
      applied: true,
      createdKnowledgeIds,
      createdRuleIds,
      updatedMemoryKeys: Object.keys(memoryUpdates),
      newConfidenceScore: newConfidence,
      totalLearnings,
      message: `Successfully trained ${brain.name}. Persisted ${createdKnowledgeIds.length} knowledge doc(s) and ${createdRuleIds.length} rule(s).`,
    });
  } catch (error: any) {
    console.error('[POST /api/brains/[brainId]/train/apply Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
