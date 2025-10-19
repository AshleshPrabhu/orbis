import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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

  // Mock data - you'll replace this with API call
  useEffect(() => {
    const loadForms = async () => {
      try {
        // You'll implement the API call here
        const mockForms = [
          {
            id: '1',
            title: 'Event Registration Form',
            description: 'Registration form for upcoming hackathon',
            formUrl: 'ABC123',
            isActive: true,
            createdAt: '2024-10-15T10:00:00Z',
            updatedAt: '2024-10-18T14:30:00Z',
            _count: { responses: 45 }
          },
          {
            id: '2',
            title: 'Feedback Survey',
            description: 'Post-event feedback collection',
            formUrl: 'DEF456',
            isActive: false,
            createdAt: '2024-10-10T09:00:00Z',
            updatedAt: '2024-10-16T11:20:00Z',
            _count: { responses: 23 }
          },
          {
            id: '3',
            title: 'Team Application Form',
            description: 'Application form for team members',
            formUrl: 'GHI789',
            isActive: true,
            createdAt: '2024-10-12T15:00:00Z',
            updatedAt: '2024-10-17T16:45:00Z',
            _count: { responses: 67 }
          }
        ];
        setForms(mockForms);
      } catch (error) {
        console.error('Error loading forms:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="container-width py-24">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-semibold text-black">My Forms</h1>
            <p className="text-gray-600 mt-2">
              Create, manage, and analyze your forms
            </p>
          </div>
          <Button onClick={handleCreateForm} variant="primary">
            Create New Form
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                    <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex space-x-2">
              {['all', 'active', 'inactive'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filter === filterOption
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filterOption}
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
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                {/* Form Status */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      form.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {form.formUrl}
                  </span>
                </div>

                {/* Form Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
                    {form.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {form.description || 'No description provided'}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
                      </svg>
                      <span>{form._count?.responses || 0} responses</span>
                    </div>
                    <div>
                      Updated {formatDate(form.updatedAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditForm(form.id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewForm(form.formUrl)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    View
                  </button>
                  {form._count?.responses > 0 && (
                    <button
                      onClick={() => handleViewResponses(form.id)}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                      title="View Responses"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zM2.5 2a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3zm6.5.5A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm1.5-.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3zM1 10.5A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm1.5-.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3zm6.5.5A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3zm1.5-.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-3z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-2xl font-semibold text-black mb-4">
              {searchTerm || filter !== 'all' ? 'No forms found' : 'No forms yet'}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first form to get started'
              }
            </p>
            {(!searchTerm && filter === 'all') && (
              <Button onClick={handleCreateForm} variant="primary">
                Create Your First Form
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsList;