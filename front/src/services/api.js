import axios from 'axios';

const PREFIX_URL= "/api";
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Invoices
export const invoiceAPI = {
  getAll: (params) => api.get(`${PREFIX_URL}/invoices`, { params }),
  getById: (id) => api.get(`${PREFIX_URL}/invoices/${id}`),
  create: (data) => api.post(`${PREFIX_URL}/invoices`, data),
  update: (id, data) => api.put(`${PREFIX_URL}/invoices/${id}`, data),
  delete: (id) => api.delete(`${PREFIX_URL}/invoices/${id}`),
};

// Clients
export const clientAPI = {
  getAll: () => api.get(`${PREFIX_URL}/clients`),
  getById: (id) => api.get(`${PREFIX_URL}/clients/${id}`),
  create: (data) => api.post(`${PREFIX_URL}/clients`, data),
  update: (id, data) => api.put(`${PREFIX_URL}/clients/${id}`, data),
  delete: (id) => api.delete(`${PREFIX_URL}/clients/${id}`),
};

// Templates
export const templateAPI = {
  getAll: () => api.get(`${PREFIX_URL}/templates`),
  getById: (id) => api.get(`${PREFIX_URL}/templates/${id}`),
  create: (data) => api.post(`${PREFIX_URL}/templates`, data),
  update: (id, data) => api.put(`${PREFIX_URL}/templates/${id}`, data),
  delete: (id) => api.delete(`${PREFIX_URL}/templates/${id}`),
};

export default api;