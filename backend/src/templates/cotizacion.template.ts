export function plantillaCotizacion(data: {
  folio: string;
  fechaCreacion: string;
  clienteNombre: string;
  clienteContacto?: string;
  clienteEmail?: string;
  condicionesPago?: string;
  monedaBase: string;
  tipoCambioAplicado: number;
  vigenciaDias: number;
  notas?: string;
  subtotal: number;
  total: number;
  vendedorNombre: string;
  partidas: {
    cantidad: number;
    codigoProducto?: string;
    descripcion: string;
    imagenUrl?: string;
    precioUnitario: number;
    totalPartida: number;
  }[];
}): string {
  const simbolo = data.monedaBase === 'USD' ? 'USD' : 'MXN';
  const fmt = (v: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: data.monedaBase }).format(v);

  const filasPartidas = data.partidas
    .map(
      (p, i) => `
      <tr>
        <td class="cell center">${i + 1}</td>
        <td class="cell center">
          ${p.imagenUrl ? `<img src="${p.imagenUrl}" class="thumb" />` : '<span class="no-img">—</span>'}
        </td>
        <td class="cell">${p.codigoProducto || '—'}</td>
        <td class="cell center">${p.cantidad}</td>
        <td class="cell">${p.descripcion}</td>
        <td class="cell right">${fmt(p.precioUnitario)}</td>
        <td class="cell right bold">${fmt(p.totalPartida)}</td>
      </tr>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #1e293b; font-size: 11px; line-height: 1.5; }

    .page { width: 100%; padding: 40px 48px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #f1f5f9; }
    .brand h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; }
    .brand p { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .doc-info { text-align: right; }
    .doc-info .folio { font-size: 18px; font-weight: 800; color: #0f172a; }
    .doc-info .date { font-size: 10px; color: #94a3b8; margin-top: 4px; }

    /* Info grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .info-box { background: #f8fafc; border-radius: 12px; padding: 16px 20px; }
    .info-box h3 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
    .info-box p { font-size: 11px; color: #334155; margin-bottom: 2px; }
    .info-box .label { color: #94a3b8; font-size: 10px; }

    /* Table */
    .table-wrap { margin-bottom: 28px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #0f172a; color: #fff; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 12px; }
    thead th:first-child { border-radius: 8px 0 0 0; }
    thead th:last-child { border-radius: 0 8px 0 0; }
    .cell { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 10.5px; vertical-align: middle; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; color: #0f172a; }
    .thumb { width: 88px; height: 88px; object-fit: cover; border-radius: 10px; border: 1px solid #e2e8f0; }
    .no-img { color: #cbd5e1; }

    /* Totals */
    .totals { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .totals-box { width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px; }
    .totals-row.total { border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 4px; }
    .totals-row.total span:last-child { font-size: 16px; font-weight: 800; color: #0f172a; }

    /* Notes */
    .notes { background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 28px; }
    .notes h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #b45309; margin-bottom: 4px; }
    .notes p { font-size: 10.5px; color: #78350f; }

    /* Footer */
    .footer { border-top: 2px solid #f1f5f9; padding-top: 16px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
    .footer .legal { max-width: 400px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <h1>Draco</h1>
        <p>Sistema de Gestión de Cotizaciones</p>
      </div>
      <div class="doc-info">
        <div class="folio">${data.folio}</div>
        <div class="date">${data.fechaCreacion}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h3>Cliente</h3>
        <p style="font-weight: 600; color: #0f172a;">${data.clienteNombre}</p>
        ${data.clienteContacto ? `<p><span class="label">Contacto:</span> ${data.clienteContacto}</p>` : ''}
        ${data.clienteEmail ? `<p><span class="label">Email:</span> ${data.clienteEmail}</p>` : ''}
      </div>
      <div class="info-box">
        <h3>Detalles</h3>
        <p><span class="label">Moneda:</span> <strong>${data.monedaBase}</strong></p>
        ${data.tipoCambioAplicado !== 1 ? `<p><span class="label">Tipo de cambio:</span> $${data.tipoCambioAplicado}</p>` : ''}
        <p><span class="label">Vigencia:</span> ${data.vigenciaDias} días</p>
        <p><span class="label">Vendedor:</span> ${data.vendedorNombre}</p>
        ${data.condicionesPago ? `<p><span class="label">Pago:</span> ${data.condicionesPago}</p>` : ''}
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:30px">#</th>
            <th style="width:100px">Img</th>
            <th style="width:90px">Código</th>
            <th style="width:45px">Cant.</th>
            <th>Descripción</th>
            <th style="width:90px; text-align:right">P. Unitario</th>
            <th style="width:100px; text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${filasPartidas}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${fmt(data.subtotal)}</span>
        </div>
        <div class="totals-row total">
          <span>Total</span>
          <span>${fmt(data.total)}</span>
        </div>
      </div>
    </div>

    ${data.notas ? `
    <div class="notes">
      <h4>Notas</h4>
      <p>${data.notas}</p>
    </div>` : ''}

    <div class="footer">
      <div class="legal">
        Este documento es una cotización y no constituye una factura. Los precios y disponibilidad están sujetos a cambio sin previo aviso.
      </div>
      <div style="text-align: right;">
        Draco — Sistema de Gestión de Cotizaciones
      </div>
    </div>
  </div>
</body>
</html>`;
}
