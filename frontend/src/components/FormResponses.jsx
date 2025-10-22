import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formsAPI } from '../api/api';

const FormResponses = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFormResponses = async () => {
      try {
        setLoading(true);
        const data = await formsAPI.getFormResponsesById(formId);
        setForm(data.form);
        setResponses(data.responses);
      } catch (err) {
        console.error('Error loading form responses:', err);
        setError(err.response?.data?.error || 'Failed to load form responses');
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      loadFormResponses();
    }
  }, [formId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getAnswerDisplay = (answer) => {
    if (answer.answerJson) {
      try {
        const jsonData = JSON.parse(answer.answerJson);
        if (Array.isArray(jsonData)) {
          return jsonData.join(', ');
        }
        return JSON.stringify(jsonData);
      } catch {
        return answer.answerJson;
      }
    }
    return answer.answerValue || 'No answer';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Responses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{form?.title}</h1>
          {form?.description && (
            <p className="text-gray-600 mb-4">{form.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>📊 {responses.length} response{responses.length !== 1 ? 's' : ''}</span>
            <span>📋 {form?.fields?.length || 0} field{form?.fields?.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Responses Yet</h3>
            <p className="text-gray-500">
              Share your form link to start collecting responses!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <div key={response.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Response Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Response #{responses.length - index}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted on {formatDate(response.submittedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    {response.submittedBy ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {response.submittedBy.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {response.submittedBy.email}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Anonymous</p>
                        <p className="text-xs text-gray-500">
                          ID: {response.anonymousId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Response Answers */}
                <div className="space-y-4">
                  {response.answers.map((answer) => (
                    <div key={answer.fieldId} className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {answer.fieldLabel}
                      </p>
                      <p className="text-gray-900">
                        {getAnswerDisplay(answer)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {answer.fieldType}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormResponses;