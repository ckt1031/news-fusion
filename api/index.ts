import { handle } from '@hono/node-server/vercel';
import { Hono } from 'hono';
import { router as feedRouter } from './feed.js';

const app = new Hono();

app.route('/v1/feeds', feedRouter);

export default handle(app);
