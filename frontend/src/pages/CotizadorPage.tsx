import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { api } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import type { Cotizacion, Moneda, Partida } from '../types';
import { toNumber } from '../types';
import VistaPreviaCotizacion from '../components/VistaPreviaCotizacion';
import type { DatosPreview } from '../components/VistaPreviaCotizacion';

const schemaCotizacion = z.object({
  clienteNombre: z.string().min(1, 'El nombre del cliente es requerido'),
  partidas: z.array(z.object({
    descripcion: z.string().min(1, 'La descripción es requerida'),
  })).min(1, 'Agrega al menos una partida').refine(
    (partidas) => partidas.some((p) => p.descripcion.trim().length > 0),
    { message: 'Agrega al menos una partida con descripción' },
  ),
});

interface PartidaEditor extends Omit<Partida, 'precioUnitario' | 'totalPartida'> {
  uid: string;
  precioUnitario: number;
  totalPartida: number;
  imagenPreview: string | null;
}

function nuevaPartida(): PartidaEditor {
  return {
    uid: crypto.randomUUID(),
    cantidad: 1,
    codigoProducto: '',
    descripcion: '',
    imagenUrl: undefined,
    imagenPreview: null,
    precioUnitario: 0,
    totalPartida: 0,
  };
}

function calcularTotal(p: PartidaEditor): number {
  return p.cantidad * p.precioUnitario;
}

interface CellInputProps {
  uid: string;
  value: string | number;
  onChange: (uid: string, campo: keyof PartidaEditor, valor: unknown) => void;
}

const CodigoInput = memo(function CodigoInput({ uid, value, onChange }: CellInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(uid, 'codigoProducto', e.target.value)}
      placeholder="SKU-001"
      className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
    />
  );
});

const CantidadInput = memo(function CantidadInput({ uid, value, onChange }: CellInputProps) {
  return (
    <input
      type="number"
      min={1}
      value={value}
      onChange={(e) => onChange(uid, 'cantidad', Number(e.target.value) || 1)}
      className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-1.5 text-center text-sm outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
    />
  );
});

const DescripcionInput = memo(function DescripcionInput({ uid, value, onChange }: CellInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(uid, 'descripcion', e.target.value)}
      placeholder="Descripción del producto"
      className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
    />
  );
});

const PrecioInput = memo(function PrecioInput({ uid, value, onChange }: CellInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        $
      </span>
      <input
        type="number"
        min={0}
        step={0.01}
        value={value}
        onChange={(e) => onChange(uid, 'precioUnitario', Number(e.target.value) || 0)}
        className="w-full rounded-xl border border-gray-200 bg-transparent py-1.5 pl-7 pr-3 text-right text-sm outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
      />
    </div>
  );
});

const col = createColumnHelper<PartidaEditor>();

