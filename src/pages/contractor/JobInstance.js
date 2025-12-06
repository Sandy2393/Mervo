import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useGeofence } from "../../hooks/useGeofence";
import { compressPhoto } from "../../lib/photo/compress";
import { offlineQueue } from "../../lib/offline/indexeddbQueue";
export default function JobInstance({ instanceId }) {
    const [instance, setInstance] = useState(null);
    const [photoBefore, setPhotoBefore] = useState(null);
    const [photoAfter, setPhotoAfter] = useState(null);
    const [checklist, setChecklist] = useState({});
    const [status, setStatus] = useState("idle");
    const { insideGeofence, requestOverride } = useGeofence(instance?.location, 50);
    useEffect(() => {
        // TODO: fetch instance details
        setInstance({ id: instanceId, location: { lat: 0, lng: 0, radius: 50 } });
    }, [instanceId]);
    const uploadPhoto = async (file, type) => {
        const compressed = await compressPhoto(file);
        const payload = { type, file: compressed, instanceId };
        await offlineQueue.enqueue({ type: "photo", payload });
        if (type === "before")
            setPhotoBefore(file);
        if (type === "after")
            setPhotoAfter(file);
    };
    const clock = async (action) => {
        const geo = await requestOverride();
        await offlineQueue.enqueue({ type: action, payload: { instanceId, geo } });
    };
    const submitReport = async () => {
        setStatus("submitting");
        const photos = [];
        if (photoBefore)
            photos.push({ type: "before", file: photoBefore });
        if (photoAfter)
            photos.push({ type: "after", file: photoAfter });
        await offlineQueue.enqueue({ type: "report", payload: { instanceId, checklist, photos } });
        setStatus("submitted");
    };
    return (_jsxs("div", { className: "p-4 space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Job" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "px-4 py-2 bg-green-600 text-white rounded", onClick: () => clock("clockin"), children: "Clock In" }), _jsx("button", { className: "px-4 py-2 bg-red-600 text-white rounded", onClick: () => clock("clockout"), children: "Clock Out" }), _jsx("span", { className: `text-sm ${insideGeofence ? "text-green-700" : "text-red-700"}`, children: insideGeofence ? "Inside geofence" : "Outside geofence" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-1", children: "Before photo" }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "before") }), photoBefore && _jsx("div", { className: "text-xs text-gray-600", children: photoBefore.name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-1", children: "After photo" }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "after") }), photoAfter && _jsx("div", { className: "text-xs text-gray-600", children: photoAfter.name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold mb-1", children: "Checklist" }), Object.keys(checklist).length === 0 && _jsx("div", { className: "text-sm text-gray-600", children: "No checklist loaded." })] }), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", onClick: submitReport, disabled: status === "submitting", children: "Submit Report" }), status === "submitted" && _jsx("div", { className: "text-green-700", children: "Queued for sync" })] }));
}
