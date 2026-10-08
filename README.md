# VB-propuestas-nuevas

Landing de Vamos Bien con formulario de aplicación.

```
frontend/   Angular + nginx (sirve la landing y hace proxy de /api al backend)
backend/    API en Node (Fastify) que valida y guarda las aplicaciones
            en Postgres; opcionalmente avisa por Telegram
```

## Producción (Docker)

1. Copiá `.env.example` a `.env` y completá `POSTGRES_PASSWORD` (`openssl rand -hex 24`).
2. `docker compose up -d --build`
3. En Nginx Proxy Manager apuntá el dominio a `vb-landing:80` con SSL forzado y HSTS.

Solo `vb-landing` está en la red de Nginx Proxy Manager. La API y la base de datos no publican
puertos, y la base está en una red interna sin salida a internet.

### Ver las aplicaciones recibidas

```bash
docker compose exec vb-db psql -U vb -d vb \
  -c "SELECT id, created_at, plan, nombre, apellido, whatsapp, contacto, rubro, inversion FROM aplicaciones ORDER BY id DESC"
```

Exportar a CSV:

```bash
docker compose exec -T vb-db psql -U vb -d vb \
  -c "\copy (SELECT * FROM aplicaciones ORDER BY id) TO STDOUT WITH CSV HEADER" > aplicaciones.csv
```

### Backup

```bash
docker compose exec -T vb-db pg_dump -U vb vb | gzip > backup-$(date +%F).sql.gz
```

### Opcionales

- **Cloudflare Turnstile** (anti-spam): creá un widget en el panel de Cloudflare y completá
  `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`. Si están vacías, no se exige.
- **Aviso por Telegram**: completá `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`.

## Envío a otro sistema (webhook)

Con `WEBHOOK_URL` y `WEBHOOK_SECRET` en el `.env`, cada aplicación se guarda en Postgres y
después se envía por `POST` a esa URL. Si el otro sistema corre en Docker en el mismo servidor,
poné en `WEBHOOK_NETWORK` el nombre de su red (`docker network ls`) y usá como URL el nombre de
su contenedor, por ejemplo `http://mi-sistema:8080/webhooks/vb`.

Cuerpo del envío:

```json
{
  "evento": "aplicacion.creada",
  "id": 42,
  "createdAt": "2026-10-06T18:49:07.982Z",
  "plan": "Plan de Captación 30 días",
  "nombre": "Ana",
  "apellido": "Pérez",
  "contacto": "@ana",
  "whatsapp": "+598 99 123 456",
  "rubro": "estética",
  "inversion": "300-700",
  "consentimientoAt": "2026-10-06T18:49:07.982Z"
}
```

`inversion` es uno de `cero`, `menos-300`, `300-700`, `700-1500` o `mas-1500`.

Headers:

- `x-vb-event-id`: el id de la aplicación. Puede llegar más de una vez, así que el receptor tiene
  que ignorar los ids que ya procesó.
- `x-vb-timestamp`: segundos Unix del envío.
- `x-vb-signature`: `sha256=` + HMAC-SHA256 en hex de `` `${timestamp}.${body}` `` con `WEBHOOK_SECRET`.

El receptor debe verificar la firma sobre el body **crudo** (sin re-serializar el JSON), rechazar
timestamps de más de 5 minutos y responder 2xx. Cualquier otra respuesta, o no responder en 10 s,
cuenta como fallo y se reintenta con espera creciente (1, 2, 4… minutos, hasta 6 h entre intentos;
máximo 20 intentos). Ejemplo en Node:

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

function firmaValida(rawBody, headers, secret) {
  const ts = headers['x-vb-timestamp'];
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const esperada = 'sha256=' + createHmac('sha256', secret).update(`${ts}.${rawBody}`).digest('hex');
  const recibida = headers['x-vb-signature'] ?? '';
  return esperada.length === recibida.length && timingSafeEqual(Buffer.from(esperada), Buffer.from(recibida));
}
```

Ver envíos pendientes o fallidos:

```bash
docker compose exec vb-db psql -U vb -d vb \
  -c "SELECT id, webhook_intentos, webhook_proximo_at, webhook_error FROM aplicaciones WHERE webhook_enviado_at IS NULL"
```

## Seguridad del formulario

- Validación en el servidor (zod): campos obligatorios, largos máximos, valores permitidos.
- Consultas SQL parametrizadas.
- Límite de 5 envíos por minuto por IP (nginx) y body máximo de 10 KB.
- Honeypot y Turnstile opcional contra bots.
- Consentimiento explícito, guardado con fecha.
- Los secretos solo viven en el `.env` del servidor; nunca en el código de Angular.
- Headers de seguridad (CSP, nosniff, frame-ancestors, etc.) en nginx.
- Los logs no incluyen datos personales.

## Desarrollo local

```bash
# Postgres de desarrollo
docker run -d --name vb-db-dev -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:17-alpine

# Backend (http://localhost:3000)
cd backend && yarn install
DATABASE_URL=postgres://postgres:dev@localhost:5432/postgres yarn dev

# Frontend (http://localhost:4200, /api se redirige al backend)
cd frontend && yarn install && yarn start
```
