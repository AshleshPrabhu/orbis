import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formsAPI } from '../api/api';
import Button from './Button';

const FormsList = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load forms from backend API
  useEffect(() => {
    const loadForms = async () => {
      try {
        const formsData = await formsAPI.getUserForms();
        // Handle array response (new format) or fallback to empty array
        const formsList = Array.isArray(formsData) ? formsData : [];
        setForms(formsList);
      } catch (error) {
        console.error('Error loading forms:', error);
        const errorMsg = error.response?.data?.message || 'Failed to load forms';
        alert(`Error: ${errorMsg}`);
        setForms([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadForms();
    }
  }, [isAuthenticated]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && form.isActive) ||
                         (filter === 'inactive' && !form.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateForm = () => {
    navigate('/forms/create');
  };

  const handleEditForm = (formId) => {
    navigate(`/forms/edit/${formId}`);
  };

  const handleViewForm = (formUrl) => {
    window.open(`/form/${formUrl}`, '_blank');
  };

  const handleViewResponses = (formId) => {
    navigate(`/forms/${formId}/responses`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-width py-24">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your forms...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-width py-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-0 space-y-6 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                    <path d="M1 2.5A1.5 1.5 0 012.5 1h11A1.5 1.5 0 0115 2.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 13.5v-11zM2.5 2a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5h-11z"/>
                    <path d="M4 6h8v1H4V6zM4 8h8v1H4V8zM4 10h5v1H4v-1z"/>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-black">My Forms</h1>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                Create, manage, and analyze your forms. Build powerful forms to collect data, feedback, and registrations with ease.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                onClick={handleCreateForm} 
                variant="primary"
                className="px-6 py-3 text-base font-semibold"
              >
                <span className="mr-2">+</span>
                Create New Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-width py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search forms by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all text-base"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                    <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'inactive', label: 'Inactive' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                    filter === filterOption.key
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-600 hover:text-black hover:bg-white/50'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        {filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-gray-300"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                        form.isActive
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        form.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border">
                      {form.formUrl}
                    </span>
                  </div>

                  {/* Form Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2 leading-tight">
                      {form.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                      {form.description || 'No description provided'}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1a2.5 2.5 0 00-2.5 2.5V4h-1a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V5a1 1 0 00-1-1h-1v-.5A2.5 2.5 0 008 1zM6.5 3.5a1.5 1.5 0 113 0V4h-3v-.5zM5 5h6v7H5V5z"/>
                        </svg>
                        <span className="font-medium">{form.responses?.length || 0}</span>
                        <span className="text-gray-500">responses</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(form.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditForm(form.id)}
                      className="flex-1 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewForm(form.formUrl)}
                      className="flex-1 px-3 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleViewResponses(form.id)}
                      className="px-3 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:text-black hover:bg-gray-50 transition-all"
                      title="View Responses"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zM2.5 2a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3zm6.5.5A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm1.5-.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3zM1 10.5A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm1.5-.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3zm6.5.5A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3zm1.5-.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                  <path d="M1 2.5A1.5 1.5 0 012.5 1h11A1.5 1.5 0 0115 2.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 13.5v-11z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 6h8M4 8h8M4 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                {searchTerm || filter !== 'all' ? 'No forms found' : 'No forms yet'}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Get started by creating your first form to collect responses and manage data.'
                }
              </p>
              {(!searchTerm && filter === 'all') && (
                <Button 
                  onClick={handleCreateForm} 
                  variant="primary"
                  className="px-6 py-3 text-base font-semibold"
                >
                  <span className="mr-2">+</span>
                  Create Your First Form
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsList;