import { handle } from '@hono/node-server/vercel';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { secureHeaders } from 'hono/secure-headers';
import { router as cronRouter } from './cron.js';
import { router as feedRouter } from './feed.js';

const app = new Hono();

app.use('*', cors());
app.use('*', etag());
app.use('*', secureHeaders());

app.route('/v1/feeds', feedRouter);
app.route('/v1/cron', cronRouter);

export default handle(app);
