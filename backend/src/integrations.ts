import { config } from './config.ts';
import type { Aplicacion } from './schema.ts';

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  if (!config.turnstileSecretKey) {
    return true;
  }
  if (!token) {
    return false;
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: config.turnstileSecretKey, response: token, remoteip: ip }),
    signal: AbortSignal.timeout(5000),
  });
  const result = (await response.json()) as { success: boolean };
  return result.success === true;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function notifyTelegram(id: number, data: Aplicacion): Promise<void> {
  if (!config.telegramBotToken || !config.telegramChatId) {
    return;
  }

  const text = [
    `<b>Nueva aplicación #${id}</b>`,
    `Plan: ${escapeHtml(data.plan)}`,
    `Nombre: ${escapeHtml(data.nombre)} ${escapeHtml(data.apellido)}`,
    `Sitio/Instagram: ${escapeHtml(data.contacto)}`,
    `WhatsApp: ${escapeHtml(data.whatsapp)}`,
    `Rubro: ${escapeHtml(data.rubro)}`,
    `Inversión: ${escapeHtml(data.inversion)}`,
  ].join('\n');

  const response = await fetch(
    `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: config.telegramChatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!response.ok) {
    throw new Error(`Telegram respondió ${response.status}`);
  }
}
