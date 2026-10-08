import pg from 'pg';

import { config } from './config.ts';
import type { Aplicacion } from './schema.ts';

export const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 5 });

// Una conexión inactiva que se cae no debe tumbar el proceso; el pool abre otra.
pool.on('error', (error) => console.error('Error en conexión inactiva de Postgres:', error.message));

export async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS aplicaciones (
      id          BIGSERIAL PRIMARY KEY,
      plan        TEXT NOT NULL,
      nombre      TEXT NOT NULL,
      apellido    TEXT NOT NULL,
      contacto    TEXT NOT NULL,
      whatsapp    TEXT NOT NULL,
      rubro       TEXT NOT NULL,
      inversion   TEXT NOT NULL,
      consentimiento_at TIMESTAMPTZ NOT NULL,
      ip          INET,
      user_agent  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // Estado del envío al sistema externo (webhook).
  await pool.query(`
    ALTER TABLE aplicaciones
      ADD COLUMN IF NOT EXISTS webhook_enviado_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS webhook_intentos   INT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS webhook_proximo_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS webhook_error      TEXT
  `);
  // De qué campaña / anuncio llegó (parámetros utm_* de la URL).
  await pool.query(`
    ALTER TABLE aplicaciones
      ADD COLUMN IF NOT EXISTS utm_source   TEXT,
      ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
      ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
      ADD COLUMN IF NOT EXISTS utm_content  TEXT,
      ADD COLUMN IF NOT EXISTS utm_term     TEXT
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS aplicaciones_webhook_pendientes
      ON aplicaciones (webhook_proximo_at) WHERE webhook_enviado_at IS NULL
  `);
}

export async function insertAplicacion(
  data: Aplicacion,
  meta: { ip: string; userAgent: string | undefined },
): Promise<number> {
  // Consulta parametrizada: los valores nunca se concatenan al SQL.
  const result = await pool.query<{ id: string }>(
    `INSERT INTO aplicaciones
       (plan, nombre, apellido, contacto, whatsapp, rubro, inversion, consentimiento_at, ip, user_agent,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now(), $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [
      data.plan,
      data.nombre,
      data.apellido,
      data.contacto,
      data.whatsapp,
      data.rubro,
      data.inversion,
      meta.ip,
      meta.userAgent?.slice(0, 300) ?? null,
      data.utm?.source ?? null,
      data.utm?.medium ?? null,
      data.utm?.campaign ?? null,
      data.utm?.content ?? null,
      data.utm?.term ?? null,
    ],
  );
  return Number(result.rows[0].id);
}
