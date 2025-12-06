import crypto from "crypto";

export type ConnectorManifest = {
  id: string;
  name: string;
  description: string;
  required_permissions: string[];
  required_oauth_scopes?: string[];
  supported_events: string[];
};

export function validateManifest(manifest: ConnectorManifest) {
  if (!manifest.id || !manifest.name) throw new Error("Manifest missing id/name");
  if (!manifest.supported_events?.length) throw new Error("No events defined");
  return true;
}

export function createHandler({ onEvent }: { onEvent: (event: string, payload: any) => Promise<any> }) {
  return async function handler(event: string, payload: any) {
    return onEvent(event, payload);
  };
}

export function sign(body: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export function verify(body: string, secret: string, signature: string) {
  return sign(body, secret) === signature;
}

export async function httpPost(url: string, body: any, headers: Record<string, string> = {}) {
  const fetchFn = (globalThis as any).fetch as typeof fetch;
  const res = await fetchFn(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  return res;
}
