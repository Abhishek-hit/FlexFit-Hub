import apiClient from './axiosClient';

export const notificationApi = {
  list: () => apiClient.get('/notifications'),
  unreadCount: () => apiClient.get('/notifications/unread-count'),
  markRead: (id) => apiClient.post(`/notifications/${id}/read`),
};
