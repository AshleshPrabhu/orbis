import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormBuilder from '../components/FormBuilder';

const CreateForm = () => {
  const navigate = useNavigate();

  const handleSave = (formData) => {
    console.log('Form saved:', formData);
    // After successful save, redirect to forms list
    navigate('/forms');
  };

  const handleCancel = () => {
    navigate('/forms');
  };

  return (
    <FormBuilder 
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default CreateForm;