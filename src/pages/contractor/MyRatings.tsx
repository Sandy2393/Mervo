import React, { useEffect, useState } from "react";
import { fetchRatingSummary, listRatings } from "../../services/ratingsClient";

const MyRatings: React.FC = () => {
  const [companyId] = useState("demo-company");
  const [contractorId] = useState("self");
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchRatingSummary(contractorId, companyId).then(setSummary).catch(console.error);
    listRatings(contractorId, companyId, { limit: 20, offset: 0 }).then(setHistory).catch(console.error);
  }, [contractorId, companyId]);

  return (
    <div className="p-4">
      <h1>My Ratings</h1>
      {summary && (
        <div>
          <div>Average: {summary.avg_rating?.toFixed?.(2) ?? "0"}</div>
          <div>Ratings: {summary.rating_count}</div>
          <div>30d: {summary.avg_30d ?? "-"}</div>
          <div>90d: {summary.avg_90d ?? "-"}</div>
        </div>
      )}
      <div>
        {history.map((r) => (
          <div key={r.id}>
            <strong>{r.stars}★</strong> — {r.comment}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRatings;
