import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsAPI } from '../api/api';
import FormPreview from './FormPreview';

const FormEdit = () => {
  const { formUrl } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(true);
  const [existingResponse, setExistingResponse] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  // Load form data
  useEffect(() => {
    const loadForm = async () => {
      try {
        const response = await formsAPI.getFormForDisplay(formUrl);
        const formData = response.form || response;
        
        if (!formData.isEditable) {
          setError('This form does not allow editing responses.');
          return;
        }
        
        setForm(formData);
      } catch (err) {
        console.error('Error loading form:', err);
        setError('Form not found or no longer available');
      } finally {
        setLoading(false);
      }
    };

    if (formUrl) {
      loadForm();
    }
  }, [formUrl]);

  // Load existing response with edit code
  const handleLoadResponse = async () => {
    if (!editCode.trim()) {
      alert('Please enter your edit code');
      return;
    }

    setLoading(true);
    try {
      const response = await formsAPI.getFormResponses(formUrl, { 
        anonymousId: editCode.trim() 
      });
      
      if (response.responseWise && response.responseWise.length > 0) {
        setExistingResponse(response.responseWise[0]);
        setShowCodeInput(false);
      } else {
        alert('No response found with this edit code. Please check your code and try again.');
      }
    } catch (error) {
      console.error('Error loading response:', error);
      alert('Failed to load your response. Please check your edit code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update existing response
  const handleUpdate = async (responses) => {
    if (!existingResponse) return;

    setIsUpdating(true);
    try {
      // Convert responses to the format expected by backend
      const answers = Object.entries(responses).map(([fieldId, answerValue]) => ({
        fieldId: fieldId, // Keep as string - database field IDs are strings
        answerValue: answerValue
      }));

      await formsAPI.updateFormResponse(formUrl, { 
        answers,
        anonymousId: editCode
      });
      
      setIsUpdated(true);
    } catch (error) {
      console.error('Error updating response:', error);
      throw error; // Re-throw to be handled by FormPreview
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-semibold text-black mb-4">
            Cannot Edit Form
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate(`/form/${formUrl}`)}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Back to Form
          </button>
        </div>
      </div>
    );
  }

  if (isUpdated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-semibold text-black mb-4">
            Response Updated!
          </h2>
          <p className="text-gray-600 mb-6">
            Your response has been successfully updated.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Again
            </button>
            <button
              onClick={() => navigate(`/form/${formUrl}`)}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Back to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-width py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full shadow-sm border border-orange-200 mb-6">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-orange-600">Edit Mode</span>
          </div>
          <h1 className="text-3xl font-semibold text-black mb-3">
            {form?.title || 'Edit Form Response'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {showCodeInput 
              ? 'Enter your edit code to modify your previous response.'
              : 'Update your response and submit the changes.'
            }
          </p>
        </div>

        {showCodeInput ? (
          /* Edit Code Input */
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔑</div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Enter Your Edit Code
                </h3>
                <p className="text-sm text-gray-600">
                  Use the code provided when you first submitted this form
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edit Code
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    placeholder="Enter your edit code (e.g. ABC123)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all text-center font-mono text-lg tracking-wider"
                    maxLength={20}
                  />
                </div>

                <button
                  onClick={handleLoadResponse}
                  disabled={!editCode.trim() || loading}
                  className="w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Loading...' : 'Load My Response'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Don't have an edit code? You can only edit responses if the form creator enabled editing when you first submitted.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Form Preview for Editing */
          <div>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <span className="text-sm text-blue-600">
                  📝 Editing response from {new Date(existingResponse?.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <FormPreview 
              form={form} 
              isPublic={true} 
              isEditing={true}
              existingResponse={existingResponse}
              onSubmit={handleUpdate}
              submitButtonText={isUpdating ? 'Updating...' : 'Update Response'}
              disabled={isUpdating}
            />

            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setShowCodeInput(true);
                  setExistingResponse(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
              >
                ← Use Different Edit Code
              </button>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            This form editing is powered by Orbis Forms. 
            <span className="mx-2">•</span>
            Your data is secure and protected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormEdit;