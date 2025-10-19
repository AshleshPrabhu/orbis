import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormBuilder from '../components/FormBuilder';

const EditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForm = async () => {
      try {
        // You'll implement the API call here
        const mockForm = {
          id: id,
          title: 'Event Registration Form',
          description: 'Registration form for upcoming hackathon',
          formUrl: 'ABC123',
          fields: [
            {
              id: 'field1',
              label: 'Full Name',
              fieldType: 'TEXT',
              position: 1,
              isRequired: true,
              placeholder: 'Enter your full name'
            },
            {
              id: 'field2',
              label: 'Email Address',
              fieldType: 'EMAIL',
              position: 2,
              isRequired: true,
              placeholder: 'your.email@example.com'
            }
          ]
        };
        
        setForm(mockForm);
      } catch (error) {
        console.error('Error loading form:', error);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [id]);

  const handleSave = (formData) => {
    console.log('Form updated:', formData);
    // After successful save, redirect to forms list
    navigate('/forms');
  };

  const handleCancel = () => {
    navigate('/forms');
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

  return (
    <FormBuilder 
      form={form}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default EditForm;