// src/hooks/useAssessmentDraft.js
import { useState, useEffect, useCallback } from 'react';
import { saveAssessmentDraft } from '../services/assessmentService';
import { toast } from 'react-toastify';


const useAssessmentDraft = (initialData, draftId) => {
  const [formData, setFormData] = useState(initialData || {});
  const [lastSaved, setLastSaved] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(draftId);

  const updateFormData = useCallback((updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      setHasChanges(true);
      return newData;
    });
  }, []);

  const saveDraft = useCallback(async (isAutoSave = false) => {
    if (!hasChanges && currentDraftId) return;

    try {
      setIsSaving(true);
      const { draftId: newDraftId } = await saveAssessmentDraft({
        ...formData,
        draftId: currentDraftId,
      });

      setLastSaved(new Date());
      setHasChanges(false);
      
      if (newDraftId && !currentDraftId) {
        setCurrentDraftId(newDraftId);
      }

      if (!isAutoSave) {
        toast.success('Draft saved successfully', { autoClose: 2000 });
      }
      
      return newDraftId || currentDraftId;
    } catch (error) {
      toast.error(`Save failed: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [formData, currentDraftId, hasChanges]);
  
  
  // Auto-save effect
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (hasChanges) saveDraft(true);
    }, 60000);

    return () => clearInterval(autoSave);
  }, [hasChanges, saveDraft]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  return {
    formData,
    updateFormData,
    saveDraft,
    lastSaved,
    saveMessage,
    isSaving,
    hasChanges,
    draftId: currentDraftId,
    setHasChanges,
  };
};

export default useAssessmentDraft;