import { createHmac } from 'node:crypto';

import { config } from './config.ts';
import { pool } from './db.ts';

const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 60_000;

interface PendingRow {
  id: string;
  created_at: Date;
  plan: string;
  nombre: string;
  apellido: string;
  contacto: string;
  whatsapp: string;
  rubro: string;
  inversion: string;
  consentimiento_at: Date;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  webhook_intentos: number;
}

type Logger = { info: (obj: object, msg: string) => void; error: (obj: object, msg: string) => void };

let running = false;
let pendingKick = false;
let logger: Logger = console as unknown as Logger;

/** Arranca el reintento periódico de envíos pendientes. */
export function startWebhookWorker(log: Logger): void {
  if (!config.webhookUrl) {
    return;
  }
  logger = log;
  kickWebhook();
  setInterval(kickWebhook, POLL_INTERVAL_MS).unref();
}

/** Procesa los envíos pendientes ya (por ejemplo, justo después de guardar una aplicación). */
export function kickWebhook(): void {
  if (!config.webhookUrl) {
    return;
  }
  if (running) {
    pendingKick = true;
    return;
  }
  running = true;
  processPending()
    .catch((error: Error) => logger.error({ err: error.message }, 'error procesando webhooks'))
    .finally(() => {
      running = false;
      if (pendingKick) {
        pendingKick = false;
        kickWebhook();
      }
    });
}

async function processPending(): Promise<void> {
  // Reserva las filas por 2 minutos para que nadie más las envíe en paralelo.
  const { rows } = await pool.query<PendingRow>(
    `UPDATE aplicaciones SET webhook_proximo_at = now() + interval '2 minutes'
     WHERE id IN (
       SELECT id FROM aplicaciones
       WHERE webhook_enviado_at IS NULL
         AND webhook_intentos < $1
         AND webhook_proximo_at <= now()
       ORDER BY id
       LIMIT $2
       FOR UPDATE SKIP LOCKED
     )
     RETURNING id, created_at, plan, nombre, apellido, contacto, whatsapp, rubro, inversion,
               consentimiento_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
               webhook_intentos`,
    [MAX_ATTEMPTS, BATCH_SIZE],
  );

  for (const row of rows) {
    try {
      await send(row);
      await pool.query(
        `UPDATE aplicaciones
         SET webhook_enviado_at = now(), webhook_intentos = webhook_intentos + 1, webhook_error = NULL
         WHERE id = $1`,
        [row.id],
      );
      logger.info({ id: Number(row.id) }, 'aplicación enviada al sistema externo');
    } catch (error) {
      const attempts = row.webhook_intentos + 1;
      // Espera creciente: 1, 2, 4, 8... minutos, con un máximo de 6 horas.
      const delayMinutes = Math.min(2 ** (attempts - 1), 360);
      const message = (error as Error).message.slice(0, 500);
      await pool.query(
        `UPDATE aplicaciones
         SET webhook_intentos = $2,
             webhook_proximo_at = now() + make_interval(mins => $3),
             webhook_error = $4
         WHERE id = $1`,
        [row.id, attempts, delayMinutes, message],
      );
      logger.error(
        { id: Number(row.id), intento: attempts, err: message },
        attempts >= MAX_ATTEMPTS
          ? 'webhook abandonado tras el máximo de intentos'
          : `webhook falló, se reintenta en ${delayMinutes} min`,
      );
    }
  }

  // Si se llenó el lote puede haber más pendientes.
  if (rows.length === BATCH_SIZE) {
    pendingKick = true;
  }
}

async function send(row: PendingRow): Promise<void> {
  const body = JSON.stringify({
    evento: 'aplicacion.creada',
    id: Number(row.id),
    createdAt: row.created_at.toISOString(),
    plan: row.plan,
    nombre: row.nombre,
    apellido: row.apellido,
    contacto: row.contacto,
    whatsapp: row.whatsapp,
    rubro: row.rubro,
    inversion: row.inversion,
    consentimientoAt: row.consentimiento_at.toISOString(),
    utm: {
      source: row.utm_source,
      medium: row.utm_medium,
      campaign: row.utm_campaign,
      content: row.utm_content,
      term: row.utm_term,
    },
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac('sha256', config.webhookSecret!)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  const response = await fetch(config.webhookUrl!, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-vb-event-id': row.id,
      'x-vb-timestamp': timestamp,
      'x-vb-signature': `sha256=${signature}`,
    },
    body,
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    // Guardamos el principio de la respuesta para saber por qué la rechazó.
    const detail = (await response.text().catch(() => '')).slice(0, 300);
    throw new Error(`El sistema externo respondió ${response.status}${detail ? `: ${detail}` : ''}`);
  }
}
