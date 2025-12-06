// @ts-nocheck
import { sendNotification } from "../../server/notifications/notificationService";

const makeDb = () => {
  const notifications: any[] = [];
  const attempts: any[] = [];
  return {
    notifications,
    attempts,
    async query(text: string, params: any[]) {
      if (text.includes("INSERT INTO notifications")) {
        const row = { id: `n${notifications.length + 1}`, company_id: params[0], type: params[1], channel: params[2], recipient: params[3] };
        notifications.push(row);
        return { rows: [row] };
      }
      if (text.includes("INSERT INTO notification_attempts")) {
        const row = { id: `a${attempts.length + 1}`, notification_id: params[0], provider: params[1], status: params[3] };
        attempts.push(row);
        return { rows: [row] };
      }
      return { rows: [] };
    },
  } as any;
};

test("sends via adapters and logs attempts", async () => {
  const db = makeDb();
  const adapters = {
    email: async () => ({ status: "queued", provider: "email" }),
    sms: async () => ({ status: "queued", provider: "sms" }),
    push: async () => ({ status: "queued", provider: "push" }),
  };
  const res = await sendNotification(
    {
      company_id: "co",
      type: "job_assigned",
      payload: { job: "j1" },
      recipients: { email: "a@example.com", phone: "123", deviceTokens: ["t1"] },
      via: ["email", "sms"],
    },
    db,
    adapters
  );
  expect(res.attempts.length).toBe(2);
});
