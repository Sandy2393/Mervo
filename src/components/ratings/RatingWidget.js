import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const stars = [1, 2, 3, 4, 5];
const RatingWidget = ({ initialValue = 0, onSubmit }) => {
    const [value, setValue] = useState(initialValue);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [lastSubmitTs, setLastSubmitTs] = useState(0);
    const handleSubmit = async () => {
        const now = Date.now();
        if (now - lastSubmitTs < 2000)
            return; // debounce fast repeats
        setLastSubmitTs(now);
        setSubmitting(true);
        await onSubmit(value, comment);
        setSubmitting(false);
    };
    return (_jsxs("div", { children: [_jsx("div", { children: stars.map((s) => (_jsx("button", { onClick: () => setValue(s), "aria-label": `Rate ${s}`, disabled: submitting, children: s <= value ? "★" : "☆" }, s))) }), _jsx("textarea", { placeholder: "Add a comment (optional)", value: comment, onChange: (e) => setComment(e.target.value), disabled: submitting }), _jsx("button", { onClick: handleSubmit, disabled: submitting || value === 0, children: "Submit rating" })] }));
};
export default RatingWidget;
