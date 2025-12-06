import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { fetchRatingSummary, listRatings } from "../../services/ratingsClient";
import { recordRating } from "../../services/ratingsClient";
import RatingWidget from "../../components/ratings/RatingWidget";
const RatingsDashboard = () => {
    const [companyId] = useState("demo-company");
    const [contractors, setContractors] = useState([]);
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [history, setHistory] = useState([]);
    const [promptEnabled, setPromptEnabled] = useState(true);
    useEffect(() => {
        // TODO: replace with API call to list contractors; mocked for now
        setContractors([
            { contractor_id: "c1", avg_rating: 4.7, rating_count: 12, avg_30d: 4.9, avg_90d: 4.8 },
            { contractor_id: "c2", avg_rating: 4.3, rating_count: 6, avg_30d: 4.1, avg_90d: 4.2 },
        ]);
    }, []);
    useEffect(() => {
        if (!selectedContractor)
            return;
        listRatings(selectedContractor, companyId, { limit: 20, offset: 0 }).then(setHistory).catch(console.error);
    }, [selectedContractor, companyId]);
    const rows = useMemo(() => contractors.sort((a, b) => b.avg_rating - a.avg_rating), [contractors]);
    return (_jsxs("div", { className: "p-4", children: [_jsx("h1", { children: "Contractor Ratings" }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: promptEnabled, onChange: () => setPromptEnabled(!promptEnabled) }), " Enable post-job rating prompt"] }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Contractor" }), _jsx("th", { children: "Avg" }), _jsx("th", { children: "Count" }), _jsx("th", { children: "30d" }), _jsx("th", { children: "90d" })] }) }), _jsx("tbody", { children: rows.map((c) => (_jsxs("tr", { onClick: () => setSelectedContractor(c.contractor_id), style: { cursor: "pointer" }, children: [_jsx("td", { children: c.contractor_id }), _jsx("td", { children: c.avg_rating.toFixed(2) }), _jsx("td", { children: c.rating_count }), _jsx("td", { children: c.avg_30d ?? "-" }), _jsx("td", { children: c.avg_90d ?? "-" })] }, c.contractor_id))) })] }), selectedContractor && (_jsxs("div", { className: "modal", children: [_jsxs("h2", { children: ["Ratings for ", selectedContractor] }), _jsx("div", { style: { maxHeight: 300, overflow: "auto" }, children: history.map((r) => (_jsxs("div", { children: [_jsxs("strong", { children: [r.stars, "\u2605"] }), " \u2014 ", r.comment] }, r.id))) }), _jsx(RatingWidget, { initialValue: 0, onSubmit: async (value, comment) => {
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
                        } }), _jsx("button", { onClick: () => setSelectedContractor(null), children: "Close" }), _jsx("button", { onClick: () => console.log("Export CSV TODO"), children: "Export CSV" })] }))] }));
};
export default RatingsDashboard;
