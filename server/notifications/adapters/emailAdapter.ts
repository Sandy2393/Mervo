export type EmailPayload = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  company_id: string;
  templateId?: string;
};

export async function sendEmail(payload: EmailPayload) {
  const apiKey = process.env.SENDGRID_API_KEY || "TODO_STORE_IN_SECRET_MANAGER";
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY missing");
  }
  // TODO: integrate SendGrid SDK; this is a stub.
  return { status: "queued", provider: "sendgrid", id: `sg_${Date.now()}` };
}
