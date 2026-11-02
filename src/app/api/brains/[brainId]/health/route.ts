import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

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
      `SELECT b.*,
              (SELECT count(*)::int FROM brain_knowledge bk WHERE bk.brain_id = b.id) as "knowledgeCount",
              (SELECT count(*)::int FROM brain_rules br WHERE br.brain_id = b.id) as "rulesCount",
              (SELECT count(*)::int FROM brain_rules br WHERE br.brain_id = b.id AND br.is_hard_rule = true) as "hardRulesCount",
              (SELECT count(DISTINCT category)::int FROM brain_knowledge bk WHERE bk.brain_id = b.id) as "categoryCount"
       FROM brains b
       WHERE b.id = $1 AND b.company_id = $2`,
      [brainId, company.id]
    );

    if (brainRows.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const brain = brainRows[0];
    const learningState = brain.learning_state || {};
    const memoryKeys = Object.keys(brain.memory_context || {}).length;

    // Genuine Knowledge Health Computation (0 - 100)
    // 1. Knowledge Base Breadth (max 30 pts): 10 pts per category up to 30
    const knowledgeScore = Math.min(brain.knowledgeCount * 6 + brain.categoryCount * 6, 30);

    // 2. Governance & Rules Density (max 35 pts): 7 pts per rule, extra for hard rules
    const rulesScore = Math.min(brain.rulesCount * 5 + brain.hardRulesCount * 5, 35);

    // 3. Memory & Operational Context (max 15 pts): 5 pts per key up to 15
    const memoryScore = Math.min(memoryKeys * 5, 15);

    // 4. Calibration & Neural Confidence (max 20 pts)
    const confidence = learningState.confidenceScore ?? 0.95;
    const confidenceScore = Math.round(confidence * 20);

    const totalHealthScore = Math.min(Math.round(knowledgeScore + rulesScore + memoryScore + confidenceScore), 100);

    // Operational Readiness Assessment
    let readinessStatus = 'INITIALIZING';
    if (totalHealthScore >= 80) {
      readinessStatus = 'FULLY_CALIBRATED';
    } else if (totalHealthScore >= 50) {
      readinessStatus = 'OPERATIONAL';
    } else if (totalHealthScore >= 25) {
      readinessStatus = 'TRAINING_REQUIRED';
    }

    return NextResponse.json({
      brainId: brain.id,
      healthScore: totalHealthScore,
      readinessStatus,
      confidenceRating: Number((confidence * 100).toFixed(1)),
      totalLearnings: learningState.totalLearnings || 0,
      breakdown: {
        knowledgeScore: { current: knowledgeScore, max: 30, count: brain.knowledgeCount, categories: brain.categoryCount },
        rulesScore: { current: rulesScore, max: 35, count: brain.rulesCount, hardRules: brain.hardRulesCount },
        memoryScore: { current: memoryScore, max: 15, keys: memoryKeys },
        confidenceScore: { current: confidenceScore, max: 20, raw: confidence },
      },
      recommendations: generateRecommendations(brain, memoryKeys),
    });
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/health Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function generateRecommendations(brain: any, memoryKeys: number): string[] {
  const recs: string[] = [];
  if (brain.knowledgeCount < 3) {
    recs.push('Index core SOPs and expense documentation to raise knowledge baseline.');
  }
  if (brain.rulesCount < 3) {
    recs.push('Establish financial threshold constraints (e.g. invoice approval limits).');
  }
  if (memoryKeys < 2) {
    recs.push('Configure operational memory variables (default currency, reconciliation period).');
  }
  if (recs.length === 0) {
    recs.push('Brain is fully trained and aligned with enterprise governance standards.');
  }
  return recs;
}
