import api from './api';

export const ticketService = {
  create: async (ticketData) => {
    // Check if sending FormData (with image attachment) or standard JSON
    if (ticketData instanceof FormData) {
      const response = await api.post('/complaints', ticketData, {
        transformRequest: (data) => data,
      });
      return response.data;
    } else {
      const response = await api.post('/complaints', ticketData);
      return response.data;
    }
  },

  getById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  getAll: async (params) => {

    const response = await api.get('/complaints', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/complaints/stats');
    return response.data;
  },

  assign: async (id, assignedTo) => {
    const response = await api.patch(`/complaints/${id}/assign`, { assignedTo });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/complaints/${id}/status`, { status });
    return response.data;
  },

  getReport: async (params) => {
    const response = await api.get('/complaints/report', { params });
    return response.data;
  },
};
