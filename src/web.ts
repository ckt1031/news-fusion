import dayjs from 'dayjs';
import fastify from 'fastify';
import sAgo from 's-ago';

import logging from './utils/logger';

const app = fastify();

const PORT = process.env.PORT ?? 3000;

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
