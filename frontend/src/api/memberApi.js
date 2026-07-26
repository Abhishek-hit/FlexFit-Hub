import apiClient from './axiosClient';

export const memberApi = {
  // owner side
  list: (gymId, q) => apiClient.get(`/owner/gyms/${gymId}/members`, { params: q ? { q } : {} }),
  get: (gymId, memberId) => apiClient.get(`/owner/gyms/${gymId}/members/${memberId}`),
  add: (gymId, payload) => apiClient.post(`/owner/gyms/${gymId}/members`, payload),
  update: (gymId, memberId, payload) => apiClient.put(`/owner/gyms/${gymId}/members/${memberId}`, payload),
  remove: (gymId, memberId) => apiClient.delete(`/owner/gyms/${gymId}/members/${memberId}`),
  uploadPhoto: (gymId, memberId, formData) =>
    apiClient.post(`/owner/gyms/${gymId}/members/${memberId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // member (self) side
  myProfile: () => apiClient.get('/member/profile'),
  updateMyProfile: (payload) => apiClient.put('/member/profile', payload),
  uploadMyPhoto: (formData) =>
    apiClient.post('/member/profile/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
