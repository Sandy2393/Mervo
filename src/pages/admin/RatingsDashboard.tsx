import React, { useEffect, useMemo, useState } from "react";
import { fetchRatingSummary, listRatings } from "../../services/ratingsClient";
import { recordRating } from "../../services/ratingsClient";
import RatingWidget from "../../components/ratings/RatingWidget";

interface ContractorSummary {
  contractor_id: string;
  avg_rating: number;
  rating_count: number;
  avg_30d?: number | null;
  avg_90d?: number | null;
}

const RatingsDashboard: React.FC = () => {
  const [companyId] = useState<string>("demo-company");
  const [contractors, setContractors] = useState<ContractorSummary[]>([]);
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [promptEnabled, setPromptEnabled] = useState<boolean>(true);

  useEffect(() => {
    // TODO: replace with API call to list contractors; mocked for now
    setContractors([
      { contractor_id: "c1", avg_rating: 4.7, rating_count: 12, avg_30d: 4.9, avg_90d: 4.8 },
      { contractor_id: "c2", avg_rating: 4.3, rating_count: 6, avg_30d: 4.1, avg_90d: 4.2 },
    ]);
  }, []);

  useEffect(() => {
    if (!selectedContractor) return;
    listRatings(selectedContractor, companyId, { limit: 20, offset: 0 }).then(setHistory).catch(console.error);
  }, [selectedContractor, companyId]);

  const rows = useMemo(() => contractors.sort((a, b) => b.avg_rating - a.avg_rating), [contractors]);

  return (
    <div className="p-4">
      <h1>Contractor Ratings</h1>
      <label>
        <input type="checkbox" checked={promptEnabled} onChange={() => setPromptEnabled(!promptEnabled)} /> Enable post-job rating prompt
      </label>
      <table>
        <thead>
          <tr>
            <th>Contractor</th>
            <th>Avg</th>
            <th>Count</th>
            <th>30d</th>
            <th>90d</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.contractor_id} onClick={() => setSelectedContractor(c.contractor_id)} style={{ cursor: "pointer" }}>
              <td>{c.contractor_id}</td>
              <td>{c.avg_rating.toFixed(2)}</td>
              <td>{c.rating_count}</td>
              <td>{c.avg_30d ?? "-"}</td>
              <td>{c.avg_90d ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedContractor && (
        <div className="modal">
          <h2>Ratings for {selectedContractor}</h2>
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            {history.map((r) => (
              <div key={r.id}>
                <strong>{r.stars}★</strong> — {r.comment}
              </div>
            ))}
          </div>
          <RatingWidget
            initialValue={0}
            onSubmit={async (value, comment) => {
              await recordRating({
                contractor_id: selectedContractor,
                company_id: companyId,
                job_instance_id: "demo-job",
                rater_user_id: "admin",
                stars: value,
                comment,
              });
              const summary = await fetchRatingSummary(selectedContractor, companyId);
              setContractors((prev) => prev.map((c) => (c.contractor_id === selectedContractor ? { ...c, ...summary } : c)));
              const newHistory = await listRatings(selectedContractor, companyId, { limit: 20, offset: 0 });
              setHistory(newHistory);
            }}
          />
          <button onClick={() => setSelectedContractor(null)}>Close</button>
          <button onClick={() => console.log("Export CSV TODO")}>Export CSV</button>
        </div>
      )}
    </div>
  );
};

export default RatingsDashboard;
