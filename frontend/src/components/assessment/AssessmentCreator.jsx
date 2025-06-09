import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicInfoStep from './BasicInfoStep';
import QuestionsStep from './QuestionsStep';
import AdvancedSettingsStep from './AdvancedSettingsStep';
import ReviewStep from './ReviewStep';
import AssessmentPreview from './AssessmentPreview';
import ProgressBar from '../ui/ProgressBar';
import { saveAssessmentDraft, createAssessment, updateAssessmentDraft, deleteDraft } from '../../services/assessmentService';
import { toast } from 'react-toastify';

const steps = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Questions' },
  { id: 3, name: 'Settings' },
  { id: 4, name: 'Review' }
];

const AssessmentCreator = ({ 
  initialData, 
  courses, 
  draftId,
  initialLastSaved, 
  onCancel 
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false); // Track if form has been interacted with
  const [currentDraftId, setCurrentDraftId] = useState(draftId || null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData]);

  // Update lastSaved when initialLastSaved changes
  useEffect(() => {
    if (initialLastSaved) {
      setLastSaved(initialLastSaved);
    }
  }, [initialLastSaved]);


  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates } ));
    setFormTouched(true)
  }


  // Load draft data when editing
  // useEffect(() => {
  //   const loadDraft = async () => {
  //     if (draftId) {
  //       setIsLoading(true);
  //       try {
  //         const draftData = await loadDraftForEditing(draftId);
  //         setFormData(draftData);
  //         setCurrentDraftId(draftId);
  //         setLastSaved(new Date(draftData.lastUpdated))
  //         toast.success('Draft loaded successfully');
  //       } catch (error) {
  //         toast.error(`Error loading draft: ${error.message}`);
  //         navigate('/lecturer-dashboard'); // Redirect on error
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     }
  //   };

  //   loadDraft();
  // }, [draftId, navigate]);

  // const updateFormData = (updates) => {
  //   setFormData(prev => ({ ...prev, ...updates }));
  //   setFormTouched(true); // Mark form as touched when data changes
  // };

  // Updated handleSaveDraft function with specific handling for updates
  const handleSaveDraft = async () => {
    setFormTouched(true);

    // Basic validation for required fields in current step
    if (currentStep === 1) {
      const newErrors = {}

      if (!formData.title) newErrors.title = 'Title is required';
      if (!formData.courseId) newErrors.courseId = 'Course selection is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';

      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end <= start) {
          newErrors.endDate = 'End date must be after start date';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Please fill in all required fields before saving!');
        return null;
      }
    }

    try {
      setIsSaving(true);
      setSaveMessage('Saving draft...');

      const draftPayload = {...formData};
      
      let response;
      if (currentDraftId) {
        // Update existing draft
        response = await updateAssessmentDraft(currentDraftId, draftPayload);
      } else {
        // Create new draft
        response = await saveAssessmentDraft(draftPayload);
      }
      
      // Update the current draft ID
      setCurrentDraftId(response.draftId);
      
      setLastSaved(new Date());
      setSaveMessage('Draft saved successfully!');
      toast.success('Draft saved successfully!');
      
      // Redirect to lecturer dashboard after successful save
      navigate('/lecturer-dashboard');
      
      return response.draftId;
    } catch (error) {
      setSaveMessage('Error saving draft: ' + error.message);
      toast.error('Error saving draft: ' + error.message);
      return currentDraftId;
    } finally {
      setIsSaving(false);
    }
  };


  // Add auto-save functionality
  useEffect(() => {
    let autoSaveTimer;

    if (formTouched && currentDraftId) {
      autoSaveTimer = setTimeout(() => {
        handleSaveDraft();
      }, 60000); // Auto-save after 1 minute of inactivity
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [formData, formTouched]);


  // Function to delete a draft
  const handleDeleteDraft = async (draftId) => {
    try {
      await deleteDraft(draftId);
      console.log(`Draft ${draftId} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting draft ${draftId}:`, error);
      // Continue with navigation even if draft deletion fails
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.title) newErrors.title = 'Title is required';
      if (!formData.courseId) newErrors.courseId = 'Course selection is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      
      // Check if end date is after start date
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end <= start) {
          newErrors.endDate = 'End date must be after start date';
        }
      }
    }

    if (currentStep === 2) {
      if (!formData.questions || formData.questions.length === 0) {
        newErrors.questions = 'At least one question is required';
      } else {
        formData.questions.forEach((question, index) => {
          if (!question.text) {
            newErrors[`question_${index}_text`] = 'Question text is required';
          }
          if (question.type === 'mcq') {
            if (!question.options || question.options.length < 2) {
              newErrors[`question_${index}_options`] = 'At least 2 options are required';
            }
            if (question.correctOption === undefined || question.correctOption === null) {
              newErrors[`question_${index}_correctOption`] = 'Correct answer must be selected';
            }
          }
          if (question.type === 'essay' && !question.modelAnswer) {
            newErrors[`question_${index}_modelAnswer`] = 'Model answer is required for essay questions';
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    setFormTouched(true); // Mark as touched when trying to advance
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
      setErrors({}); // Clear errors when moving to next step
    } else {
      toast.error('Complete form step before you proceed!')
    }
  };

  const handlePrev = () => {
    setCurrentStep(prevStep => prevStep - 1);
    window.scrollTo(0, 0);
    setErrors({}); // Clear errors when moving to previous step
  };

  const handlePublish = async () => {
    setFormTouched(true); // Mark as touched when trying to publish
    try {
      if (!validateCurrentStep()) return;
      
      setIsPublishing(true);
      
      // Include the draft ID if available so backend can handle draft cleanup
      const publishData = { ...formData };
      if (currentDraftId) {
        publishData.draftId = currentDraftId;
      }
      
      await createAssessment(publishData);
      toast.success('Assessment published successfully!');
      
      // Delete the draft after successful publishing
      if (currentDraftId) {
        await handleDeleteDraft(currentDraftId);
      }
      
      // Redirect to lecturer dashboard on successful publish
      navigate('/lecturer-dashboard');
    } catch (error) {
      toast.error(`Publication failed: ${error.message}`);
      setSaveMessage('Error publishing assessment: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const renderStepContent = () => {
    // Only pass errors if the form has been touched
    const displayErrors = formTouched ? errors : {};
    
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep 
            formData={formData} 
            updateFormData={updateFormData} 
            courses={courses}
            errors={displayErrors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <QuestionsStep 
            questions={formData.questions || []} 
            updateQuestions={(questions) => updateFormData({ questions })}
            errors={displayErrors}
          />
        );
      case 3:
        return (
          <AdvancedSettingsStep 
            formData={formData}
            updateFormData={updateFormData}
            errors={displayErrors}
          />
        );
      case 4:
        return (
          <ReviewStep 
            formData={formData}
            courses={courses}
            errors={displayErrors}
          />
        );
      default:
        return null;
    }
  };

  

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-8/12 bg-white shadow-md rounded-lg p-6">
        <ProgressBar 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={(step) => {
            setFormTouched(true);
            if (validateCurrentStep()) {
              setCurrentStep(step);
              setErrors({});
            }
          }} 
        />
        
        {/* Enhanced Draft Status Information */}
        <div className="mt-6 mb-4">
          {currentDraftId && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="text-sm text-gray-600">
                  Draft ID: {currentDraftId}
                </div>
                {lastSaved && (
                  <div className="text-sm text-gray-500">
                    Last modified: {new Date(lastSaved).toLocaleString()}
                  </div>
                )}
              </div>
              {/* <div className="text-sm text-gray-500">
                Modified by: {formData.modifiedBy || 'mikadojnr'}
              </div> */}
            </div>
          )}
          
          {saveMessage && (
            <div className={`text-sm mt-2 ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {saveMessage}
            </div>
          )}
        </div>

        
        <div className="mb-8">
          {renderStepContent()}
        </div>
        
        <div className="flex justify-between mt-8">
          <div>
            {currentStep > 1 && (
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={handlePrev}
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : currentDraftId ? 'Update Draft' : 'Save Draft'}
            </button>
            {currentStep < steps.length ? (
              <button 
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button 
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Panel: Preview */}
      <div className="w-full lg:w-4/12 sticky">
        <AssessmentPreview 
          formData={formData}
          courses={courses}
        />
      </div>
    </div>
  );
};

export default AssessmentCreator;