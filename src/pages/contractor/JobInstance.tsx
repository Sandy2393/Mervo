import { useEffect, useState } from "react";
import { useGeofence } from "../../hooks/useGeofence";
import { compressPhoto } from "../../lib/photo/compress";
import { offlineQueue } from "../../lib/offline/indexeddbQueue";

export default function JobInstance({ instanceId }: { instanceId: string }) {
  const [instance, setInstance] = useState<any>(null);
  const [photoBefore, setPhotoBefore] = useState<File | null>(null);
  const [photoAfter, setPhotoAfter] = useState<File | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState("idle");
  const { insideGeofence, requestOverride } = useGeofence(instance?.location, 50);

  useEffect(() => {
    // TODO: fetch instance details
    setInstance({ id: instanceId, location: { lat: 0, lng: 0, radius: 50 } });
  }, [instanceId]);

  const uploadPhoto = async (file: File, type: "before" | "after") => {
    const compressed = await compressPhoto(file);
    const payload = { type, file: compressed, instanceId };
    await offlineQueue.enqueue({ type: "photo", payload });
    if (type === "before") setPhotoBefore(file);
    if (type === "after") setPhotoAfter(file);
  };

  const clock = async (action: "clockin" | "clockout") => {
    const geo = await requestOverride();
    await offlineQueue.enqueue({ type: action, payload: { instanceId, geo } });
  };

  const submitReport = async () => {
    setStatus("submitting");
    const photos: any[] = [];
    if (photoBefore) photos.push({ type: "before", file: photoBefore });
    if (photoAfter) photos.push({ type: "after", file: photoAfter });
    await offlineQueue.enqueue({ type: "report", payload: { instanceId, checklist, photos } });
    setStatus("submitted");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Job</h1>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => clock("clockin")}>Clock In</button>
        <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => clock("clockout")}>Clock Out</button>
        <span className={`text-sm ${insideGeofence ? "text-green-700" : "text-red-700"}`}>
          {insideGeofence ? "Inside geofence" : "Outside geofence"}
        </span>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Before photo</label>
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "before")} />
        {photoBefore && <div className="text-xs text-gray-600">{photoBefore.name}</div>}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">After photo</label>
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "after")} />
        {photoAfter && <div className="text-xs text-gray-600">{photoAfter.name}</div>}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Checklist</label>
        {Object.keys(checklist).length === 0 && <div className="text-sm text-gray-600">No checklist loaded.</div>}
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submitReport} disabled={status === "submitting"}>
        Submit Report
      </button>
      {status === "submitted" && <div className="text-green-700">Queued for sync</div>}
    </div>
  );
}
