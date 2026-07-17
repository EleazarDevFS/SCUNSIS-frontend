<script>
import ActiveUser from '../components/ActiveUser.vue';
import AsideComponent from '../components/AsideComponent.vue';
import { api } from '../utils/api.js';

export default {
    name: 'HistorialView',
    components: { ActiveUser, AsideComponent },
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
                if (err.message !== 'Sesion expirada') alert(err.message);
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
            if (this.filterDateFrom) {
                result = result.filter(p => p.date >= this.filterDateFrom);
            }
            if (this.filterDateTo) {
                result = result.filter(p => p.date <= this.filterDateTo);
            }
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
                a.download = `constancia_${folio}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                if (err.message !== 'Sesion expirada') alert(err.message);
            }
        },
        async deleteProof(folio) {
            if (!confirm(`¿Eliminar constancia ${folio}?`)) return;
            try {
                const res = await api(`/api/v1/proof/${folio}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Error al eliminar');
                this.proofs = this.proofs.filter(p => p.folio !== folio);
                this.applyFilters();
            } catch (err) {
                if (err.message !== 'Sesion expirada') alert(err.message);
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
        document.body.style.background = '#EBE7E7';
        this.fetchProofs();
    }
}
</script>
<template>
    <div class="historial-container">
        <main>
            <div class="header-actions">
                <h2>Historial de constancias</h2>
                <div class="stats-bar">
                    <span class="stat">Total: <strong>{{ stats.total }}</strong></span>
                    <span class="stat">Ponentes: <strong>{{ stats.ponentes }}</strong></span>
                    <span class="stat">Participantes: <strong>{{ stats.participantes }}</strong></span>
                    <span class="stat">Organizadores: <strong>{{ stats.organizadores }}</strong></span>
                </div>
            </div>
            <div class="filters">
                <input v-model="searchQuery" @input="applyFilters" placeholder="Buscar por nombre, folio, evento..." class="filter-input" />
                <label>Desde: <input type="date" v-model="filterDateFrom" @change="applyFilters" class="filter-date" /></label>
                <label>Hasta: <input type="date" v-model="filterDateTo" @change="applyFilters" class="filter-date" /></label>
                <button @click="fetchProofs" class="btn-refresh">Actualizar</button>
            </div>
            <div v-if="loading" class="loading">Cargando...</div>
            <ul v-else-if="filteredProofs.length === 0" class="empty-state">
                <li>No hay constancias registradas</li>
            </ul>
            <ul v-else>
                <li v-for="p in filteredProofs" :key="p.folio" class="proof-item" @click="toggleExpand(p.folio)">
                    <div class="proof-summary">
                        <span class="proof-folio"><strong>{{ p.folio }}</strong></span>
                        <span class="proof-receiver">{{ p.receiverFullName }}</span>
                        <span class="proof-event">{{ p.eventName }}</span>
                        <span class="proof-role">{{ roleBadge(p.role) }}</span>
                        <span class="proof-date">{{ p.date }}</span>
                    </div>
                    <div v-if="expandedFolio === p.folio" class="proof-details" @click.stop>
                        <div class="detail-grid">
                            <div><label>Folio:</label> {{ p.folio }}</div>
                            <div><label>Receptor:</label> {{ p.receiverFullName }}</div>
                            <div><label>Email:</label> {{ p.receiverEmail || '—' }}</div>
                            <div><label>Emisor:</label> {{ p.senderName || '—' }}</div>
                            <div><label>Evento:</label> {{ p.eventName }}</div>
                            <div><label>Actividad:</label> {{ p.activityName }}</div>
                            <div><label>Rol:</label> {{ roleBadge(p.role) }}</div>
                            <div><label>Fecha:</label> {{ p.date }}</div>
                        </div>
                        <div class="detail-actions">
                            <button @click="downloadPdf(p.folio)" class="btn-download">Descargar PDF</button>
                            <button v-if="isAdmin" @click="deleteProof(p.folio)" class="btn-delete">Eliminar</button>
                        </div>
                    </div>
                </li>
            </ul>
        </main>
    </div>
</template>
<style scoped>
.historial-container {
    width: 100%;
    height: 100%;
    display: flex;
}
main {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
}
.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
}
.header-actions h2 {
    margin: 0;
    color: #333;
}
.stats-bar {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}
.stat {
    background: #fff;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.9rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.filters {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 16px;
    background: #fff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.filter-input {
    flex: 1;
    min-width: 200px;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.95rem;
}
.filter-date {
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    margin-left: 4px;
}
.btn-refresh {
    background: #7C0A02;
    color: #fff;
    border: none;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-refresh:hover {
    background: #a11a1a;
}
.loading {
    text-align: center;
    padding: 40px;
    color: #888;
    font-size: 1.2rem;
}
.empty-state {
    list-style: none;
    padding: 40px;
    text-align: center;
    color: #888;
    font-size: 1.1rem;
}
ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.proof-item {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: box-shadow 0.2s;
}
.proof-item:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.proof-summary {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 16px;
    flex-wrap: wrap;
}
.proof-folio {
    min-width: 140px;
    color: #7C0A02;
}
.proof-receiver {
    flex: 1;
    min-width: 150px;
}
.proof-event {
    flex: 1;
    min-width: 120px;
    color: #555;
}
.proof-role {
    min-width: 100px;
    text-align: center;
    background: #f0f0f0;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
}
.proof-date {
    min-width: 90px;
    color: #888;
    font-size: 0.9rem;
}
.proof-details {
    border-top: 1px solid #eee;
    padding: 16px;
}
.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
}
.detail-grid div label {
    font-weight: 600;
    color: #555;
    margin-right: 6px;
}
.detail-actions {
    display: flex;
    gap: 12px;
}
.btn-download {
    background: #7C0A02;
    color: #fff;
    border: none;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-download:hover {
    background: #a11a1a;
}
.btn-delete {
    background: #ccc;
    color: #333;
    border: none;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
}
.btn-delete:hover {
    background: #e74c3c;
    color: #fff;
}
</style>
