'use client';

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

/**
 * Composant Stepper - Guidage parcours (Journey-Centric Design)
 * Montre la progression dans un processus multi-étapes
 */
export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <nav aria-label="Étapes du processus" className={`stepper ${className}`}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={index}
              className={`stepper-step flex-1 ${isActive ? 'stepper-step-active' : ''} ${isCompleted ? 'stepper-step-completed' : ''}`}
            >
              <div className="flex items-center">
                <span
                  className="stepper-number"
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? '✓' : index + 1}
                </span>
                <div className="ml-2 hidden sm:block">
                  <p className="text-sm font-medium">{step.label}</p>
                  {step.description && (
                    <p className="text-xs text-gray-500">{step.description}</p>
                  )}
                </div>
                {!isLast && <div className="stepper-line mx-4" />}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
