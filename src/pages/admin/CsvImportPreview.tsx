import { useState } from "react";

type Props = {
  onClose: () => void;
  onPreview: (file: File) => Promise<any>;
  onCommit: (file: File) => Promise<any>;
};

export default function CsvImportPreview({ onClose, onPreview, onCommit }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await onPreview(file);
      setPreview(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      await onCommit(file);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">CSV Import</h2>
          <button onClick={onClose}>×</button>
        </div>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded" onClick={handlePreview} disabled={!file || loading}>
            Preview
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleCommit} disabled={!file || loading || !preview}>
            Commit
          </button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {preview && (
          <div className="border rounded p-3 max-h-64 overflow-auto text-sm">
            <div className="font-semibold mb-2">Valid rows: {preview.rows?.length || 0}</div>
            {preview.errors?.length > 0 && <div className="text-red-700">Errors: {preview.errors.length}</div>}
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(preview, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
