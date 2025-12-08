import { useState } from 'react';
import { Card, CardBody } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

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

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-900 p-lg">
      <div className="max-w-2xl mx-auto">
        <div className="mb-xl">
          <h1 className="text-4xl font-bold text-charcoal-900 dark:text-charcoal-50 mb-md">
            Help Center
          </h1>
          <p className="text-charcoal-700 dark:text-charcoal-300">
            Find answers to common questions and get support.
          </p>
        </div>

        <Card className="mb-xl">
          <CardBody>
            <Input
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search help articles"
              className="w-full"
            />
          </CardBody>
        </Card>

        <div className="space-y-md mb-xl">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => (
              <Card key={faq.id}>
                <CardBody>
                  <h3 className="text-lg font-semibold text-charcoal-900 dark:text-charcoal-50 mb-sm">
                    {faq.question}
                  </h3>
                  <p className="text-charcoal-700 dark:text-charcoal-300">
                    {faq.answer}
                  </p>
                </CardBody>
              </Card>
            ))
          ) : (
            <Card>
              <CardBody>
                <p className="text-center text-charcoal-600 dark:text-charcoal-400">
                  No help articles found. Try a different search term.
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        <Card className="bg-orange-50 dark:bg-charcoal-800 border-orange-200 dark:border-orange-900">
          <CardBody>
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-charcoal-50 mb-md">
              Still need help?
            </h2>
            <p className="text-charcoal-700 dark:text-charcoal-300 mb-lg">
              Contact our support team and we'll be happy to assist you.
            </p>
            <div className="space-y-md">
              <div>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-sm">Email</p>
                <a
                  href="mailto:support@mervo.app"
                  className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
                >
                  support@mervo.app
                </a>
              </div>
              <div>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-sm">Phone</p>
                <a
                  href="tel:+61234567890"
                  className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
                >
                  +61 2 3456 7890
                </a>
              </div>
            </div>
            <Button className="mt-lg w-full bg-orange-500 text-white hover:bg-orange-600">
              Open Support Chat
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
