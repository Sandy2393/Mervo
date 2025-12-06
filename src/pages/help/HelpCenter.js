import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
/**
 * HelpCenter Page
 * Skeleton for FAQ, search, and support contact.
 * TODO: Integrate with actual CMS or knowledge base (Intercom, Zendesk, etc.)
 */
export default function HelpCenter() {
    const [searchTerm, setSearchTerm] = useState('');
    const faqs = [
        {
            id: 1,
            question: 'How do I create a new job?',
            answer: 'Navigate to the Jobs section and click "Create Job". Fill in the job details and assign contractors.'
        },
        {
            id: 2,
            question: 'How do I track job progress?',
            answer: 'Use the dashboard to view all jobs. Each job shows the current status and assigned contractor.'
        },
        {
            id: 3,
            question: 'How do I rate a contractor?',
            answer: 'After a job is completed, visit the contractor\'s profile and leave a rating and feedback.'
        },
        {
            id: 4,
            question: 'Can I view past job history?',
            answer: 'Yes, visit the "Past Jobs" section to see completed jobs and download PDFs.'
        },
        {
            id: 5,
            question: 'How do I reset my password?',
            answer: 'On the login page, click "Forgot password?" and follow the email instructions.'
        },
        {
            id: 6,
            question: 'Is my data secure?',
            answer: 'Yes, all data is encrypted and stored securely with role-based access controls.'
        },
    ];
    const filteredFaqs = faqs.filter(faq => faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsx("div", { className: "min-h-screen bg-charcoal-50 dark:bg-charcoal-900 p-lg", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "mb-xl", children: [_jsx("h1", { className: "text-4xl font-bold text-charcoal-900 dark:text-charcoal-50 mb-md", children: "Help Center" }), _jsx("p", { className: "text-charcoal-700 dark:text-charcoal-300", children: "Find answers to common questions and get support." })] }), _jsx(Card, { className: "mb-xl", children: _jsx(CardBody, { children: _jsx(Input, { placeholder: "Search help articles...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), "aria-label": "Search help articles", className: "w-full" }) }) }), _jsx("div", { className: "space-y-md mb-xl", children: filteredFaqs.length > 0 ? (filteredFaqs.map(faq => (_jsx(Card, { children: _jsxs(CardBody, { children: [_jsx("h3", { className: "text-lg font-semibold text-charcoal-900 dark:text-charcoal-50 mb-sm", children: faq.question }), _jsx("p", { className: "text-charcoal-700 dark:text-charcoal-300", children: faq.answer })] }) }, faq.id)))) : (_jsx(Card, { children: _jsx(CardBody, { children: _jsx("p", { className: "text-center text-charcoal-600 dark:text-charcoal-400", children: "No help articles found. Try a different search term." }) }) })) }), _jsx(Card, { className: "bg-orange-50 dark:bg-charcoal-800 border-orange-200 dark:border-orange-900", children: _jsxs(CardBody, { children: [_jsx("h2", { className: "text-xl font-bold text-charcoal-900 dark:text-charcoal-50 mb-md", children: "Still need help?" }), _jsx("p", { className: "text-charcoal-700 dark:text-charcoal-300 mb-lg", children: "Contact our support team and we'll be happy to assist you." }), _jsxs("div", { className: "space-y-md", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-charcoal-600 dark:text-charcoal-400 mb-sm", children: "Email" }), _jsx("a", { href: "mailto:support@mervo.app", className: "text-orange-600 dark:text-orange-400 hover:underline font-medium", children: "support@mervo.app" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-charcoal-600 dark:text-charcoal-400 mb-sm", children: "Phone" }), _jsx("a", { href: "tel:+61234567890", className: "text-orange-600 dark:text-orange-400 hover:underline font-medium", children: "+61 2 3456 7890" })] })] }), _jsx(Button, { className: "mt-lg w-full bg-orange-500 text-white hover:bg-orange-600", children: "Open Support Chat" })] }) })] }) }));
}
