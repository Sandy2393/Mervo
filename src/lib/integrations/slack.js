/*
 * Slack notifications helper (client-side).
 * All webhook calls should be proxied through a server endpoint to avoid exposing webhook URLs.
 */
export async function notifyChannel(message, opts) {
    // The server-side endpoint should hold the Slack webhook URL as a secret and post to Slack
    const payload = { message, channel: opts?.channel || null, attachments: opts?.attachments || [] };
    const res = await fetch('/api/integrations/slack/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok)
        throw new Error('Failed to send Slack notification');
    return res.json();
}
export default { notifyChannel };
