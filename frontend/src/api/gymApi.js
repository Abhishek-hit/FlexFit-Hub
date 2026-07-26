import apiClient from './axiosClient';

export const gymApi = {
  search: (params) => apiClient.get('/gyms/search', { params }),
  topTen: () => apiClient.get('/gyms/top10'),
  getById: (id) => apiClient.get(`/gyms/${id}`),
  reviews: (id) => apiClient.get(`/gyms/${id}/reviews`),

  // owner
  myGyms: () => apiClient.get('/owner/gyms'),
  getOwnerGym: (gymId) => apiClient.get(`/owner/gyms/${gymId}`),
  updateGym: (gymId, payload) => apiClient.put(`/owner/gyms/${gymId}`, payload),
  uploadImage: (gymId, formData) =>
    apiClient.post(`/owner/gyms/${gymId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addPlan: (gymId, payload) => apiClient.post(`/owner/gyms/${gymId}/plans`, payload),
  removePlan: (gymId, planId) => apiClient.delete(`/owner/gyms/${gymId}/plans/${planId}`),

  // member
  addReview: (gymId, payload) => apiClient.post(`/member/gyms/${gymId}/reviews`, payload),
};
