import { createRouter, createWebHistory } from 'vue-router'
import pinia from '../stores'
import { useAuthStore } from '../stores/auth'
import MainLayout from '../layouts/MainLayout.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import ManagementView from '../views/ManagementView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/registro', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: 'servicios', name: 'services', component: ManagementView, props: { resource: 'services' } },
        { path: 'estilistas', name: 'stylists', component: ManagementView, props: { resource: 'stylists' } },
        { path: 'citas', name: 'appointments', component: ManagementView, props: { resource: 'appointments' } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore(pinia)
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login' }
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'dashboard' }
})

export default router