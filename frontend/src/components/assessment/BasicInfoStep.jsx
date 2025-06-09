import { useState } from 'react';
import RichTextEditor from '../ui/RichTextEditor';
import DateTimePicker from '../ui/DateTimePicker';

const BasicInfoStep = ({ formData, updateFormData, courses, errors, setErrors }) => {
  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (title.length <= 100) {
      updateFormData({ title });
    }
  };

  // No validation useEffect here - validation happens in the parent component

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
      
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assessment Title*
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.title || ''}
            onChange={handleTitleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter assessment title"
          />
          <div className="absolute right-2 bottom-2 text-xs text-gray-500">
            {(formData.title || '').length}/100
          </div>
        </div>
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <RichTextEditor 
          value={formData.description || ''}
          onChange={(description) => updateFormData({ description })}
          placeholder="Enter assessment instructions or description"
        />
      </div>
      
      {/* Course Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Course*
        </label>
        <select
          value={formData.courseId || ''}
          onChange={(e) => updateFormData({ courseId: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.courseId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a course</option>
            {courses === undefined ? (
                <option disabled>Loading courses...</option>
                ) : courses.length === 0 ? (
                <option disabled>No courses available</option>
                ) : (
                courses.map((course) => (
                    <option key={course.id} value={course.id}>
                    {course.icon} {course.code} - {course.title}
                    </option>
                ))
            )}
        </select>
        {errors.courseId && <p className="mt-1 text-sm text-red-500">{errors.courseId}</p>}
      </div>
      
      {/* Date/Time Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time*
          </label>
          <DateTimePicker
            value={formData.startDate || ''}
            onChange={(startDate) => updateFormData({ startDate })}
            error={errors.startDate}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date & Time*
          </label>
          <DateTimePicker
            value={formData.endDate || ''}
            onChange={(endDate) => updateFormData({ endDate })}
            minDate={formData.startDate}
            error={errors.endDate}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mt-4">
        <p>* Required fields</p>
      </div>
    </div>
  );
};

export default BasicInfoStep;