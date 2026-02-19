/**
 * Generate Invoice Batch Recap PDF
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export interface BatchLineItem {
  workOrderId: number;
  ticketId: number;
  storeName: string;
  completionDate: string; // formatted
  approvedAmount: number;
  description: string; // short, e.g. first invoice row or WO summary
}

export interface BatchPdfData {
  vendorName: string;
  batchNumber: string;
  date: string; // formatted
  createdByName: string;
  period?: string;
  items: BatchLineItem[];
  totalAmount: number;
  currency: string;
}

/**
 * Generate recap PDF and write to filePath. Creates parent dirs if needed.
 */
export function generateBatchRecapPdf(data: BatchPdfData, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    stream.on('finish', () => resolve());
    stream.on('error', reject);
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100;

    // Header
    doc.fontSize(18).text('Invoice Batch Recap', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Vendor: ${data.vendorName}`, 50, doc.y);
    doc.text(`Batch #: ${data.batchNumber}`, 50, doc.y + 14);
    doc.text(`Date: ${data.date}`, 50, doc.y + 28);
    doc.text(`Created by: ${data.createdByName}`, 50, doc.y + 42);
    if (data.period) doc.text(`Period: ${data.period}`, 50, doc.y + 56);
    doc.moveDown(2);

    // Table header
    const rowHeight = 22;
    const col1 = 50;  // WO #
    const col2 = 110; // Store
    const col3 = 220; // Completion date
    const col4 = 310; // Amount
    const col5 = 380; // Description
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('WO #', col1, doc.y);
    doc.text('Store / Site', col2, doc.y);
    doc.text('Completion', col3, doc.y);
    doc.text('Amount', col4, doc.y);
    doc.text('Description', col5, doc.y);
    doc.y += rowHeight;
    doc.moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke();
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(9);

    for (const row of data.items) {
      const desc = (row.description || '').slice(0, 35);
      doc.text(String(row.workOrderId), col1, doc.y);
      doc.text((row.storeName || '').slice(0, 18), col2, doc.y);
      doc.text(row.completionDate, col3, doc.y);
      doc.text(formatCurrency(row.approvedAmount, data.currency), col4, doc.y);
      doc.text(desc, col5, doc.y);
      doc.y += rowHeight;
    }

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold');
    doc.text('Total', col3, doc.y);
    doc.text(formatCurrency(data.totalAmount, data.currency), col4, doc.y);
    doc.font('Helvetica');

    doc.end();
  });
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}
