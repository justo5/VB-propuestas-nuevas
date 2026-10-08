import { z } from 'zod';

// Quita caracteres de control y espacios sobrantes antes de validar.
const text = (max: number) =>
  z
    .string()
    .transform((value) => value.replace(/[\u0000-\u001f\u007f]/g, '').trim())
    .pipe(z.string().min(1).max(max));

export const INVERSION_VALUES = ['cero', 'menos-300', '300-700', '700-1500', 'mas-1500'] as const;

export const aplicacionSchema = z.object({
  plan: text(120),
  nombre: text(80),
  apellido: text(80),
  contacto: text(200),
  whatsapp: text(30).pipe(z.string().regex(/^\+?[\d\s()-]{6,30}$/, 'Teléfono inválido')),
  rubro: text(120),
  inversion: z.enum(INVERSION_VALUES),
  consentimiento: z.literal(true),
  // Honeypot: campo oculto que una persona nunca completa.
  website: z.string().max(200).optional(),
  turnstileToken: z.string().max(4096).optional(),
});

export type Aplicacion = z.infer<typeof aplicacionSchema>;
