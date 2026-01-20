import apiClient from './baseAPI';

export const crmAPI = {
  // Accounts
  getAccounts: (params) => apiClient.get('/api/crm/accounts', { params }),
  getAccount: (id) => apiClient.get(`/api/crm/accounts/${id}`),
  createAccount: (data) => apiClient.post('/api/crm/accounts', data),
  updateAccount: (id, data) => apiClient.put(`/api/crm/accounts/${id}`, data),
  deleteAccount: (id) => apiClient.delete(`/api/crm/accounts/${id}`),
  
  // Leads
  getLeads: (params) => apiClient.get('/api/crm/leads', { params }),
  getLead: (id) => apiClient.get(`/api/crm/leads/${id}`),
  createLead: (data) => apiClient.post('/api/crm/leads', data),
  updateLead: (id, data) => apiClient.put(`/api/crm/leads/${id}`, data),
  convertLead: (id, data) => apiClient.post(`/api/crm/leads/${id}/convert`, data),
  
  // Opportunities
  getOpportunities: (params) => apiClient.get('/api/crm/opportunities', { params }),
  getOpportunity: (id) => apiClient.get(`/api/crm/opportunities/${id}`),
  createOpportunity: (data) => apiClient.post('/api/crm/opportunities', data),
  updateOpportunity: (id, data) => apiClient.put(`/api/crm/opportunities/${id}`, data),
  updateStage: (id, stage) => apiClient.patch(`/api/crm/opportunities/${id}/stage`, { stage }),
  
  // Activities
  getActivities: (params) => apiClient.get('/api/crm/activities', { params }),
  getActivity: (id) => apiClient.get(`/api/crm/activities/${id}`),
  createActivity: (data) => apiClient.post('/api/crm/activities', data),
  updateActivity: (id, data) => apiClient.put(`/api/crm/activities/${id}`, data),
  completeActivity: (id) => apiClient.post(`/api/crm/activities/${id}/complete`),
  
  // Dashboard
  getDashboardMetrics: () => apiClient.get('/api/crm/dashboard/metrics'),
  getPipeline: () => apiClient.get('/api/crm/pipeline'),
};

export default crmAPI;
