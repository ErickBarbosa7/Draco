import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Cotizacion } from '../types';
import { toNumber } from '../types';

export default function CotizacionesPage() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [cotAEliminar, setCotAEliminar] = useState<Cotizacion | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const query = new URLSearchParams();
        if (fechaInicio) query.append('fechaInicio', fechaInicio);
        if (fechaFin) query.append('fechaFin', fechaFin);
        const url = `/cotizaciones${query.toString() ? `?${query.toString()}` : ''}`;
        
        const data = await api.get<Cotizacion[]>(url);
        setCotizaciones(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar cotizaciones');
      } finally {
        setCargando(false);
      }
    }
    void cargar();
  }, [fechaInicio, fechaFin]);

  const cotizacionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return cotizaciones;
    return cotizaciones.filter(
      (c) =>
        c.folio?.toLowerCase().includes(q) ||
        c.clienteNombre.toLowerCase().includes(q) ||
        c.clienteContacto?.toLowerCase().includes(q) ||
        c.clienteEmail?.toLowerCase().includes(q) ||
        c.notas?.toLowerCase().includes(q),
    );
  }, [cotizaciones, busqueda]);

  function formatoMonto(cot: Cotizacion): string {
    const monto = toNumber(cot.total);
    const moneda = cot.monedaBase || 'MXN';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda,
    }).format(monto) + ` ${moneda}`;
  }

  async function descargarPdf(cot: Cotizacion) {
    if (!cot.id || !cot.folio) return;
    setDescargandoId(cot.id);
    try {
      await api.download(`/cotizaciones/${cot.id}/pdf`, `${cot.folio}.pdf`);
      toast.success(`PDF descargado: ${cot.folio}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al descargar el PDF');
    } finally {
      setDescargandoId(null);
    }
  }

  async function eliminarCotizacion() {
    if (!cotAEliminar?.id) return;
    setEliminando(true);
    try {
      await api.delete(`/cotizaciones/${cotAEliminar.id}`);
      setCotizaciones((prev) => prev.filter((c) => c.id !== cotAEliminar.id));
      toast.success(`Cotización ${cotAEliminar.folio} eliminada`);
      setCotAEliminar(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar la cotización');
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con toggle de moneda */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cotizaciones</h1>
          <p className="mt-1 text-sm text-slate-500">Histórico de cotizaciones emitidas</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cotizador')}
            className="flex items-center gap-1.5 rounded-full bg-[#1e293b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#334155]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cotización
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por folio, cliente, contacto o email…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
            title="Fecha Inicio"
          />
          <span className="text-slate-400">-</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
            title="Fecha Fin"
          />
        </div>
      </div>

      {/* Tabla dentro de tarjeta flotante */}
      <div className="rounded-3xl bg-white p-6 shadow-md animate-[fade-in_200ms_ease-out]">
        {cargando ? (
          <p className="py-10 text-center text-sm text-slate-400">Cargando cotizaciones…</p>
        ) : cotizaciones.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Aún no hay cotizaciones registradas.
          </p>
        ) : cotizacionesFiltradas.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No se encontraron cotizaciones con «{busqueda}».
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="pb-3">Folio</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Fecha</th>
                <th className="pb-3 text-right">Total</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.map((cot) => (
                <tr key={cot.id} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-slate-50/60">
                  <td className="py-3 font-medium text-slate-900">{cot.folio}</td>
                  <td className="py-3 text-slate-700">{cot.clienteNombre}</td>
                  <td className="py-3 text-slate-500">
                    {cot.fechaCreacion
                      ? new Date(cot.fechaCreacion).toLocaleDateString('es-MX')
                      : '—'}
                  </td>
                  <td className="py-3 text-right font-medium text-slate-900">
                    {formatoMonto(cot)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/cotizador/${cot.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1e293b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#334155]"
                        title="Editar cotización"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => setCotAEliminar(cot)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        title="Eliminar cotización"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                      <button
                        onClick={() => descargarPdf(cot)}
                        disabled={descargandoId === cot.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-gray-50 disabled:opacity-50"
                        title="Descargar PDF"
                      >
                        {descargandoId === cot.id ? (
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!cotAEliminar}
        titulo="Eliminar cotización"
        mensaje={`¿Eliminar la cotización ${cotAEliminar?.folio}? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        onConfirm={eliminarCotizacion}
        onCancel={() => setCotAEliminar(null)}
        loading={eliminando}
      />
    </div>
  );
}