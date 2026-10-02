import { defineStore } from 'pinia'
import { authApi } from '../api/salon'

export const useAuthStore = defineStore('salon-auth', {
  state: () => ({ token: '', user: null }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    fullName: (state) => [state.user?.nombre, state.user?.apellido].filter(Boolean).join(' '),
  },
  actions: {
    async login(credentials) {
      const { data } = await authApi.login(credentials)
      this.token = data.token
      this.user = data.cliente
      return data
    },
    async register(details) {
      const { data } = await authApi.register(details)
      this.token = data.token
      this.user = data.cliente
      return data
    },
    logout() {
      this.token = ''
      this.user = null
    },
  },
  persist: {
    key: 'salon-auth',
    pick: ['token', 'user'],
  },
})