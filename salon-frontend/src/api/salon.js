import api from './client'

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/registro', payload),
}

export const resourcesApi = {
  services: '/servicios',
  stylists: '/estilistas',
  appointments: '/citas',
  clients: '/clientes',
}

export const extractRows = (response, resourceKey) => {
  if (Array.isArray(response?.[resourceKey])) return response[resourceKey]
  if (Array.isArray(response?.data)) return response.data
  return []
}

export const salonApi = {
  list: (path) => api.get(path),
  create: (path, payload) => api.post(path, payload),
  update: (path, id, payload) => api.put(`${path}/${id}`, payload),
  remove: (path, id) => api.delete(`${path}/${id}`),
}