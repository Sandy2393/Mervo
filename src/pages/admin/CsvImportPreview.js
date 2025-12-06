import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function CsvImportPreview({ onClose, onPreview, onCommit }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handlePreview = async () => {
        if (!file)
            return;
        setLoading(true);
        setError("");
        try {
            const res = await onPreview(file);
            setPreview(res);
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCommit = async () => {
        if (!file)
            return;
        setLoading(true);
        setError("");
        try {
            await onCommit(file);
            onClose();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white p-6 rounded shadow-lg max-w-2xl w-full space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold", children: "CSV Import" }), _jsx("button", { onClick: onClose, children: "\u00D7" })] }), _jsx("input", { type: "file", accept: ".csv", onChange: (e) => setFile(e.target.files?.[0] || null) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "px-4 py-2 border rounded", onClick: handlePreview, disabled: !file || loading, children: "Preview" }), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", onClick: handleCommit, disabled: !file || loading || !preview, children: "Commit" })] }), error && _jsx("div", { className: "text-red-600 text-sm", children: error }), preview && (_jsxs("div", { className: "border rounded p-3 max-h-64 overflow-auto text-sm", children: [_jsxs("div", { className: "font-semibold mb-2", children: ["Valid rows: ", preview.rows?.length || 0] }), preview.errors?.length > 0 && _jsxs("div", { className: "text-red-700", children: ["Errors: ", preview.errors.length] }), _jsx("pre", { className: "whitespace-pre-wrap text-xs", children: JSON.stringify(preview, null, 2) })] }))] }) }));
}
