import express from 'express';
import pino from 'pino';

const logger = pino();
const app = express();

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  logger.info('Server is running on port 3000');
});
