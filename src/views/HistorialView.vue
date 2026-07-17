<script>
import { api } from '../utils/api.js';
import { useToast } from 'vue-toastification';

export default {
    name: 'HistorialView',
    setup() {
        return { toast: useToast() };
    },
    data() {
        return {
            proofs: [],
            filteredProofs: [],
            loading: false,
            searchQuery: '',
            filterDateFrom: '',
            filterDateTo: '',
            expandedFolio: null,
            userRole: localStorage.getItem('role')
        }
    },
    computed: {
        stats() {
            return {
                total: this.filteredProofs.length,
                ponentes: this.filteredProofs.filter(p => p.role === 'PONENTE').length,
                participantes: this.filteredProofs.filter(p => p.role === 'PARTICIPANTE').length,
                organizadores: this.filteredProofs.filter(p => p.role === 'ORGANIZADOR').length
            }
        },
        isAdmin() {
            return this.userRole === 'ADMIN';
        }
    },
    methods: {
        async fetchProofs() {
            this.loading = true;
            try {
                const res = await api('/api/v1/proof');
                if (!res.ok) throw new Error('Error al cargar historial');
                this.proofs = await res.json();
                this.applyFilters();
            } catch (err) {
                if (err.message !== 'Sesion expirada') this.toast.error(err.message);
            } finally {
                this.loading = false;
            }
        },
        applyFilters() {
            let result = [...this.proofs];
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                result = result.filter(p =>
                    p.receiverFullName?.toLowerCase().includes(q) ||
                    p.folio?.toLowerCase().includes(q) ||
                    p.eventName?.toLowerCase().includes(q) ||
                    p.activityName?.toLowerCase().includes(q)
                );
            }
            if (this.filterDateFrom) result = result.filter(p => p.date >= this.filterDateFrom);
            if (this.filterDateTo) result = result.filter(p => p.date <= this.filterDateTo);
            result.sort((a, b) => b.date?.localeCompare(a.date));
            this.filteredProofs = result;
        },
        async downloadPdf(folio) {
            try {
                const res = await api(`/api/v1/proof/${folio}/pdf`);
                if (!res.ok) throw new Error('Error al descargar PDF');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `constancia_${folio}_.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                if (err.message !== 'Sesion expirada') this.toast.error(err.message);
            }
        },
        async deleteProof(folio) {
            if (!confirm(`¿Eliminar constancia ${folio}?`)) return;
            try {
                const res = await api(`/api/v1/proof/${folio}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Error al eliminar');
                this.proofs = this.proofs.filter(p => p.folio !== folio);
                this.applyFilters();
                this.toast.success(`Constancia ${folio} eliminada`);
            } catch (err) {
                if (err.message !== 'Sesion expirada') this.toast.error(err.message);
            }
        },
        toggleExpand(folio) {
            this.expandedFolio = this.expandedFolio === folio ? null : folio;
        },
        roleBadge(role) {
            const map = { PONENTE: 'Ponente', PARTICIPANTE: 'Participante', ORGANIZADOR: 'Organizador', RECONOCIMIENTO: 'Reconocimiento' };
            return map[role] || role;
        }
    },
    mounted() {
        this.fetchProofs();
    }
}
</script>
<template>
    <div class="historial-container">
        <div class="page-header">
            <div>
                <span class="page-badge">Historial</span>
                <h2>Constancias emitidas</h2>
            </div>
            <div class="stats-bar">
                <div class="stat"><span class="stat-value">{{ stats.total }}</span>Total</div>
                <div class="stat stat-ponente"><span class="stat-value">{{ stats.ponentes }}</span>Ponentes</div>
                <div class="stat stat-participante"><span class="stat-value">{{ stats.participantes }}</span>Participantes</div>
                <div class="stat stat-organizador"><span class="stat-value">{{ stats.organizadores }}</span>Organizadores</div>
            </div>
        </div>
        <div class="filters-card">
            <div class="search-wrapper">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                    <path d="M796-121 533-384q-30 26-69.5 41T378-328q-108 0-183-75t-75-183q0-108 75-183t183-75q108 0 183 75t75 183q0 46-15 85.5T597-507l263 263-64 64ZM378-408q70 0 119-49t49-119q0-70-49-119t-119-49q-70 0-119 49T210-576q0 70 49 119t119 49Z"/>
                </svg>
                <input v-model="searchQuery" @input="applyFilters" placeholder="Buscar por nombre, folio, evento..." class="search-input" />
            </div>
            <div class="date-filters">
                <label>Desde:
                    <input type="date" v-model="filterDateFrom" @change="applyFilters" />
                </label>
                <label>Hasta:
                    <input type="date" v-model="filterDateTo" @change="applyFilters" />
                </label>
            </div>
            <button @click="fetchProofs" class="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                    <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Z"/>
                </svg>
                Actualizar
            </button>
        </div>
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <span>Cargando constancias...</span>
        </div>
        <div v-else-if="filteredProofs.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" height="56px" viewBox="0 -960 960 960" width="56px" fill="var(--text-muted)">
                <path d="M240-400h320v-80H240v80Zm0-120h320v-80H240v80Zm0-120h320v-80H240v80Zm360 480v-123l263-263q10-10 21.5-14t23.5-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4.5 22.5T907-343L644-80H600ZM360-80H160q-33 0-56.5-23.5T80-160v-640q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v248q-19-9-40-13.5t-40-2.5v-232H160v640h207l-7 80Z"/>
            </svg>
            <p>No hay constancias registradas</p>
        </div>
        <div v-else class="proofs-list">
            <div v-for="p in filteredProofs" :key="p.folio" class="proof-card" :class="{ expanded: expandedFolio === p.folio }" @click="toggleExpand(p.folio)">
                <div class="proof-summary">
                    <span class="proof-folio">{{ p.folio }}</span>
                    <span class="proof-receiver">{{ p.receiverFullName }}</span>
                    <span class="proof-event">{{ p.eventName }}</span>
                    <span class="badge" :class="'badge-' + (p.role || '').toLowerCase()">{{ roleBadge(p.role) }}</span>
                    <span class="proof-date">{{ p.date }}</span>
                    <svg class="expand-icon" :class="{ rotated: expandedFolio === p.folio }" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                        <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>
                    </svg>
                </div>
                <div v-if="expandedFolio === p.folio" class="proof-details" @click.stop>
                    <div class="detail-grid">
                        <div class="detail-item"><span class="detail-label">Folio</span>{{ p.folio }}</div>
                        <div class="detail-item"><span class="detail-label">Receptor</span>{{ p.receiverFullName }}</div>
                        <div class="detail-item"><span class="detail-label">Email</span>{{ p.receiverEmail || '—' }}</div>
                        <div class="detail-item"><span class="detail-label">Emisor</span>{{ p.senderName || '—' }}</div>
                        <div class="detail-item"><span class="detail-label">Evento</span>{{ p.eventName }}</div>
                        <div class="detail-item"><span class="detail-label">Actividad</span>{{ p.activityName }}</div>
                        <div class="detail-item"><span class="detail-label">Rol</span>{{ roleBadge(p.role) }}</div>
                        <div class="detail-item"><span class="detail-label">Fecha</span>{{ p.date }}</div>
                    </div>
                    <div class="detail-actions">
                        <button @click="downloadPdf(p.folio)" class="btn-download">
                            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                                <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
                            </svg>
                            Descargar PDF
                        </button>
                        <button v-if="isAdmin" @click="deleteProof(p.folio)" class="btn-delete">
                            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.historial-container {
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
}

