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

  useEffect(() => {
    const loadForm = async () => {
      try {
        const response = await formsAPI.getFormForDisplay(formUrl);
        setForm(response.form);
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

  const handleSubmit = async (responses) => {
    try {
      // Convert responses to the format expected by backend
      const answers = Object.entries(responses).map(([fieldId, answerValue]) => ({
        fieldId: parseInt(fieldId),
        answerValue: answerValue
      }));

      await formsAPI.submitFormResponse(formUrl, { answers });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error; // Re-throw to be handled by FormPreview
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
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-semibold text-black mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-6">
            Your response has been submitted successfully. We'll get back to you soon.
          </p>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="font-semibold text-black mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• We'll review your application within 2-3 business days</li>
              <li>• Check your email for further updates</li>
            </ul>
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
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Form is live</span>
          </div>
          <h1 className="text-3xl font-semibold text-black mb-3">
            Public Form Submission
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill out the form below with accurate information. All required fields must be completed.
          </p>
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