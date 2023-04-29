import dayjs from 'dayjs';
import express from 'express';
import sAgo from 's-ago';

import logging from './utils/logger';

const app = express();

const PORT = process.env.PORT ?? 3000;

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.get('/versions', (_, res) => {
  res.send({
    server: process.versions,
  });
});

app.get('/uptime', (_, res) => {
  res.send({
    uptime: sAgo(dayjs().subtract(process.uptime(), 'second').toDate()),
  });
});

app.listen(PORT, () => {
  logging.info(`SERVER: Server is running on port ${PORT}`);
});
