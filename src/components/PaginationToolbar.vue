<template>
    <div class="pagination-toolbar">
        <div v-if="sortFields && sortFields.length" class="toolbar-group">
            <span class="toolbar-label">Ordenar por:</span>
            <button v-for="sf in sortFields" :key="sf.field"
                :class="['btn-edit', { active: sortField === sf.field }]"
                @click="$emit('set-sort', sf.field)">{{ sf.label }}</button>
            <div class="sort-dir-grid">
                <button class="dir-btn" :class="{ active: sortDirection === 'ASC' }" @click="$emit('set-direction', 'ASC')" title="Ascendente" aria-label="Orden ascendente">▲</button>
                <button class="dir-btn" :class="{ active: sortDirection === 'DESC' }" @click="$emit('set-direction', 'DESC')" title="Descendente" aria-label="Orden descendente">▼</button>
            </div>
        </div>
        <div class="toolbar-group">
            <span class="toolbar-label">Mostrar:</span>
            <button v-for="s in [10, 20, 30]" :key="s" :class="['btn-edit', { active: size === s }]" @click="$emit('set-size', s)">{{ s }}</button>
        </div>
        <div class="toolbar-group">
            <button class="btn-edit" :disabled="page <= 0" @click="$emit('set-page', page - 1)">◀ Anterior</button>
            <span class="page-info">Pág. {{ totalPages ? page + 1 : 0 }} de {{ totalPages }} · {{ totalElements }} registros</span>
            <button class="btn-edit" :disabled="page >= totalPages - 1" @click="$emit('set-page', page + 1)">Siguiente ▶</button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    page: { type: Number, required: true },
    size: { type: Number, required: true },
    totalPages: { type: Number, default: 0 },
    totalElements: { type: Number, default: 0 },
    sortField: { type: String, default: '' },
    sortDirection: { type: String, default: 'ASC' },
    sortFields: { type: Array, default: () => [] }
})

defineEmits(['set-page', 'set-size', 'set-sort', 'set-direction'])
</script>

<style scoped>
.pagination-toolbar { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.toolbar-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.toolbar-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.sort-dir-grid { display: flex; flex-direction: column; gap: 2px; margin-left: 4px; }
.dir-btn { width: 26px; height: 17px; padding: 0; border: 1px solid var(--border); background: var(--background); color: var(--text-muted); border-radius: 4px; cursor: pointer; font-size: 0.55rem; line-height: 1; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
.dir-btn:hover { background: var(--border); color: var(--text-primary); }
.dir-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.btn-edit { background: var(--background); border: 1px solid var(--border); padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 0.82rem; transition: all 0.2s ease; color: var(--text-secondary); font-weight: 500; }
.btn-edit:hover { background: var(--border); color: var(--text-primary); }
.btn-edit.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.btn-edit:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap; }
</style>
