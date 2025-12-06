import { renderTemplate } from "../../src/lib/templateEngine";

export type ConnectorHandler = (input: {
  companyId: string;
  event: string;
  payload: any;
  config?: any;
  secrets?: Record<string, string>;
}) => Promise<{ ok: boolean; detail?: string }>;

export type Connector = {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: string[];
  handler: ConnectorHandler;
};

const registry: Connector[] = [];

export function registerConnector(connector: Connector) {
  registry.push(connector);
}

export function listConnectors() {
  return registry;
}

export function getConnector(id: string) {
  return registry.find((c) => c.id === id || c.key === id);
}

// Sample connectors
registerConnector({
  id: "google-drive",
  key: "google_drive_export",
  name: "Google Drive Export",
  description: "Exports job reports to Drive",
  permissions: ["job.completed"],
  handler: async ({ payload }) => {
    // TODO: implement OAuth and Drive upload
    console.log("Drive export placeholder", payload);
    return { ok: true };
  },
});

registerConnector({
  id: "slack-notifier",
  key: "slack_notifier",
  name: "Slack Notifier",
  description: "Posts notifications to Slack",
  permissions: ["job.created", "job.completed"],
  handler: async ({ payload }) => {
    // TODO: call Slack webhook with secret token
    console.log("Slack placeholder", payload);
    return { ok: true };
  },
});

registerConnector({
  id: "http-forward",
  key: "http_forward",
  name: "HTTP Forwarder",
  description: "Forward events via templated webhook",
  permissions: ["*"],
  handler: async ({ payload, config }) => {
    const body = renderTemplate(config?.template ?? "{{payload}}", { payload });
    console.log("Forwarding to", config?.url, body);
    // TODO: fetch POST to config.url with HMAC if provided
    return { ok: true };
  },
});
