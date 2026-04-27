/**
 * Email Service
 * Sends transactional emails via Resend
 */
import { Resend } from 'resend';
import { prisma } from '../../config/database.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'onboarding@resend.dev';

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set, skipping email');
    return;
  }
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    console.log(`[Email] Sent: ${subject} → ${to}`);
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
  }
}

export async function notifyNewOwner(params: {
  entityType: 'TICKET' | 'WORK_ORDER';
  entityId: number;
  newOwnerId: number;
  ownerType: 'INTERNAL' | 'VENDOR';
  context?: string;
}): Promise<void> {
  const { entityType, entityId, newOwnerId, ownerType, context } = params;

  let email: string | null = null;
  let name: string | null = null;

  if (ownerType === 'INTERNAL') {
    const user = await prisma.internalUser.findUnique({
      where: { id: newOwnerId },
      select: { email: true, name: true },
    });
    email = user?.email ?? null;
    name = user?.name ?? null;
  } else {
    const user = await prisma.vendorUser.findUnique({
      where: { id: newOwnerId },
      select: { email: true, name: true },
    });
    email = user?.email ?? null;
    name = user?.name ?? null;
  }

  if (!email) return;

  const entityLabel = entityType === 'TICKET' ? 'Tiket' : 'Radni nalog';
  const subject = `[Maintrix] ${entityLabel} #${entityId} — dodijeljen vam je`;
  const html = `
    <h2>${entityLabel} #${entityId} je dodijeljen vama</h2>
    ${name ? `<p>Pozdrav, <strong>${name}</strong>!</p>` : ''}
    ${context ? `<p><strong>Akcija:</strong> ${context}</p>` : ''}
    <p>Prijavite se u Maintrix sustav za više detalja i poduzimanje sljedećih koraka.</p>
    <hr/>
    <p style="color: #666; font-size: 12px;">Ovu poruku ste primili jer ste novi vlasnik ovog zadatka u Maintrix sustavu.</p>
  `;

  await sendEmail(email, subject, html);
}
