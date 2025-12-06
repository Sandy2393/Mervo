import React, { useEffect, useState } from "react";
import NotificationPreview from "../../components/notifications/NotificationPreview";
import { listTemplates, sendTestNotification } from "../../services/notificationsClient";

const NotificationTemplates: React.FC = () => {
  const [companyId] = useState("demo-company");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [testRecipient, setTestRecipient] = useState<string>("");

  useEffect(() => {
    listTemplates(companyId).then(setTemplates).catch(console.error);
  }, [companyId]);

  return (
    <div className="p-4">
      <h1>Notification Templates</h1>
      <ul>
        {templates.map((t) => (
          <li key={t.id} onClick={() => setSelected(t)} style={{ cursor: "pointer" }}>
            {t.type} / {t.channel}
          </li>
        ))}
      </ul>

      {selected && (
        <div>
          <h2>Edit {selected.type}</h2>
          <NotificationPreview
            template={selected}
            sampleData={{ job: { id: "job-123" }, contractor: { name: "Pat" } }}
            onSendTest={async () => {
              await sendTestNotification({
                company_id: companyId,
                templateId: selected.id,
                to: testRecipient,
              });
            }}
          />
          <input placeholder="test email/phone" value={testRecipient} onChange={(e) => setTestRecipient(e.target.value)} />
          <button onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplates;