.page-badge {
    display: inline-block;
    padding: 3px 12px;
    background: var(--primary-bg);
    color: var(--primary);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 20px;
    margin-bottom: 8px;
}

.page-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.stats-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 18px;
    border-radius: 12px;
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: var(--surface);
    border: 1px solid var(--border);
    min-width: 80px;
}

.stat-value {
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--text-primary);
}

.stat-ponente .stat-value { color: #6D28D9; }
.stat-participante .stat-value { color: #1D4ED8; }
.stat-organizador .stat-value { color: #B45309; }

.filters-card {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    background: var(--surface);
    padding: 16px 20px;
    border-radius: 14px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
}

.search-wrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
}

.search-input {
    width: 100%;
    padding: 11px 14px 11px 42px;
    border: 2px solid var(--border);
    border-radius: 10px;
    font-size: 0.9rem;
    background: var(--background);
    outline: none;
    transition: all 0.2s ease;
}

.search-input:focus {
    border-color: var(--primary);
    background: var(--surface);
    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.08);
}

.date-filters {
    display: flex;
    gap: 10px;
}

.date-filters label {
    font-size: 0.82rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
}

.date-filters input {
    padding: 9px 10px;
    border: 2px solid var(--border);
    border-radius: 8px;
    font-size: 0.85rem;
    outline: none;
    background: var(--background);
    transition: border-color 0.2s ease;
}

.date-filters input:focus {
    border-color: var(--primary);
}

.btn-icon {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.88rem;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn-icon:hover {
    background: var(--primary-light);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px;
    color: var(--text-muted);
    font-size: 0.95rem;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
    text-align: center;
    padding: 64px 24px;
    color: var(--text-muted);
}

.empty-state p {
    margin-top: 16px;
    font-size: 1rem;
}

.proofs-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.proof-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
}

.proof-card:hover {
    border-color: #d1d5db;
    box-shadow: var(--shadow-md);
}

.proof-card.expanded {
    border-color: var(--primary);
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.1);
}

