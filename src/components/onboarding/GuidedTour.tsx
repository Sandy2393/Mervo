import { useState } from 'react';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * GuidedTour Component
 * Step-by-step tour with next/prev navigation.
 * Respects prefers-reduced-motion for accessibility.
 * TODO: Integrate with framer-motion for advanced animations if added to dependencies.
 */
export default function GuidedTour({ steps, onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-40 transition-opacity ${
        shouldReduceMotion ? 'opacity-100' : 'animate-fade-in'
      }`}
    >
      <div className="bg-white dark:bg-charcoal-900 rounded-lg shadow-lg p-lg max-w-md">
        <div className="mb-lg">
          <div className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-sm">
            Step {currentStep + 1} of {steps.length}
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-50">
            {step.title}
          </h2>
          <p className="text-charcoal-700 dark:text-charcoal-300 mt-md">
            {step.description}
          </p>
        </div>

        <div className="flex gap-md">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            aria-label="Previous step"
            className="px-lg py-md rounded-lg bg-charcoal-200 dark:bg-charcoal-700 text-charcoal-900 dark:text-charcoal-50 hover:bg-charcoal-300 dark:hover:bg-charcoal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onSkip}
            aria-label="Skip tour"
            className="px-lg py-md rounded-lg bg-charcoal-200 dark:bg-charcoal-700 text-charcoal-900 dark:text-charcoal-50 hover:bg-charcoal-300 dark:hover:bg-charcoal-600 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            aria-label={currentStep === steps.length - 1 ? 'Complete tour' : 'Next step'}
            className="flex-1 px-lg py-md rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
