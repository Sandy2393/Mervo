import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import NotificationPreview from "../../components/notifications/NotificationPreview";
import { listTemplates, sendTestNotification } from "../../services/notificationsClient";
const NotificationTemplates = () => {
    const [companyId] = useState("demo-company");
    const [templates, setTemplates] = useState([]);
    const [selected, setSelected] = useState(null);
    const [testRecipient, setTestRecipient] = useState("");
    useEffect(() => {
        listTemplates(companyId).then(setTemplates).catch(console.error);
    }, [companyId]);
    return (_jsxs("div", { className: "p-4", children: [_jsx("h1", { children: "Notification Templates" }), _jsx("ul", { children: templates.map((t) => (_jsxs("li", { onClick: () => setSelected(t), style: { cursor: "pointer" }, children: [t.type, " / ", t.channel] }, t.id))) }), selected && (_jsxs("div", { children: [_jsxs("h2", { children: ["Edit ", selected.type] }), _jsx(NotificationPreview, { template: selected, sampleData: { job: { id: "job-123" }, contractor: { name: "Pat" } }, onSendTest: async () => {
                            await sendTestNotification({
                                company_id: companyId,
                                templateId: selected.id,
                                to: testRecipient,
                            });
                        } }), _jsx("input", { placeholder: "test email/phone", value: testRecipient, onChange: (e) => setTestRecipient(e.target.value) }), _jsx("button", { onClick: () => setSelected(null), children: "Close" })] }))] }));
};
export default NotificationTemplates;
