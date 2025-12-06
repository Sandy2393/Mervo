import { useEffect, useState } from "react";
import { FlagDefinition } from "../../types/flags";
import FlagEditor from "./FlagEditor";
import { listFlags, saveFlag, toggleFlag } from "../../services/flagsService";

export default function FlagsDashboard() {
  const [flags, setFlags] = useState<FlagDefinition[]>([]);
  const [editing, setEditing] = useState<FlagDefinition | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try {
      const data = await listFlags();
      setFlags(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async (flag: FlagDefinition) => {
    await saveFlag(flag);
    setShowModal(false);
    setEditing(null);
    load();
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Flags Dashboard</h2>
      <button onClick={() => { setEditing(null); setShowModal(true); }}>New Flag</button>
      <table style={{ width: "100%", marginTop: 12 }}>
        <thead>
          <tr>
            <th>Key</th>
            <th>Type</th>
            <th>Enabled</th>
            <th>Kill Switch</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((f) => (
            <tr key={f.key}>
              <td>{f.key}</td>
              <td>{f.type}</td>
              <td>
                <input type="checkbox" checked={f.enabled} onChange={(e) => toggleFlag(f.key, e.target.checked)} />
              </td>
              <td>{f.killSwitch ? "ON" : "off"}</td>
              <td>
                <button onClick={() => { setEditing(f); setShowModal(true); }}>Edit</button>
                <button onClick={() => toggleFlag(f.key, false)}>Kill</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={{ border: "1px solid #e5e7eb", padding: 8, marginTop: 12 }}>
          <FlagEditor
            initial={editing ?? undefined}
            onSave={onSave}
            onCancel={() => { setShowModal(false); setEditing(null); }}
          />
        </div>
      )}
    </div>
  );
}
