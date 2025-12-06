import { sendEmail } from "./adapters/emailAdapter";
import { sendSms } from "./adapters/smsAdapter";
import { sendPush } from "./adapters/pushAdapter";
import { renderTemplate } from "./templateEngine";
import { insertAttempt, insertNotification } from "./sql/queries";

type DBClient = { query: (text: string, params?: any[]) => Promise<{ rows: any[] }> };

const defaultDb: DBClient = {
  query: async () => {
    throw new Error("DB client not configured");
  },
};

const defaultAdapters = {
  email: sendEmail,
  sms: sendSms,
  push: sendPush,
};

type Channel = "email" | "sms" | "push";

type NotificationPayload = {
  company_id: string;
  type: string;
  payload: Record<string, unknown>;
  recipients: { email?: string; phone?: string; deviceTokens?: string[] };
  via: Channel[];
  template?: { subject?: string; body_html?: string; body_text?: string };
  templateId?: string;
};

type AdapterResult = { status: string; provider: string; id?: string; error?: string };

async function logAttempt(db: DBClient, notificationId: string, provider: string, attemptNumber: number, status: string, error?: string, response?: Record<string, unknown>) {
  await db.query(insertAttempt, [notificationId, provider, attemptNumber, status, error ?? null, response ?? null]);
}

function overQuotaPlaceholder(company_id: string) {
  // TODO: implement daily quota checks per company_id
  return false;
}

export async function sendNotification(
  input: NotificationPayload,
  db: DBClient = defaultDb,
  adapters = defaultAdapters
) {
  const attempts: AdapterResult[] = [];
  for (const channel of input.via) {
    if (overQuotaPlaceholder(input.company_id)) {
      attempts.push({ status: "skipped_quota", provider: channel });
      continue;
    }

    const recipient = channel === "email" ? input.recipients.email : channel === "sms" ? input.recipients.phone : undefined;
    const deviceTokens = channel === "push" ? input.recipients.deviceTokens || [] : [];
    if (!recipient && channel !== "push") {
      attempts.push({ status: "failed", provider: channel, error: "missing recipient" });
      continue;
    }

    const notificationRes = await db.query(insertNotification, [
      input.company_id,
      input.type,
      channel,
      recipient || (deviceTokens.length ? deviceTokens.join(",") : ""),
      input.payload,
      input.templateId ?? null,
      "queued",
    ]);
    const notificationId = notificationRes.rows[0].id as string;

    let adapterResult: AdapterResult;
    try {
      if (channel === "email") {
        const subject = input.template?.subject ? renderTemplate(input.template.subject, input.payload) : `${input.type}`;
        const html = input.template?.body_html ? renderTemplate(input.template.body_html, input.payload) : undefined;
        const text = input.template?.body_text ? renderTemplate(input.template.body_text, input.payload, { escapeHtml: false }) : undefined;
        adapterResult = await adapters.email({ to: recipient!, subject, html, text, company_id: input.company_id, templateId: input.templateId });
      } else if (channel === "sms") {
        const body = input.template?.body_text ? renderTemplate(input.template.body_text, input.payload, { escapeHtml: false }) : JSON.stringify(input.payload);
        adapterResult = await adapters.sms({ to: recipient!, body, company_id: input.company_id });
      } else {
        const title = input.template?.subject ? renderTemplate(input.template.subject, input.payload) : input.type;
        const body = input.template?.body_text ? renderTemplate(input.template.body_text, input.payload, { escapeHtml: false }) : JSON.stringify(input.payload);
        adapterResult = await adapters.push({ deviceTokens, title, body, data: {} });
      }
      await logAttempt(db, notificationId, adapterResult.provider, 1, adapterResult.status, adapterResult.error, { id: adapterResult.id });
    } catch (err: any) {
      const message = err?.message || "send failed";
      await logAttempt(db, notificationId, channel, 1, "failed", message);
      attempts.push({ status: "failed", provider: channel, error: message });
      continue;
    }

    attempts.push(adapterResult);
  }
  return { attempts };
}
