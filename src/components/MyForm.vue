<script setup>
import { ref, defineProps, watch, onMounted } from 'vue'
import EditPaperMaster from './EditPaperMaster.vue'
import { api } from '../utils/api.js'
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
    titulo: String,
    mensajePlaceholder: String
})

const editPaperMasterRef = ref(null)
const pdfUrl = ref(null)
const mensaje = ref('')
const receptor = ref('')
const fechaSeleccionada = ref('')
const cerrarFormulario = () => {}

const events = ref([])
const activities = ref([])
const senders = ref([])
const selectedEventId = ref('')
const selectedActivityId = ref('')
const selectedSenderId = ref('')
const selectedRole = ref('PARTICIPANTE')
const generando = ref(false)

onMounted(async () => {
    try {
        const [evtRes, actRes, sndRes] = await Promise.all([
            api('/api/v1/event'),
            api('/api/v1/activity'),
            api('/api/v1/sender')
        ])
        if (evtRes.ok) events.value = await evtRes.json()
        if (actRes.ok) activities.value = await actRes.json()
        if (sndRes.ok) senders.value = await sndRes.json()
    } catch (_) {}
})

const filteredActivities = () => {
    if (!selectedEventId.value) return []
    return activities.value.filter(a => a.eventId === Number(selectedEventId.value))
}

function incrementFolio(folio) {
    const match = folio.match(/^(.*?)(\d+)$/)
    if (match) {
        const prefix = match[1]
        const num = parseInt(match[2], 10)
        const padded = String(num + 1).padStart(match[2].length, '0')
        return prefix + padded
    }
    return folio + '_1'
}

const submitForm = async () => {
    if (!excelData.value.length) {
        toast.error('Primero carga un archivo Excel válido.')
        return;
    }

    if (!editPaperMasterRef.value?.getCanvasImage?.(3)) {
        toast.error('Primero edita y carga la hoja maestra en el editor.')
        return;
    }

    generando.value = true
    let totalCount = 0
    let allFolios = []
    const firstPersona = excelData.value[0]

    try {
        let currentFolio = null
        try {
            const folioRes = await api('/api/v1/folio')
            if (folioRes.ok) {
                const folioData = await folioRes.json()
                currentFolio = folioData.folio || folioData
            }
        } catch (_) {}

        for (const [index, persona] of excelData.value.entries()) {
            if (index > 0 && currentFolio) {
                currentFolio = incrementFolio(currentFolio)
            }

            if (currentFolio) {
                editPaperMasterRef.value?.updateFolio(currentFolio)
            }

            editPaperMasterRef.value?.updatePreview(persona)

            const image = editPaperMasterRef.value?.getCanvasImage?.(3)
            if (!image) continue

            const personData = Array.isArray(persona) ? [persona] : [[persona.nombre || '', persona.primer_apellido || '', persona.segundo_apellido || '', persona.grado_academico || '', persona.grado || '']]

            const body = {
                canvasImage: image,
                data: personData,
                folios: currentFolio ? [currentFolio] : undefined
            }

            const hasMeta = selectedSenderId.value && selectedActivityId.value && selectedEventId.value
            if (hasMeta) {
                body.senderId = Number(selectedSenderId.value)
                body.activityId = Number(selectedActivityId.value)
                body.eventId = Number(selectedEventId.value)
                if (excelHasRole.value && Array.isArray(persona) && excelRolIndex.value >= 0 && persona[excelRolIndex.value]) {
                    body.role = persona[excelRolIndex.value]
                } else if (selectedRole.value) {
                    body.role = selectedRole.value
                }
            }

            try {
                const response = await api('/api/v1/proof/generate-pdfs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
                if (response.ok) {
                    const result = await response.json()
                    totalCount += result.count || 1
                    if (result.folios) allFolios.push(...result.folios)
                    if (result.generatedFolios) allFolios.push(...result.generatedFolios)
                }
            } catch (_) {}
        }

        editPaperMasterRef.value?.updatePreview(firstPersona)
    } finally {
        generando.value = false
    }

    if (totalCount > 0) {
        if (allFolios.length) {
            toast.success(`Se generaron ${totalCount} constancias. Folios: ${allFolios.join(', ')}`)
        } else {
            toast.success(`Se generaron ${totalCount} constancias`)
        }
    } else {
        toast.error('Error al generar las constancias')
    }
}

const pdfSelect = ref(false)
const formData = ref({ name: '' })
function handleFileChange(event) {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
        pdfSelect.value = true
        pdfUrl.value = URL.createObjectURL(file)
    } else {
        pdfSelect.value = false
        pdfUrl.value = null
        toast.error('Por favor seleccione un archivo PDF válido')
    }
}

const excelData = ref([])
const excelHasRole = ref(false)
const excelRolIndex = ref(-1)

