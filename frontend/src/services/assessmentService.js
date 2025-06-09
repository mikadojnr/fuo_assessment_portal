// src/services/assessmentService.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';



const formatUTCDate = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};



const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // or use cookies/sessionStorage/etc.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {

    // Add specific handling for 500 errors
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      // You might want to log this to your error tracking service
    }

    return Promise.reject(error); // so services can still catch it if needed
  }
);




// Get courses taught by the current lecturer
export const getCourses = async () => {
  try {
    const response = await api.get('/assessments/courses');
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    toast.error('Failed to load courses. Please try again.');
    return [];
  }
};

// Create and publish an assessment
export const createAssessment = async (assessmentData) => {
  try {
    const response = await api.post('/assessments', {
      ...assessmentData,
      questions: assessmentData.questions.map(question => ({
        ...question,
        // Transform data for backend
        options: question.type === 'mcq' ? question.options : undefined,
        modelAnswer: question.type === 'essay' ? question.modelAnswer : undefined,
        keywords: question.type === 'essay' ? question.keywords : undefined
      }))
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to publish assessment');
  }
};

export const getCompletedAssessments = async () => {
  try {
    const response = await api.get('/lecturer/assessments/completed');
    console.log('Completed Assessments: ', response.data.completed);
    
    return response.data.completed || [];
  } catch (error) {
    console.error('Error fetching completed assessments:', error);
    toast.error('Failed to fetch completed assessments');
    return [];
  }
};

export const getActiveAssessments = async () => {
  try {
    const response = await api.get('/lecturer/assessments/active');
    console.log('Active Assessments: ', response.data.active);
    
    return response.data.active || [];
  } catch (error) {
    console.error('Error fetching active assessments:', error);
    toast.error('Failed to fetch active assessments');
    return [];
  }
};


// Save assessment draft
export const saveAssessmentDraft = async (draftData) => {
  try {
    const response = await api.post('/assessments/drafts', {
      ...draftData,
      created: formatUTCDate(new Date()),
      // createdBy: 'mikadojnr',
      lastModified: formatUTCDate(new Date()),
      // modifiedBy: 'mikadojnr'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error saving draft:', error);
    toast.error('Failed to save draft. Please try again.');
    throw error;
  }
};

export const getDrafts = async () => {
  try {
    const response = await api.get('/lecturer/assessments/drafts');    
    // console.log('drafts data: ',response.data);
    return response.data.drafts || [];
  } catch (error) {
    console.error('Error fetching drafts:', error);
    toast.error('Failed to fetch drafts');
    return [];
  }
};


export const loadDraftForEditing = async (draftId) => {
  try {
    const response = await api.get(`/assessments/drafts/${draftId}`);
    
    if (!response.data) {
      throw new Error('No draft data received');
    }

    // Transform the response data to match the form structure
    const draftData = {
      ...response.data,
      // Ensure these fields exist even if they're null/undefined
      title: response.data.title || '',
      description: response.data.description || '',
      courseId: response.data.courseId || '',
      questions: response.data.questions || [],
      startDate: response.data.startDate || '',
      endDate: response.data.endDate || '',
      shuffleQuestions: response.data.shuffleQuestions || false,
      shuffleOptions: response.data.shuffleOptions || true,
      enablePlagiarismCheck: response.data.enablePlagiarismCheck || true,
      similarityThreshold: response.data.similarityThreshold || 30,
      cosineSimilarityThreshold: response.data.cosineSimilarityThreshold || 0.7
    };
    
    return draftData;
    
  } catch (error) {
    console.error('Error loading draft:', error);
    toast.error(error.response?.data?.error || 'Could not load the draft. Please try again.');
    throw error;
  }
};

// Update an existing draft
export const updateAssessmentDraft = async (draftId, draftData) => {
  try {
    const response = await api.put(`/assessments/drafts/${draftId}`, draftData);
    return response.data;
  } catch (error) {
    console.error('Error updating draft:', error);
    toast.error('Could not update the draft. Please try again.');
    throw error;
  }
};

// Delete a draft
export const deleteDraft = async (draftId) => {
  try {
    await api.delete(`/assessments/drafts/${draftId}`);
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    toast.error('Failed to delete draft. Please try again.');
    throw error;
  }
};


// Assessment API functions

// Fetch a specific assessment
export const fetchAssessment = async (assessmentId) => {
  try {
    const response = await api.get(`/assessments/${assessmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    toast.error('Failed to fetch assessment. Please try again.');
    throw error;
  }
};



// Student assessment API functions

// Get data for student dashboard
export const studentDashboard = async () => {
  try {
    const response = await api.get('/student/dashboard');
    
    console.log('Upcoming Assessments: ', response.data);
    
    return response.data || {};
  } catch (error) {
    console.error('Error fetching upcoming assessments:', error);
    toast.error('Failed to fetch upcoming assessments');
    return {};
  }
};



// Save student assessment progress
export const saveAssessmentProgress = async (assessmentId, data) => {
  try {
    const response = await api.post(`/student/assessments/${assessmentId}/attempt`, data);
    return response.data;
  } catch (error) {
    console.error('Error saving assessment progress:', error);
    toast.error('Failed to save progress. Please try again.');
    throw error;
  }
};

// Submit completed assessment
export const submitAssessment = async (assessmentId, data) => {
  try {
    const response = await api.post(`/student/assessments/${assessmentId}/submit`, data);
    return response.data;
  } catch (error) {
    console.error('Error submitting assessment:', error);
    toast.error('Failed to submit assessment. Please try again.');
    throw error;
  }
};
