import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Map of userId → callback function
const subscribers = new Map<string, (data: any) => void>();

// Call this function when you want to send a notification to a specific user
export function publishToUser(userId: string, event: any) {
  const subscriber = subscribers.get(userId);
  if (subscriber) subscriber(event);
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return new Response('Unauthorized', { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return new Response('Unauthorized', { status: 401 });

  const userId = payload.userId;
  const encoder = new TextEncoder();
  let interval: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      // Connection established
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

      // Heartbeat every 30 seconds
      interval = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // Register this user's callback
      subscribers.set(userId, (event) => {
        const message = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(message));
      });

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        subscribers.delete(userId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}