async function onExcelChange(event) {
  const file = event.target.files ? event.target.files[0] : event;
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await api('/api/upload-excel', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.data && Array.isArray(result.data) && result.data.length > 1) {
      const headers = result.data[0].map(h => (h || '').toUpperCase())
      excelHasRole.value = headers.includes('ROL')
      excelRolIndex.value = headers.indexOf('ROL')
      excelData.value = result.data.slice(1);
    } else if (result.folios && Array.isArray(result.folios) && result.folios.length > 0) {
      excelHasRole.value = false
      excelRolIndex.value = -1
      excelData.value = result.folios;
    } else {
      excelData.value = [];
      excelHasRole.value = false
      excelRolIndex.value = -1
    }
    if (excelData.value.length > 0) {
      editPaperMasterRef.value?.updatePreview(excelData.value[0]);
    }
    toast.success('Excel cargado correctamente');
  } catch (err) {
    toast.error('Error procesando el archivo Excel');
  }
};

watch(fechaSeleccionada, (nuevaFecha) => {
  if (editPaperMasterRef.value && editPaperMasterRef.value.selectedDate !== undefined) {
    editPaperMasterRef.value.selectedDate = nuevaFecha;
  }
});
</script>

<template>
    <form class="my-form" @submit.prevent="submitForm">
        <div class="form-header">
            <h3>{{ titulo }}</h3>
        </div>
        <div class="form-group">
            <label>Cargar Excel con los datos de las personas</label>
            <v-file-input label="Archivo Excel" accept=".xlsx" multiple
                :rules="[value => !!value || 'Porfavor cargue un archivo .xlsx o calc']"
                class="file-input" @change="onExcelChange" variant="outlined" density="comfortable" />
        </div>
        <div class="form-group">
            <label>Mensaje:</label>
            <textarea class="form-textarea" :placeholder="mensajePlaceholder" v-model="mensaje"></textarea>
        </div>
        <div class="form-row-group">
            <div class="form-group">
                <label>Evento</label>
                <select v-model="selectedEventId" @change="selectedActivityId = ''" class="form-select">
                    <option value="">Seleccione un evento</option>
                    <option v-for="e in events" :key="e.eventId" :value="e.eventId">{{ e.eventName }}</option>
                </select>
            </div>
            <div class="form-group">
                <label>Actividad</label>
                <select v-model="selectedActivityId" class="form-select">
                    <option value="">Seleccione una actividad</option>
                    <option v-for="a in filteredActivities()" :key="a.activityId" :value="a.activityId">{{ a.activityName }}</option>
                </select>
            </div>
            <div class="form-group">
                <label>Emisor</label>
                <select v-model="selectedSenderId" class="form-select">
                    <option value="">Seleccione un emisor</option>
                    <option v-for="s in senders" :key="s.senderId" :value="s.senderId">{{ s.name }}</option>
                </select>
            </div>
            <div class="form-group" v-if="excelData.length === 0 || !excelHasRole">
                <label>Rol</label>
                <select v-model="selectedRole" class="form-select">
                    <option value="PARTICIPANTE">Participante</option>
                    <option value="PONENTE">Ponente</option>
                    <option value="ORGANIZADOR">Organizador</option>
                    <option value="RECONOCIMIENTO">Reconocimiento</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Cargar hoja maestra</label>
            <EditPaperMaster ref="editPaperMasterRef" :valorTexto="mensaje" />
        </div>
        <div v-if="generando" class="progress-bar-container">
            <div class="progress-bar"></div>
            <span class="progress-text">Generando constancias...</span>
        </div>
        <div class="form-actions">
            <button type="button" class="btn-secondary" @click="cerrarFormulario" :disabled="generando">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="generando">
                <span v-if="generando" class="spinner-btn"></span>
                {{ generando ? 'Generando...' : 'Generar' }}
            </button>
        </div>
    </form>
</template>

<style scoped>
.my-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-header h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.file-input {
    width: 100%;
}

.form-textarea {
    width: 100%;
    min-height: 100px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    resize: vertical;
    outline: none;
    background: var(--surface);
    transition: border-color var(--transition);
}

.form-textarea:focus {
    border-color: var(--primary);
}

.form-row-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    background: var(--surface);
    outline: none;
    transition: border-color var(--transition);
}

.form-select:focus {
    border-color: var(--primary);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.progress-bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
}

.progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: -30%;
    width: 30%;
    height: 100%;
    background: var(--primary);
    border-radius: 4px;
    animation: bar-loading 1.2s ease-in-out infinite;
}

@keyframes bar-loading {
    0% { left: -30%; }
    100% { left: 100%; }
}

.progress-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.spinner-btn {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin-btn 0.6s linear infinite;
    margin-right: 6px;
    vertical-align: middle;
}

@keyframes spin-btn {
    to { transform: rotate(360deg); }
}

.btn-primary {
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 10px 28px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: background var(--transition);
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-light);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    background: var(--background);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    padding: 10px 28px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all var(--transition);
}

.btn-secondary:hover {
    background: var(--border);
}
</style>
