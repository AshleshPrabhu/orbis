import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
        // You'll implement the API call here
        const mockForm = {
          id: '1',
          title: 'Event Registration Form',
          description: 'Please fill out this form to register for our upcoming hackathon. We need some basic information to process your registration.',
          formUrl: formUrl,
          isActive: true,
          fields: [
            {
              id: 'field1',
              label: 'Full Name',
              fieldType: 'TEXT',
              position: 1,
              isRequired: true,
              placeholder: 'Enter your full name',
              helpText: 'Please provide your full legal name'
            },
            {
              id: 'field2',
              label: 'Email Address',
              fieldType: 'EMAIL',
              position: 2,
              isRequired: true,
              placeholder: 'your.email@example.com',
              helpText: 'We will send confirmation details to this email'
            },
            {
              id: 'field3',
              label: 'Phone Number',
              fieldType: 'PHONE',
              position: 3,
              isRequired: false,
              placeholder: '+1 (555) 123-4567',
              helpText: 'Optional - for urgent communications only'
            },
            {
              id: 'field4',
              label: 'Experience Level',
              fieldType: 'MULTIPLE_CHOICE',
              position: 4,
              isRequired: true,
              options: [
                { label: 'Beginner (0-1 years)', value: 'beginner' },
                { label: 'Intermediate (2-5 years)', value: 'intermediate' },
                { label: 'Advanced (5+ years)', value: 'advanced' }
              ],
              helpText: 'Select your programming experience level'
            },
            {
              id: 'field5',
              label: 'Programming Languages',
              fieldType: 'CHECKBOXES',
              position: 5,
              isRequired: false,
              options: [
                { label: 'JavaScript', value: 'javascript' },
                { label: 'Python', value: 'python' },
                { label: 'Java', value: 'java' },
                { label: 'C++', value: 'cpp' },
                { label: 'Go', value: 'go' },
                { label: 'Rust', value: 'rust' }
              ],
              helpText: 'Select all languages you are comfortable with'
            },
            {
              id: 'field6',
              label: 'Preferred Team Size',
              fieldType: 'DROPDOWN',
              position: 6,
              isRequired: true,
              options: [
                { label: 'Solo (1 person)', value: '1' },
                { label: 'Pair (2 people)', value: '2' },
                { label: 'Small team (3-4 people)', value: '3-4' },
                { label: 'Large team (5+ people)', value: '5+' }
              ]
            },
            {
              id: 'field7',
              label: 'Resume/Portfolio',
              fieldType: 'FILE_UPLOAD',
              position: 7,
              isRequired: false,
              helpText: 'Upload your resume or portfolio (PDF format preferred)'
            },
            {
              id: 'field8',
              label: 'Why do you want to participate?',
              fieldType: 'TEXTAREA',
              position: 8,
              isRequired: true,
              placeholder: 'Tell us what motivates you to join this hackathon...',
              helpText: 'Share your goals and what you hope to achieve'
            },
            {
              id: 'field9',
              label: 'Event Date',
              fieldType: 'DATE',
              position: 9,
              isRequired: true,
              helpText: 'Select your preferred event date'
            },
            {
              id: 'field10',
              label: 'Rate your excitement level',
              fieldType: 'STAR_RATING',
              position: 10,
              isRequired: false,
              helpText: 'How excited are you about this event?'
            }
          ]
        };

        setForm(mockForm);
      } catch (err) {
        setError('Failed to load form. Please try again later.');
        console.error('Error loading form:', err);
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
      // You'll implement the API call here
      console.log('Submitting form responses:', {
        formUrl,
        responses
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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