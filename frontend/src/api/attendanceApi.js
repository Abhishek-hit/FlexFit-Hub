import apiClient from './axiosClient';

export const attendanceApi = {
  checkIn: (payload) => apiClient.post('/attendance/check-in', payload),

  // owner
  byDate: (gymId, date) => apiClient.get(`/owner/gyms/${gymId}/attendance`, { params: date ? { date } : {} }),
  report: (gymId) => apiClient.get(`/owner/gyms/${gymId}/attendance/report`),

  // member
  myAttendance: (from, to) => apiClient.get('/member/attendance', { params: { from, to } }),
};
