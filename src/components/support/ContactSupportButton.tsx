import React, { useState } from "react";

interface TicketForm {
  subject: string;
  message: string;
  urgency: "low" | "medium" | "high";
  attachment?: File | null;
}

export const ContactSupportButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TicketForm>({ subject: "", message: "", urgency: "medium", attachment: null });
  const [ticketId, setTicketId] = useState<string | null>(null);

  const submit = async () => {
    const body = new FormData();
    body.append("subject", form.subject);
    body.append("message", form.message);
    body.append("urgency", form.urgency);
    if (form.attachment) body.append("attachment", form.attachment);

    const res = await fetch("/api/support/create-ticket", { method: "POST", body });
    const json = await res.json();
    setTicketId(json.ticketId);
    setOpen(false);
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>Contact Support</button>
      {open && (
        <div role="dialog" aria-modal="true" style={{ border: "1px solid #ccc", padding: 12, marginTop: 8 }}>
          <h3>Contact Support</h3>
          <label>
            Subject
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </label>
          <label>
            Message
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </label>
          <label>
            Urgency
            <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as TicketForm["urgency"] })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Attachment
            <input type="file" onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] || null })} />
          </label>
          <div style={{ marginTop: 8 }}>
            <button onClick={submit}>Submit</button>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 8 }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {ticketId && <div>Ticket created: {ticketId}</div>}
    </div>
  );
};
