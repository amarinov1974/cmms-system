/**
 * Email Service
 * Sends transactional emails via Resend
 */
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'onboarding@resend.dev';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set, skipping email');
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    console.log(`[Email] Sent: ${payload.subject} → ${payload.to}`);
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
  }
}

export const emailTemplates = {
  ticketSubmitted: (ticketId: number, storeName: string, category: string) => ({
    subject: `[Maintrix] Novi tiket #${ticketId} — ${storeName}`,
    html: `
      <h2>Novi tiket je kreiran</h2>
      <p><strong>Tiket ID:</strong> #${ticketId}</p>
      <p><strong>Trgovina:</strong> ${storeName}</p>
      <p><strong>Kategorija:</strong> ${category}</p>
      <p>Prijavite se u Maintrix za više detalja.</p>
    `,
  }),

  ticketApproved: (ticketId: number, storeName: string) => ({
    subject: `[Maintrix] Tiket #${ticketId} odobren — ${storeName}`,
    html: `
      <h2>Vaš tiket je odobren</h2>
      <p><strong>Tiket ID:</strong> #${ticketId}</p>
      <p><strong>Trgovina:</strong> ${storeName}</p>
      <p>Prijavite se u Maintrix za više detalja.</p>
    `,
  }),

  workOrderCreated: (workOrderId: number, ticketId: number, vendorName: string) => ({
    subject: `[Maintrix] Novi radni nalog #${workOrderId}`,
    html: `
      <h2>Novi radni nalog vam je dodijeljen</h2>
      <p><strong>Radni nalog ID:</strong> #${workOrderId}</p>
      <p><strong>Tiket ID:</strong> #${ticketId}</p>
      <p><strong>Izvođač:</strong> ${vendorName}</p>
      <p>Prijavite se u Maintrix za više detalja.</p>
    `,
  }),

  costProposalSubmitted: (workOrderId: number, totalCost: number) => ({
    subject: `[Maintrix] Prijedlog troška za radni nalog #${workOrderId}`,
    html: `
      <h2>Vendor je dostavio prijedlog troška</h2>
      <p><strong>Radni nalog ID:</strong> #${workOrderId}</p>
      <p><strong>Ukupni trošak:</strong> €${totalCost}</p>
      <p>Prijavite se u Maintrix za odobrenje.</p>
    `,
  }),
};
