import express from 'express';
import pino from 'pino';

const app = express();
const logger = pino();

const PORT = process.env.PORT ?? 3000;

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
