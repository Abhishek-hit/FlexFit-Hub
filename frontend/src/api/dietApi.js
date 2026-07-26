import apiClient from './axiosClient';

export const dietApi = {
  // owner
  list: (gymId) => apiClient.get(`/owner/gyms/${gymId}/diet-plans`),
  createOrReplace: (gymId, payload) => apiClient.post(`/owner/gyms/${gymId}/diet-plans`, payload),

  // member
  myPlan: () => apiClient.get('/member/diet/plan'),
};
