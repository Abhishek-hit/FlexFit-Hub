import apiClient from './axiosClient';

export const workoutApi = {
  // owner
  list: (gymId) => apiClient.get(`/owner/gyms/${gymId}/workout-plans`),
  createOrReplace: (gymId, payload) => apiClient.post(`/owner/gyms/${gymId}/workout-plans`, payload),
  uploadMedia: (gymId, formData, type) =>
    apiClient.post(`/owner/gyms/${gymId}/workout-plans/media`, formData, {
      params: { type },
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // member
  myPlan: () => apiClient.get('/member/workout/plan'),
  markComplete: (dayNumber) => apiClient.post('/member/workout/complete', { dayNumber }),
  myProgress: () => apiClient.get('/member/workout/progress'),
};
