import api from './api';

export const departmentService = {
  getAll: async () => {
    const response = await api.get('/departments');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/departments', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

export const programmeService = {
  getAll: async (params) => {
    const response = await api.get('/programmes', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/programmes', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/programmes/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/programmes/${id}`);
    return response.data;
  },
};

export const blockService = {
  getAll: async (params) => {
    const response = await api.get('/blocks', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/blocks', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/blocks/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/blocks/${id}`);
    return response.data;
  },
};

export const roomService = {
  getAll: async (params) => {
    const response = await api.get('/rooms', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/rooms', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};

export const roleService = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/roles', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};
