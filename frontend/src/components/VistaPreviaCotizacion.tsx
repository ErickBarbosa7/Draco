import { useEffect } from 'react';
import type { Moneda } from '../types';

export interface PartidaPreview {
  cantidad: number;
  codigoProducto?: string;
  descripcion: string;
  imagenUrl?: string;
  precioUnitario: number;
  totalPartida: number;
}

export interface DatosPreview {
  folio: string;
  clienteNombre: string;
  clienteContacto: string;
  clienteEmail: string;
  notas: string;
  moneda: Moneda;
  tipoCambio: number;
  partidas: PartidaPreview[];
}

interface Props {
  datos: DatosPreview;
  onCerrar: () => void;
}

export default function VistaPreviaCotizacion({ datos, onCerrar }: Props) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [onCerrar]);

  const formatoMoneda = (valor: number): string =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: datos.moneda }).format(valor);

  const subtotal = datos.partidas.reduce((acc, p) => acc + p.totalPartida, 0);
  const fecha = new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const vigencia = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={onCerrar}
    >
      <div className="mx-auto max-w-3xl">
        {/* Barra de acciones */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-white/80">
            Vista previa del documento · así se verá tu cotización
          </span>
          <button
            onClick={onCerrar}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            title="Cerrar (Esc)"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Documento */}
        <div
          className="animate-[fade-in_200ms_ease-out] rounded-2xl bg-white p-8 shadow-2xl sm:p-12"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Encabezado */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Draco</h2>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">Cotización</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {datos.folio.trim() || 'COT — (automático al guardar)'}
              </p>
              <p className="mt-1 text-xs text-slate-400">Fecha: {fecha}</p>
              <p className="text-xs text-slate-400">Vigencia (30 días): {vigencia}</p>
            </div>
          </div>

          {/* Datos del cliente y moneda */}
          <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Cliente</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {datos.clienteNombre.trim() || '—'}
              </p>
              {datos.clienteContacto.trim() && (
                <p className="text-sm text-slate-500">{datos.clienteContacto}</p>
              )}
              {datos.clienteEmail.trim() && (
                <p className="text-sm text-slate-500">{datos.clienteEmail}</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Moneda</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{datos.moneda}</p>
              {datos.moneda === 'USD' && (
                <p className="text-xs text-slate-400">
                  Tipo de cambio aplicado: ${datos.tipoCambio.toFixed(2)} MXN/USD
                </p>
              )}
            </div>
          </div>

          {/* Partidas */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="pb-2">Cant.</th>
                <th className="pb-2">Código</th>
                <th className="pb-2">Descripción</th>
                <th className="pb-2 text-right">P. Unitario</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {datos.partidas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    Sin partidas con descripción
                  </td>
                </tr>
              ) : (
                datos.partidas.map((p, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-2.5 align-top text-slate-700">{p.cantidad}</td>
                    <td className="py-2.5 align-top text-slate-500">{p.codigoProducto || '—'}</td>
                    <td className="py-2.5 align-top text-slate-900">
                      <div className="flex items-center gap-3">
                        {p.imagenUrl && (
                          <img
                            src={p.imagenUrl}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <span>{p.descripcion}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right align-top text-slate-700">
                      {formatoMoneda(p.precioUnitario)}
                    </td>
                    <td className="py-2.5 text-right align-top font-medium text-slate-900">
                      {formatoMoneda(p.totalPartida)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totales */}
          <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium text-slate-900">{formatoMoneda(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Total</span>
                <span className="text-xl font-bold text-slate-900">{formatoMoneda(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {datos.notas.trim() && (
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Notas</p>
              <p className="mt-1 text-sm text-slate-600">{datos.notas}</p>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-slate-300">
            Documento generado por Draco · Vista previa (el PDF oficial se genera al guardar)
          </p>
        </div>
      </div>
    </div>
  );
}