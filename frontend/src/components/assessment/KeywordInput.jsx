// src/components/assessment/KeywordInput.jsx
import { useState } from 'react';

const KeywordInput = ({ keywords = [], onChange }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newWeight, setNewWeight] = useState(10);
  
  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    
    const updatedKeywords = [
      ...keywords,
      { 
        text: newKeyword.trim(), 
        weight: newWeight 
      }
    ];
    
    onChange(updatedKeywords);
    setNewKeyword('');
    setNewWeight(10);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };
  
  const handleRemoveKeyword = (index) => {
    const updatedKeywords = keywords.filter((_, i) => i !== index);
    onChange(updatedKeywords);
  };
  
  const handleWeightChange = (index, weight) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index] = { ...updatedKeywords[index], weight };
    onChange(updatedKeywords);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a keyword"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
        />
        <div className="flex items-center">
          <label className="text-sm text-gray-500 mr-2">Weight:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={newWeight}
            onChange={(e) => setNewWeight(parseInt(e.target.value) || 0)}
            className="w-16 px-2 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="button"
          onClick={handleAddKeyword}
          className="px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Add
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {keywords.map((keyword, index) => (
          <div 
            key={index} 
            className="flex items-center bg-gray-100 rounded-full px-3 py-1"
          >
            <span className="mr-1">{keyword.text}</span>
            <span className="text-xs text-gray-500">
              ({keyword.weight}%)
            </span>
            <button
              type="button"
              onClick={() => handleRemoveKeyword(index)}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
        
        {keywords.length === 0 && (
          <div className="text-gray-500 text-sm">No keywords added</div>
        )}
      </div>
      
      {keywords.length > 0 && (
        <div className="mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 pl-3">Keyword</th>
                <th className="text-left py-2">Weight (%)</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((keyword, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 pl-3">{keyword.text}</td>
                  <td className="py-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={keyword.weight}
                      onChange={(e) => handleWeightChange(index, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KeywordInput;