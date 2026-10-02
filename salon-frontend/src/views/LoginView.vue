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
const showPassword = ref(false)
const form = ref({ correo: '', password: '' })

const submit = async () => {
  loading.value = true
  try {
    await auth.login(form.value)
    $q.notify({ type: 'positive', message: 'Qué bueno tenerte de vuelta.' })
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
        <div class="eyebrow">Tu momento, tu espacio</div>
        <h1>Un ritual de belleza hecho para ti.</h1>
        <p>Encuentra tu servicio favorito, elige a tu estilista y reserva tu próxima visita.</p>
      </div>
    </section>
    <section class="auth-form-wrap">
      <q-form class="auth-form" @submit.prevent="submit">
        <div class="eyebrow">Bienvenida de nuevo</div>
        <h2>Inicia sesión</h2>
        <p class="subtle q-mb-lg">Ingresa a tu espacio personal para gestionar tus citas.</p>
        <q-input v-model.trim="form.correo" label="Correo electrónico" type="email" autocomplete="email" outlined class="q-mb-md" :rules="[(value) => !!value || 'El correo es obligatorio']" />
        <q-input v-model="form.password" label="Contraseña" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" outlined class="q-mb-sm" :rules="[(value) => !!value || 'La contraseña es obligatoria']">
          <template #append><q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword" /></template>
        </q-input>
        <q-btn type="submit" label="Entrar a mi cuenta" color="primary" unelevated no-caps class="full-width q-mt-md" size="lg" :loading="loading" />
        <div class="auth-foot">¿Aún no tienes cuenta? <router-link to="/registro">Crear cuenta</router-link></div>
      </q-form>
    </section>
  </main>
</template>