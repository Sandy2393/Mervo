import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ratingsService } from '../../services/ratingsService';
import { Card, CardBody } from '../../components/ui/Card';
import RatingStars from '../../components/ratings/RatingStars';
import { colors } from '../../styles/design-tokens';
/**
 * MyRatings Page
 * Shows the current user's received ratings and average rating.
 */
export default function MyRatings() {
    const { user } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!user?.id)
            return;
        const fetchRatings = async () => {
            try {
                setLoading(true);
                const ratingsRes = await ratingsService.getRatingsForContractor(user.id);
                if (ratingsRes.success) {
                    setRatings(ratingsRes.data || []);
                }
                else {
                    setError(ratingsRes.error || 'Failed to fetch ratings');
                }
                const avgRes = await ratingsService.getAverageRating(user.id);
                if (avgRes.success) {
                    setAverageRating(avgRes.data.average);
                    setRatingCount(avgRes.data.count);
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
            finally {
                setLoading(false);
            }
        };
        fetchRatings();
    }, [user?.id]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-charcoal-50 dark:bg-charcoal-900 p-lg", children: _jsx("p", { className: "text-center text-charcoal-600 dark:text-charcoal-400", children: "Loading ratings..." }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-charcoal-50 dark:bg-charcoal-900 p-lg", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [error && (_jsx(Card, { className: "mb-lg border-red-200 dark:border-red-900", children: _jsx(CardBody, { children: _jsx("p", { className: "text-red-600 dark:text-red-400", children: error }) }) })), _jsx(Card, { className: "mb-xl bg-orange-50 dark:bg-charcoal-800", children: _jsxs(CardBody, { children: [_jsx("h1", { className: "text-3xl font-bold text-charcoal-900 dark:text-charcoal-50 mb-md", children: "Your Ratings" }), _jsx("div", { className: "flex items-center gap-lg", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm text-charcoal-600 dark:text-charcoal-400 mb-sm", children: "Average Rating" }), _jsxs("div", { className: "flex items-center gap-md", children: [_jsx("span", { className: "text-4xl font-bold", style: { color: colors.orange[500] }, children: averageRating.toFixed(1) }), _jsxs("div", { className: "flex flex-col", children: [_jsx(RatingStars, { value: Math.round(averageRating), readOnly: true, showLabel: false }), _jsxs("p", { className: "text-xs text-charcoal-600 dark:text-charcoal-400 mt-sm", children: ["Based on ", ratingCount, " rating", ratingCount !== 1 ? 's' : ''] })] })] })] }) })] }) }), ratings.length === 0 ? (_jsx(Card, { children: _jsx(CardBody, { children: _jsx("p", { className: "text-center text-charcoal-600 dark:text-charcoal-400", children: "You haven't received any ratings yet. Complete more jobs to earn ratings!" }) }) })) : (_jsxs("div", { className: "space-y-md", children: [_jsx("h2", { className: "text-2xl font-bold text-charcoal-900 dark:text-charcoal-50 mb-lg", children: "Recent Ratings" }), ratings.map(rating => (_jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs("div", { className: "flex justify-between items-start mb-md", children: [_jsx(RatingStars, { value: rating.rating, readOnly: true, showLabel: true }), _jsx("p", { className: "text-xs text-charcoal-500 dark:text-charcoal-400", children: new Date(rating.created_at).toLocaleDateString() })] }), rating.comment && (_jsxs("p", { className: "text-charcoal-700 dark:text-charcoal-300", children: ["\"", rating.comment, "\""] }))] }) }, rating.id)))] }))] }) }));
}
