// src/components/assessment/QuestionsStep.jsx
import { useState } from 'react';
import MCQQuestion from './QuestionType/MCQQuestion';
import EssayQuestion from './QuestionType/EssayQuestion';
import FileUploadQuestion from './QuestionType/FileUploadQuestion';

const QuestionsStep = ({ questions, updateQuestions, errors }) => {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(
    questions.length > 0 ? 0 : null
  );
  const [questionType, setQuestionType] = useState('mcq');

  // const addQuestion = () => {
  //   const newQuestion = {
  //     id: Date.now(), // Temporary ID for UI purposes
  //     text: '',
  //     type: questionType,
  //     maxMark: 10,
  //   };
    
  //   // Add default fields based on question type
  //   if (questionType === 'mcq') {
  //     newQuestion.options = [
  //       { text: '' },
  //       { text: '' }
  //     ];
  //     newQuestion.correctOption = null;
  //   } else if (questionType === 'essay') {
  //     newQuestion.wordLimit = 500;
  //     newQuestion.modelAnswer = '';
  //     newQuestion.keywords = [];
  //   }
    
  //   const updatedQuestions = [...questions, newQuestion];
  //   updateQuestions(updatedQuestions);
  //   setActiveQuestionIndex(updatedQuestions.length - 1);
  // };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: questionType,
      maxMark: 10,
      // Reset fields based on type
      ...(questionType === 'mcq' && {
        options: [{ text: '' }, { text: '' }],
        correctOption: null
      }),
      ...(questionType === 'essay' && {
        wordLimit: 500,
        modelAnswer: '',
        keywords: []
      })
    };
    
    updateQuestions([...questions, newQuestion]);
    setActiveQuestionIndex(questions.length);
  };

  const updateQuestion = (index, updates) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    updateQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    updateQuestions(updatedQuestions);
    
    // Reset activeQuestionIndex if needed
    if (updatedQuestions.length === 0) {
      setActiveQuestionIndex(null);
    } else if (activeQuestionIndex >= updatedQuestions.length) {
      setActiveQuestionIndex(updatedQuestions.length - 1);
    }
  };

  const moveQuestion = (fromIndex, direction) => {
    if (
      (direction === 'up' && fromIndex === 0) ||
      (direction === 'down' && fromIndex === questions.length - 1)
    ) {
      return;
    }
    
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    const updatedQuestions = [...questions];
    const [removed] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, removed);
    
    updateQuestions(updatedQuestions);
    setActiveQuestionIndex(toIndex);
  };

  const renderQuestionForm = () => {
    if (activeQuestionIndex === null) return null;
    
    const question = questions[activeQuestionIndex];
    const questionErrors = Object.keys(errors)
      .filter(key => key.startsWith(`question_${activeQuestionIndex}_`))
      .reduce((obj, key) => {
        const errorKey = key.replace(`question_${activeQuestionIndex}_`, '');
        obj[errorKey] = errors[key];
        return obj;
      }, {});
    
    switch (question.type) {
      case 'mcq':
        return (
          <MCQQuestion 
            question={question}
            onChange={(updates) => updateQuestion(activeQuestionIndex, updates)}
            errors={questionErrors}
          />
        );
      case 'essay':
        return (
          <EssayQuestion 
            question={question}
            onChange={(updates) => updateQuestion(activeQuestionIndex, updates)}
            errors={questionErrors}
          />
        );
      case 'file':
        return (
          <FileUploadQuestion 
            question={question}
            onChange={(updates) => updateQuestion(activeQuestionIndex, updates)}
            errors={questionErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">Design Questions</h2>
      
      {/* Question type selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Question Type to Add
        </label>
        <div className="flex">
          <button
            className={`px-4 py-2 rounded-l ${
              questionType === 'mcq' ? 'bg-teal-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setQuestionType('mcq')}
          >
            Multiple Choice
          </button>
          <button
            className={`px-4 py-2 ${
              questionType === 'essay' ? 'bg-teal-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setQuestionType('essay')}
          >
            Essay
          </button>
          <button
            className={`px-4 py-2 rounded-r ${
              questionType === 'file' ? 'bg-teal-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setQuestionType('file')}
          >
            File Upload
          </button>
        </div>
        <button
          className="mt-3 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          onClick={addQuestion}
        >
          + Add Question
        </button>
      </div>
      
      {/* Questions list */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <h3 className="text-lg font-medium mb-3">Questions</h3>
          {questions.length === 0 ? (
            <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
              No questions added yet
            </div>
          ) : (
            <ul className="space-y-2">
              {questions.map((question, index) => (
                <li 
                  key={index} 
                  className={`
                    p-3 border rounded cursor-pointer flex justify-between
                    ${activeQuestionIndex === index ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}
                  `}
                  onClick={() => setActiveQuestionIndex(index)}
                >
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Q{index + 1}.</span>
                    <span className="text-sm">
                      {question.text ? 
                        (question.text.length > 30 ? 
                          question.text.substring(0, 30) + '...' : 
                          question.text) : 
                        'Untitled Question'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      className="text-gray-500 hover:text-gray-700 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveQuestion(index, 'up');
                      }}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button 
                      className="text-gray-500 hover:text-gray-700 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveQuestion(index, 'down');
                      }}
                      disabled={index === questions.length - 1}
                    >
                      ↓
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(index);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {errors.questions && (
            <p className="mt-2 text-sm text-red-500">{errors.questions}</p>
          )}
        </div>
        
        <div className="w-full md:w-2/3">
          <h3 className="text-lg font-medium mb-3">
            {activeQuestionIndex !== null ? `Question ${activeQuestionIndex + 1} Details` : 'Question Details'}
          </h3>
          {renderQuestionForm()}
        </div>
      </div>
    </div>
  );
};

export default QuestionsStep;