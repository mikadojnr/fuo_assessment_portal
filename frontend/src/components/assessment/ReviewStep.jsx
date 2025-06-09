// src/components/assessment/ReviewStep.jsx
import { useState } from 'react';

const ReviewStep = ({ formData, courses, errors }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id.toString() === courseId?.toString());
    return course ? `${course.code} - ${course.title}` : 'Unknown Course';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTotalMarks = () => {
    return formData.questions?.reduce((sum, q) => sum + (q.maxMark || 0), 0) || 0;
  };

  const getQuestionTypeText = (type) => {
    switch (type) {
      case 'mcq': return 'Multiple Choice';
      case 'essay': return 'Essay';
      case 'file': return 'File Upload';
      default: return type;
    }
  };

  const renderQuestionDetails = (question, index) => (
    <div key={index} className="border rounded p-3 mb-4">
      <div className="flex justify-between mb-2">
        <h4 className="font-medium">Question {index + 1}</h4>
        <span className="text-gray-500 text-sm">
          {getQuestionTypeText(question.type)} • {question.maxMark || 0} marks
        </span>
      </div>

      <div dangerouslySetInnerHTML={{ __html: question.text }} />

      {question.type === 'mcq' && (
        <div className="mt-3">
          <p className="text-sm text-gray-500 mb-1">Options:</p>
          <ul className="list-disc list-inside pl-2">
            {question.options?.map((option, optIndex) => (
              <li
                key={optIndex}
                className={optIndex === question.correctOption ? 'font-medium text-green-600' : ''}
              >
                {option.text || `Option ${String.fromCharCode(65 + optIndex)}`}
                {optIndex === question.correctOption && ' (Correct)'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {question.type === 'essay' && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-gray-500">
            Word Limit: {question.wordLimit || 500} words
          </p>
          {question.keywords?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Keywords:</p>
              <div className="flex flex-wrap gap-1">
                {question.keywords.map((keyword, kIndex) => (
                  <span key={kIndex} className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {keyword.text} ({keyword.weight}%)
                  </span>
                ))}
              </div>
            </div>
          )}
          {question.modelAnswer && (
            <div className="mt-4 bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Model Answer:</h4>
              <div dangerouslySetInnerHTML={{ __html: question.modelAnswer }} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Check for missing required fields
  const missingFields = [];
  if (!formData.title) missingFields.push('Assessment title');
  if (!formData.courseId) missingFields.push('Course selection');
  if (!formData.startDate) missingFields.push('Start date');
  if (!formData.endDate) missingFields.push('End date');
  if (!formData.questions?.length) missingFields.push('Questions');

  // Check question completeness
  formData.questions?.forEach((q, index) => {
    if (!q.text) missingFields.push(`Question ${index + 1} text`);
    if (q.type === 'mcq' && (!q.options || q.options.length < 2)) {
      missingFields.push(`Question ${index + 1} options`);
    }
    if (q.type === 'essay' && !q.modelAnswer) {
      missingFields.push(`Question ${index + 1} model answer`);
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">Review Assessment</h2>

      {missingFields.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Warning:</span> Missing required fields:
              </p>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                {missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white p-4 rounded-md border">
        <h3 className="text-lg font-medium mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Title</p>
            <p className="font-medium">{formData.title || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Course</p>
            <p className="font-medium">{getCourseTitle(formData.courseId)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-medium">{formatDate(formData.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p className="font-medium">{formatDate(formData.endDate)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <div className="border rounded p-2 mt-1 bg-gray-50 min-h-[100px]">
              {formData.description ? (
                <div dangerouslySetInnerHTML={{ __html: formData.description }} />
              ) : (
                <p className="text-gray-400 italic">No description provided</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white p-4 rounded-md border">
        <h3 className="text-lg font-medium mb-3">Questions</h3>
        <p className="text-sm text-gray-500 mb-3">Total Marks: {getTotalMarks()}</p>

        {formData.questions?.length > 0 ? (
          <div className="space-y-4">
            {formData.questions.map((question, index) => renderQuestionDetails(question, index))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No questions added</p>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white p-4 rounded-md border">
        <h3 className="text-lg font-medium mb-3">Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Shuffle Questions</p>
            <p className="font-medium">{formData.shuffleQuestions ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Shuffle Options</p>
            <p className="font-medium">{formData.shuffleOptions ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Plagiarism Check</p>
            <p className="font-medium">{formData.enablePlagiarismCheck ? 'Enabled' : 'Disabled'}</p>
          </div>
          {formData.enablePlagiarismCheck && (
            <>
              <div>
                <p className="text-sm text-gray-500">Similarity Threshold</p>
                <p className="font-medium">{formData.similarityThreshold || 30}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ignore Quotes</p>
                <p className="font-medium">{formData.ignoreQuotes ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ignore References</p>
                <p className="font-medium">{formData.ignoreReferences ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cosine Similarity</p>
                <p className="font-medium">{formData.cosineSimilarityThreshold || 0.7}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Optional Student Preview */}
      {/* <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide Student Preview' : 'Show Student Preview'}
        </button>
      </div>

      {showPreview && (
        <div className="mt-6">
          <AssessmentPreview formData={formData} courses={courses} />
        </div>
      )} */}
    </div>
  );
};

export default ReviewStep;
