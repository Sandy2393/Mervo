import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { renderPreview } from "../../services/notificationsClient";
const NotificationPreview = ({ template, sampleData, onSendTest }) => {
    const preview = useMemo(() => renderPreview(template, sampleData), [template, sampleData]);
    return (_jsxs("div", { children: [_jsxs("div", { children: [_jsx("strong", { children: "Subject:" }), " ", preview.subject] }), _jsxs("div", { children: [_jsx("strong", { children: "Text:" }), _jsx("pre", { children: preview.text })] }), template.channel === "email" && (_jsxs("div", { children: [_jsx("strong", { children: "HTML:" }), _jsx("div", { dangerouslySetInnerHTML: { __html: preview.html } })] })), onSendTest && _jsx("button", { onClick: onSendTest, children: "Send test" })] }));
};
export default NotificationPreview;
