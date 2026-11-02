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
      `SELECT a.*,
              (SELECT count(*)::int FROM automation_tasks at WHERE at.automation_id = a.id) as "tasksCount",
              (SELECT json_agg(json_build_object(
                 'id', at.id,
                 'name', at.name,
                 'taskType', at.task_type,
                 'sequence', at.sequence,
                 'status', at.status
               ) ORDER BY at.sequence ASC) FROM automation_tasks at WHERE at.automation_id = a.id) as tasks
       FROM automations a
       WHERE a.brain_id = $1 AND a.company_id = $2
       ORDER BY a.created_at DESC`,
      [brainId, company.id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/automations Error]', error);
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
    const body = await request.json();

    const {
      name,
      description = '',
      taskType = 'PROCESS_INVOICES',
      requiredApps = [],
      permissions = [],
      triggerType = 'WEBHOOK',
      triggerConfig = {},
      status = 'ACTIVE', // DRAFT | ACTIVE | PAUSED
      config = {},
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Automation name is required' }, { status: 400 });
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

    // Transactional creation of Automation and primary AutomationTask
    const client = await db.getClient();
    let automation: any;

    try {
      await client.query('BEGIN');

      const metadata = {
        taskType,
        requiredApps,
        permissions,
        department: brain.department,
        config,
      };

      const autoRes = await client.query(
        `INSERT INTO automations (
           brain_id, company_id, name, description, trigger_type, trigger_config,
           status, execution_engine, version, metadata
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, 'INTERNAL', 1, $8
         ) RETURNING *`,
        [
          brainId,
          company.id,
          name,
          description,
          triggerType,
          JSON.stringify(triggerConfig),
          status,
          JSON.stringify(metadata),
        ]
      );
      automation = autoRes.rows[0];

      // 2. Insert primary AutomationTask
      await client.query(
        `INSERT INTO automation_tasks (
           automation_id, name, sequence, task_type, config, status, metadata
         ) VALUES (
           $1, $2, 1, $3, $4, 'ACTIVE', $5
         )`,
        [
          automation.id,
          name,
          taskType,
          JSON.stringify(config),
          JSON.stringify({ requiredApps, permissions }),
        ]
      );

      await client.query('COMMIT');
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }

    return NextResponse.json(automation, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/brains/[brainId]/automations Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
