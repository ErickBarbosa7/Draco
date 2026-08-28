import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { verificarToken } from '../middleware/auth.middleware.js';
import { generarPDF } from '../services/pdf.service.js';
import type { Moneda } from '@prisma/client';

const router = Router();
router.use(verificarToken);

interface PartidaInput {
  cantidad: number;
  codigoProducto?: string;
  descripcion: string;
  imagenUrl?: string;
  precioUnitario: number;
}

function generarFolio(): string {
  const anio = new Date().getFullYear();
  const aleatorio = Math.floor(Math.random() * 900 + 100);
  return `COT-${anio}-${aleatorio}`;
}

function calcularPartidas(partidas: PartidaInput[]) {
  return partidas.map((p) => ({
    ...p,
    totalPartida: p.cantidad * p.precioUnitario,
  }));
}

// GET /api/cotizaciones
router.get('/', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Construir la condición de filtrado por fecha
    let whereClause = {};
    if (fechaInicio || fechaFin) {
      whereClause = {
        fechaCreacion: {
          ...(fechaInicio ? { gte: new Date(fechaInicio as string) } : {}),
          ...(fechaFin ? { lte: new Date(fechaFin as string) } : {}),
        },
      };
    }

    const cotizaciones = await prisma.cotizacion.findMany({
      where: whereClause,
      include: { usuario: { select: { nombre: true } } },
      orderBy: { fechaCreacion: 'desc' },
    });

    res.json(cotizaciones);
  } catch (error) {
    console.error('Error al listar cotizaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/cotizaciones/:id
router.get('/:id', async (req, res) => {
  try {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: Number(req.params.id) },
      include: { partidas: true, usuario: { select: { nombre: true, email: true } } },
    });

    if (!cotizacion) {
      res.status(404).json({ error: 'Cotización no encontrada' });
      return;
    }

    res.json(cotizacion);
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/cotizaciones/:id/pdf
router.get('/:id/pdf', async (req, res) => {
  try {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: Number(req.params.id) },
      include: { partidas: true, usuario: { select: { nombre: true } } },
    });

    if (!cotizacion) {
      res.status(404).json({ error: 'Cotización no encontrada' });
      return;
    }

    const pdfBuffer = await generarPDF({
      folio: cotizacion.folio,
      fechaCreacion: new Date(cotizacion.fechaCreacion).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      clienteNombre: cotizacion.clienteNombre,
      clienteContacto: cotizacion.clienteContacto ?? undefined,
      clienteEmail: cotizacion.clienteEmail ?? undefined,
      condicionesPago: cotizacion.condicionesPago ?? undefined,
      monedaBase: cotizacion.monedaBase,
      tipoCambioAplicado: Number(cotizacion.tipoCambioAplicado),
      notas: cotizacion.notas ?? undefined,
      subtotal: Number(cotizacion.subtotal),
      total: Number(cotizacion.total),
      partidas: cotizacion.partidas.map((p) => ({
        cantidad: p.cantidad,
        codigoProducto: p.codigoProducto ?? undefined,
        descripcion: p.descripcion,
        imagenUrl: p.imagenUrl ?? undefined,
        precioUnitario: Number(p.precioUnitario),
        totalPartida: Number(p.totalPartida),
      })),
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cotizacion.folio}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({
      error: 'Error al generar el PDF',
      detalle: error instanceof Error ? error.message : String(error),
    });
  }
});

