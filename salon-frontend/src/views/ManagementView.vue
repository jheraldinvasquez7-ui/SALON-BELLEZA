<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getApiError } from '../api/client'
import { resourcesApi, salonApi, extractRows } from '../api/salon'
import { useAuthStore } from '../stores/auth'

const props = defineProps({ resource: { type: String, required: true } })
const $q = useQuasar()
const auth = useAuthStore()
const rows = ref([])
const servicesOptions = ref([])
const stylistsOptions = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const editingId = ref(null)
const form = ref({})

const config = computed(() => ({
  services: {
    title: 'Servicios', eyebrow: 'Encuentra tu ritual', description: 'Tratamientos pensados para que te sientas bien.', icon: 'spa', endpoint: resourcesApi.services, responseKey: 'servicios',
    fields: [
      { key: 'nombre', label: 'Nombre del servicio', required: true },
      { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true, wide: true },
      { key: 'precio', label: 'Precio (COP)', type: 'number', required: true },
      { key: 'duracion', label: 'Duración en minutos', type: 'number', required: true },
    ],
  },
  stylists: {
    title: 'Estilistas', eyebrow: 'Personas que cuidan de ti', description: 'Conoce al equipo y su especialidad.', icon: 'face_3', endpoint: resourcesApi.stylists, responseKey: 'estilistas',
    fields: [
      { key: 'nombre', label: 'Nombre', required: true },
      { key: 'apellido', label: 'Apellido', required: true },
      { key: 'correo', label: 'Correo', type: 'email', required: true },
      { key: 'telefono', label: 'Teléfono', required: true },
      { key: 'especialidad', label: 'Especialidad', wide: true, required: true },
    ],
  },
  appointments: {
    title: 'Mis citas', eyebrow: 'Un momento para ti', description: 'Reserva, revisa o cancela tus próximas visitas.', icon: 'calendar_month', endpoint: resourcesApi.appointments, responseKey: 'citas',
    fields: [
      { key: 'servicio', label: 'Servicio', type: 'service', required: true },
      { key: 'estilista', label: 'Estilista', type: 'stylist', required: true },
      { key: 'fecha', label: 'Fecha', type: 'date', required: true },
      { key: 'hora', label: 'Hora', type: 'time', required: true },
      { key: 'observaciones', label: 'Notas para tu cita', type: 'textarea', wide: true },
    ],
  },
})[props.resource])

const isAppointment = computed(() => props.resource === 'appointments')
const dialogTitle = computed(() => `${editingId.value ? 'Editar' : isAppointment.value ? 'Agendar' : 'Agregar'} ${isAppointment.value ? 'cita' : props.resource === 'services' ? 'servicio' : 'estilista'}`)
const activeRows = computed(() => rows.value.filter((row) => row.estado !== false))

const idOf = (value) => typeof value === 'object' && value ? value._id : value
const displayName = (value) => typeof value === 'object' && value ? [value.nombre, value.apellido].filter(Boolean).join(' ') : '—'
const price = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0)

