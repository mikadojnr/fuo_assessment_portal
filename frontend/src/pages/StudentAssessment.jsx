import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft,
  ChevronRight,
  Flag,
  Check,
  Clock,
  AlertCircle,
  Maximize,
  Minimize,
  Moon,
  Sun,
  HelpCircle,
  FileText,
  X,
  Menu,
  Upload,
  RefreshCw,
  CheckCircle,
  Eye,
  Save,
  ArrowLeft,
  Italic, Bold, List
} from "lucide-react";

import { shuffleArray, generateSeed } from "../utils/randomize";
import { useAuth } from "../contexts/AuthContext";
import { 
  fetchAssessment,
  saveAssessmentProgress,
  submitAssessment,
 } from "../services/assessmentService";
import RichTextEditor from "../components/ui/RichTextEditor";


const Question = ({ 
  question, 
  index, 
  onAnswerChange, 
  currentAnswer, 
  flagged, 
  onToggleFlag, 
  darkMode, 
  fontSize,
  options = question.options 
}) => {
  const getWordCount = (html) => {
    if (!html) return 0;
    // Remove html tags and count words
    const text = html.replace(/<[^>]*>/g, ' ');
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  
  
  // File validation
  const validateFile = (file) => {
    if (!file) return { valid: false, error: 'No file selected' };

    // Check file size (default 10MB if not specified)
    const maxSize = (question.maxFileSize || 10) * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size exceeds ${question.maxFileSize || 10}MB limit` 
      };
    }

    // Check file type
    const allowedTypes = question.fileTypes || ['pdf', 'docx', 'jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return { 
        valid: false, 
        error: `File type not allowed. Accepted types: ${allowedTypes.join(', ')}` 
      };
    }

    return { valid: true };
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${
      darkMode ? "bg-gray-800" : "bg-white"
    }`}>
      {/* Question Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            darkMode 
              ? "bg-blue-900/30 text-blue-300" 
              : "bg-blue-100 text-blue-700"
          }`}>
            {question.type === "mcq" 
              ? "Multiple Choice" 
              : question.type === "essay" 
                ? "Essay" 
                : "File Upload"}
          </span>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            darkMode 
              ? "bg-green-900/30 text-green-300" 
              : "bg-green-100 text-green-700"
          }`}>
            {question.maxMark} points
          </span>
        </div>

        <button
          onClick={() => onToggleFlag(index)}
          className={`p-2 rounded-full transition-colors ${
            flagged
              ? darkMode
                ? "bg-yellow-900/30 text-yellow-300"
                : "bg-yellow-100 text-yellow-600"
              : darkMode
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-500"
          }`}
          aria-label={flagged ? "Unflag question" : "Flag question for review"}
        >
          <Flag size={16} />
        </button>
      </div>

      {/* Question Text */}
      <h2 
        className="text-xl font-medium mb-6"
        style={{ fontSize: `${fontSize}px` }}
      >
        Question {index + 1}: {question.text}
      </h2>

      {/* Multiple Choice Question */}
      {question.type === "mcq" && (
        <div className="space-y-3">
          {options.map((option, optionIndex) => (
            <label
              key={option.id}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
                currentAnswer?.selectedOption === optionIndex
                  ? darkMode
                    ? "bg-blue-900/30 border border-blue-500"
                    : "bg-blue-50 border border-blue-300"
                  : darkMode
                    ? "border border-gray-700 hover:bg-gray-700"
                    : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={`question-${index}`}
                checked={currentAnswer?.selectedOption === optionIndex}
                onChange={() => onAnswerChange(index, optionIndex)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
              />
              <span style={{ fontSize: `${fontSize}px` }}>{option.text}</span>
            </label>
          ))}
        </div>
      )}

      {/* Essay Question */}
      {question.type === "essay" && (
        <div className="space-y-4">
          <RichTextEditor
              value={currentAnswer?.content || ''} // Pass the curent HTML content
              onChange={(html) => onAnswerChange(index, html)} //Pass HTML content up
              placeholder={"Write your answer here..."}
              error={false} //Add error handling if needed
            />

          {/* Word Count */}
          {question.wordLimit > 0 && (
            <div className="flex justify-between text-sm">
              <span>Word limit: {question.wordLimit}</span>
              <span className={
                getWordCount(currentAnswer?.content || '') > question.wordLimit
                  ? "text-red-500"
                  : getWordCount(currentAnswer?.content || '') > question.wordLimit * 0.8
                    ? "text-yellow-500"
                    : "text-green-500"
              }>
                {getWordCount(currentAnswer?.content || '')} / {question.wordLimit} words
              </span>
            </div>
          )}

          {/* Keywords Display (if available) */}
          {/* {question.keywords && question.keywords.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Key Concepts to Include:</h3>
              <div className="flex flex-wrap gap-2">
                {question.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-full text-xs ${
                      darkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {keyword.text}
                  </span>
                ))}
              </div>
            </div>
          )} */}
        </div>
      )}

      {/* File Upload Question */}
      {question.type === "file" && (
        <div className="space-y-4">
          {currentAnswer ? (
            <div className={`p-4 rounded-lg border ${
              darkMode ? "border-gray-700" : "border-gray-300"
            }`}>
              <div className="flex items-center">
                <FileText size={24} className="mr-3 text-blue-500" />
                <div>
                  <p className="font-medium">{currentAnswer.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {Math.round(currentAnswer.fileSize / 1024)} KB • Uploaded{" "}
                    {new Date(currentAnswer.uploadTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onAnswerChange(index, null)}
                className={`mt-3 px-3 py-1 rounded text-sm ${
                  darkMode
                    ? "bg-red-900/30 text-red-300 hover:bg-red-900/50"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                <X size={14} className="inline-block mr-1" />
                Remove File
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                darkMode 
                  ? "border-gray-700 hover:border-gray-600" 
                  : "border-gray-300 hover:border-gray-400"
              } cursor-pointer transition-colors`}
              onClick={() => document.getElementById(`file-upload-${index}`).click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                const validation = validateFile(file);
                
                if (validation.valid) {
                  onAnswerChange(index, {
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    uploadTime: new Date().toISOString(),
                  });
                } else {
                  alert(validation.error);
                }
              }}
            >
              <Upload 
                size={32} 
                className={`mx-auto mb-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`} 
              />
              <p className="mb-2 font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">
                {question.fileTypes?.join(", ") || "PDF, DOCX, JPG"} (Max:{" "}
                {question.maxFileSize || 10}MB)
              </p>
              <input
                id={`file-upload-${index}`}
                type="file"
                className="hidden"
                accept={
                  question.fileTypes?.map((type) => `.${type}`).join(",") || 
                  ".pdf,.docx,.jpg,.jpeg,.png"
                }
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const validation = validateFile(file);
                  if (validation.valid) {
                    onAnswerChange(index, {
                      fileName: file.name,
                      fileSize: file.size,
                      fileType: file.type,
                      uploadTime: new Date().toISOString(),
                    });
                  } else {
                    alert(validation.error);
                    e.target.value = null; // Clear the input
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

};

// Question Navigation Sidebar Component
const QuestionSidebar = ({ 
  assessment, 
  currentIndex, 
  onNavigate, 
  answers, 
  flaggedQuestions, 
  darkMode,
  sidebarOpen,
  onToggleSidebar,
  onShowBreathingTool 
}) => {
  return (
    <aside
      className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      } border-r ${darkMode ? "border-gray-700" : "border-gray-200"} h-[calc(100vh-64px)]`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Questions</h2>
          <button 
            onClick={onToggleSidebar}
            className={`p-1 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex mb-4">
          <button
            className={`text-xs px-3 py-1 rounded-md mr-2 ${
              darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            className={`text-xs px-3 py-1 rounded-md flex items-center ${
              darkMode ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <Flag size={12} className="mr-1" />
            Flagged ({flaggedQuestions.length})
          </button>
        </div>

        {/* Question list */}
        <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
          {assessment.questions.map((question, index) => {
            const answer = answers[index];
            const isAnswered = answer?.isAnswered || false;
            const isFlagged = flaggedQuestions.includes(index);
            const isCurrent = index === currentIndex;
            
            return (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center text-sm ${
                  isCurrent
                    ? darkMode
                      ? "bg-blue-900/30 text-blue-300"
                      : "bg-blue-100 text-blue-800"
                    : darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                } ${
                  isFlagged
                    ? darkMode
                      ? "border-l-4 border-yellow-500"
                      : "border-l-4 border-yellow-500"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 mr-2">
                  {isFlagged ? (
                    <Flag size={16} className="text-yellow-500" />
                  ) : isAnswered ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  )}
                </div>
                <span className="truncate">Question {index + 1}</span>
                <span className="ml-auto text-xs opacity-70">{question.maxMark} pts</span>
              </button>
            );
          })}
        </div>

        {/* Resources section */}
        <div className="mt-6 border-t pt-4 border-gray-700">
          <h2 className="font-semibold mb-2">Resources</h2>
          <div className="space-y-1">
            <button
              className={`w-full text-left px-3 py-2 rounded-md flex items-center text-sm ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              onClick={onShowBreathingTool}
            >
              <HelpCircle size={16} className="mr-2" />
              Breathing Exercise
            </button>
            
            <button
              className={`w-full text-left px-3 py-2 rounded-md flex items-center text-sm ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <FileText size={16} className="mr-2" />
              Course Materials
            </button>
            
            <button
              className={`w-full text-left px-3 py-2 rounded-md flex items-center text-sm ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <Eye size={16} className="mr-2" />
              View Instructions
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Timer Component with smooth animation 
const AssessmentTimer = ({ timeRemaining, darkMode }) => {
  const getTimeColor = () => {
    if (timeRemaining > 1800) return "text-green-500"; // > 30 minutes
    if (timeRemaining > 600) return "text-yellow-500"; // > 10 minutes
    return "text-red-500"; // < 10 minutes
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex items-center ${getTimeColor()} font-mono text-lg`}>
      <Clock size={18} className="mr-1" />
      {formatTime(timeRemaining)}
    </div>
  );
};






// Main Assessment Component
export default function StudentAssessment() {

  // State
  const { assessmentId } = useParams()
  const navigate = useNavigate()

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved', 'saving', 'error'
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBreathingTool, setShowBreathingTool] = useState(false);
  const [networkStatus, setNetworkStatus] = useState("online");
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [assessmentComplete, setAssessmentComplete] = useState(false);


  // New states
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  const [randomizedOptionsMap, setRandomizedOptionsMap] = useState({});

  const mainContentRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);

  const {currentUser} = useAuth();
  const userUUId = currentUser?.id;
  

  // Initialize assessment
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        setLoading(true);
        // Fetch assessment data (using mock data in this demo)
        const data = await fetchAssessment(assessmentId);


        // Initialize answers state with empty/default values
      const initialAnswers = {};
      data.questions.forEach((question, index) => {
        switch (question.type) {
          case 'essay':
            initialAnswers[index] = {
              type: 'essay',
              content: '',
              isAnswered: false
            };
            break;
          case 'mcq':
            initialAnswers[index] = {
              type: 'mcq',
              selectedOption: null,
              isAnswered: false
            };
            break;
          case 'file':
            initialAnswers[index] = {
              type: 'file',
              file: null,
              isAnswered: false
            };
            break;
        }

      });
      setAnswers(initialAnswers);

        // Handle question and option and randomization
        if (data.shuffleQuestions) {
          const seed = generateSeed(userUUId, data.id);
          const shuffled = shuffleArray(data.questions);
          setRandomizedQuestions(shuffled);
        } else {
          setRandomizedQuestions(data.questions);
        }

        // Handle options randomization for MCQs
        if (data.shuffleOptions) {
          const optionsMap = {}
          data.questions.forEach(question => {
            if (question.type === 'mcq') {
              optionsMap[question.id] = shuffleArray(question.options);
            }
          })
          setRandomizedOptionsMap(optionsMap)
        }
        
        setAssessment(data)

        
        // Set up timer
        const now = new Date();
        const endTime = new Date(data.endDate);
        const diffMs = Math.max(0, endTime - now);
        const diffSec = Math.floor(diffMs / 1000);
        setTimeRemaining(diffSec);
        
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load assessment");
        setLoading(false);
      }
    };
    
    initializeAssessment();
    
    // Set up auto-save interval
    autoSaveIntervalRef.current = setInterval(() => {
      saveProgress();
    }, 30000); // Auto-save every 30 seconds
    
    // Set up network status listener
    const handleOnline = () => setNetworkStatus("online");
    const handleOffline = () => setNetworkStatus("offline");
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      clearInterval(autoSaveIntervalRef.current);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [assessmentId, userUUId]);
  
  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || assessmentComplete) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show warnings when time is running out
        if (newTime === 300) { // 5 minutes
          showTimeWarning(5);
        } else if (newTime === 60) { // 1 minute
          showTimeWarning(1);
        } else if (newTime <= 0) {
          clearInterval(timer);
          autoSubmit();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, assessmentComplete]);
  
  // Handle answer changes
  const handleAnswerChange = (questionIndex, answer) => {
  const questionType = assessment.questions[questionIndex].type;

  let newAnswer;

  const cleanContent = typeof answer === 'string' 
        ? answer.replace(/<[^>]*>/g, '').trim() 
        : '';

  switch (questionType) {
    case 'essay':
      
      newAnswer = {
        type: 'essay',
        content: answer,
        isAnswered: cleanContent.length > 0
      };
      break;

    case 'mcq':
      newAnswer = {
        type: 'mcq',
        selectedOption: answer,
        isAnswered: answer !== null && answer !== undefined
      };
      break;

    case 'file':
      newAnswer = {
        type: 'file',
        file: answer,
        isAnswered: !!answer
      };
      break;
  }

  setAnswers(prev => ({
    ...prev,
    [questionIndex]: newAnswer
  }));

  // Trigger save after delay
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }

  saveTimeoutRef.current = setTimeout(() => {
    saveProgress();
  }, 1000);
};
  
  

// Update getQuestionStatus to check essay answers correctly
const getQuestionStatus = (index) => {
  if (flaggedQuestions.includes(index)) {
    return "flagged";
  }

  const answer = answers[index]

  if (answer && answer.isAnswered) {
    return "answered";
  }

  if (index === currentQuestionIndex) {
    return "current";
  }

  return "unanswered";
};

  // Add Description card component
  const AssessmentDescription = ({description, darkMode}) => (
    <div className={`mb-6 p-6 rounded-lg shadow-md  ${
      darkMode ? "bg-gray-800" : "bg-white"}`}>
      <h2 className="text-lg font-semibold mb-3">Instructions</h2>
      <div className={`prose ${darkMode ? "prose-invert" : ""} max-w-none`}>
        {description}
      </div>
    </div>
  )
  
  // Toggle flagged question
  const toggleFlaggedQuestion = (index) => {
    setFlaggedQuestions(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  // Navigate to question
  const navigateToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  };
  
  // Save progress
  const saveProgress = async () => {
    if (saveStatus === "saving" || !assessment || assessmentComplete) return;
    
    try {
      setSaveStatus("saving");
      
      const formattedAnswers = Object.entries(answers).reduce((acc, [index, answer]) => {
        acc[index] = answer.type === 'essay' ? answer.content : answer;
        return acc
      }, {})

      await saveAssessmentProgress(assessment.id, {
        answers: formattedAnswers,
        flaggedQuestions,
        timestamp: new Date().toISOString()
      });
      
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      console.error('Save progress error:', error);
      
      
      // Retry after delay
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress();
      }, 5000);
    }
  };
  
  // Auto submit when time expires
  const autoSubmit = async () => {
    await saveProgress();
    handleSubmit();
  };
  
  // Show time warning
  const showTimeWarning = (minutes) => {
    // Creating a simplified warning alert for demo
    alert(`Time Warning: You have ${minutes} minute${minutes > 1 ? 's' : ''} remaining!`);
  };
  
  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Submit assessment
  const handleSubmit = async () => {
    try {
      await submitAssessment(assessment.id, {
        answers,
        flaggedQuestions,
      });
      
      setAssessmentComplete(true);
      navigate("/student-dashboard", {
        state: {message: "Assessment submitted successfully!"}
      })
    } catch (error) {
      setError("Failed to submit assessment. Please try again.");
    }
  };
  
  // Calculate progress
  const calculateProgress = () => {
    if (!assessment) return 0;
    
    const answeredCount = Object.values(answers).filter(answer => 
      answer?.isAnswered === true
    ).length;
    
    return Math.round((answeredCount / assessment.questions.length) * 100);
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent shortcuts when typing in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }
      
      // Left arrow: previous question
      if (e.key === "ArrowLeft") {
        if (currentQuestionIndex > 0) {
          navigateToQuestion(currentQuestionIndex - 1);
        }
      }
      
      // Right arrow: next question
      if (e.key === "ArrowRight") {
        if (assessment && currentQuestionIndex < assessment.questions.length - 1) {
          navigateToQuestion(currentQuestionIndex + 1);
        }
      }
      
      // F key: flag/unflag question
      if (e.key === "f" || e.key === "F") {
        toggleFlaggedQuestion(currentQuestionIndex);
      }
      
      // S key: save progress
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveProgress();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentQuestionIndex, assessment]);
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg font-medium">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load assessment</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw size={16} className="inline mr-2" />
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Render assessment completion state
  if (assessmentComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Assessment Submitted</h2>
          <p className="text-gray-600 mb-6">
            Your answers have been successfully submitted. Thank you for completing the assessment.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ArrowLeft size={16} className="inline mr-2" />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render breathing exercise modal
  const BreathingToolModal = () => (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? "bg-black/70" : "bg-black/50"}`}>
      <div className={`relative max-w-md w-full p-6 rounded-lg shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <button
          onClick={() => setShowBreathingTool(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Breathing Exercise</h2>
        <p className="mb-6">Take a moment to calm your mind with this breathing exercise.</p>
        
        <div className="relative w-40 h-40 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 opacity-50"></div>
          <div
            className="absolute inset-0 rounded-full border-4 border-blue-500"
            style={{
              animation: "breathe 8s infinite ease-in-out",
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-sm">
            Breathe
          </div>
        </div>
        
        <p className="text-center text-sm">
          Breathe in as the circle expands and out as it contracts. Continue for at least 1 minute.
        </p>
      </div>
    </div>
  );

  // Render confirm submit modal
  const ConfirmSubmitModal = () => {
    const unansweredCount = assessment.questions.length - Object.keys(answers).length;
    
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? "bg-black/70" : "bg-black/50"}`}>
        <div className={`relative max-w-md w-full p-6 rounded-lg shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
          
          {unansweredCount > 0 ? (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md dark:bg-yellow-900/30 dark:text-yellow-200">
              <AlertCircle size={18} className="inline-block mr-2" />
              You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}.
            </div>
          ) : (
            <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md dark:bg-green-900/30 dark:text-green-200">
              <CheckCircle size={18} className="inline-block mr-2" />
              You have answered all questions.
            </div>
          )}
          
          <p className="mb-6">
            Are you sure you want to submit your assessment? Once submitted, you will not be able to make any changes.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmSubmit(false)}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Confirm Submission
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header className={`px-4 h-16 flex items-center justify-between border-b ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } shadow-sm z-10`}>
        <div className="flex items-center">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className={`mr-3 p-2 rounded-md ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
            >
              <Menu size={20} />
            </button>
          )}
         
          <div className="flex flex-col">
            <h1 className="font-bold truncate max-w-xs">
              {assessment?.courseCode}: {assessment?.courseTitle}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {assessment?.title || "Assessment"}
            </p>
          </div>

        </div>
        
        <div className="flex items-center space-x-4">
          {networkStatus === "offline" && (
            <div className="flex items-center text-red-500">
              <AlertCircle size={16} className="mr-1" />
              <span className="text-sm">Offline</span>
            </div>
          )}
          
          {saveStatus === "saving" ? (
            <div className="flex items-center text-blue-500">
              <RefreshCw size={16} className="mr-1 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          ) : saveStatus === "saved" ? (
            <div className="flex items-center text-green-500">
              <Check size={16} className="mr-1" />
              <span className="text-sm">Saved</span>
            </div>
          ) : (
            <div className="flex items-center text-red-500">
              <AlertCircle size={16} className="mr-1" />
              <span className="text-sm">Save failed</span>
            </div>
          )}
          
          <AssessmentTimer timeRemaining={timeRemaining} darkMode={darkMode} />
          
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={toggleFullScreen}
              className={`p-2 rounded-md ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        <QuestionSidebar
          assessment={assessment}
          currentIndex={currentQuestionIndex}
          onNavigate={navigateToQuestion}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          darkMode={darkMode}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onShowBreathingTool={() => setShowBreathingTool(true)}
        />
        
        <main
          ref={mainContentRef}
          className={`flex-1 p-4 overflow-y-auto ${!sidebarOpen ? "ml-0" : ""}`}
        >
          {/* Assessment Description */}
          <AssessmentDescription
            description={assessment.description}
            darkMode={darkMode}
          />


          {/* Font size controls */}
          <div className="flex justify-end mb-4">
            <div className={`flex items-center rounded-md ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow p-1`}>
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className={`p-1 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                aria-label="Decrease font size"
              >
                A-
              </button>
              <span className="px-2 text-sm">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className={`p-1 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>
          </div>
          
          {/* Current question */}
          <Question
            question={randomizedQuestions[currentQuestionIndex]}
            options={
              randomizedOptionsMap[randomizedQuestions[currentQuestionIndex]?.id] || 
              randomizedQuestions[currentQuestionIndex]?.options
            }
            index={currentQuestionIndex}
            onAnswerChange={handleAnswerChange}
            currentAnswer={answers[currentQuestionIndex]}
            flagged={flaggedQuestions.includes(currentQuestionIndex)}
            onToggleFlag={toggleFlaggedQuestion}
            darkMode={darkMode}
            fontSize={fontSize}
  
          />
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center px-4 py-2 rounded-lg ${
                currentQuestionIndex === 0
                  ? "opacity-50 cursor-not-allowed"
                  : darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            
            <div className="flex items-center">
              <div
                className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700"
                title={`${calculateProgress()}% complete`}
              >
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              <span className="ml-3 text-sm">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </span>
            </div>
            
            {currentQuestionIndex === assessment.questions.length - 1 ? (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
            )}
          </div>
        </main>
      </div>
      
      {/* Modals */}
      {showBreathingTool && <BreathingToolModal />}
      {showConfirmSubmit && <ConfirmSubmitModal />}
      
      {/* Global styles */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(0.8); }
          50% { transform: scale(1.2); }
        }
        
        /* Set global font size based on user preference */
        html {
          font-size: ${fontSize}px;
        }
        
        /* Draft.js editor styles */
        .DraftEditor-root {
          min-height: 150px;
        }
      `}</style>
    </div>
  );
}