/**
 * Attachment service — upload and link files to tickets (and work orders).
 */

import { prisma } from '../../config/database.js';

export interface TicketAttachmentResult {
  id: number;
  fileName: string;
  createdAt: Date;
  internalFlag: boolean;
}

/**
 * Add an attachment to a ticket. Call this after multer has saved the file.
 * Verifies the ticket exists; creates Attachment record.
 */
export async function addTicketAttachment(
  ticketId: number,
  filePath: string,
  fileName: string,
  uploadedById: number,
  internalFlag: boolean = true
): Promise<TicketAttachmentResult> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });
  if (!ticket) {
    throw new Error('Ticket not found');
  }

  const attachment = await prisma.attachment.create({
    data: {
      entityType: 'TICKET',
      entityId: ticketId,
      ticketId,
      filePath,
      fileName: fileName.slice(0, 255),
      uploadedByType: 'INTERNAL',
      uploadedById,
      internalFlag,
    },
  });

  return {
    id: attachment.id,
    fileName: attachment.fileName,
    createdAt: attachment.createdAt,
    internalFlag: attachment.internalFlag,
  };
}

