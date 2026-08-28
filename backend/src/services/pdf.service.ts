import puppeteer from 'puppeteer';
import { plantillaCotizacion } from '../templates/cotizacion.template.js';

interface PartidaPDF {
  cantidad: number;
  codigoProducto?: string;
  descripcion: string;
  imagenUrl?: string;
  precioUnitario: number;
  totalPartida: number;
}

interface CotizacionPDF {
  folio: string;
  fechaCreacion: string;
  clienteNombre: string;
  clienteContacto?: string;
  clienteEmail?: string;
  condicionesPago?: string;
  monedaBase: string;
  tipoCambioAplicado: number;
  notas?: string;
  subtotal: number;
  total: number;
  partidas: PartidaPDF[];
}

let browserInstance: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

async function getBrowser() {
  if (!browserInstance || !browserInstance.connected) {
    try {
      browserInstance = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `No se pudo iniciar el navegador para generar el PDF. ` +
          `Asegúrate de que Chrome de Puppeteer esté instalado (npx puppeteer browsers install chrome). ` +
          `Detalle: ${msg}`,
      );
    }
  }
  return browserInstance;
}

export async function generarPDF(cotizacion: CotizacionPDF): Promise<Buffer> {
  const html = plantillaCotizacion(cotizacion);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

export async function cerrarBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
