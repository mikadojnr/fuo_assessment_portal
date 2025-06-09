// src/components/assessment/QuestionType/MCQQuestion.jsx
import { useState } from 'react';
import RichTextEditor from '../../ui/RichTextEditor';

const MCQQuestion = ({ question, onChange, errors }) => {
  const addOption = () => {
    const updatedOptions = [...question.options, { text: '' }];
    onChange({ options: updatedOptions });
  };

  const updateOption = (index, text) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = { ...updatedOptions[index], text };
    onChange({ options: updatedOptions });
  };

  const removeOption = (index) => {
    if (question.options.length <= 2) {
      return; // Maintain at least 2 options
    }
    
    const updatedOptions = question.options.filter((_, i) => i !== index);
    
    // Update correctOption if needed
    let correctOption = question.correctOption;
    if (correctOption === index) {
      correctOption = null;
    } else if (correctOption > index) {
      correctOption = correctOption - 1;
    }
    
    onChange({ 
      options: updatedOptions,
      correctOption
    });
  };

  return (
    <div className="space-y-4 bg-white p-4 border rounded-md">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text*
        </label>
        <RichTextEditor
          value={question.text || ''}
          onChange={(text) => onChange({ text })}
          placeholder="Enter your question here"
          error={errors?.text}
        />
        {errors?.text && <p className="mt-1 text-sm text-red-500">{errors.text}</p>}
      </div>
      
      {/* Question Mark */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mark Value
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={question.maxMark || 10}
          onChange={(e) => onChange({ maxMark: parseInt(e.target.value) || 0 })}
          className="w-24 px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Options*
        </label>
        
        {errors?.options && <p className="mb-2 text-sm text-red-500">{errors.options}</p>}
        
        <ul className="space-y-3">
          {question.options?.map((option, index) => (
            <li key={index} className="flex items-center">
              <div className="flex-shrink-0 mr-2">
                <input
                  type="radio"
                  name={`correctOption_${question.id}`}
                  checked={question.correctOption === index}
                  onChange={() => onChange({ correctOption: index })}
                  className="w-4 h-4 text-teal-600"
                />
              </div>
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {question.options.length > 2 && (
                  <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      
      <button
        type="button"
        onClick={addOption}
        className="mt-3 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        + Add Option
      </button>
      
      {errors?.correctOption && (
        <p className="mt-2 text-sm text-red-500">{errors.correctOption}</p>
      )}
    </div>
    
    {/* Explanation (optional) */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Explanation (Optional)
      </label>
      <textarea
        value={question.explanation || ''}
        onChange={(e) => onChange({ explanation: e.target.value })}
        placeholder="Explain why the correct answer is right (shown to students after submission)"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        rows={3}
      />
    </div>
  </div>
);
};

export default MCQQuestion;