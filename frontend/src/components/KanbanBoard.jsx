import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { FiMoreVertical, FiCalendar, FiEdit2, FiEye, FiTrash2, FiClock } from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"
import { deleteDraft } from "../services/assessmentService";
import { useState } from "react";
import { toast } from 'react-toastify';

const KanbanBoard = ({ 
  assessments, 
  onDragEnd,
  limit = null, // Optional limit parameter
  className = "", // Optional className for styling
  onUpdateAssessments
}) => {

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format date and time helper
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",     // e.g. "May"
      day: "numeric",     // e.g. 7
      year: "numeric",    // e.g. 2025
      hour: "numeric",    // e.g. 7
      minute: "2-digit",  // e.g. 00
      hour12: true        // AM/PM format
    });
  };

  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter assessments if limit is provided
  // Ensure assessments[category] is always an array
  const getLimitedAssessments = (category) => {
    const items = Array.isArray(assessments?.[category]) ? assessments[category] : [];
    return limit ? items.slice(0, limit) : items;
  };

  


  const handleEditDraft = (draftId) => {
    navigate(`/assessments/edit/${draftId}`);
  }

  const handleDeleteDraft = async (draftId) => {
    if (isDeleting) return; // Prevent multiple clicks
    
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteDraft(draftId);
      
      // Show success toast
      toast.success('Draft deleted successfully');

      // Update parent component's state
      if (onUpdateAssessments) {
        onUpdateAssessments(prev => ({
          ...prev,
          drafts: prev.drafts.filter(draft => draft.id !== draftId)
        }));
      }
    } catch (error) {
      console.error(`Error deleting draft ${draftId}:`, error);
      toast.error('Failed to delete draft');
    } finally {
      setIsDeleting(false);
    }
  };


  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {/* Drafts Column */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Drafts
          </h3>
          <Droppable droppableId="drafts">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 min-h-[200px]"
              >
                {getLimitedAssessments("drafts").map((assessment, index) => (
                  <Draggable
                    key={assessment.id}
                    draggableId={`draft-${assessment.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 mb-3 border-l-4 border-gray-300 dark:border-gray-600"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {assessment.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {assessment.course}
                            </p>
                          </div>
                          <div className="dropdown relative">
                            <button className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full">
                              <FiMoreVertical />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <FiCalendar className="mr-1" />
                          <span>Saved: {formatDate(assessment.lastUpdated)}</span>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>No submissions allowed</span>
                            <span>
                              N/A
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-muted-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (assessment.submissions /
                                    assessment.totalStudents) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>


                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              onClick={() => handleEditDraft(assessment.id)}
                            >
                              <FiEdit2 />
                            </button>
                            <button className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                              <FiEye />
                            </button>
                            <button className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              onClick={() => handleDeleteDraft(assessment.id)}
                              disabled={isDeleting}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                          <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                            Draft
                          </span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Active Column */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Active
          </h3>
          <Droppable droppableId="active">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 min-h-[200px]"
              >
                {getLimitedAssessments("active").map((assessment, index) => (
                  <Draggable
                    key={assessment.id}
                    draggableId={`active-${assessment.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 mb-3 border-l-4 border-[#00BFA5]"
                      >

                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {assessment.title}
                        </h4>

                        <div className="flex justify-between items-start mb-2 mt-1">
                          <div>
                            
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {assessment.course}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(assessment.status)}`}>
                            {assessment.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <FiClock className="mr-1" />
                          <span className="text-xs">
                            {assessment.status === 'ongoing' 
                              ? `Ends in: ${assessment.deadline}`
                              : `Starts: ${formatDateTime(assessment.startDate)}`}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Submissions</span>
                            <span>
                              {assessment.submissions}/{assessment.totalStudents}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                assessment.status === 'ongoing' 
                                  ? 'bg-green-500' 
                                  : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${assessment.progressPercentage}%`
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                              <FiEdit2 />
                            </button>
                            <button className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                              <FiEye />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Duration: {assessment.durationMinutes} mins
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Completed Column */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Completed
          </h3>
          <Droppable droppableId="completed">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 min-h-[200px]"
              >
                {getLimitedAssessments("completed").map((assessment, index) => (
                  <Draggable
                    key={assessment.id}
                    draggableId={`completed-${assessment.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 mb-3 border-l-4 border-blue-500 dark:border-blue-400"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {assessment.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {assessment.course}
                            </p>
                          </div>
                          <div className="dropdown relative">
                            <button className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full">
                              <FiMoreVertical />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <FiCalendar className="mr-1" />
                          <span>Due: {formatDate(assessment.deadline)}</span>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Submissions</span>
                            <span>
                              {assessment.submissions}/{assessment.totalStudents}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (assessment.submissions /
                                    assessment.totalStudents) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            View Results
                          </button>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  )
}

export default KanbanBoard