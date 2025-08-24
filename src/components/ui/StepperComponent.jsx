import React from 'react';

const StepperComponent = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Cart Review' },
    { number: 2, title: 'Shipping Details' },
    { number: 3, title: 'Payment' }
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.number
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span className="text-sm font-medium">{step.number}</span>
              </div>
              <div className="text-xs font-medium text-gray-500 mt-2">{step.title}</div>
            </div>
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepperComponent;