import React, { useState } from 'react';
import Button from './Button';


const getFieldTypeName = (fieldType) => {
  const names = {
    'TEXT': 'Text',
    'NUMBER': 'Number',
    'EMAIL': 'Email',
    'MULTIPLE_CHOICE': 'Multiple Choice',
    'CHECKBOX': 'Checkboxes',
    'SINGLE_CHOICE': 'Single Choice',
    'FILE': 'File Upload',
    'DATE': 'Date',
    'STAR_RATING': 'Star Rating',
    'DROPDOWN': 'Dropdown'
  };
  return names[fieldType] || fieldType.replace('_', ' ');
};

const FormFieldEditor = ({ 
  field, 
  isActive, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onFocus, 
  onBlur 
}) => {
  const [showValidation, setShowValidation] = useState(false);
  const [showConditions, setShowConditions] = useState(false);

  const handleFieldChange = (property, value) => {
    onUpdate({ [property]: value });
  };

  const handleOptionChange = (index, property, value) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = { ...newOptions[index], [property]: value };
    handleFieldChange('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(field.options || [])];
    newOptions.push({ 
      label: `Option ${newOptions.length + 1}`, 
      value: `option${newOptions.length + 1}` 
    });
    handleFieldChange('options', newOptions);
  };

  const removeOption = (index) => {
    const newOptions = field.options.filter((_, i) => i !== index);
    handleFieldChange('options', newOptions);
  };

  const renderFieldPreview = () => {
    const baseInputClass = "w-full p-3 border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors";
    
    switch (field.fieldType) {
      case 'TEXT':
        return (
          <input
            type="text"
            placeholder={field.placeholder || "Enter text..."}
            disabled
            className={baseInputClass}
          />
        );
      
      case 'EMAIL':
        return (
          <input
            type="email"
            placeholder={field.placeholder || "Enter email address..."}
            disabled
            className={baseInputClass}
          />
        );
      
      case 'NUMBER':
        return (
          <input
            type="number"
            placeholder={field.placeholder || "Enter number..."}
            disabled
            className={baseInputClass}
          />
        );
      
      case 'DATE':
        return (
          <input
            type="date"
            disabled
            className={baseInputClass}
          />
        );
      
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {(field.options || []).map((option, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  disabled
                  className="w-4 h-4 text-black"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'CHECKBOX':
        return (
          <div className="space-y-3">
            {(field.options || []).map((option, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 text-black rounded"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'SINGLE_CHOICE':
        return (
          <div className="space-y-3">
            {(field.options || []).map((option, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  disabled
                  className="w-4 h-4 text-black"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'DROPDOWN':
        return (
          <select disabled className={baseInputClass}>
            <option>Choose an option...</option>
            {(field.options || []).map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'FILE':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-600">Click or drag files here to upload</div>
            <div className="text-sm text-gray-400 mt-1">Max file size: 10MB</div>
          </div>
        );
      
      case 'STAR_RATING':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} disabled className="text-2xl text-gray-300">
                ⭐
              </button>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            placeholder="Field preview"
            disabled
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div 
      className={`border rounded-lg transition-all duration-200 cursor-pointer overflow-hidden ${
        isActive 
          ? 'border-black bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
      }`}
      onClick={onFocus}
    >
      {/* Field Header */}
      <div className={`flex items-center justify-between p-4 ${isActive ? 'bg-blue-100 border-b border-blue-200' : 'bg-gray-50 border-b border-gray-100'}`}>
        <div className="flex items-center space-x-3">
          <div className="cursor-move text-gray-400 hover:text-gray-600">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10 3a1 1 0 11-2 0 1 1 0 012 0zM10 8a1 1 0 11-2 0 1 1 0 012 0zM10 13a1 1 0 11-2 0 1 1 0 012 0zM6 3a1 1 0 11-2 0 1 1 0 012 0zM6 8a1 1 0 11-2 0 1 1 0 012 0zM6 13a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {getFieldTypeName(field.fieldType)}
            </span>
          </div>
        </div>
        
        {isActive && (
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
              title="Duplicate field"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V2z"/>
                <path d="M2 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-1h-1v1a1 1 0 01-1 1H2a1 1 0 01-1-1V7a1 1 0 011-1h1V5H2z"/>
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-md transition-colors"
              title="Delete field"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.5 1h3a.5.5 0 01.5.5v1H6v-1a.5.5 0 01.5-.5zM11 2.5v-1A1.5 1.5 0 009.5 0h-3A1.5 1.5 0 005 1.5v1H2.5a.5.5 0 000 1h.538l.853 10.66A2 2 0 005.885 16h4.23a2 2 0 001.994-1.84L12.962 3.5h.538a.5.5 0 000-1H11z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Field Configuration */}
      {isActive && (
        <div className="p-4 bg-white border-b border-gray-100">
          <div className="space-y-4">
            {/* Field Label */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Field Label *
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => handleFieldChange('label', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="Enter field label"
              />
            </div>

            {/* Help Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Help Text
              </label>
              <input
                type="text"
                value={field.helpText || ''}
                onChange={(e) => handleFieldChange('helpText', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                placeholder="Add helpful description (optional)"
              />
            </div>

            {/* Placeholder (for text inputs) */}
            {['TEXT', 'EMAIL', 'NUMBER'].includes(field.fieldType) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => handleFieldChange('placeholder', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                  placeholder="Placeholder text for users"
                />
              </div>
            )}

            {/* Options (for choice fields) */}
            {['MULTIPLE_CHOICE', 'CHECKBOX', 'SINGLE_CHOICE', 'DROPDOWN'].includes(field.fieldType) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {(field.options || []).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-100 focus:outline-none transition-all"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={field.options.length <= 1}
                        title="Remove option"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M2.5 1a1 1 0 00-1 1v1a1 1 0 001 1H3v9a2 2 0 002 2h6a2 2 0 002-2V4h.5a1 1 0 001-1V2a1 1 0 00-1-1H10a1 1 0 00-1-1H7a1 1 0 00-1 1H2.5zm3 4a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7a.5.5 0 01.5-.5zM8 5a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7A.5.5 0 018 5zm3 .5v7a.5.5 0 01-1 0v-7a.5.5 0 011 0z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <span>+</span>
                    <span>Add Option</span>
                  </button>
                </div>
              </div>
            )}

            {/* Required Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Required Field
                </label>
                <p className="text-xs text-gray-500 mt-1">Make this field mandatory</p>
              </div>
              <button
                onClick={() => handleFieldChange('isRequired', !field.isRequired)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  field.isRequired ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    field.isRequired ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Preview */}
      <div className="p-4 bg-gray-50">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <label className="text-base font-medium text-black">
              {field.label || 'Untitled Field'}
            </label>
            {field.isRequired && (
              <span className="text-red-500 text-sm">*</span>
            )}
          </div>
          
          {field.helpText && (
            <p className="text-sm text-gray-600">{field.helpText}</p>
          )}
          
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            {renderFieldPreview()}
          </div>
          
          {!isActive && (
            <div className="text-xs text-gray-400 italic">
              Click to edit this field
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormFieldEditor;