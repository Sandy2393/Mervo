import { PIISpan } from "../../../server/ai/redactor";

export type Props = {
  text: string;
  redactionSpans?: PIISpan[];
  isAdmin?: boolean;
  onToggleRedaction?: (show: boolean) => void;
};

export default function RedactionUI({ text, redactionSpans, isAdmin, onToggleRedaction }: Props) {
  const [showRedacted, setShowRedacted] = React.useState(false);

  if (!redactionSpans || redactionSpans.length === 0) {
    return <div>{text}</div>;
  }

  const spans = [...redactionSpans].sort((a, b) => a.start - b.start);
  const elements = [];
  let lastEnd = 0;

  for (const span of spans) {
    if (lastEnd < span.start) {
      elements.push(
        <span key={`text-${lastEnd}`}>{text.slice(lastEnd, span.start)}</span>
      );
    }
    const content = showRedacted ? text.slice(span.start, span.end) : span.replacement;
    elements.push(
      <span
        key={`pii-${span.start}`}
        title={span.type}
        style={{
          backgroundColor: showRedacted ? "#fecaca" : "#e5e7eb",
          padding: "2px 4px",
          borderRadius: 3,
          cursor: "help",
        }}
      >
        {content}
      </span>
    );
    lastEnd = span.end;
  }
  if (lastEnd < text.length) {
    elements.push(
      <span key={`text-end`}>{text.slice(lastEnd)}</span>
    );
  }

  return (
    <div>
      {isAdmin && (
        <button onClick={() => { setShowRedacted(!showRedacted); onToggleRedaction?.(!showRedacted); }}>
          {showRedacted ? "Hide" : "Show"} PII
        </button>
      )}
      <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{elements}</div>
    </div>
  );
}

import React from "react";
