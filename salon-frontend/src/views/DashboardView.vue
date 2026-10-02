<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { salonApi, resourcesApi, extractRows } from '../api/salon'
import { getApiError } from '../api/client'

const auth = useAuthStore()
const services = ref([])
const stylists = ref([])
const appointments = ref([])
const loading = ref(true)
const errorMessage = ref('')

const loadDashboard = async () => {
  loading.value = true
  errorMessage.value = ''
  const results = await Promise.allSettled([
    salonApi.list(resourcesApi.services),
    salonApi.list(resourcesApi.stylists),
    salonApi.list(resourcesApi.appointments),
  ])
  if (results[0].status === 'fulfilled') services.value = extractRows(results[0].value.data, 'servicios')
  if (results[1].status === 'fulfilled') stylists.value = extractRows(results[1].value.data, 'estilistas')
  if (results[2].status === 'fulfilled') {
    appointments.value = extractRows(results[2].value.data, 'citas').filter((item) => (item.cliente?._id || item.cliente) === auth.user?._id)
  }
  const failed = results.find((result) => result.status === 'rejected')
  if (failed) errorMessage.value = getApiError(failed.reason)
  loading.value = false
}

const upcomingAppointments = () => appointments.value
  .filter((item) => item.estado !== 'cancelada')
  .sort((first, second) => `${first.fecha} ${first.hora}`.localeCompare(`${second.fecha} ${second.hora}`))
  .slice(0, 3)

onMounted(loadDashboard)
</script>

<template>
  <q-page>
    <div class="page-shell">
      <section class="dashboard-hero">
        <div class="dashboard-hero-copy">
          <div class="eyebrow">Belleza Estudio · Tu espacio</div>
          <h1>Hola, {{ auth.user?.nombre || 'bienvenida' }}.</h1>
          <p>Un ratito para ti cambia todo. Descubre nuestros servicios y encuentra el momento perfecto para tu próxima visita.</p>
          <div class="quick-links">
            <q-btn to="/citas" label="Reservar una cita" icon="event_available" color="white" text-color="primary" unelevated no-caps />
            <q-btn to="/servicios" label="Ver servicios" icon="arrow_forward" flat color="white" no-caps />
          </div>
        </div>
      </section>

      <div v-if="errorMessage" class="row items-center q-gutter-sm q-mt-md text-negative">
        <q-icon name="cloud_off" /> <span class="text-caption">No se pudo conectar con la API: {{ errorMessage }}</span>
        <q-btn flat dense no-caps label="Reintentar" @click="loadDashboard" />
      </div>

      <section class="metric-grid">
        <div class="metric surface">
          <div class="metric-label">Servicios disponibles</div>
          <div class="metric-value">{{ loading ? '—' : services.length }}</div>
        </div>
        <div class="metric surface">
          <div class="metric-label">Nuestro equipo</div>
          <div class="metric-value">{{ loading ? '—' : stylists.length }}</div>
        </div>
        <div class="metric surface">
          <div class="metric-label">Tus citas</div>
          <div class="metric-value">{{ loading ? '—' : appointments.filter((item) => item.estado !== 'cancelada').length }}</div>
        </div>
      </section>

      <section class="row items-center justify-between q-mb-sm">
        <div>
          <div class="eyebrow">Agenda</div>
          <h2 class="q-mt-xs q-mb-none">Tus próximas visitas</h2>
        </div>
        <q-btn to="/citas" flat color="primary" no-caps label="Ver agenda" icon-right="arrow_forward" />
      </section>

      <div class="surface data-list">
        <div v-if="loading" class="empty-state"><q-spinner color="primary" size="30px" /></div>
        <div v-else-if="upcomingAppointments().length" v-for="appointment in upcomingAppointments()" :key="appointment._id" class="list-row">
          <div>
            <div class="row-title">{{ appointment.servicio?.nombre || 'Servicio reservado' }}</div>
            <div class="subtle row-secondary">{{ appointment.estilista?.nombre || 'Estilista' }} · {{ appointment.fecha }} a las {{ appointment.hora }}</div>
          </div>
          <span class="appointment-status" :class="appointment.estado">{{ appointment.estado }}</span>
          <span class="row-secondary">{{ appointment.observaciones || '' }}</span>
        </div>
        <div v-else class="empty-state">
          <q-icon name="event_note" size="32px" />
          <div class="text-weight-medium text-dark">Todavía no tienes citas</div>
          <div class="text-caption q-mt-xs">Tu próxima visita está a un paso.</div>
          <q-btn to="/citas" outline color="primary" no-caps label="Agendar ahora" class="q-mt-md" />
        </div>
      </div>
    </div>
  </q-page>
</template>