import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formsAPI } from '../api/api';
import FormPreview from './FormPreview';

const FormSubmission = () => {
  const { formUrl } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const loadForm = async () => {
      try {
        console.log('Loading form with URL:', formUrl);
        const response = await formsAPI.getFormForDisplay(formUrl);
        console.log('Form response:', response);
        console.log('Form fields:', response.form?.fields);
        setForm(response.form);
      } catch (err) {
        console.error('Error loading form:', err);
        console.error('Error details:', err.response?.data);
        setError(err.response?.data?.error || 'Form not found or no longer available');
      } finally {
        setLoading(false);
      }
    };

    if (formUrl) {
      loadForm();
    }
  }, [formUrl]);

  const handleSubmit = async (responsesArray) => {
    try {
      const answers = responsesArray.map(({ fieldId, value }) => {
        if (Array.isArray(value)) {
          return {
            fieldId: fieldId.toString(), 
            answerJson: value,
            answerValue: null
          };
        }
        return {
          fieldId: fieldId.toString(), 
          answerValue: value,
          answerJson: null
        };
      });

      console.log('Sending to backend:', { answers });
      const result = await formsAPI.submitFormResponse(formUrl, { answers });
      console.log('Submission result:', result);
      
      setSubmissionResult(result);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
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
            Form Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-semibold text-black mb-4">
            Form Not Found
          </h2>
          <p className="text-gray-600">
            The form you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (!form.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-2xl font-semibold text-black mb-4">
            Form Closed
          </h2>
          <p className="text-gray-600">
            This form is no longer accepting responses.
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-semibold text-black mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-6">
            Your response has been submitted successfully. We'll get back to you soon.
          </p>
          
          {/* Show edit code for editable forms */}
          {submissionResult?.canEdit && submissionResult?.anonymousId && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔑</div>
                <h3 className="font-bold text-green-900 text-lg mb-2">
                  Your Edit Code
                </h3>
                <p className="text-sm text-green-700">
                  Save this code to edit your response later. This form allows editing!
                </p>
              </div>
              
              {/* Edit Code Display */}
              <div className="bg-white rounded-lg p-4 border-2 border-green-300 mb-4">
                <div className="text-center">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Edit Code
                  </label>
                  <div className="text-2xl font-mono font-bold text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-200 select-all">
                    {submissionResult.anonymousId}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">📋 How to edit your response:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Keep this code safe - screenshot or write it down</li>
                  <li>2. Visit this form URL again anytime</li>
                  <li>3. Enter your edit code when prompted</li>
                  <li>4. Make changes and resubmit</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(submissionResult.anonymousId);
                    alert('Edit code copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  📋 Copy Edit Code
                </button>
                <button
                  onClick={() => {
                    const editUrl = `${window.location.origin}/form/${formUrl}/edit`;
                    window.open(editUrl, '_blank');
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  🔧 Edit Now
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-width py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Form is live</span>
            </div>
            {form.isEditable && (
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full shadow-sm border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-600">Responses editable</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-semibold text-black mb-3">
            {form.title}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {form.description || 'Fill out the form below with accurate information. All required fields must be completed.'}
          </p>
          {form.isEditable && (
            <p className="text-sm text-blue-600 mt-3">
              💡 You can edit your responses after submission
            </p>
          )}
        </div>

        {/* Form */}
        <FormPreview 
          form={form} 
          isPublic={true} 
          onSubmit={handleSubmit} 
        />

        {/* Footer Info */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            This form is powered by Orbis Forms. 
            <span className="mx-2">•</span>
            Your data is secure and protected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormSubmission;