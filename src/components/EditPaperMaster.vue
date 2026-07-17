<template>
  <div class="editor">
    <v-file-input style="width: 100%; margin-bottom: 10px;" label="Cargar imagen de fondo" variant="outlined"
      accept="image/*" @change="onImageChange" prepend-icon="mdi-file-upload"
      :rules="[value => !!value || 'Por favor, cargue una imagen']" placeholder="Seleccione una imagen de fondo" />
    <v-btn @click="addTextBox" :disabled="image === null" variant="tonal" color="primary"
      style="margin-bottom: 16px; width: 100%;">
      Agregar Caja de Texto
    </v-btn>
    <div class="sidebar-container">
      <div class="canvas-container" ref="canvasContainer">
        <canvas ref="canvas" width="800" height="600"></canvas>
        <div v-for="(box, index) in textBoxes" :key="index" class="text-box" :style="{
          top: box.y + 'px',
          left: box.x + 'px',
          opacity: 0.2,
          fontFamily: box.fontFamily,
          color: box.color,
          fontSize: box.fontSize + 'px',
          background: box.background,
          display: (box.id === 'firma-one' || box.id === 'firma-two') ? 'inline-block' : (box.id === 'verification-text' || box.id === 'folio-text') ? 'inline-block' : 'block',
          marginRight: (box.id === 'firma-one' || box.id === 'verification-text') ? '16px' : '0',
          minWidth: '40px',
        }" :class="{ selected: selectedBox === index }" @mousedown="startDrag(index, $event)"
          @click.stop="selectBox(index)">
          <span v-if="selectedBox === index" style="pointer-events:none; user-select:none;">{{ box.text }}</span>
          <span v-else>{{ box.text }}</span>
          <button v-if="box.id && box.id.startsWith('extra-text-')" class="delete-btn"
            @click.stop="removeTextBox(index)">✕</button>
        </div>
      </div>
      <div class="sidebar">
        <div style="margin-bottom: 16px;">
          <label>Selecciona la fecha:</label>
          <input type="date" v-model="selectedDate" style="width: 100%; padding: 6px; margin-top: 4px;" class="date-picker" />
        </div>
        <div v-if="selectedBox !== null">
          <label>Editar texto:</label>
          <textarea id="text-edition" v-model="textBoxes[selectedBox].text" @input="drawCanvas"></textarea>
          <div style="margin-top: 12px;">
            <v-select label="Tipo de letra" :items="[
              { title: 'Arial', value: 'Arial' },
              { title: 'Times New Roman', value: 'Times New Roman' },
              { title: 'Courier New', value: 'Courier New' },
              { title: 'Verdana', value: 'Verdana' },
              { title: 'Monospace', value: 'monospace' },
              { title: 'Serif', value: 'serif' },
              { title: 'Sans-serif', value: 'sans-serif' }
            ]" v-model="textBoxes[selectedBox].fontFamily" variant="outlined" density="comfortable" />
          </div>
          <div class="color-row">
            <div class="color-group">
              <label>Color de texto:</label>
              <v-color-picker v-model="textBoxes[selectedBox].color" mode="rgba" show-swatches hide-canvas hide-inputs
                dot-size="18" swatches-max-height="120" style="max-width: 260px; margin-top: 8px;" />
              <v-text-field v-model="textBoxes[selectedBox].fontSize" type="number" :min="8"
                :max="72" label="Tamaño (px)" style="width: 100%; margin-top: 8px;" variant="outlined" density="comfortable" />
            </div>
            <div class="color-group">
              <label>Fondo:</label>
              <v-color-picker v-model="textBoxes[selectedBox].background" mode="rgba" show-swatches hide-canvas
                hide-inputs dot-size="18" swatches-max-height="120" style="max-width: 260px; margin-top: 8px;" />
              <v-btn style="margin-top: 8px; width: 100%;" @click="clearBackground" variant="outlined">
                Quitar fondo
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { api } from '../utils/api.js'

const props = defineProps({
  valorTexto: String
})

const textBTxt = ref('')

watch(
  () => props.valorTexto,
  (nuevoValor) => {
    textBTxt.value = nuevoValor
  },
  { immediate: true }
)

