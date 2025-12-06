import { useState, useEffect } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';

/**
 * FirstRunModal Component
 * Presented on first login with option to take a quick tour.
 * Persists "shown" flag to prevent repeated display.
 */
interface FirstRunModalProps {
  onStartTour: () => void;
  onSkip: () => void;
}

export default function FirstRunModal({ onStartTour, onSkip }: FirstRunModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenFirstRun = localStorage.getItem('mervo_first_run_shown') === 'true';
    if (!hasSeenFirstRun) {
      setShow(true);
    }
  }, []);

  const handleStartTour = () => {
    localStorage.setItem('mervo_first_run_shown', 'true');
    setShow(false);
    onStartTour();
  };

  const handleSkip = () => {
    localStorage.setItem('mervo_first_run_shown', 'true');
    setShow(false);
    onSkip();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-md">
        <CardBody>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-50 mb-md">
            Welcome to Mervo
          </h2>
          <p className="text-charcoal-700 dark:text-charcoal-300 mb-lg">
            Let's get you started with a quick tour of the key features. You can skip this at any time.
          </p>
          <div className="flex gap-md">
            <Button
              onClick={handleSkip}
              className="flex-1 bg-charcoal-200 dark:bg-charcoal-700 text-charcoal-900 dark:text-charcoal-50 hover:bg-charcoal-300 dark:hover:bg-charcoal-600"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleStartTour}
              className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
            >
              Take the tour
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
