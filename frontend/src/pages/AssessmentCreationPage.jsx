// src/pages/AssessmentCreationPage.jsx
import { useState, useEffect } from 'react';
import AssessmentCreator from '../components/assessment/AssessmentCreator';
import { useParams, useNavigate } from 'react-router-dom';
import { loadDraftForEditing, getCourses } from '../services/assessmentService';
import { toast } from 'react-toastify'

const AssessmentCreationPage = () => {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch courses taught by the lecturer
        const coursesData = await getCourses();
        setCourses(coursesData);

        // If draftId exists, load the draft
        if (draftId) {
          try {
            const draftData = await loadDraftForEditing(draftId);
            setInitialData(draftData);
            setLastSaved(new Date(draftData.lastUpdated))
            toast.success('Draft loaded successfully');
          } catch (draftError) {
            toast.error(`Error loading draft: ${draftError.message}`);
            navigate('/lecturer-dashboard');
            return
          }
          
        } else {
          // Set default values for a new assessment
          setInitialData({
            title: '',
            description: '',
            courseId: '',
            startDate: '',
            endDate: '',
            questions: [],
            shuffleQuestions: false,
            shuffleOptions: true,
            enablePlagiarismCheck: true,
            similarityThreshold: 30,
            ignoreQuotes: true,
            ignoreReferences: true,
            cosineSimilarityThreshold: 0.7,
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load initial data');
        toast.error('Failed to load initial data')
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [draftId, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">
        {draftId ? 'Edit Assessment Draft' : 'Create New Assessment'}
      </h1>
      <AssessmentCreator 
        initialData={initialData} 
        courses={courses}
        draftId={draftId}
        initialLastSaved={lastSaved}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default AssessmentCreationPage;