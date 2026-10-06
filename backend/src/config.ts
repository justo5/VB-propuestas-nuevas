function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

function optional(name: string): string | null {
  return process.env[name] || null;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  // Si no se definen, se desactiva la verificación de Turnstile / el aviso por Telegram.
  turnstileSiteKey: optional('TURNSTILE_SITE_KEY'),
  turnstileSecretKey: optional('TURNSTILE_SECRET_KEY'),
  telegramBotToken: optional('TELEGRAM_BOT_TOKEN'),
  telegramChatId: optional('TELEGRAM_CHAT_ID'),
  // Si no se define WEBHOOK_URL, no se envían las aplicaciones a otro sistema.
  webhookUrl: optional('WEBHOOK_URL'),
  webhookSecret: optional('WEBHOOK_SECRET'),
};

if (config.webhookUrl && (!config.webhookSecret || config.webhookSecret.length < 32)) {
  throw new Error('WEBHOOK_SECRET es obligatorio (mínimo 32 caracteres) si se define WEBHOOK_URL');
}
