<template>
  <div class="editor">
    <div class="editor-toolbar">
      <v-file-input label="Cargar imagen de fondo" variant="outlined" density="compact"
        accept="image/*" @change="onImageChange" prepend-icon="mdi-file-upload"
        :rules="[value => !!value || 'Por favor, cargue una imagen']" placeholder="Seleccione una imagen de fondo" hide-details />
      <v-btn @click="addTextBox" variant="tonal" color="primary" class="add-btn">
        Agregar Caja de Texto
      </v-btn>
    </div>

    <div class="editor-main">
      <div class="canvas-scroll">
        <div class="canvas-wrapper" ref="canvasContainer">
          <canvas ref="canvas" width="800" height="600"></canvas>
          <div v-for="(box, index) in textBoxes" :key="index" class="text-box" :style="{
            top: box.y + 'px',
            left: box.x + 'px',
            width: box.align === 'center' ? 'auto' : '360px',
            minWidth: '40px',
            transform: box.align === 'center' ? 'translateX(-50%)' : 'none',
          }" :class="{ selected: selectedBox === index }" @mousedown="startDrag(index, $event)"
            @click.stop="selectBox(index)">
            <span class="text-box-inner">{{ box.text }}</span>
            <button v-if="box.id && box.id.startsWith('extra-text-')" class="delete-btn"
              @click.stop="removeTextBox(index)">✕</button>
          </div>
        </div>
      </div>

      <div class="editor-sidebar">
        <div class="sidebar-section">
          <label>Selecciona la fecha:</label>
          <input type="date" v-model="selectedDate" class="sidebar-input" />
        </div>
        <div v-if="selectedBox !== null" class="sidebar-section">
          <label>Editar texto:</label>
          <textarea v-model="textBoxes[selectedBox].text" @input="drawCanvas" class="sidebar-textarea"></textarea>
        </div>
        <div v-if="selectedBox !== null" class="sidebar-section">
          <label>Tipo de letra</label>
          <v-select :items="[
            { title: 'Arial', value: 'Arial' },
            { title: 'Times New Roman', value: 'Times New Roman' },
            { title: 'Courier New', value: 'Courier New' },
            { title: 'Verdana', value: 'Verdana' },
            { title: 'Monospace', value: 'monospace' },
            { title: 'Serif', value: 'serif' },
            { title: 'Sans-serif', value: 'sans-serif' }
          ]" v-model="textBoxes[selectedBox].fontFamily" variant="outlined" density="compact" hide-details />
        </div>
        <div v-if="selectedBox !== null" class="sidebar-row">
          <div class="sidebar-group">
            <label>Color de texto</label>
            <v-color-picker v-model="textBoxes[selectedBox].color" mode="rgba" show-swatches hide-canvas hide-inputs
              dot-size="16" swatches-max-height="100" />
            <v-text-field v-model="textBoxes[selectedBox].fontSize" type="number" :min="8" :max="72"
              label="Tamaño (px)" variant="outlined" density="compact" hide-details />
          </div>
          <div class="sidebar-group">
            <label>Fondo</label>
            <v-color-picker v-model="textBoxes[selectedBox].background" mode="rgba" show-swatches hide-canvas hide-inputs
              dot-size="16" swatches-max-height="100" />
            <v-btn @click="clearBackground" variant="outlined" size="small">
              Quitar fondo
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted } from 'vue'
import { api } from '../utils/api.js'

const props = defineProps({ valorTexto: String })

const textBTxt = ref('')

watch(() => props.valorTexto, (v) => { textBTxt.value = v }, { immediate: true })

const defaultTextBoxes = [
  { id: 'emisor-text', text: 'UNIVERSIDAD DE LA SIERRA SUR', x: 400, y: 40, fontFamily: 'Arial', fontSize: 24, color: '#000', background: 'rgba(255,255,255,0)', align: 'center' },
  { id: 'otorga-text', text: 'Otorga la presente constancia a:', x: 400, y: 100, fontFamily: 'Arial', fontSize: 16, color: '#000', background: 'rgba(255,255,255,0)', align: 'center' },
  { id: 'receptor-text', text: '[Nombre del receptor]', x: 400, y: 150, fontFamily: 'Arial', fontSize: 22, color: '#000', background: 'rgba(255,255,255,0)', align: 'center' },
  { id: 'body-text', text: textBTxt.value || '[Mensaje de la constancia]', x: 400, y: 210, fontFamily: 'Arial', fontSize: 14, color: '#333', background: 'rgba(255,255,255,0)', align: 'center' },
  { id: 'date-text', text: 'Fecha', x: 400, y: 370, fontFamily: 'Arial', fontSize: 14, color: '#000', background: 'rgba(255,255,255,0)', align: 'center' },
  { id: 'att-text', text: 'Atentamente: Docendo discimus', x: 400, y: 410, fontFamily: 'Arial', fontSize: 14, color: '#000', background: 'rgba(255,255,255,0)', align: 'center' },
  { id: 'firma-one', text: 'Firma 1', x: 240, y: 480, fontFamily: 'Arial', fontSize: 14, color: '#000', background: 'rgba(255,255,255,0)', align: 'center' },
  { id: 'firma-two', text: 'Firma 2', x: 560, y: 480, fontFamily: 'Arial', fontSize: 14, color: '#000', background: 'rgba(255,255,255,0)', align: 'center' },
  { id: 'verification-text', text: 'Puede validar su constancia en:', x: 160, y: 555, fontFamily: 'Arial', fontSize: 10, color: '#666', background: 'rgba(255,255,255,0)', align: 'left' },
  { id: 'folio-text', text: 'Folio:', x: 640, y: 555, fontFamily: 'Arial', fontSize: 10, color: '#666', background: 'rgba(255,255,255,0)', align: 'right' },
]

