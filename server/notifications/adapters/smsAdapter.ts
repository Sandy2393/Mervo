export type SmsPayload = {
  to: string;
  body: string;
  company_id: string;
};

export async function sendSms(payload: SmsPayload) {
  const sid = process.env.TWILIO_SID || "TODO_TWILIO_SID";
  const token = process.env.TWILIO_TOKEN || "TODO_TWILIO_TOKEN";
  if (!sid || !token) {
    throw new Error("Twilio credentials missing");
  }
  // TODO: call Twilio API
  return { status: "queued", provider: "twilio", id: `tw_${Date.now()}` };
}
