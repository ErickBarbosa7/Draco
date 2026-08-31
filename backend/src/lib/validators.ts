import { z } from 'zod';

export const emailSchema = z.string().trim().email('El email no es válido').max(254);

export const passwordSchema = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(72);

export const nombreSchema = z.string().trim().min(1, 'El nombre es requerido').max(120);

export const credencialesSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registroSchema = z.object({
  nombre: nombreSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const perfilSchema = z
  .object({
    nombre: nombreSchema,
    email: emailSchema,
    password: passwordSchema.optional().or(z.literal('')),
  })
  .transform((d) => ({ ...d, password: d.password || undefined }));

export const partidaSchema = z.object({
  cantidad: z.number().int().positive('La cantidad debe ser positiva'),
  codigoProducto: z.string().trim().max(60).optional(),
  descripcion: z.string().trim().min(1, 'La descripción es requerida').max(500),
  imagenUrl: z.string().trim().max(1000).optional(),
  precioUnitario: z.number().nonnegative('El precio no puede ser negativo'),
});

export const cotizacionSchema = z.object({
  folio: z.string().trim().max(40).optional(),
  clienteNombre: z.string().trim().min(1, 'El nombre del cliente es requerido').max(120),
  clienteContacto: z.string().trim().max(120).optional(),
  clienteEmail: emailSchema.optional().or(z.literal('')),
  condicionesPago: z.string().trim().max(500).optional(),
  monedaBase: z.enum(['MXN', 'USD']).optional(),
  tipoCambioAplicado: z.number().positive().optional(),
  notas: z.string().trim().max(2000).optional(),
  partidas: z.array(partidaSchema).min(1, 'Se requiere al menos una partida'),
});
