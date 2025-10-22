import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsAPI } from '../api/api';
import FormBuilder from '../components/FormBuilder';

const EditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForm = async () => {
      try {
        console.log('Loading form for editing with ID:', id);
        const response = await formsAPI.getFormForEdit(id);
        console.log('Form loaded successfully:', response);
        
        // Handle both old and new response format
        const formData = response.success ? response : response.data || response;
        setForm(formData);
      } catch (error) {
        console.error('Error loading form:', error);
        console.error('Error details:', error.response?.data);
        
        const errorMsg = error.response?.data?.message || error.message || 'Failed to load form for editing';
        alert(`Error: ${errorMsg}`);
        navigate('/forms');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadForm();
    }
  }, [id, navigate]);

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