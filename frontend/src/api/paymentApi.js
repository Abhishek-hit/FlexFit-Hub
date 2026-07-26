import apiClient from './axiosClient';

export const paymentApi = {
  // owner
  list: (gymId, status) => apiClient.get(`/owner/gyms/${gymId}/fees`, { params: status ? { status } : {} }),
  create: (gymId, payload) => apiClient.post(`/owner/gyms/${gymId}/fees`, payload),
  markPaid: (gymId, paymentId, payload) => apiClient.post(`/owner/gyms/${gymId}/fees/${paymentId}/mark-paid`, payload),
  remind: (gymId, paymentId) => apiClient.post(`/owner/gyms/${gymId}/fees/${paymentId}/remind`),
  revenueSummary: (gymId) => apiClient.get(`/owner/gyms/${gymId}/fees/revenue-summary`),

  // member
  myPayments: () => apiClient.get('/member/payments'),
  createOnlineOrder: (amount) => apiClient.post('/member/payments/online/create-order', null, { params: { amount } }),
};
