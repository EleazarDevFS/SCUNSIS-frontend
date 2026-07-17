<script setup>
import { ref, defineProps, watch } from 'vue'
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

const submitForm = async () => {
    if (!excelData.value.length) {
        toast.error('Primero carga un archivo Excel válido.')
        return;
    }
    const canvasImage = editPaperMasterRef.value?.getCanvasImage?.();
    if (!canvasImage) {
        toast.error('Primero edita y carga la hoja maestra en el editor.')
        return;
    }

    const data = excelData.value.map(persona => {
        if (Array.isArray(persona)) return persona;
        return [persona.nombre || '', persona.primer_apellido || '', persona.segundo_apellido || '', persona.grado_academico || '', persona.grado || ''];
    });

    try {
        const response = await api('/api/v1/proof/generate-pdfs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ canvasImage, data })
        });
        if (!response.ok) {
            toast.error('Error al generar las constancias');
            return;
        }
        const result = await response.json();
        toast.success(`Se generaron ${result.count} constancias en la ruta ${result.path}`);
    } catch (err) {
        toast.error('Error al generar las constancias');
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
    if (result.folios && Array.isArray(result.folios) && result.folios.length > 0) {
      excelData.value = result.folios;
    } else if (result.data && Array.isArray(result.data) && result.data.length > 1) {
      excelData.value = result.data.slice(1);
    } else {
      excelData.value = [];
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
        <div class="form-group">
            <label>Cargar hoja maestra</label>
            <EditPaperMaster ref="editPaperMasterRef" :valorTexto="mensaje" />
        </div>
        <div class="form-actions">
            <button type="button" class="btn-secondary" @click="cerrarFormulario">Cancelar</button>
            <button type="submit" class="btn-primary" @click="submitForm">Generar</button>
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

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
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

.btn-primary:hover {
    background: var(--primary-light);
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
