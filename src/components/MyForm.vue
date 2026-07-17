<script setup>
import { ref, defineProps, watch } from 'vue'
import { PDFDocument } from 'pdf-lib'
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

    const toDownload = [];

    for (const persona of excelData.value) {
        let nombre, primer_apellido, segundo_apellido, grado_academico, grado;
        if (Array.isArray(persona)) {
            nombre = persona[0] || '';
            primer_apellido = persona[1] || '';
            segundo_apellido = persona[2] || '';
            grado_academico = persona[3] || '';
            grado = persona[4] || '';
        } else {
            nombre = persona.nombre || '';
            primer_apellido = persona.primer_apellido || '';
            segundo_apellido = persona.segundo_apellido || '';
            grado_academico = persona.grado_academico || '';
            grado = persona.grado || '';
        }
        const nombreCompleto = [nombre, primer_apellido, segundo_apellido].filter(Boolean).join(' ');
        const mensajePersonalizado = `Por su destacada participación, se otorga la presente constancia a ${grado ? grado + ' ' : ''}${nombreCompleto}.`;
        receptor.value = nombreCompleto;
        mensaje.value = mensajePersonalizado;
        await new Promise(resolve => setTimeout(resolve, 100));
        const canvasImg = editPaperMasterRef.value?.getCanvasImage?.();
        if (!canvasImg) continue;
        const tempImg = new window.Image();
        tempImg.src = canvasImg;
        await new Promise(resolve => { tempImg.onload = resolve; });
        const width = tempImg.width;
        const height = tempImg.height;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([width, height]);
        const pngImage = await pdfDoc.embedPng(canvasImg);
        page.drawImage(pngImage, { x: 0, y: 0, width, height });
        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        toDownload.push({ blob, filename: `constancia-${nombreCompleto.replace(/\s+/g, '_')}.pdf` });
    }

    for (let i = 0; i < toDownload.length; i++) {
        const { blob, filename } = toDownload[i];
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        if (i < toDownload.length - 1) {
            await new Promise(r => setTimeout(r, 600));
        }
    }
    toast.success('Constancias generadas exitosamente');
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
