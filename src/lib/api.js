// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API methods
export const api = {
  // Campaigns
  getCampaigns: () => apiCall('/api/campaigns'),
  
  getCampaign: (id) => apiCall(`/api/campaigns/${id}`),
  
  updateCampaign: (id, data) => apiCall(`/api/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  getCampaignQuestions: (id) => apiCall(`/api/campaigns/${id}/questions`),
  
  updateCampaignQuestions: (id, questions) => apiCall(`/api/campaigns/${id}/questions`, {
    method: 'PUT',
    body: JSON.stringify({ questions }),
  }),
  
  getDashboardData: (id) => apiCall(`/api/campaigns/${id}/dashboard`),
  
  // Surveys (Public)
  getSurvey: (id) => apiCall(`/api/surveys/${id}`),
  
  submitSurveyResponse: (id, data) => apiCall(`/api/surveys/${id}/responses`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

