import { useEffect, useState } from "react";
import { fetchCompanies, createCompany } from "../../services/admin/companyClient";

export default function CompaniesList() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchCompanies()
      .then(setCompanies)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()));

  const submit = async () => {
    try {
      const created = await createCompany(form);
      setCompanies([created, ...companies]);
      setShowModal(false);
      setForm({ name: "", slug: "" });
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Companies</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowModal(true)}>
          New Company
        </button>
      </div>
      <div>
        <input
          className="border px-3 py-2 rounded w-full max-w-md"
          placeholder="Filter companies"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-600">{c.slug}</div>
            </div>
            <a className="text-blue-600 underline" href={`/admin/companies/${c.id}`}>
              View
            </a>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-md w-full space-y-4">
            <h2 className="text-xl font-semibold">Create Company</h2>
            <input
              className="border px-3 py-2 rounded w-full"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border px-3 py-2 rounded w-full"
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 border rounded" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
