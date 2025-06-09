// src/components/ui/DateTimePicker.jsx

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateTimePicker = ({ value, onChange, minDate, error }) => {
  const [startDate, setStartDate] = useState(value ? new Date(value) : null);

  useEffect(() => {
    if (value) setStartDate(new Date(value));
  }, [value]);

  return (
    <div className="w-full">
      <DatePicker
        selected={startDate}
        onChange={(date) => {
          setStartDate(date);
          onChange(date.toISOString());
        }}
        showTimeSelect
        dateFormat="MMMM d, yyyy h:mm aa"
        minDate={minDate ? new Date(minDate) : null}
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholderText="Select date and time"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DateTimePicker