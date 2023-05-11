import crypto from 'node:crypto';

import axios from 'axios';
import type { preHandlerHookHandler } from 'fastify';

export const passwordHandler: preHandlerHookHandler = (req, res, next) => {
  const password = req.session.get('password');

  const loginHtmlPath = '/static/login.ejs';

  if (!password) {
    void res.view(loginHtmlPath, { HCAPTCHA_SITEKEY: process.env.HCAPTCHA_SITEKEY });

    return;
  }

  const isValid = crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(process.env.WEB_PASSWORD),
  );

  if (!isValid) {
    void res.view(loginHtmlPath, { HCAPTCHA_SITEKEY: process.env.HCAPTCHA_SITEKEY });

    return;
  }

  next();
};

export const hcaptchaHandler: preHandlerHookHandler = (req, res, next) => {
  const { hcaptchaToken } = req.body as { hcaptchaToken: string };

  if (!hcaptchaToken) {
    void res.status(400).send({ error: 'No hcaptcha provided' });

    return;
  }

  axios
    .get(
      `https://hcaptcha.com/siteverify?secret=${process.env.HCAPTCHA_SECRETKEY}&response=${hcaptchaToken}`,
    )
    .then(response => {
      const { success } = response.data as { success: boolean };

      if (!success) {
        void res.status(400).send({ error: 'Invalid hcaptcha' });
        return;
      }

      next();
    })
    .catch(() => {
      void res.status(400).send({ error: 'Invalid hcaptcha' });
    });
};