watch(textBTxt, (v) => {
  const b = textBoxes.find(box => box.id === 'body-text')
  if (b) { b.text = v || 'Cuerpo'; drawCanvas() }
})

const addDefaultTextBoxes = () => {
  textBoxes.splice(0, textBoxes.length)
  for (const box of defaultTextBoxes) {
    textBoxes.push({ ...box, fontFamily: 'Arial', color: '#000000', fontSize: 18, background: 'rgba(255,255,255,0)' })
  }
  selectedBox.value = null; draggingIndex = null
}

const canvas = ref(null)
const canvasContainer = ref(null)
const image = ref(null)
const textBoxes = reactive([])
let draggingIndex = null
let offset = { x: 0, y: 0 }
const selectedBox = ref(null)
const selectedDate = ref('')

watch(selectedDate, (d) => {
  const b = textBoxes.find(box => box.id === 'date-text')
  if (b) {
    if (d) { const [y, m, day] = d.split('-'); b.text = `${day}/${m}/${y}` }
    else b.text = 'Fecha'
    drawCanvas()
  }
})

const clearBackground = (e) => {
  e.preventDefault()
  if (selectedBox.value !== null && textBoxes[selectedBox.value])
    textBoxes[selectedBox.value].background = 'rgba(255,255,255,0)'
}

watch(selectedBox, (n, o) => {
  drawCanvas()
  if (o !== null && textBoxes[o]) { textBoxes[o].__unwatchers?.forEach(u => u()); textBoxes[o].__unwatchers = undefined }
  if (n !== null && textBoxes[n]) {
    const b = textBoxes[n]
    b.__unwatchers = [
      watch(() => b.fontFamily, drawCanvas),
      watch(() => b.fontSize, drawCanvas),
      watch(() => b.color, drawCanvas),
      watch(() => b.background, drawCanvas)
    ]
  }
})

watch(textBoxes, () => drawCanvas(), { deep: true })

const onImageChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    image.value = new Image()
    image.value.onload = () => { addDefaultTextBoxes(); drawCanvas() }
    image.value.src = e.target.result
  }
  reader.readAsDataURL(file)
}

function boxMaxWidth(box) {
  if (box.align === 'center') return 500
  return 340
}

function drawMultilineText(ctx, text, x, y, maxW, lineH, font, color, maxY) {
  ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textBaseline = 'top'
  const words = text.split(' '); let line = ''; let curY = y
  for (const w of words) {
    const t = line + w + ' '
    if (ctx.measureText(t).width > maxW && line) {
      if (maxY && curY + lineH > maxY) break
      ctx.fillText(line, x, curY); line = w + ' '; curY += lineH
    } else line = t
  }
  if (!maxY || curY + lineH <= maxY) ctx.fillText(line, x, curY)
  ctx.restore()
}

function drawBoxText(ctx, box, x, y, maxW) {
  const font = `${box.fontSize || 18}px ${box.fontFamily || 'Arial'}`
  ctx.font = font; ctx.fillStyle = box.color || '#000'
  const lh = (box.fontSize || 18) + 6
  drawMultilineText(ctx, box.text, x, y, maxW, lh, font, box.color, 590)
}

