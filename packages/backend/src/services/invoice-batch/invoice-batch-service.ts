/**
 * Invoice Batch Service
 * Prevents double invoicing: batch AMM-approved cost proposals and generate recap PDF.
 */

import { prisma } from '../../config/database.js';
import { generateBatchRecapPdf, type BatchLineItem, type BatchPdfData } from './invoice-batch-pdf.js';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'uploads');
const BATCH_PDF_DIR = path.join(UPLOADS_DIR, 'invoice-batches');

export interface CreateBatchResult {
  id: number;
  batchNumber: string;
  vendorCompanyId: number;
  createdById: number;
  createdAt: Date;
  totalAmount: number;
  currency: string;
  status: string;
  itemCount: number;
  pdfUrl: string;
}

/**
 * Create an invoice batch from selected approved cost proposals (work order IDs).
 * Only AMM-approved WOs that are not already batched can be included.
 * Same vendor company required. All-or-nothing transaction + PDF generation.
 */
export async function createBatch(
  workOrderIds: number[],
  vendorCompanyId: number,
  createdByVendorUserId: number
): Promise<CreateBatchResult> {
  if (workOrderIds.length === 0) {
    throw new Error('At least one work order is required');
  }

  const distinctIds = [...new Set(workOrderIds)];

  const workOrders = await prisma.workOrder.findMany({
    where: { id: { in: distinctIds } },
    include: {
      vendorCompany: true,
      ticket: { include: { store: true } },
      invoiceRows: true,
    },
  });

  if (workOrders.length !== distinctIds.length) {
    throw new Error('One or more work orders not found');
  }

  for (const wo of workOrders) {
    if (wo.vendorCompanyId !== vendorCompanyId) {
      throw new Error(`Work order ${wo.id} does not belong to your company`);
    }
    if (wo.currentStatus !== 'COST_PROPOSAL_APPROVED') {
      throw new Error(`Work order ${wo.id} is not in status Cost Proposal Approved`);
    }
    if (wo.invoiceBatchId != null) {
      throw new Error(`Work order ${wo.id} is already included in an invoice batch`);
    }
  }

  const createdBy = await prisma.vendorUser.findUnique({
    where: { id: createdByVendorUserId },
    select: { name: true },
  });
  const createdByName = createdBy?.name ?? 'Unknown';

  const batchNumber = await getNextBatchNumber(vendorCompanyId);
  let totalAmount = 0;
  const lineItems: BatchLineItem[] = [];

  for (const wo of workOrders) {
    const woTotal =
      wo.invoiceRows?.reduce((sum, row) => sum + Number(row.lineTotal), 0) ?? 0;
    totalAmount += woTotal;
    const completionDate = wo.checkoutTs
      ? wo.checkoutTs.toISOString().slice(0, 10)
      : wo.updatedAt.toISOString().slice(0, 10);
    const description =
      wo.invoiceRows?.[0]?.description ?? `Work order ${wo.id}`;
    const storeName = (wo as { ticket?: { store?: { name: string } } }).ticket?.store?.name ?? '';
    lineItems.push({
      workOrderId: wo.id,
      ticketId: wo.ticketId,
      storeName,
      completionDate,
      approvedAmount: woTotal,
      description: String(description).slice(0, 80),
    });
  }

  const batch = await prisma.$transaction(async (tx) => {
    const batchRecord = await tx.invoiceBatch.create({
      data: {
        batchNumber,
        vendorCompanyId,
        createdById: createdByVendorUserId,
        totalAmount,
        currency: 'EUR',
        status: 'CREATED',
      },
    });

    await tx.invoiceBatchItem.createMany({
      data: distinctIds.map((workOrderId) => ({
        batchId: batchRecord.id,
        workOrderId,
      })),
    });

    await tx.workOrder.updateMany({
      where: { id: { in: distinctIds } },
      data: { invoiceBatchId: batchRecord.id },
    });

    return batchRecord;
  });

  const pdfFileName = `batch-${batch.id}-${batch.batchNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
  const pdfPath = path.join(BATCH_PDF_DIR, pdfFileName);

  const pdfData: BatchPdfData = {
    vendorName: workOrders[0].vendorCompany.name,
    batchNumber,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    createdByName,
    items: lineItems,
    totalAmount,
    currency: 'EUR',
  };

  await generateBatchRecapPdf(pdfData, pdfPath);

  await prisma.invoiceBatch.update({
    where: { id: batch.id },
    data: { pdfPath },
  });

  return {
    id: batch.id,
    batchNumber: batch.batchNumber,
    vendorCompanyId: batch.vendorCompanyId,
    createdById: batch.createdById,
    createdAt: batch.createdAt,
    totalAmount: Number(batch.totalAmount),
    currency: batch.currency,
    status: batch.status,
    itemCount: distinctIds.length,
    pdfUrl: `/api/invoice-batches/${batch.id}/pdf`,
  };
}

async function getNextBatchNumber(vendorCompanyId: number): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoiceBatch.count({
    where: { vendorCompanyId },
  });
  const seq = String(count + 1).padStart(4, '0');
  // Include vendorCompanyId so batch_number is globally unique (DB unique constraint)
  return `BATCH-${year}-${vendorCompanyId}-${seq}`;
}

/**
 * Get batch by ID; ensure it belongs to the vendor company (for PDF download).
 */
export async function getBatchForVendor(
  batchId: number,
  vendorCompanyId: number
): Promise<{ pdfPath: string } | null> {
  const batch = await prisma.invoiceBatch.findFirst({
    where: { id: batchId, vendorCompanyId },
    select: { pdfPath: true },
  });
  return batch?.pdfPath ? { pdfPath: batch.pdfPath } : null;
}

/**
 * Resolve absolute path for serving PDF. Returns null if file missing.
 */
export function resolveBatchPdfPath(relativeOrAbsolutePath: string | null): string | null {
  if (!relativeOrAbsolutePath) return null;
  const absolute = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(BATCH_PDF_DIR, path.basename(relativeOrAbsolutePath));
  return fs.existsSync(absolute) ? absolute : null;
}
