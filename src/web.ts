import express from 'express';

import logging from './utils/logger';

const app = express();

const PORT = process.env.PORT ?? 3000;

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  logging.info(`Server is running on port ${PORT}`);
});
