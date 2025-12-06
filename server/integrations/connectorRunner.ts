import { Connector } from "./connectorsRegistry";

export async function runConnector(connector: Connector, event: string, payload: any, config?: any) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await connector.handler({ companyId: config?.companyId, event, payload, config });
    return res;
  } catch (e: any) {
    return { ok: false, detail: e?.message ?? "error" };
  } finally {
    clearTimeout(timeout);
  }
}
