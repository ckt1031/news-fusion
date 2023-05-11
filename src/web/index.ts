import crypto from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';

import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import session from '@fastify/session';
import view from '@fastify/view';
import ws from '@fastify/websocket';
import dayjs from 'dayjs';
import ejs from 'ejs';
import fastify from 'fastify';
import sAgo from 's-ago';

import { getBingResponseWebsocket } from '../ai/edge-gpt';
import { __dirname, isDevelopment } from '../constants';
import logging from '../utils/logger';
import { hcaptchaHandler, passwordHandler } from './handlers';

const app = fastify();

const PORT = process.env.PORT ?? 3000;

await app.register(rateLimit, {
  max: 20,
  timeWindow: '1 minute',
});

await app.register(compress);
await app.register(ws);
await app.register(view, {
  engine: {
    ejs: ejs,
  },
});
await app.register(cookie);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
await app.register(session, {
  cookieName: 'session',
  secret: process.env.WEB_SESSION_TOKEN,
  cookie: {
    secure: !isDevelopment,
    httpOnly: !isDevelopment,
  },
});

declare module 'fastify' {
  interface Session {
    password: string;
  }
}

app.get(
  '/gpt',
  {
    preHandler: passwordHandler,
  },
  async (_, res) => {
    // Send gpt.html in static folder
    const stream = fs.createReadStream(join(__dirname, '../static/gpt.html'));

    await res.type('text/html').send(stream);
  },
);

app.post(
  '/api/logout',
  {
    preHandler: passwordHandler,
  },
  async (req, res) => {
    await req.session.destroy();

    return res.status(200).send({ success: true });
  },
);

app.post(
  '/api/login',
  {
    preHandler: hcaptchaHandler,
  },
  async (req, res) => {
    const { password } = req.body as { password: string };

    if (!password) {
      return res.status(400).send({ error: 'No password provided' });
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(process.env.WEB_PASSWORD),
    );

    if (!isValid) {
      return res.status(401).send({ error: 'Invalid password' });
    }

    req.session.set('password', password);
    await req.session.save();

    return res.status(200).send({ success: true });
  },
);

app.get('/api/bing-ai', { websocket: true, preHandler: passwordHandler }, connection => {
  // the connection will only be opened for authenticated incoming requests
  connection.socket.on('message', async message => {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const data = JSON.parse(message.toString());
    await getBingResponseWebsocket(connection.socket, 'precise', data.prompt as string);
  });
});

app.get('/', () => {
  return 'Hello World!';
});

app.get('/versions', () => {
  return {
    server: process.versions,
  };
});

app.get('/uptime', () => {
  return {
    instance: sAgo(dayjs().subtract(process.uptime(), 'second').toDate()),
  };
});

app.listen(
  {
    port: Number(PORT),
    host: '0.0.0.0',
  },
  () => {
    logging.info(`SERVER: Server is running on port ${PORT}`);
  },
);
