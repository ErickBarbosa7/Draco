import { useEffect } from 'react';
import type { Moneda } from '../types';
import { plantillaCotizacion } from '../lib/plantillaCotizacion';

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

  const subtotal = datos.partidas.reduce((acc, p) => acc + p.totalPartida, 0);
  const fecha = new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const htmlContent = plantillaCotizacion({
    folio: datos.folio.trim() || 'COT-BORRADOR',
    fechaCreacion: fecha,
    clienteNombre: datos.clienteNombre.trim() || 'Sin Nombre',
    clienteContacto: datos.clienteContacto.trim() || undefined,
    clienteEmail: datos.clienteEmail.trim() || undefined,
    monedaBase: datos.moneda,
    tipoCambioAplicado: datos.tipoCambio,
    notas: datos.notas.trim() || undefined,
    subtotal: subtotal,
    total: subtotal, // Assuming taxes are not calculated, subtotal=total
    partidas: datos.partidas
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

        {/* Documento PDF en iframe */}
        <div 
          className="animate-[fade-in_200ms_ease-out] rounded-2xl bg-white shadow-2xl overflow-hidden" 
          style={{ height: '80vh', minHeight: '600px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <iframe 
            srcDoc={htmlContent}
            title="Vista Previa PDF"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}