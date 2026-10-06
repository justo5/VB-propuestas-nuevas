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
