import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormFieldEditor from './FormFieldEditor';
import FormPreview from './FormPreview';
import Button from './Button';

const FormBuilder = ({ form = null, onSave, onCancel }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fields: [],
    contributors: []
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [draggedField, setDraggedField] = useState(null);

  // Load existing form data if editing
  useEffect(() => {
    if (form) {
      setFormData({
        title: form.title || '',
        description: form.description || '',
        fields: form.fields || [],
        contributors: form.contributors || []
      });
    }
  }, [form]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Add new field
  const addField = (fieldType) => {
    const newField = {
      id: `temp_${Date.now()}`,
      label: `New ${fieldType.replace('_', ' ')} Field`,
      fieldType,
      position: formData.fields.length + 1,
      isRequired: false,
      placeholder: '',
      helpText: '',
      options: ['MULTIPLE_CHOICE', 'DROPDOWN', 'CHECKBOXES', 'SINGLE_CHOICE'].includes(fieldType) ? 
        [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }] : null,
      validation: null,
      conditions: null
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setActiveFieldId(newField.id);
  };

  // Update field
  const updateField = (fieldId, updatedField) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updatedField } : field
      )
    }));
  };

  // Delete field
  const deleteField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
        .map((field, index) => ({ ...field, position: index + 1 }))
    }));
    setActiveFieldId(null);
  };

  // Duplicate field
  const duplicateField = (fieldId) => {
    const fieldToDuplicate = formData.fields.find(f => f.id === fieldId);
    if (fieldToDuplicate) {
      const duplicatedField = {
        ...fieldToDuplicate,
        id: `temp_${Date.now()}`,
        label: `Copy of ${fieldToDuplicate.label}`,
        position: formData.fields.length + 1
      };
      
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, duplicatedField]
      }));
    }
  };

  // Handle drag start
  const handleDragStart = (e, fieldId) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e, targetFieldId) => {
    e.preventDefault();
    
    if (!draggedField || draggedField === targetFieldId) return;

    const fields = [...formData.fields];
    const draggedIndex = fields.findIndex(f => f.id === draggedField);
    const targetIndex = fields.findIndex(f => f.id === targetFieldId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at target position
    const [draggedItem] = fields.splice(draggedIndex, 1);
    fields.splice(targetIndex, 0, draggedItem);

    // Update positions
    const updatedFields = fields.map((field, index) => ({
      ...field,
      position: index + 1
    }));

    setFormData(prev => ({ ...prev, fields: updatedFields }));
    setDraggedField(null);
  };

  // Save form (placeholder - you'll implement the API call)
  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a form title');
      return;
    }

    setIsSaving(true);
    try {
      // You'll implement the API call here
      console.log('Saving form:', formData);
      onSave && onSave(formData);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const fieldTypes = [
    { type: 'TEXT', label: 'Short Text', icon: '📝', description: 'Single line text input' },
    { type: 'TEXTAREA', label: 'Long Text', icon: '📄', description: 'Multi-line text area' },
    { type: 'EMAIL', label: 'Email', icon: '📧', description: 'Email address input' },
    { type: 'NUMBER', label: 'Number', icon: '🔢', description: 'Numeric input' },
    { type: 'PHONE', label: 'Phone', icon: '📞', description: 'Phone number input' },
    { type: 'DATE', label: 'Date', icon: '📅', description: 'Date picker' },
    { type: 'TIME', label: 'Time', icon: '⏰', description: 'Time picker' },
    { type: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: '⚪', description: 'Single selection from options' },
    { type: 'CHECKBOXES', label: 'Checkboxes', icon: '☑️', description: 'Multiple selections' },
    { type: 'DROPDOWN', label: 'Dropdown', icon: '📋', description: 'Dropdown selection' },
    { type: 'FILE_UPLOAD', label: 'File Upload', icon: '📎', description: 'File attachment' },
    { type: 'URL', label: 'Website URL', icon: '🔗', description: 'URL input' },
    { type: 'STAR_RATING', label: 'Star Rating', icon: '⭐', description: 'Star rating scale' }
  ];

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Header Bar for Preview */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40" style={{ top: '80px' }}>
          <div className="container-width py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-2xl font-semibold text-black flex items-center">
                    <span className="mr-2">👁️</span>
                    Form Preview
                  </h2>
                  <p className="text-sm text-gray-500">See how your form will look to respondents</p>
                </div>
              </div>
              <Button
                onClick={() => setIsPreviewMode(false)}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Editor</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Preview Content */}
        <div className="container-width pt-56 pb-12">
          <FormPreview form={formData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40" style={{ top: '80px' }}>
        <div className="container-width py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-semibold text-black">
                  {form ? 'Edit Form' : 'Create New Form'}
                </h1>
                <p className="text-sm text-gray-500">
                  Build your form by adding fields and customizing their properties
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIsPreviewMode(true)}
                variant="secondary"
                className="px-4 py-2"
              >
                👁️ Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="primary"
                className="px-6 py-2"
              >
                {isSaving ? '⏳ Saving...' : '💾 Save Form'}
              </Button>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  variant="text"
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top margin to account for fixed header */}
      <div className="container-width pt-56 pb-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Field Types Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-56">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-black flex items-center">
                  <span className="mr-2">🧩</span>
                  Form Elements
                </h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {fieldTypes.map((fieldType) => (
                    <button
                      key={fieldType.type}
                      onClick={() => addField(fieldType.type)}
                      className="w-full group flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform flex-shrink-0">
                        {fieldType.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-black">
                          {fieldType.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {fieldType.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Builder */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-96 mt-48 ">
              {/* Form Header Section */}
              <div className="p-6 border-b border-gray-100">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Untitled Form"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-2xl font-semibold text-black placeholder-gray-400 border-none outline-none focus:bg-gray-50 p-3 rounded-lg transition-colors"
                  />
                  <textarea
                    placeholder="Add a description to help people understand your form..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full text-gray-600 placeholder-gray-400 border-none outline-none focus:bg-gray-50 p-3 rounded-lg resize-none transition-colors"
                    rows="2"
                  />
                </div>
              </div>

              {/* Form Fields Section */}
              <div className="p-6">
                {formData.fields.length > 0 ? (
                  <div className="space-y-4">
                    {formData.fields.map((field, index) => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, field.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, field.id)}
                        className={`transition-all duration-200 ${
                          draggedField === field.id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <FormFieldEditor
                          field={field}
                          isActive={activeFieldId === field.id}
                          onUpdate={(updatedField) => updateField(field.id, updatedField)}
                          onDelete={() => deleteField(field.id)}
                          onDuplicate={() => duplicateField(field.id)}
                          onFocus={() => setActiveFieldId(field.id)}
                          onBlur={() => setActiveFieldId(null)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold text-black mb-2">
                      Start building your form
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Click on a field type from the sidebar to add your first question
                    </p>
                    <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
                      <span>💡</span>
                      <span>Tip: Drag fields to reorder them</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-56">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-black flex items-center">
                  <span className="mr-2">⚙️</span>
                  Form Settings
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Total Fields</span>
                      <span className="text-xl font-bold text-blue-600">{formData.fields.length}</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-900">Required Fields</span>
                      <span className="text-xl font-bold text-green-600">
                        {formData.fields.filter(f => f.isRequired).length}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Created By
                        </label>
                        <div className="text-sm text-black font-medium bg-gray-50 px-3 py-2 rounded-lg">
                          {user?.username || user?.email || 'Unknown User'}
                        </div>
                      </div>

                      {form && form.formUrl && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                            Form URL
                          </label>
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg font-mono break-all">
                            /form/{form.formUrl}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Status
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Draft</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;