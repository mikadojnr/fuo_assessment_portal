// src/components/assessment/QuestionType/FileUploadQuestion.jsx
import { useState } from 'react';
import RichTextEditor from '../../ui/RichTextEditor';

const FileUploadQuestion = ({ question, onChange, errors }) => {
  const fileTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Microsoft Word (DOCX)' },
    { value: 'xlsx', label: 'Microsoft Excel (XLSX)' },
    { value: 'jpg,jpeg,png', label: 'Images (JPG, JPEG, PNG)' },
    { value: 'zip', label: 'ZIP Archive' },
  ];

  const toggleFileType = (type) => {
    const currentTypes = question.allowedFileTypes || [];
    if (currentTypes.includes(type)) {
      onChange({ allowedFileTypes: currentTypes.filter(t => t !== type) });
    } else {
      onChange({ allowedFileTypes: [...currentTypes, type] });
    }
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
          placeholder="Enter your file upload instructions here"
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
      
      {/* Allowed File Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allowed File Types
        </label>
        <div className="space-y-2">
          {fileTypes.map((type) => (
            <label key={type.value} className="flex items-center">
              <input
                type="checkbox"
                checked={question.allowedFileTypes?.includes(type.value) || false}
                onChange={() => toggleFileType(type.value)}
                className="w-4 h-4 text-teal-600 mr-2"
              />
              {type.label}
            </label>
          ))}
        </div>
      </div>
      
      {/* Max File Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Maximum File Size (MB)
        </label>
        <select
          value={question.maxFileSize || 10}
          onChange={(e) => onChange({ maxFileSize: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value={2}>2 MB</option>
          <option value={5}>5 MB</option>
          <option value={10}>10 MB</option>
          <option value={20}>20 MB</option>
          <option value={50}>50 MB</option>
        </select>
      </div>
      
      {/* Marking Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marking Instructions (Optional)
        </label>
        <textarea
          value={question.markingInstructions || ''}
          onChange={(e) => onChange({ markingInstructions: e.target.value })}
          placeholder="Provide instructions for marking this file submission"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>
    </div>
  );
};

export default FileUploadQuestion;
