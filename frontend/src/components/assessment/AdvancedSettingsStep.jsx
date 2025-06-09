// src/components/assessment/AdvancedSettingsStep.jsx
import { useState } from 'react';

const AdvancedSettingsStep = ({ formData, updateFormData, errors }) => {
  // Helper function to determine similarity threshold color
  const getSimilarityColor = (value) => {
    if (value <= 20) return 'text-green-600';
    if (value <= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">Advanced Settings</h2>
      
      {/* Randomization */}
      <div className="bg-white p-4 rounded-md border">
        <h3 className="text-lg font-medium mb-3">Randomization</h3>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="shuffleQuestions"
              checked={formData.shuffleQuestions || false}
              onChange={(e) => updateFormData({ shuffleQuestions: e.target.checked })}
              className="w-4 h-4 text-teal-600 mr-2"
            />
            <label htmlFor="shuffleQuestions" className="text-gray-700">
              Shuffle Questions
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="shuffleOptions"
              checked={formData.shuffleOptions || false}
              onChange={(e) => updateFormData({ shuffleOptions: e.target.checked })}
              className="w-4 h-4 text-teal-600 mr-2"
            />
            <label htmlFor="shuffleOptions" className="text-gray-700">
              Shuffle MCQ Options
            </label>
          </div>
        </div>
      </div>
      
      {/* Plagiarism Check */}
      <div className="bg-white p-4 rounded-md border">
        <h3 className="text-lg font-medium mb-3">Plagiarism Detection</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enablePlagiarismCheck"
              checked={formData.enablePlagiarismCheck || false}
              onChange={(e) => updateFormData({ enablePlagiarismCheck: e.target.checked })}
              className="w-4 h-4 text-teal-600 mr-2"
            />
            <label htmlFor="enablePlagiarismCheck" className="text-gray-700">
              Enable Plagiarism Check
            </label>
          </div>
          
          {formData.enablePlagiarismCheck && (
            <>
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Similarity Threshold
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.similarityThreshold || 30}
                    onChange={(e) => updateFormData({ similarityThreshold: parseInt(e.target.value) })}
                    className="w-64 mr-4"
                  />
                  <span className={`${getSimilarityColor(formData.similarityThreshold)} font-medium`}>
                    {formData.similarityThreshold || 30}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Students with similarity above this threshold will receive a score of zero.
                </p>
              </div>
              
              <div className="ml-6 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ignoreQuotes"
                    checked={formData.ignoreQuotes || false}
                    onChange={(e) => updateFormData({ ignoreQuotes: e.target.checked })}
                    className="w-4 h-4 text-teal-600 mr-2"
                  />
                  <label htmlFor="ignoreQuotes" className="text-gray-700">
                    Ignore Quoted Text
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ignoreReferences"
                    checked={formData.ignoreReferences || false}
                    onChange={(e) => updateFormData({ ignoreReferences: e.target.checked })}
                    className="w-4 h-4 text-teal-600 mr-2"
                  />
                  <label htmlFor="ignoreReferences" className="text-gray-700">
                    Ignore References/Bibliography
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* NLP Marking Settings */}
      <div className="bg-white p-4 rounded-md border">
        <h3 className="text-lg font-medium mb-3">NLP Marking Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cosine Similarity Threshold
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.cosineSimilarityThreshold || 0.7}
                onChange={(e) => updateFormData({ cosineSimilarityThreshold: parseFloat(e.target.value) })}
                className="w-64 mr-4"
              />
              <span className="text-gray-700">
                {formData.cosineSimilarityThreshold || 0.7}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="cursor-help underline dotted" title="Cosine similarity measures how similar two text documents are regardless of their size. A value of 1.0 means the answers are identical, while 0.0 means they have nothing in common.">
                Cosine Similarity
              </span> threshold for scoring essay questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsStep;