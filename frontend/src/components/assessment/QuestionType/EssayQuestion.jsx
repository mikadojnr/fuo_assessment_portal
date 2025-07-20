// src/components/assessment/QuestionType/EssayQuestion.jsx
import { useState } from 'react';
import RichTextEditor from '../../ui/RichTextEditor';
import KeywordInput from '../KeywordInput';

const EssayQuestion = ({ question, onChange, errors }) => {
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
          placeholder="Enter your essay question here"
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
      
      {/* Word Limit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Word Limit
        </label>
        <div className="flex items-center">
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={question.wordLimit || 500}
            onChange={(e) => onChange({ wordLimit: parseInt(e.target.value) })}
            className="w-64 mr-4"
          />
          <span className="text-gray-700 w-24">{question.wordLimit || 500} words</span>
        </div>
      </div>
      
      {/* Model Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model Answer*
        </label>
        <RichTextEditor
          value={question.modelAnswer || ''}
          onChange={(modelAnswer) => onChange({ modelAnswer })}
          placeholder="Enter the model answer for this essay question"
          error={errors?.modelAnswer}
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be used for automated marking using NLP similarity algorithms.
        </p>
        {errors?.modelAnswer && <p className="mt-1 text-sm text-red-500">{errors.modelAnswer}</p>}
      </div>
      
      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marking Scheme Keywords
        </label>
        <KeywordInput
          keywords={question.keywords || []}
          onChange={(keywords) => onChange({ keywords })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Add important keywords with their weights for TF-IDF scoring.
        </p>
      </div>
    </div>
  );
};

export default EssayQuestion;
