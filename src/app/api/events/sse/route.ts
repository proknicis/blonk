import { NextRequest } from 'next/server';
import { automationEventBus } from '@/lib/automation-os';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
        start(controller) {
            // Send connection established event
            controller.enqueue(encoder.encode('data: {"status":"connected"}\n\n'));

            // Heartbeat
            const keepAlive = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(': keepalive\n\n'));
                } catch {
                    // Controller might be closed
                    clearInterval(keepAlive);
                }
            }, 15000);

            const pushEvent = (eventType: string, payload: any) => {
                if (!teamId || payload.teamId === teamId) {
                    try {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ eventType, ...payload })}\n\n`));
                    } catch {
                        // Controller might be closed
                    }
                }
            };

            const handler1 = (p: any) => pushEvent('execution.queued', p);
            const handler2 = (p: any) => pushEvent('execution.started', p);
            const handler3 = (p: any) => pushEvent('execution.completed', p);
            const handler4 = (p: any) => pushEvent('execution.failed', p);

            automationEventBus.subscribe('execution.queued', handler1);
            automationEventBus.subscribe('execution.started', handler2);
            automationEventBus.subscribe('execution.completed', handler3);
            automationEventBus.subscribe('execution.failed', handler4);

            request.signal.addEventListener('abort', () => {
                clearInterval(keepAlive);
                automationEventBus.unsubscribe('execution.queued', handler1);
                automationEventBus.unsubscribe('execution.started', handler2);
                automationEventBus.unsubscribe('execution.completed', handler3);
                automationEventBus.unsubscribe('execution.failed', handler4);
                try {
                    controller.close();
                } catch {}
            });
        }
    });

    return new Response(customReadable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