export default function CotizadorPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const monedaActiva = useAppStore((s) => s.monedaActiva);
  const tipoCambio = useAppStore((s) => s.tipoCambio);
  const alternarMoneda = useAppStore((s) => s.alternarMoneda);
  const setTipoCambio = useAppStore((s) => s.setTipoCambio);

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteContacto, setClienteContacto] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [folio, setFolio] = useState('');
  const [notas, setNotas] = useState('');
  const [partidas, setPartidas] = useState<PartidaEditor[]>([nuevaPartida()]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(editando);
  const [imagenGrande, setImagenGrande] = useState<string | null>(null);
  const [mostrarPreview, setMostrarPreview] = useState(false);

  const fileInputs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (!id) return;
    async function cargar() {
      try {
        const cot = await api.get<Cotizacion>(`/cotizaciones/${id}`);
        setFolio(cot.folio ?? '');
        setClienteNombre(cot.clienteNombre);
        setClienteContacto(cot.clienteContacto ?? '');
        setClienteEmail(cot.clienteEmail ?? '');
        setNotas(cot.notas ?? '');
        if (cot.monedaBase && cot.monedaBase !== monedaActiva) {
          alternarMoneda();
        }
        if (cot.tipoCambioAplicado && Number(cot.tipoCambioAplicado) !== 1) {
          setTipoCambio(Number(cot.tipoCambioAplicado));
        }
        const partidasCargadas: PartidaEditor[] =
          cot.partidas && cot.partidas.length > 0
            ? cot.partidas.map((p) => ({
                uid: crypto.randomUUID(),
                cantidad: p.cantidad,
                codigoProducto: p.codigoProducto ?? '',
                descripcion: p.descripcion,
                imagenUrl: p.imagenUrl ?? undefined,
                imagenPreview: p.imagenUrl ?? null,
                precioUnitario: toNumber(p.precioUnitario),
                totalPartida: toNumber(p.totalPartida ?? p.cantidad * toNumber(p.precioUnitario)),
              }))
            : [nuevaPartida()];
        setPartidas(partidasCargadas);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar la cotización');
        navigate('/');
      } finally {
        setCargando(false);
      }
    }
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const actualizarPartida = useCallback((uid: string, campo: keyof PartidaEditor, valor: unknown) => {
    setPartidas((prev) =>
      prev.map((p) => {
        if (p.uid !== uid) return p;
        const actualizado = { ...p, [campo]: valor };
        if (campo === 'cantidad' || campo === 'precioUnitario') {
          actualizado.totalPartida = calcularTotal(actualizado);
        }
        return actualizado;
      }),
    );
  }, []);

  const convertirMontos = useCallback(
    (partidas: PartidaEditor[], desde: Moneda, hacia: Moneda): PartidaEditor[] => {
      if (desde === hacia) return partidas;
      const factor = hacia === 'USD' ? 1 / tipoCambio : tipoCambio;
      return partidas.map((p) => {
        const nuevoPrecio = p.precioUnitario * factor;
        return {
          ...p,
          precioUnitario: Math.round(nuevoPrecio * 100) / 100,
          totalPartida: p.cantidad * Math.round(nuevoPrecio * 100) / 100,
        };
      });
    },
    [tipoCambio],
  );

  const handleAlternarMoneda = () => {
    const nuevaMoneda = monedaActiva === 'MXN' ? 'USD' : 'MXN';
    setPartidas((prev) => convertirMontos(prev, monedaActiva, nuevaMoneda));
    alternarMoneda();
  };

  const agregarPartida = () => {
    setPartidas((prev) => [...prev, nuevaPartida()]);
  };

  const eliminarPartida = useCallback((uid: string) => {
    setPartidas((prev) => (prev.length <= 1 ? prev : prev.filter((p) => p.uid !== uid)));
  }, []);

  const handleImagen = (uid: string, archivo: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      actualizarPartida(uid, 'imagenUrl', base64);
      actualizarPartida(uid, 'imagenPreview', base64);
    };
    reader.readAsDataURL(archivo);
  };

  const subtotal = partidas.reduce((acc, p) => acc + p.totalPartida, 0);

  const columnas = useMemo<ColumnDef<PartidaEditor, any>[]>(
    () => [
    col.display({
      id: 'imagen',
      header: '',
      size: 160,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center justify-center">
            {p.imagenPreview || p.imagenUrl ? (
              <button
                onClick={() => setImagenGrande(p.imagenPreview ?? p.imagenUrl!)}
                className="group relative"
                title="Ver imagen"
              >
                <img
                  src={p.imagenPreview ?? p.imagenUrl!}
                  alt=""
                  className="h-32 w-32 rounded-xl object-cover shadow-sm transition group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/0 text-white opacity-0 transition group-hover:bg-slate-900/40 group-hover:opacity-100">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </button>
            ) : (
              <button
                onClick={() => fileInputs.current.get(p.uid)?.click()}
                className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-slate-400 hover:text-slate-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            <input
              ref={(el) => { if (el) fileInputs.current.set(p.uid, el); }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) handleImagen(p.uid, archivo);
                e.target.value = '';
              }}
            />
          </div>
        );
      },
    }),
    col.accessor('codigoProducto', {
      header: 'Código',
      size: 130,
      cell: ({ row }) => (
        <CodigoInput
          uid={row.original.uid}
          value={row.original.codigoProducto ?? ''}
          onChange={actualizarPartida}
        />
      ),
    }),
    col.accessor('cantidad', {
      header: 'Cant.',
      size: 80,
      cell: ({ row }) => (
        <CantidadInput
          uid={row.original.uid}
          value={row.original.cantidad}
          onChange={actualizarPartida}
        />
      ),
    }),
    col.accessor('descripcion', {
      header: 'Descripción',
      size: 260,
      cell: ({ row }) => (
        <DescripcionInput
          uid={row.original.uid}
          value={row.original.descripcion}
          onChange={actualizarPartida}
        />
      ),
    }),
    col.accessor('precioUnitario', {
      header: 'P. Unitario',
      size: 130,
      cell: ({ row }) => (
        <PrecioInput
          uid={row.original.uid}
          value={row.original.precioUnitario}
          onChange={actualizarPartida}
        />
      ),
    }),
    col.display({
      id: 'total',
      header: 'Total',
      size: 120,
      cell: ({ row }) => {
        const total = row.original.totalPartida;
        return (
          <span className="block text-right text-sm font-medium text-slate-900">
            {formatoMoneda(total)}
          </span>
        );
      },
    }),
    col.display({
      id: 'acciones',
      header: '',
      size: 48,
      cell: ({ row }) => (
        <button
          onClick={() => eliminarPartida(row.original.uid)}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          title="Eliminar partida"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ),
    }),
    ],
    [],
  );

  const tabla = useReactTable({
    data: partidas,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  });

  function formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: monedaActiva,
    }).format(valor);
  }

  const datosPreview: DatosPreview = useMemo(
    () => ({
      folio,
      clienteNombre,
      clienteContacto,
      clienteEmail,
      notas,
      moneda: monedaActiva,
      tipoCambio,
      partidas: partidas
        .filter((p) => p.descripcion.trim())
        .map((p) => ({
          cantidad: p.cantidad,
          codigoProducto: p.codigoProducto || undefined,
          descripcion: p.descripcion,
          imagenUrl: p.imagenUrl,
          precioUnitario: p.precioUnitario,
          totalPartida: p.totalPartida,
        })),
    }),
    [folio, clienteNombre, clienteContacto, clienteEmail, notas, monedaActiva, tipoCambio, partidas],
  );

  async function handleGuardar() {
    const resultado = schemaCotizacion.safeParse({
      clienteNombre,
      partidas,
    });

    if (!resultado.success) {
      const primerError = resultado.error.issues[0];
      toast.error(primerError.message);
      return;
    }

    setGuardando(true);

    try {
      const payload: Omit<Cotizacion, 'id' | 'fechaCreacion'> & { partidas: Partida[] } = {
        folio: folio.trim() || undefined,
        clienteNombre: clienteNombre.trim(),
        clienteContacto: clienteContacto.trim() || undefined,
        clienteEmail: clienteEmail.trim() || undefined,
        monedaBase: monedaActiva,
        tipoCambioAplicado: monedaActiva === 'USD' ? tipoCambio : 1,
        notas: notas.trim() || undefined,
        partidas: partidas
          .filter((p) => p.descripcion.trim())
          .map((p) => ({
            cantidad: p.cantidad,
            codigoProducto: p.codigoProducto?.trim() || undefined,
            descripcion: p.descripcion.trim(),
            imagenUrl: p.imagenUrl ?? undefined,
            precioUnitario: p.precioUnitario,
          })),
      };

      if (editando && id) {
        await api.put<Cotizacion>(`/cotizaciones/${id}`, payload);
        toast.success('Cotización actualizada correctamente');
      } else {
        await api.post<Cotizacion>('/cotizaciones', payload);
        toast.success('Cotización guardada correctamente');
      }
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar la cotización');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {editando ? 'Editar Cotización' : 'Nueva Cotización'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {editando ? 'Modifica los datos y las partidas' : 'Completa los datos y agrega las partidas'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-full bg-white p-1">
            {(['MXN', 'USD'] as const).map((moneda) => (
              <button
                key={moneda}
                onClick={() => { if (monedaActiva !== moneda) handleAlternarMoneda(); }}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  monedaActiva === moneda
                    ? 'bg-[#1e293b] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {moneda}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
            <span className="text-xs font-medium text-slate-400">Tipo de cambio</span>
            <span className="text-xs text-slate-400">$</span>
            <input
              type="number"
              step={0.01}
              value={tipoCambio}
              onChange={(e) => setTipoCambio(Number(e.target.value))}
              className="w-20 border-0 bg-transparent px-0 text-right text-sm font-semibold text-slate-900 outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {cargando ? (
        <p className="py-10 text-center text-sm text-slate-400">Cargando cotización…</p>
      ) : (
      <>
      <div className="rounded-3xl bg-white p-5 shadow-md">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Folio</label>
            <input
              type="text"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              placeholder="COT-2026-000 (automático si lo dejas vacío)"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Cliente *</label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Nombre de la empresa"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Contacto</label>
            <input
              type="text"
              value={clienteContacto}
              onChange={(e) => setClienteContacto(e.target.value)}
              placeholder="Persona de contacto"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
            <input
              type="email"
              value={clienteEmail}
              onChange={(e) => setClienteEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Notas adicionales</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Tiempo de entrega, garantía..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Partidas</h2>
          <button
            onClick={agregarPartida}
            className="flex items-center gap-1.5 rounded-full bg-[#1e293b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#334155]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {tabla.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  {hg.headers.map((header) => (
                    <th key={header.id} className="pb-3 pr-2" style={{ width: header.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {tabla.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 transition-colors last:border-0 animate-[fade-in_200ms_ease-out] hover:bg-slate-50/60">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 pr-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-end gap-6 border-t border-gray-100 pt-4">
          <div className="text-right">
            <span className="text-xs text-slate-400">Subtotal</span>
            <p className="text-lg font-bold text-slate-900">{formatoMoneda(subtotal)}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Total</span>
            <p className="text-2xl font-bold text-slate-900">{formatoMoneda(subtotal)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setMostrarPreview(true)}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
          title="Ver cómo quedará la cotización"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Vista previa
        </button>
        <button
          onClick={() => navigate('/')}
          className="rounded-full bg-red-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="rounded-full bg-[#1e293b] px-8 py-3 text-base font-semibold text-white transition hover:bg-[#334155] hover:shadow-lg hover:shadow-[#1e293b]/30 disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar cotización'}
        </button>
      </div>
      </>
      )}

      {mostrarPreview && (
        <VistaPreviaCotizacion datos={datosPreview} onCerrar={() => setMostrarPreview(false)} />
      )}

      {imagenGrande && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-6 backdrop-blur-sm"
          onClick={() => setImagenGrande(null)}
        >
          <button
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setImagenGrande(null)}
            title="Cerrar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={imagenGrande}
            alt="Imagen de la pieza"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