const defaultTextBoxes = [
  { id: 'emisor-text', text: 'UNIVERSIDAD DE LA SIERRA SUR', x: 400, y: 40, fontFamily: 'Arial', fontSize: 24, color: '#000', background: 'rgba(255,255,255,0)', align: 'center' },
  { id: 'otorga-text', text: 'Otorga la presente constancia a', x: 350, y: 90 },
  { id: 'receptor-text', text: 'Receptor', x: 350, y: 140 },
  { id: 'body-text', text: textBTxt.value || 'Cuerpo', x: 350, y: 190 },
  { id: 'att-text', text: 'Atentamente: Docendo discimus', x: 350, y: 240 },
  { id: 'firma-one', text: 'Firma 1', x: 350, y: 450 },
  { id: 'firma-two', text: 'Firma 2', x: 600, y: 450 },
  { id: 'date-text', text: 'Fecha', x: 350, y: 370 },
  { id: 'verification-text', text: 'Puede validar su constancia en ', x: 350, y: 550 },
  { id: 'folio-text', text: 'Folio', x: 650, y: 550 },
]

watch(textBTxt, (nuevoValor) => {
  const bodyBox = textBoxes.find(box => box.id === 'body-text')
  if (bodyBox) {
    bodyBox.text = nuevoValor || 'Cuerpo'
    drawCanvas()
  }
})

const addDefaultTextBoxes = () => {
  textBoxes.splice(0, textBoxes.length)
  for (const box of defaultTextBoxes) {
    textBoxes.push({
      ...box,
      fontFamily: 'Arial',
      color: '#000000',
      fontSize: 18,
      background: 'rgba(255,255,255,0)'
    })
  }
  selectedBox.value = null;
  draggingIndex = null;
}

const canvas = ref(null)
const canvasContainer = ref(null)
const image = ref(null)
const textBoxes = reactive([])
let draggingIndex = null
let offset = { x: 0, y: 0 }
const selectedBox = ref(null)
const selectedDate = ref('');

watch(selectedDate, (newDate) => {
  const dateBox = textBoxes.find(box => box.id === 'date-text');
  if (dateBox) {
    if (newDate) {
      const [yyyy, mm, dd] = newDate.split('-');
      dateBox.text = `${dd}/${mm}/${yyyy}`;
    } else {
      dateBox.text = 'Fecha';
    }
    drawCanvas();
  }
});

const clearBackground = (event) => {
  event.preventDefault()
  if (selectedBox.value !== null && textBoxes[selectedBox.value] !== undefined) {
    textBoxes[selectedBox.value].background = 'rgba(255,255,255,0)'
  }
}

watch(selectedBox, (newIdx, oldIdx) => {
  drawCanvas();
  if (oldIdx !== null && textBoxes[oldIdx]) {
    if (textBoxes[oldIdx].__unwatchers) {
      textBoxes[oldIdx].__unwatchers.forEach(unwatch => unwatch());
      textBoxes[oldIdx].__unwatchers = undefined;
    }
  }
  if (newIdx !== null && textBoxes[newIdx]) {
    const box = textBoxes[newIdx];
    box.__unwatchers = [
      watch(() => box.fontFamily, drawCanvas),
      watch(() => box.fontSize, drawCanvas),
      watch(() => box.color, drawCanvas),
      watch(() => box.background, drawCanvas)
    ];
  }
});

watch(textBoxes, () => { drawCanvas(); }, { deep: true });

const onImageChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    image.value = new Image()
    image.value.onload = () => {
      addDefaultTextBoxes()
      drawCanvas()
    }
    image.value.src = e.target.result
  }
  reader.readAsDataURL(file)
}

const onExcelChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await api('/api/file', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.data && Array.isArray(result.data)) {
      const rows = result.data.slice(1);
      if (rows.length > 0) {
        const persona = rows[0];
        const folioRes = await api('/api/v1/receiver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: persona[0],
            primer_apellido: persona[1],
            segundo_apellido: persona[2],
            telefono: persona[3] || '',
            email: persona[4] || '',
            grado_academico: persona[5] || ''
          })
        });
        const folioData = await folioRes.json();
        const receptorBox = textBoxes.find(box => box.id === 'receptor-text');
        if (receptorBox) receptorBox.text = `${persona[0]} ${persona[1]} ${persona[2]}`;
        const folioBox = textBoxes.find(box => box.id === 'folio-text');
        if (folioBox && folioData.folio) folioBox.text = `Folio: ${folioData.folio}`;
        drawCanvas();
      }
    }
  } catch (err) {
    alert('Error procesando el archivo Excel o registrando receptor');
  }
};

function getTextBoxWidth(box, index) {
  const el = document.querySelectorAll('.text-box')[index];
  if (el) {
    return el.offsetWidth;
  }
  return 400;
}

function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight, font, color, opacity, maxY) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.textBaseline = 'top';
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      if (maxY && currentY + lineHeight > maxY) break;
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (!maxY || currentY + lineHeight <= maxY) {
    ctx.fillText(line, x, currentY);
  }
  ctx.restore();
}

