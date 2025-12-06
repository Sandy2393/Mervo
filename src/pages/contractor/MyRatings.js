import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { fetchRatingSummary, listRatings } from "../../services/ratingsClient";
const MyRatings = () => {
    const [companyId] = useState("demo-company");
    const [contractorId] = useState("self");
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    useEffect(() => {
        fetchRatingSummary(contractorId, companyId).then(setSummary).catch(console.error);
        listRatings(contractorId, companyId, { limit: 20, offset: 0 }).then(setHistory).catch(console.error);
    }, [contractorId, companyId]);
    return (_jsxs("div", { className: "p-4", children: [_jsx("h1", { children: "My Ratings" }), summary && (_jsxs("div", { children: [_jsxs("div", { children: ["Average: ", summary.avg_rating?.toFixed?.(2) ?? "0"] }), _jsxs("div", { children: ["Ratings: ", summary.rating_count] }), _jsxs("div", { children: ["30d: ", summary.avg_30d ?? "-"] }), _jsxs("div", { children: ["90d: ", summary.avg_90d ?? "-"] })] })), _jsx("div", { children: history.map((r) => (_jsxs("div", { children: [_jsxs("strong", { children: [r.stars, "\u2605"] }), " \u2014 ", r.comment] }, r.id))) })] }));
};
export default MyRatings;
