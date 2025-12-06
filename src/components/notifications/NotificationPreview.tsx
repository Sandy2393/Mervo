import React, { useMemo } from "react";
import { renderPreview } from "../../services/notificationsClient";

type Props = {
  template: { subject?: string; body_html?: string; body_text?: string; channel?: string };
  sampleData: Record<string, unknown>;
  onSendTest?: () => Promise<void>;
};

const NotificationPreview: React.FC<Props> = ({ template, sampleData, onSendTest }) => {
  const preview = useMemo(() => renderPreview(template, sampleData), [template, sampleData]);

  return (
    <div>
      <div>
        <strong>Subject:</strong> {preview.subject}
      </div>
      <div>
        <strong>Text:</strong>
        <pre>{preview.text}</pre>
      </div>
      {template.channel === "email" && (
        <div>
          <strong>HTML:</strong>
          <div dangerouslySetInnerHTML={{ __html: preview.html }} />
        </div>
      )}
      {onSendTest && <button onClick={onSendTest}>Send test</button>}
    </div>
  );
};

export default NotificationPreview;
