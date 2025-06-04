import { Hono } from 'hono';
import { handle } from '@hono/node-server/vercel';
import { router as feedRouter } from './feed';

const app = new Hono();

app.route('/v1/feeds', feedRouter);

export default handle(app);
