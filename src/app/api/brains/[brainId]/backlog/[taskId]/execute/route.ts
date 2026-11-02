import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ brainId: string; taskId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId, taskId } = await params;

    // Verify task belongs to Brain
    const taskRows = await db.query(
      `SELECT at.*, a.name as automation_name, a.company_id
       FROM automation_tasks at
       JOIN automations a ON a.id = at.automation_id
       WHERE at.id = $1 AND a.brain_id = $2 AND a.company_id = $3`,
      [taskId, brainId, company.id]
    );

    if (taskRows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const existingTask = taskRows[0];
    const currentMetadata = existingTask.metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      startedAt: new Date().toISOString(),
    };

    // Transition status to IN_PROGRESS
    const updated = await db.query(
      `UPDATE automation_tasks
       SET status = 'IN_PROGRESS', metadata = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedMetadata), taskId]
    );

    return NextResponse.json({
      success: true,
      task: updated[0],
      message: `Task "${existingTask.name}" is now IN_PROGRESS.`,
    });
  } catch (error: any) {
    console.error('[POST /api/brains/[brainId]/backlog/[taskId]/execute Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
