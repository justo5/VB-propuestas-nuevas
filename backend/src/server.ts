import Fastify, { type FastifyError } from 'fastify';

import { config } from './config.ts';
import { insertAplicacion, migrate, pool } from './db.ts';
import { notifyTelegram, verifyTurnstile } from './integrations.ts';
import { aplicacionSchema } from './schema.ts';

const app = Fastify({
  bodyLimit: 10 * 1024,
  // Solo confiamos en el nginx del frontend, que está en la misma red de Docker.
  trustProxy: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
  logger: {
    // No registrar datos personales: solo método, ruta y estado.
    serializers: {
      req: (req) => ({ method: req.method, url: req.url }),
    },
  },
});

app.get('/api/health', async () => {
  await pool.query('SELECT 1');
  return { ok: true };
});

app.get('/api/config', async () => ({ turnstileSiteKey: config.turnstileSiteKey }));

app.post('/api/aplicaciones', async (request, reply) => {
  const parsed = aplicacionSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({
      error: 'Datos inválidos',
      campos: [...new Set(parsed.error.issues.map((issue) => issue.path[0]))],
    });
  }
  const data = parsed.data;

  // Los bots que completan el honeypot reciben un OK falso y no se guarda nada.
  if (data.website) {
    return reply.code(201).send({ ok: true });
  }

  if (!(await verifyTurnstile(data.turnstileToken, request.ip))) {
    return reply.code(403).send({ error: 'No pudimos verificar que no seas un robot' });
  }

  const id = await insertAplicacion(data, {
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  });
  request.log.info({ id }, 'aplicación recibida');

  notifyTelegram(id, data).catch((error: Error) =>
    request.log.error({ id, err: error.message }, 'falló el aviso por Telegram'),
  );

  return reply.code(201).send({ ok: true });
});

app.setErrorHandler<FastifyError>((error, request, reply) => {
  const status = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
  if (status === 500) {
    request.log.error(error);
  }
  reply.code(status).send({ error: status === 500 ? 'Error interno' : error.message });
});

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

await migrate();
await app.listen({ host: '0.0.0.0', port: config.port });
