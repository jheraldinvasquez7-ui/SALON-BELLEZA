<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const drawer = ref(false)
const auth = useAuthStore()
const router = useRouter()

const navigation = [
  { title: 'Resumen', icon: 'space_dashboard', to: '/' },
  { title: 'Servicios', icon: 'spa', to: '/servicios' },
  { title: 'Estilistas', icon: 'face_3', to: '/estilistas' },
  { title: 'Mis citas', icon: 'calendar_month', to: '/citas' },
]

const logout = () => {
  auth.logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <q-layout view="hHh Lpr fFf">
    <q-header class="topbar">
      <div class="topbar-inner">
        <div class="row items-center no-wrap q-gutter-sm">
          <q-btn flat round dense icon="menu" aria-label="Abrir menú" class="lt-md" @click="drawer = !drawer" />
          <span class="mobile-brand lt-md">BELLEZA ESTUDIO</span>
          <span class="topbar-greeting gt-sm">Un espacio para sentirte bien, {{ auth.user?.nombre || 'bienvenida' }}</span>
        </div>
        <q-btn flat round icon="logout" aria-label="Cerrar sesión" @click="logout">
          <q-tooltip>Cerrar sesión</q-tooltip>
        </q-btn>
      </div>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="248" bordered>
      <div class="side-brand">
        <span class="brand-mark"><q-icon name="spa" size="20px" /></span>
        <span>BELLEZA ESTUDIO</span>
      </div>
      <div class="nav-label">Espacio personal</div>
      <q-list padding>
        <q-item v-for="item in navigation" :key="item.to" v-ripple clickable :to="item.to" exact @click="drawer = false">
          <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
          <q-item-section>{{ item.title }}</q-item-section>
        </q-item>
      </q-list>
      <div class="absolute-bottom q-pa-md">
        <q-separator class="q-mb-md" />
        <div class="row items-center no-wrap q-gutter-sm">
          <q-avatar color="green-1" text-color="primary" size="38px">{{ auth.user?.nombre?.slice(0, 1) || 'B' }}</q-avatar>
          <div class="ellipsis">
            <div class="text-weight-medium ellipsis">{{ auth.fullName || 'Mi cuenta' }}</div>
            <div class="text-caption text-grey-7 ellipsis">{{ auth.user?.correo }}</div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>