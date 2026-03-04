import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export interface ProposalItemData {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  total?: number;
}

export interface CompanyData {
  name?: string;
  cnpj?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface ClientData {
  name?: string;
  contact_name?: string;
  cnpj?: string;
  cpf?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface SignatureData {
  name?: string;
  role?: string;
  company?: string;
}

export interface ProposalDocumentRequest {
  code?: string;
  name?: string;
  title?: string;
  status?: string;
  date?: string;
  validity?: string;
  company?: CompanyData;
  client?: ClientData;
  signature?: SignatureData;
  items?: ProposalItemData[];
  observations?: string;
  internal_notes?: string;
  include_watermark?: boolean;
  include_signature_page?: boolean;
  primary_color?: string;
  secondary_color?: string;
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    value = 0;
  }
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  // BRL formatting
  return `R$ ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return '--/--/----';
  // Attempt to parse ISO string
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '--/--/----';
  
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}

export function fmtFullDate(d?: string | null): string {
  const dateObj = d ? new Date(d) : new Date();
  if (isNaN(dateObj.getTime())) return '--/--/----';

  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  const day = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${day} de ${monthName} de ${year}`;
}

export function logoDataUrl(primaryColor: string, secondaryColor: string, opacity: number = 0.05): string {
  // Primary color default fallback
  const c = primaryColor || '#6366f1'; 
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 54.33 47.14' fill='${c}' fill-opacity='${opacity}'>
      <path d='M15.4,46.22l2.71-2.71,3.62-3.63h-10.16c-.39,0-.7.3-.71.67v4.01c0,1.41,1.16,2.57,2.58,2.57.78,0,1.49-.36,1.96-.91Z' />
      <path d='M28.97,25.38l-3.62,3.63-2.05,2.05c-.88.87-2.05,1.57-3.35,1.57-4.24,0-8.47,0-12.71,0-3.98,0-7.24-3.26-7.24-7.24v-14.53C0,6.88,3.26,3.62,7.24,3.62h28.97s-3.62,3.63-3.62,3.63l-2.05,2.05c-.88.87-2.05,1.57-3.35,1.57H7.24v14.51h21.73Z' />
      <path d='M25.35,21.76l3.62-3.63,2.05-2.05c.88-.87,2.05-1.57,3.35-1.57,4.24,0,8.47,0,12.71,0,3.98,0,7.24,3.26,7.24,7.24v14.53c0,3.98-3.26,7.24-7.24,7.24h-28.97l3.62-3.63,2.05-2.05c.88-.87,2.05-1.57,3.35-1.57h19.95v-14.51h-21.73Z' />
      <path d='M38.93.91l-2.71,2.71-3.62,3.63h10.16c.39,0,.7-.3.71-.67V2.57c0-1.41-1.16-2.57-2.58-2.57-.78,0-1.49.36-1.96.91Z' />
    </svg>`;
  
  const encoded = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

export function compileProposalHtml(data: ProposalDocumentRequest): string {
  // Ler o template do disco
  const templatePath = path.join(process.cwd(), 'src', 'features', 'gs-propostas', 'server', 'templates', 'proposal.hbs');
  const templateStr = fs.readFileSync(templatePath, 'utf8');
  
  const template = Handlebars.compile(templateStr);

  const items = data.items || [];
  let total = 0;
  
  const formattedItems = items.map(item => {
    const unit = item.unitValue || 0;
    const lineTotal = item.total || (item.quantity * unit);
    total += lineTotal;
    
    return {
      description: item.description,
      quantity: item.quantity,
      unit_value_fmt: formatCurrency(unit),
      total_fmt: formatCurrency(lineTotal)
    };
  });

  const context = {
    data: data,
    company: data.company || {},
    client: data.client || {},
    signature: data.signature || {},
    items: formattedItems,
    total_fmt: formatCurrency(total),
    observations: data.observations,
    date_str: fmtDate(data.date || new Date().toISOString()),
    validity_str: fmtDate(data.validity),
    today_full: fmtFullDate(),
    watermark_opacity: 0.05,
    watermark_data_url: logoDataUrl(data.primary_color || '', data.secondary_color || '', 0.05),
    logo_data_url: logoDataUrl(data.primary_color || '', data.secondary_color || '', 1.0),
  };

  return template(context);
}

const getBrowserExecutablePath = (): string | undefined => {
  // Vários possíveis caminhos de chrome instalados no windows
  const paths = [
    process.env.CHROME_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  return paths.find(p => p && fs.existsSync(p));
}

export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  const isLocal = process.env.NODE_ENV === 'development';
  let browser: import('puppeteer-core').Browser | null = null;

  try {
    if (isLocal) {
      // Ambiente de desenvolvimento: usar Chrome/Edge instalado localmente
      const execPath = getBrowserExecutablePath();
      if (!execPath) {
        throw new Error('Local Chrome/Edge executable not found for puppeteer.');
      }
      browser = await puppeteer.launch({
        args: [],
        executablePath: execPath,
        headless: true,
      });
    } else {
      // Produção / Vercel: usar o @sparticuz/chromium via pacote compatível com Lambda
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: (chromium as any).defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: (chromium as any).headless,
      });
    }

    const page = await browser.newPage();
    
    // Sem tempo limite e esperar a renderização das imgs inline
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Gerar PDF em buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}
