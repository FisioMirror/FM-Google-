import type { Plugin } from 'vite';
import sendTokenHandler from './api/send-token-resend.js';
import sendSmtpHandler from './api/send-patient-invite-smtp.js';
import verifyTurnstileHandler from './api/verify-turnstile.js';
import sendSecurityEmailHandler from './api/send-security-email.js';
import emailDiagnosticsHandler from './api/email-diagnostics.js';
import sendPasswordResetHandler from './api/send-password-reset.js';
import processPasswordResetHandler from './api/process-password-reset.js';

export function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        // Helper to mimic express-like res object for handlers
        const resProxy = Object.assign(res, {
          status(code: number) {
            res.statusCode = code;
            return resProxy;
          },
          json(data: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return resProxy;
          },
        });

        // Parse JSON body for POST/PUT requests
        let body: any = {};
        if (req.method === 'POST' || req.method === 'PUT') {
          try {
            const chunks: Uint8Array[] = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const rawBody = Buffer.concat(chunks).toString();
            if (rawBody) {
              body = JSON.parse(rawBody);
            }
          } catch (e) {
            console.warn('[apiDevPlugin] Failed parsing JSON body:', e);
          }
        }

        const reqProxy = Object.assign(req, {
          body,
          query: Object.fromEntries(url.searchParams.entries()),
        });

        try {
          if (pathname === '/api/send-token-resend') {
            await sendTokenHandler(reqProxy as any, resProxy as any);
            return;
          }
          if (pathname === '/api/send-patient-invite-smtp') {
            await sendSmtpHandler(reqProxy as any, resProxy as any);
            return;
          }
          if (pathname === '/api/verify-turnstile') {
            await verifyTurnstileHandler(reqProxy as any, resProxy as any);
            return;
          }
          if (pathname === '/api/send-security-email') {
            await sendSecurityEmailHandler(reqProxy as any, resProxy as any);
            return;
          }
          if (pathname === '/api/email-diagnostics') {
            await emailDiagnosticsHandler(reqProxy as any, resProxy as any);
            return;
          }
          if (pathname === '/api/send-password-reset') {
            await sendPasswordResetHandler(reqProxy as any, resProxy as any);
            return;
          }
          if (pathname === '/api/process-password-reset') {
            await processPasswordResetHandler(reqProxy as any, resProxy as any);
            return;
          }
        } catch (err: any) {
          console.error(`[apiDevPlugin] Error handling ${pathname}:`, err);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal API Error' }));
          }
          return;
        }

        next();
      });
    },
  };
}