// POST /api/cotizaciones
router.post('/', async (req, res) => {
  try {
    const {
      folio,
      clienteNombre,
      clienteContacto,
      clienteEmail,
      condicionesPago,
      monedaBase,
      tipoCambioAplicado,
      notas,
      partidas,
    } = req.body as {
      folio?: string;
      clienteNombre?: string;
      clienteContacto?: string;
      clienteEmail?: string;
      condicionesPago?: string;
      monedaBase?: Moneda;
      tipoCambioAplicado?: number;
      notas?: string;
      partidas?: PartidaInput[];
    };

    if (!clienteNombre || !partidas || partidas.length === 0) {
      res.status(400).json({ error: 'clienteNombre y al menos una partida son requeridos' });
      return;
    }

    const folioFinal = (folio ?? '').trim() || generarFolio();

    const existeFolio = await prisma.cotizacion.findUnique({
      where: { folio: folioFinal },
    });
    if (existeFolio) {
      res.status(409).json({ error: `El folio «${folioFinal}» ya está en uso` });
      return;
    }

    const partidasCalculadas = calcularPartidas(partidas);
    const subtotal = partidasCalculadas.reduce((acc, p) => acc + p.totalPartida, 0);

    const cotizacion = await prisma.cotizacion.create({
      data: {
        folio: folioFinal,
        usuarioId: req.usuario!.sub,
        clienteNombre,
        clienteContacto,
        clienteEmail,
        condicionesPago,
        monedaBase: monedaBase ?? 'MXN',
        tipoCambioAplicado: tipoCambioAplicado ?? 1,
        notas,
        subtotal,
        total: subtotal,
        partidas: {
          create: partidasCalculadas.map((p) => ({
            cantidad: p.cantidad,
            codigoProducto: p.codigoProducto,
            descripcion: p.descripcion,
            imagenUrl: p.imagenUrl,
            precioUnitario: p.precioUnitario,
            totalPartida: p.totalPartida,
          })),
        },
      },
      include: { partidas: true },
    });

    res.status(201).json(cotizacion);
  } catch (error) {
    console.error('Error al crear cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/cotizaciones/:id
router.put('/:id', async (req, res) => {
  try {
    const existente = await prisma.cotizacion.findUnique({
      where: { id: Number(req.params.id) },
 include: { partidas: true },
    });

    if (!existente) {
      res.status(404).json({ error: 'Cotización no encontrada' });
      return;
    }

    const {
      folio,
      clienteNombre,
      clienteContacto,
      clienteEmail,
      condicionesPago,
      tipoCambioAplicado,
      notas,
      partidas,
    } = req.body as {
      folio?: string;
      clienteNombre?: string;
      clienteContacto?: string;
      clienteEmail?: string;
      condicionesPago?: string;
      tipoCambioAplicado?: number;
      notas?: string;
      partidas?: PartidaInput[];
    };

    const folioFinal = folio ? folio.trim() : undefined;
    if (folioFinal) {
      const existeFolio = await prisma.cotizacion.findFirst({
        where: { folio: folioFinal, NOT: { id: existente.id } },
      });
      if (existeFolio) {
        res.status(409).json({ error: `El folio «${folioFinal}» ya está en uso` });
        return;
      }
    }

    const data: Record<string, unknown> = {
      folio: folioFinal ?? existente.folio,
      clienteNombre: clienteNombre ?? existente.clienteNombre,
      clienteContacto: clienteContacto ?? existente.clienteContacto,
      clienteEmail: clienteEmail ?? existente.clienteEmail,
      condicionesPago: condicionesPago ?? existente.condicionesPago,
      tipoCambioAplicado: tipoCambioAplicado ?? existente.tipoCambioAplicado,
      notas: notas ?? existente.notas,
    };

    if (partidas && partidas.length > 0) {
      const partidasCalculadas = calcularPartidas(partidas);
      const subtotal = partidasCalculadas.reduce((acc, p) => acc + p.totalPartida, 0);
      data.subtotal = subtotal;
      data.total = subtotal;

      // Reemplazo de partidas dentro de una transacción
      const [, actualizada] = await prisma.$transaction([
        prisma.partida.deleteMany({ where: { cotizacionId: existente.id } }),
        prisma.cotizacion.update({
          where: { id: existente.id },
          data: {
            ...data,
            partidas: {
              create: partidasCalculadas.map((p) => ({
                cantidad: p.cantidad,
                codigoProducto: p.codigoProducto,
                descripcion: p.descripcion,
                imagenUrl: p.imagenUrl,
                precioUnitario: p.precioUnitario,
                totalPartida: p.totalPartida,
              })),
            },
          },
          include: { partidas: true },
        }),
      ]);

      res.json(actualizada);
      return;
    }

    const actualizada = await prisma.cotizacion.update({
      where: { id: existente.id },
      data,
      include: { partidas: true },
    });

    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existente = await prisma.cotizacion.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existente) {
      res.status(404).json({ error: 'Cotización no encontrada' });
      return;
    }

    await prisma.cotizacion.delete({ where: { id: existente.id } });
    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar cotización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;