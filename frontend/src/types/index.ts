export type Moneda = 'MXN' | 'USD';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface Partida {
  id?: number;
  cantidad: number;
  codigoProducto?: string;
  descripcion: string;
  imagenUrl?: string;
  precioUnitario: number | string;
  totalPartida?: number | string;
}

export interface Cotizacion {
  id?: number;
  folio?: string;
  clienteNombre: string;
  clienteContacto?: string;
  clienteEmail?: string;
  condicionesPago?: string;
  monedaBase?: Moneda;
  tipoCambioAplicado?: number | string;
  vigenciaDias?: number;
  notas?: string;
  subtotal?: number | string;
  total?: number | string;
  fechaCreacion?: string;
  partidas: Partida[];
}

export function toNumber(valor: number | string | undefined): number {
  if (valor === undefined || valor === null) return 0;
  return Number(valor);
}
