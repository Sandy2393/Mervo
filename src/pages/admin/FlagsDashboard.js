import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import FlagEditor from "./FlagEditor";
import { listFlags, saveFlag, toggleFlag } from "../../services/flagsService";
export default function FlagsDashboard() {
    const [flags, setFlags] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const load = async () => {
        try {
            const data = await listFlags();
            setFlags(data);
        }
        catch (e) {
            console.error(e);
        }
    };
    useEffect(() => {
        load();
    }, []);
    const onSave = async (flag) => {
        await saveFlag(flag);
        setShowModal(false);
        setEditing(null);
        load();
    };
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h2", { children: "Flags Dashboard" }), _jsx("button", { onClick: () => { setEditing(null); setShowModal(true); }, children: "New Flag" }), _jsxs("table", { style: { width: "100%", marginTop: 12 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Key" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Enabled" }), _jsx("th", { children: "Kill Switch" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: flags.map((f) => (_jsxs("tr", { children: [_jsx("td", { children: f.key }), _jsx("td", { children: f.type }), _jsx("td", { children: _jsx("input", { type: "checkbox", checked: f.enabled, onChange: (e) => toggleFlag(f.key, e.target.checked) }) }), _jsx("td", { children: f.killSwitch ? "ON" : "off" }), _jsxs("td", { children: [_jsx("button", { onClick: () => { setEditing(f); setShowModal(true); }, children: "Edit" }), _jsx("button", { onClick: () => toggleFlag(f.key, false), children: "Kill" })] })] }, f.key))) })] }), showModal && (_jsx("div", { style: { border: "1px solid #e5e7eb", padding: 8, marginTop: 12 }, children: _jsx(FlagEditor, { initial: editing ?? undefined, onSave: onSave, onCancel: () => { setShowModal(false); setEditing(null); } }) }))] }));
}
