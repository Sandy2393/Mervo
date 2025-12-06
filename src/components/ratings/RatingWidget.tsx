import React, { useState } from "react";

type Props = {
  initialValue?: number;
  onSubmit: (value: number, comment?: string) => Promise<void>;
};

const stars = [1, 2, 3, 4, 5];

const RatingWidget: React.FC<Props> = ({ initialValue = 0, onSubmit }) => {
  const [value, setValue] = useState(initialValue);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitTs, setLastSubmitTs] = useState<number>(0);

  const handleSubmit = async () => {
    const now = Date.now();
    if (now - lastSubmitTs < 2000) return; // debounce fast repeats
    setLastSubmitTs(now);
    setSubmitting(true);
    await onSubmit(value, comment);
    setSubmitting(false);
  };

  return (
    <div>
      <div>
        {stars.map((s) => (
          <button key={s} onClick={() => setValue(s)} aria-label={`Rate ${s}`} disabled={submitting}>
            {s <= value ? "★" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Add a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={submitting}
      />
      <button onClick={handleSubmit} disabled={submitting || value === 0}>
        Submit rating
      </button>
    </div>
  );
};

export default RatingWidget;
