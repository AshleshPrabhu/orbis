import React, { useState } from 'react';
import Button from './Button';

const FormPreview = ({ form, isPublic = false, onSubmit }) => {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    form.fields.forEach(field => {
      if (field.isRequired && !responses[field.id]) {
        newErrors[field.id] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedResponses = form.fields.map(field => ({
        fieldId: field.id,
        value: responses[field.id] || null
      }));

      // You'll implement the API call here
      console.log('Submitting responses:', formattedResponses);
      onSubmit && onSubmit(formattedResponses);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const hasError = !!errors[field.id];
    const baseInputClass = `w-full p-4 border rounded-xl transition-all duration-200 ${
      hasError 
        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
        : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-100'
    } focus:outline-none`;

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <input
            type="text"
            placeholder={field.placeholder || "Enter text..."}
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        );
      
      case 'TEXTAREA':
        return (
          <textarea
            placeholder={field.placeholder || "Enter your response..."}
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows="5"
            className={`${baseInputClass} resize-none`}
          />
        );
      
      case 'EMAIL':
        return (
          <input
            type="email"
            placeholder={field.placeholder || "Enter email address..."}
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        );
      
      case 'NUMBER':
        return (
          <input
            type="number"
            placeholder={field.placeholder || "Enter number..."}
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        );
      
      case 'PHONE':
        return (
          <input
            type="tel"
            placeholder={field.placeholder || "Enter phone number..."}
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        );
      
      case 'DATE':
        return (
          <input
            type="date"
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        );
      
      case 'TIME':
        return (
          <input
            type="time"
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        );
      
      case 'URL':
        return (
          <input
            type="url"
            placeholder={field.placeholder || "https://example.com"}
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        );
      
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {(field.options || []).map((option, index) => (
              <label 
                key={index} 
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={option.value}
                  checked={responses[field.id] === option.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-4 h-4 text-black focus:ring-black"
                />
                <span className="text-gray-800 font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'CHECKBOXES':
        return (
          <div className="space-y-3">
            {(field.options || []).map((option, index) => (
              <label 
                key={index} 
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={(responses[field.id] || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = responses[field.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFieldChange(field.id, newValues);
                  }}
                  className="w-4 h-4 text-black focus:ring-black rounded"
                />
                <span className="text-gray-800 font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'DROPDOWN':
        return (
          <select 
            value={responses[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
          >
            <option value="">Choose an option...</option>
            {(field.options || []).map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'FILE_UPLOAD':
        return (
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              hasError ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              onChange={(e) => handleFieldChange(field.id, e.target.files[0])}
              className="hidden"
              id={`file-${field.id}`}
            />
            <label htmlFor={`file-${field.id}`} className="cursor-pointer">
              <div className="text-4xl mb-3">📎</div>
              <div className="text-gray-600 font-medium">Click to upload or drag and drop</div>
              <div className="text-sm text-gray-400 mt-2">
                {responses[field.id] ? responses[field.id].name : 'Max file size: 10MB'}
              </div>
            </label>
          </div>
        );
      
      case 'STAR_RATING':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleFieldChange(field.id, star)}
                className={`text-3xl transition-colors ${
                  responses[field.id] >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                }`}
              >
                ⭐
              </button>
            ))}
            {responses[field.id] && (
              <span className="ml-3 text-gray-600 font-medium">
                {responses[field.id]} / 5
              </span>
            )}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            placeholder="Unsupported field type"
            disabled
            className={`${baseInputClass} bg-gray-100`}
          />
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-36">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Form Header */}
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-3xl font-semibold text-black mb-3">
            {form.title || 'Untitled Form'}
          </h1>
          {form.description && (
            <p className="text-gray-600 leading-relaxed">
              {form.description}
            </p>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {form.fields.map((field, index) => (
              <div key={field.id} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <label className="text-lg font-medium text-black">
                    {field.label}
                  </label>
                  {field.isRequired && (
                    <span className="text-red-500 text-lg">*</span>
                  )}
                </div>
                
                {field.helpText && (
                  <p className="text-sm text-gray-600 -mt-1">
                    {field.helpText}
                  </p>
                )}
                
                <div>
                  {renderField(field)}
                </div>

                {errors[field.id] && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          {isPublic && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                className="w-full py-4 text-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </div>
          )}
        </form>

        {form.fields.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-black mb-2">
              No fields added yet
            </h3>
            <p className="text-gray-500">
              Add some fields to see how your form will look
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPreview;