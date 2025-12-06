export type PushPayload = {
  deviceTokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function sendPush(payload: PushPayload) {
  const key = process.env.FCM_SERVER_KEY || "TODO_FCM_SERVER_KEY";
  if (!key) {
    throw new Error("FCM key missing");
  }
  // TODO: send via FCM
  return { status: "queued", provider: "fcm", id: `fcm_${Date.now()}` };
}
