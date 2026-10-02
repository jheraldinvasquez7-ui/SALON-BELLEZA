<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth'
import { getApiError } from '../api/client'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const loading = ref(false)
const form = ref({ nombre: '', apellido: '', correo: '', telefono: '', password: '' })

const submit = async () => {
  loading.value = true
  try {
    await auth.register(form.value)
    $q.notify({ type: 'positive', message: 'Tu cuenta ya está lista.' })
    router.replace({ name: 'dashboard' })
  } catch (error) {
    $q.notify({ type: 'negative', message: getApiError(error) })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-screen">
    <section class="auth-image">
      <div class="auth-brand">BELLEZA ESTUDIO</div>
      <div>
        <div class="eyebrow">Un cuidado que se siente</div>
        <h1>Tu próximo momento empieza aquí.</h1>
        <p>Regístrate para descubrir servicios y reservar fácilmente con nuestro equipo.</p>
      </div>
    </section>
    <section class="auth-form-wrap">
      <q-form class="auth-form" @submit.prevent="submit">
        <div class="eyebrow">Comienza aquí</div>
        <h2>Crear cuenta</h2>
        <p class="subtle q-mb-lg">Completa tus datos para reservar tu primera cita.</p>
        <div class="form-grid">
          <q-input v-model.trim="form.nombre" label="Nombre" autocomplete="given-name" outlined :rules="[(value) => !!value || 'Escribe tu nombre']" />
          <q-input v-model.trim="form.apellido" label="Apellido" autocomplete="family-name" outlined :rules="[(value) => !!value || 'Escribe tu apellido']" />
          <q-input v-model.trim="form.correo" class="span-2" label="Correo electrónico" type="email" autocomplete="email" outlined :rules="[(value) => !!value || 'Escribe tu correo']" />
          <q-input v-model.trim="form.telefono" class="span-2" label="Teléfono" autocomplete="tel" outlined :rules="[(value) => !!value || 'Escribe tu teléfono']" />
          <q-input v-model="form.password" class="span-2" label="Contraseña (mínimo 6 caracteres)" type="password" autocomplete="new-password" outlined :rules="[(value) => value.length >= 6 || 'Usa al menos 6 caracteres']" />
        </div>
        <q-btn type="submit" label="Crear mi cuenta" color="primary" unelevated no-caps class="full-width q-mt-md" size="lg" :loading="loading" />
        <div class="auth-foot">¿Ya tienes cuenta? <router-link to="/login">Iniciar sesión</router-link></div>
      </q-form>
    </section>
  </main>
</template>