const loadRows = async () => {
  loading.value = true
  try {
    if (isAppointment.value) {
      const [servicesResult, stylistsResult] = await Promise.all([
        salonApi.list(resourcesApi.services),
        salonApi.list(resourcesApi.stylists),
      ])
      servicesOptions.value = extractRows(servicesResult.data, 'servicios').map((item) => ({ label: item.nombre, value: item._id }))
      stylistsOptions.value = extractRows(stylistsResult.data, 'estilistas').map((item) => ({ label: `${item.nombre} ${item.apellido} · ${item.especialidad}`, value: item._id }))
    }
    const { data } = await salonApi.list(config.value.endpoint)
    const list = extractRows(data, config.value.responseKey)
    rows.value = isAppointment.value ? list.filter((item) => idOf(item.cliente) === auth.user?._id) : list
  } catch (error) {
    $q.notify({ type: 'negative', message: getApiError(error) })
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingId.value = null
  form.value = isAppointment.value ? { fecha: '', hora: '', observaciones: '' } : {}
  dialog.value = true
}

const openEdit = (row) => {
  editingId.value = row._id
  if (isAppointment.value) {
    form.value = { cliente: idOf(row.cliente), estilista: idOf(row.estilista), servicio: idOf(row.servicio), fecha: row.fecha, hora: row.hora, observaciones: row.observaciones || '' }
  } else {
    form.value = { ...row }
  }
  dialog.value = true
}

const save = async () => {
  saving.value = true
  try {
    const payload = { ...form.value }
    if (isAppointment.value && !editingId.value) payload.cliente = auth.user?._id
    if (editingId.value) await salonApi.update(config.value.endpoint, editingId.value, payload)
    else await salonApi.create(config.value.endpoint, payload)
    dialog.value = false
    $q.notify({ type: 'positive', message: editingId.value ? 'Cambios guardados.' : isAppointment.value ? 'Tu cita quedó agendada.' : 'Registro creado correctamente.' })
    await loadRows()
  } catch (error) {
    $q.notify({ type: 'negative', message: getApiError(error) })
  } finally {
    saving.value = false
  }
}

const removeRow = (row) => {
  $q.dialog({ title: isAppointment.value ? 'Cancelar cita' : 'Eliminar registro', message: '¿Deseas continuar con esta acción?', cancel: true, persistent: true })
    .onOk(async () => {
      try {
        await salonApi.remove(config.value.endpoint, row._id)
        $q.notify({ type: 'positive', message: isAppointment.value ? 'Cita cancelada.' : 'Registro eliminado.' })
        await loadRows()
      } catch (error) {
        $q.notify({ type: 'negative', message: getApiError(error) })
      }
    })
}

watch(() => props.resource, loadRows)
onMounted(loadRows)
</script>

<template>
  <q-page>
    <div class="page-shell">
      <div class="page-heading">
        <div>
          <div class="eyebrow">{{ config.eyebrow }}</div>
          <h1>{{ config.title }}</h1>
          <div class="subtle">{{ config.description }}</div>
        </div>
        <q-btn :label="isAppointment ? 'Agendar cita' : 'Agregar'" :icon="isAppointment ? 'add' : 'add'" color="primary" unelevated no-caps @click="openCreate" />
      </div>

      <div class="surface data-list">
        <div class="list-toolbar">
          <div class="row items-center q-gutter-sm"><q-icon :name="config.icon" color="primary" size="20px" /><strong>{{ activeRows.length }} {{ activeRows.length === 1 ? 'registro' : 'registros' }}</strong></div>
          <q-btn flat round dense icon="refresh" aria-label="Actualizar" :loading="loading" @click="loadRows"><q-tooltip>Actualizar</q-tooltip></q-btn>
        </div>
        <div v-if="loading" class="empty-state"><q-spinner color="primary" size="30px" /></div>

        <template v-else-if="isAppointment">
          <div v-for="row in activeRows" :key="row._id" class="list-row">
            <div>
              <div class="row-title">{{ row.servicio?.nombre || 'Servicio' }}</div>
              <div class="subtle row-secondary">{{ row.fecha }} · {{ row.hora }} · {{ displayName(row.estilista) }}</div>
            </div>
            <span class="appointment-status" :class="row.estado">{{ row.estado }}</span>
            <div class="row-secondary">{{ row.observaciones || '' }}</div>
            <div class="row-actions">
              <q-btn flat round dense icon="edit" aria-label="Editar cita" @click="openEdit(row)"><q-tooltip>Editar</q-tooltip></q-btn>
              <q-btn flat round dense color="negative" icon="event_busy" aria-label="Cancelar cita" @click="removeRow(row)"><q-tooltip>Cancelar cita</q-tooltip></q-btn>
            </div>
          </div>
        </template>

        <template v-else-if="props.resource === 'services'">
          <div v-for="row in activeRows" :key="row._id" class="list-row">
            <div><div class="row-title">{{ row.nombre }}</div><div class="subtle row-secondary">{{ row.descripcion }}</div></div>
            <div>{{ price(row.precio) }}</div>
            <div class="subtle">{{ row.duracion }} min</div>
            <div class="row-actions">
              <q-btn flat round dense icon="edit" aria-label="Editar servicio" @click="openEdit(row)"><q-tooltip>Editar</q-tooltip></q-btn>
              <q-btn flat round dense color="negative" icon="delete_outline" aria-label="Eliminar servicio" @click="removeRow(row)"><q-tooltip>Eliminar</q-tooltip></q-btn>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="row in activeRows" :key="row._id" class="list-row">
            <div><div class="row-title">{{ row.nombre }} {{ row.apellido }}</div><div class="subtle row-secondary">{{ row.correo }}</div></div>
            <div>{{ row.especialidad }}</div>
            <div class="subtle">{{ row.telefono }}</div>
            <div class="row-actions">
              <q-btn flat round dense icon="edit" aria-label="Editar estilista" @click="openEdit(row)"><q-tooltip>Editar</q-tooltip></q-btn>
              <q-btn flat round dense color="negative" icon="delete_outline" aria-label="Eliminar estilista" @click="removeRow(row)"><q-tooltip>Eliminar</q-tooltip></q-btn>
            </div>
          </div>
        </template>

        <div v-if="!loading && !activeRows.length" class="empty-state">
          <q-icon :name="config.icon" size="32px" />
          <div class="text-weight-medium text-dark">{{ isAppointment ? 'Aún no tienes citas agendadas' : 'Todavía no hay registros' }}</div>
          <div class="text-caption q-mt-xs">{{ isAppointment ? 'Agenda tu primera visita cuando quieras.' : 'Agrega el primer registro para verlo aquí.' }}</div>
          <q-btn outline color="primary" no-caps :label="isAppointment ? 'Agendar cita' : 'Agregar ahora'" class="q-mt-md" @click="openCreate" />
        </div>
      </div>
    </div>

    <q-dialog v-model="dialog">
      <q-card style="width: 520px; max-width: 94vw">
        <q-card-section class="row items-center justify-between">
          <div><div class="eyebrow">Belleza Estudio</div><div class="text-h6 serif q-mt-xs">{{ dialogTitle }}</div></div>
          <q-btn flat round dense icon="close" aria-label="Cerrar" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-form @submit.prevent="save">
          <q-card-section class="form-grid">
            <template v-for="field in config.fields" :key="field.key">
              <q-select
                v-if="field.type === 'service' || field.type === 'stylist'"
                v-model="form[field.key]"
                :class="field.wide ? 'span-2' : ''"
                :label="field.label"
                :options="field.type === 'service' ? servicesOptions : stylistsOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
                :rules="field.required ? [(value) => !!value || 'Este campo es obligatorio'] : []"
              />
              <q-input
                v-else
                v-model="form[field.key]"
                :class="field.wide ? 'span-2' : ''"
                :label="field.label"
                :type="field.type || 'text'"
                :min="field.type === 'number' ? 1 : undefined"
                outlined
                :rules="field.required ? [(value) => String(value ?? '').length > 0 || 'Este campo es obligatorio'] : []"
              />
            </template>
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat no-caps label="Volver" v-close-popup />
            <q-btn color="primary" unelevated no-caps :label="editingId ? 'Guardar cambios' : isAppointment ? 'Confirmar cita' : 'Guardar'" type="submit" :loading="saving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
