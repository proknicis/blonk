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

    const rows = await db.query(
      `SELECT b.id, b.name, b.department, b.status, b.learning_state,
              (SELECT count(*)::int FROM brain_knowledge bk WHERE bk.brain_id = b.id) as "knowledgeCount",
              (SELECT count(*)::int FROM brain_rules br WHERE br.brain_id = b.id) as "rulesCount"
       FROM brains b
       WHERE b.id = $1 AND b.company_id = $2`,
      [brainId, company.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const brain = rows[0];
    const learningState = brain.learning_state || {};

    return NextResponse.json({
      brainId: brain.id,
      department: brain.department,
      status: brain.status,
      confidenceScore: learningState.confidenceScore ?? 0.98,
      totalLearnings: learningState.totalLearnings ?? 0,
      trainingStatus: learningState.status || 'CALIBRATED',
      lastReflectionAt: learningState.lastReflectionAt || brain.updated_at,
      knowledgeCount: brain.knowledgeCount,
      rulesCount: brain.rulesCount,
      details: learningState,
    });
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/training Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

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

    // Fetch current brain stats
    const rows = await db.query(
      `SELECT b.id, b.learning_state,
              (SELECT count(*)::int FROM brain_knowledge bk WHERE bk.brain_id = b.id) as "knowledgeCount",
              (SELECT count(*)::int FROM brain_rules br WHERE br.brain_id = b.id) as "rulesCount"
       FROM brains b
       WHERE b.id = $1 AND b.company_id = $2`,
      [brainId, company.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const brain = rows[0];
    const currentLearning = brain.learning_state || {};
    const newTotalLearnings = (currentLearning.totalLearnings || 0) + 1;
    
    // Confidence score improves as knowledge and rules are established
    const baseScore = 0.95;
    const knowledgeBonus = Math.min(brain.knowledgeCount * 0.005, 0.03);
    const rulesBonus = Math.min(brain.rulesCount * 0.005, 0.019);
    const newConfidenceScore = Math.min(Number((baseScore + knowledgeBonus + rulesBonus).toFixed(4)), 0.9999);

    const updatedLearningState = {
      ...currentLearning,
      totalLearnings: newTotalLearnings,
      confidenceScore: newConfidenceScore,
      status: 'CALIBRATED',
      lastReflectionAt: new Date().toISOString(),
      lastCalibrationMetrics: {
        knowledgeCount: brain.knowledgeCount,
        rulesCount: brain.rulesCount,
        calibratedAt: new Date().toISOString(),
      },
    };

    await db.query(
      `UPDATE brains 
       SET learning_state = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND company_id = $3`,
      [JSON.stringify(updatedLearningState), brainId, company.id]
    );

    return NextResponse.json({
      success: true,
      confidenceScore: newConfidenceScore,
      totalLearnings: newTotalLearnings,
      trainingStatus: 'CALIBRATED',
      lastReflectionAt: updatedLearningState.lastReflectionAt,
    });
  } catch (error: any) {
    console.error('[POST /api/brains/[brainId]/training Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