const drawCanvas = () => {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, 800, 600)
  if (image.value) {
    ctx.drawImage(image.value, 0, 0, 800, 600)
  } else {
    ctx.fillStyle = '#fffdfa'
    ctx.fillRect(0, 0, 800, 600)
    ctx.strokeStyle = '#e8e4e0'
    ctx.lineWidth = 2
    ctx.strokeRect(12, 12, 776, 576)
    ctx.strokeStyle = '#f0ece8'
    ctx.lineWidth = 1
    ctx.strokeRect(16, 16, 768, 568)
  }
  textBoxes.forEach((box) => {
    if (box.background && box.background !== 'rgba(255,255,255,0)') {
      ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = box.background
      ctx.font = `${box.fontSize || 18}px ${box.fontFamily || 'Arial'}`
      const m = ctx.measureText(box.text)
      ctx.fillRect(box.x - 8, box.y - 4, m.width + 16, (box.fontSize || 18) + 8)
      ctx.restore()
    }
    const mw = boxMaxWidth(box)
    if (box.align === 'center') {
      ctx.textAlign = 'center'
      drawBoxText(ctx, box, box.x, box.y + 7, mw)
    } else if (box.align === 'right') {
      ctx.textAlign = 'right'
      drawBoxText(ctx, box, box.x, box.y + 7, mw)
    } else {
      ctx.textAlign = 'left'
      drawBoxText(ctx, box, box.x + 10, box.y + 7, mw)
    }
    ctx.restore()
  })
}

nextTick(() => { addDefaultTextBoxes(); drawCanvas() })

let extraBoxCount = 1
const addTextBox = (e) => {
  e.preventDefault()
  textBoxes.push({ id: `extra-text-${extraBoxCount++}`, text: 'Nuevo texto', x: 100, y: 100, fontFamily: 'Arial', color: '#000000', fontSize: 18, background: 'rgba(255,255,255,0)' })
}

const selectBox = (i) => { selectedBox.value = i }

const removeTextBox = (i) => {
  if (textBoxes[i]?.id?.startsWith('extra-text-')) { textBoxes.splice(i, 1); if (selectedBox.value === i) selectedBox.value = null }
}

const startDrag = (i, e) => {
  draggingIndex = i; const el = e.target.closest('.text-box'); const r = el.getBoundingClientRect()
  offset.x = e.clientX - r.left; offset.y = e.clientY - r.top
  selectedBox.value = i; window.addEventListener('mousemove', onDrag); window.addEventListener('mouseup', stopDrag)
}

const stopDrag = () => { draggingIndex = null; window.removeEventListener('mousemove', onDrag); window.removeEventListener('mouseup', stopDrag); drawCanvas() }

const onDrag = (e) => {
  if (draggingIndex === null || !textBoxes[draggingIndex]) return
  const cr = canvasContainer.value.getBoundingClientRect(), b = textBoxes[draggingIndex]
  let nx = e.clientX - cr.left - offset.x, ny = e.clientY - cr.top - offset.y
  b.x = Math.max(0, Math.min(nx, 780)); b.y = Math.max(0, Math.min(ny, 570))
  drawCanvas()
}

const getCanvasImage = () => {
  if (!canvas.value) return undefined
  window.__drawForPDF = true; drawCanvas(); window.__drawForPDF = false
  return canvas.value.toDataURL('image/png')
}

const updatePreview = (persona) => {
  const nombre = persona[0] || persona.nombre || ''
  const primerApellido = persona[1] || persona.primer_apellido || ''
  const segundoApellido = persona[2] || persona.segundo_apellido || ''
  const nombreCompleto = [nombre, primerApellido, segundoApellido].filter(Boolean).join(' ')
  const receptorBox = textBoxes.find(b => b.id === 'receptor-text')
  if (receptorBox) { receptorBox.text = nombreCompleto; drawCanvas() }
}

defineExpose({ getCanvasImage, updatePreview })
</script>

<style scoped>
.editor {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  background: var(--background);
  flex-wrap: wrap;
}

.editor-toolbar .add-btn {
  flex-shrink: 0;
}

.editor-main {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.canvas-scroll {
  overflow: auto;
  padding: 16px;
  display: flex;
  justify-content: center;
  background: #f0eeed;
  border-bottom: 1px solid var(--border);
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  border-radius: 4px;
  line-height: 0;
}

canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.editor-sidebar {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  max-height: 320px;
  overflow-y: auto;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  flex: 1;
}

.sidebar-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  font-size: 0.9rem;
  background: var(--surface);
}

.sidebar-input:focus {
  border-color: var(--primary);
}

.sidebar-textarea {
  width: 100%;
  height: 90px;
  resize: vertical;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  font-size: 0.9rem;
  line-height: 1.5;
  background: var(--surface);
}

.sidebar-textarea:focus {
  border-color: var(--primary);
}

.sidebar-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
}

.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 160px;
}

label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-box {
  position: absolute;
  padding: 4px 8px;
  cursor: move;
  user-select: none;
  border-radius: 4px;
  min-width: 40px;
  min-height: 28px;
  transition: box-shadow 0.15s ease;
  pointer-events: auto;
  border: 1.5px dashed transparent;
}

.text-box:hover {
  border-color: rgba(var(--primary-rgb), 0.25);
}

.text-box.selected {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.12);
}

.text-box-inner {
  display: block;
  color: transparent;
  pointer-events: none;
  white-space: nowrap;
}

.delete-btn {
  background: #DC2626;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  cursor: pointer;
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
</style>