const drawCanvas = () => {
  const ctx = canvas.value.getContext('2d');
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  if (image.value) {
    ctx.drawImage(image.value, 0, 0, canvas.value.width, canvas.value.height);
  }
  textBoxes.forEach((box, index) => {
    if (box.background && box.background !== 'rgba(255,255,255,0)') {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = box.background;
      ctx.font = `${box.fontSize || 18}px ${box.fontFamily || 'Arial'}`;
      const metrics = ctx.measureText(box.text);
      ctx.fillRect(box.x - 8, box.y - 4, metrics.width + 16, (box.fontSize || 18) + 8);
      ctx.restore();
    }
    ctx.save();
    ctx.font = `${box.fontSize || 18}px ${box.fontFamily || 'Arial'}`;
    ctx.fillStyle = box.color || '#000000';
    const maxWidth = getTextBoxWidth(box, index) - 16;
    const lineHeight = (box.fontSize || 18) + 6;
    const maxY = canvas.value.height - 10;
    if (box.align === 'center') {
      ctx.textAlign = 'center';
      drawMultilineText(ctx, box.text, box.x, box.y + 7, maxWidth, lineHeight, ctx.font, box.color, 1, maxY);
    } else {
      ctx.textAlign = 'left';
      drawMultilineText(ctx, box.text, box.x + 10, box.y + 7, maxWidth, lineHeight, ctx.font, box.color, 1, maxY);
    }
    ctx.restore();
  });
}

nextTick(() => { drawCanvas(); });

let extraBoxCount = 1;
const addTextBox = (event) => {
  event.preventDefault();
  textBoxes.push({
    id: `extra-text-${extraBoxCount++}`,
    text: 'Nuevo texto',
    x: 100, y: 100,
    fontFamily: 'Arial', color: '#000000', fontSize: 18, background: 'rgba(255,255,255,0)'
  });
}

const selectBox = (index) => { selectedBox.value = index }

const removeTextBox = (index) => {
  if (textBoxes[index] && textBoxes[index].id && textBoxes[index].id.startsWith('extra-text-')) {
    textBoxes.splice(index, 1);
    if (selectedBox.value === index) selectedBox.value = null;
  }
}

const startDrag = (index, event) => {
  draggingIndex = index
  const box = textBoxes[index];
  const boxElement = event.target.closest('.text-box');
  const boxRect = boxElement.getBoundingClientRect();
  offset.x = event.clientX - boxRect.left;
  offset.y = event.clientY - boxRect.top;
  selectedBox.value = index
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  drawCanvas()
}

const stopDrag = () => {
  draggingIndex = null
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  drawCanvas()
}

const onDrag = (event) => {
  if (draggingIndex === null) return
  if (!textBoxes[draggingIndex]) return
  const containerRect = canvasContainer.value.getBoundingClientRect()
  const box = textBoxes[draggingIndex];
  let newX = event.clientX - containerRect.left - offset.x;
  let newY = event.clientY - containerRect.top - offset.y;
  newX = Math.max(0, Math.min(newX, canvas.value.width - 400));
  newY = Math.max(0, Math.min(newY, canvas.value.height - 100));
  box.x = newX;
  box.y = newY;
  drawCanvas()
}

function getCanvasImage() {
  if (!canvas.value) return undefined;
  window.__drawForPDF = true;
  drawCanvas();
  window.__drawForPDF = false;
  return canvas.value.toDataURL('image/png');
}

defineExpose({ getCanvasImage });
</script>

<style scoped>
.editor {
  background: var(--surface);
  font-family: inherit;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  width: 100%;
}

.sidebar-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.sidebar {
  flex: 1;
  padding: 16px;
  min-height: 650px;
  box-sizing: border-box;
}

.canvas-container {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  flex: 0 0 auto;
  display: inline-block;
}

.text-box {
  position: absolute;
  padding: 4px 8px;
  cursor: move;
  user-select: none;
  border-radius: 4px;
  min-width: 40px;
  min-height: 24px;
  transition: box-shadow 0.2s;
}

.text-box.selected {
  box-shadow: 0 0 0 2px var(--primary);
  border-color: var(--primary);
}

.delete-btn {
  background: #DC2626;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 14px;
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

#text-edition {
  width: 100%;
  box-sizing: border-box;
  height: 120px;
  max-width: 100%;
  resize: none;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-top: 8px;
  margin-bottom: 12px;
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
  font-size: 0.9rem;
  line-height: 1.5;
  transition: border-color var(--transition);
}

#text-edition:focus {
  border-color: var(--primary);
}

.color-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.color-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.color-group label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.date-picker {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
}

label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
</style>