.proof-summary {
    display: flex;
    align-items: center;
    padding: 14px 20px;
    gap: 14px;
    flex-wrap: wrap;
}

.proof-folio {
    font-weight: 700;
    color: var(--primary);
    min-width: 140px;
    font-size: 0.88rem;
    font-family: monospace;
}

.proof-receiver {
    flex: 1;
    min-width: 150px;
    font-weight: 600;
    font-size: 0.9rem;
}

.proof-event {
    flex: 1;
    min-width: 120px;
    color: var(--text-secondary);
    font-size: 0.88rem;
}

.badge {
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 600;
    min-width: 100px;
    text-align: center;
}

.badge-ponente { background: #EDE9FE; color: #6D28D9; }
.badge-participante { background: #DBEAFE; color: #1D4ED8; }
.badge-organizador { background: #FEF3C7; color: #B45309; }
.badge-reconocimiento { background: #D1FAE5; color: #047857; }

.proof-date {
    min-width: 85px;
    color: var(--text-muted);
    font-size: 0.85rem;
}

.expand-icon {
    color: var(--text-muted);
    transition: transform 0.2s ease;
}

.expand-icon.rotated {
    transform: rotate(180deg);
    color: var(--primary);
}

.proof-details {
    border-top: 1px solid var(--border);
    padding: 20px;
    background: var(--background);
    animation: slideDown 0.2s ease;
}

@keyframes slideDown {
    from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
    to { opacity: 1; max-height: 500px; }
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 20px;
}

.detail-item {
    font-size: 0.9rem;
    color: var(--text-primary);
}

.detail-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 2px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

.detail-actions {
    display: flex;
    gap: 10px;
}

.btn-download {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 9px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s ease;
}

.btn-download:hover {
    background: var(--primary-light);
    transform: translateY(-1px);
}

.btn-delete {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #FEF2F2;
    color: #DC2626;
    border: 1px solid #FCA5A5;
    padding: 9px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s ease;
}

.btn-delete:hover {
    background: #FEE2E2;
    border-color: #EF4444;
}
</style>
