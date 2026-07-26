import apiClient from './axiosClient';

export const dashboardApi = {
  owner: (gymId) => apiClient.get(`/owner/gyms/${gymId}/dashboard`),
  member: () => apiClient.get('/member/dashboard'),
};
