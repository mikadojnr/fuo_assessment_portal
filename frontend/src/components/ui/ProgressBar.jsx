// src/components/ui/ProgressBar.jsx
import { useState } from 'react';

const ProgressBar = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div 
              key={step.id} 
              className={`flex flex-col items-center justify-center relative z-10 ${
                isActive || isCompleted ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
              onClick={() => (isActive || isCompleted) && onStepClick(step.id)}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium 
                ${isActive ? 'bg-teal-600 text-white' : 
                  isCompleted ? 'bg-teal-200 text-teal-800' : 'bg-gray-200 text-gray-500'}
              `}>
                {isCompleted ? '✓' : step.id}
              </div>
              <div className={`
                mt-2 text-xs font-medium 
                ${isActive ? 'text-teal-600' : 
                  isCompleted ? 'text-teal-800' : 'text-gray-500'}
              `}>
                {step.name}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Connecting Lines */}
      <div className="hidden sm:block absolute w-full left-0">
        <div className="h-0.5 bg-gray-200 absolute top-5 w-full -z-10" />
      </div>
      
      {/* Progress */}
      <div className="relative mt-2">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-teal-600 rounded-full"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;