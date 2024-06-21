import { handle } from 'hono/vercel';
import app from './app';

// Now use Node.js runtime for the app
export const runtime = 'edge'; // "nodejs"
// export const maxDuration = 60;
// export const preferredRegion = ['sin1', 'kix1'];

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);
