<script>
import ActiveUser from '../components/ActiveUser.vue';
import AsideComponent from '../components/AsideComponent.vue';

const API = 'http://localhost:8082/api/v1';

export default {
    name: 'ConfiguracionView',
    components: { AsideComponent, ActiveUser },
    data() {
        return {
            activeTab: 'senders',
            senders: [],
            showSenderForm: false,
            editingSender: null,
            senderForm: { name: '', campus: '' },
            loading: false
        }
    },
    methods: {
        async fetchSenders() {
            this.loading = true;
            try {
                const res = await fetch(`${API}/sender`);
                if (!res.ok) throw new Error('Error al cargar emisores');
                this.senders = await res.json();
            } catch (err) {
                alert(err.message);
            } finally {
                this.loading = false;
            }
        },
        openNewSender() {
            this.editingSender = null;
            this.senderForm = { name: '', campus: '' };
            this.showSenderForm = true;
        },
        openEditSender(sender) {
            this.editingSender = sender;
            this.senderForm = { name: sender.name, campus: sender.campus || '' };
            this.showSenderForm = true;
        },
        cancelSenderForm() {
            this.showSenderForm = false;
            this.editingSender = null;
            this.senderForm = { name: '', campus: '' };
        },
        async saveSender() {
            if (!this.senderForm.name.trim()) {
                alert('El nombre del emisor es requerido');
                return;
            }
            try {
                const res = await fetch(`${API}/sender`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.senderForm)
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Error al guardar');
                }
                this.cancelSenderForm();
                await this.fetchSenders();
            } catch (err) {
                alert(err.message);
            }
        },
        async deleteSender(id) {
            if (!confirm('¿Eliminar este emisor?')) return;
            try {
                const res = await fetch(`${API}/sender/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Error al eliminar');
                await this.fetchSenders();
            } catch (err) {
                alert(err.message);
            }
        }
    },
    mounted() {
        document.body.style.background = '#EBE7E7';
        this.fetchSenders();
    }
}
</script>
<template>
    <div class="config-container">
        <main>
            <div class="tabs">
                <button :class="['tab', { active: activeTab === 'senders' }]" @click="activeTab = 'senders'; fetchSenders()">Emisores</button>
                <button :class="['tab', { active: activeTab === 'events' }]" @click="activeTab = 'events'">Eventos</button>
                <button :class="['tab', { active: activeTab === 'activities' }]" @click="activeTab = 'activities'">Actividades</button>
                <button :class="['tab', { active: activeTab === 'receivers' }]" @click="activeTab = 'receivers'">Receptores</button>
            </div>
            <div class="tab-content">
                <div v-if="activeTab === 'senders'">
                    <div class="section-header">
                        <h3>Emisores (Instituciones)</h3>
                        <button class="btn-add" @click="openNewSender">+ Nuevo emisor</button>
                    </div>
                    <div v-if="showSenderForm" class="form-card">
                        <h4>{{ editingSender ? 'Editar emisor' : 'Nuevo emisor' }}</h4>
                        <div class="form-row">
                            <label>Nombre:</label>
                            <input v-model="senderForm.name" placeholder="Nombre de la institución" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Sede/Campus:</label>
                            <input v-model="senderForm.campus" placeholder="Sede o campus" class="form-input" />
                        </div>
                        <div class="form-actions">
                            <button @click="saveSender" class="btn-save">Guardar</button>
                            <button @click="cancelSenderForm" class="btn-cancel">Cancelar</button>
                        </div>
                    </div>
                    <div v-if="loading" class="loading">Cargando...</div>
                    <table v-else-if="senders.length" class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Sede/Campus</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="s in senders" :key="s.senderId">
                                <td>{{ s.senderId }}</td>
                                <td>{{ s.name }}</td>
                                <td>{{ s.campus || '—' }}</td>
                                <td class="actions-cell">
                                    <button @click="openEditSender(s)" class="btn-edit">Editar</button>
                                    <button @click="deleteSender(s.senderId)" class="btn-delete">Eliminar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="empty">No hay emisores registrados</div>
                </div>
                <div v-if="activeTab === 'events'">
                    <div class="section-header">
                        <h3>Eventos</h3>
                    </div>
                    <div class="placeholder-content">Sección en construcción</div>
                </div>
                <div v-if="activeTab === 'activities'">
                    <div class="section-header">
                        <h3>Actividades</h3>
                    </div>
                    <div class="placeholder-content">Sección en construcción</div>
                </div>
                <div v-if="activeTab === 'receivers'">
                    <div class="section-header">
                        <h3>Receptores</h3>
                    </div>
                    <div class="placeholder-content">Sección en construcción</div>
                </div>
            </div>
        </main>
    </div>
</template>
<style scoped>
.config-container {
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
.tabs {
    display: flex;
    gap: 0;
    margin-bottom: 20px;
    background: #fff;
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.tab {
    flex: 1;
    padding: 12px 20px;
    border: none;
    background: #f5f5f5;
    cursor: pointer;
    font-weight: 600;
    color: #555;
    transition: all 0.2s;
    border-bottom: 3px solid transparent;
}
.tab:hover {
    background: #eee;
}
.tab.active {
    background: #fff;
    color: #7C0A02;
    border-bottom-color: #7C0A02;
}
.tab-content {
    background: #fff;
    border-radius: 0 0 8px 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.section-header h3 {
    margin: 0;
    color: #333;
}
.btn-add {
    background: #7C0A02;
    color: #fff;
    border: none;
    padding: 8px 18px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-add:hover {
    background: #a11a1a;
}
.form-card {
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}
.form-card h4 {
    margin: 0 0 16px 0;
    color: #333;
}
.form-row {
    margin-bottom: 12px;
}
.form-row label {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
    color: #555;
}
.form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.95rem;
    box-sizing: border-box;
}
.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
}
.btn-save {
    background: #7C0A02;
    color: #fff;
    border: none;
    padding: 8px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-save:hover { background: #a11a1a; }
.btn-cancel {
    background: #ccc;
    color: #333;
    border: none;
    padding: 8px 24px;
    border-radius: 6px;
    cursor: pointer;
}
.btn-cancel:hover { background: #bbb; }
.loading {
    text-align: center;
    padding: 30px;
    color: #888;
}
.data-table {
    width: 100%;
    border-collapse: collapse;
}
.data-table th, .data-table td {
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
}
.data-table th {
    background: #f5f5f5;
    font-weight: 600;
    color: #555;
}
.data-table tr:hover {
    background: #fafafa;
}
.actions-cell {
    display: flex;
    gap: 8px;
}
.btn-edit {
    background: #f0f0f0;
    border: 1px solid #ccc;
    padding: 4px 14px;
    border-radius: 4px;
    cursor: pointer;
}
.btn-edit:hover { background: #e0e0e0; }
.btn-delete {
    background: #f0f0f0;
    border: 1px solid #ccc;
    padding: 4px 14px;
    border-radius: 4px;
    cursor: pointer;
    color: #c0392b;
}
.btn-delete:hover { background: #fde8e8; }
.empty {
    text-align: center;
    padding: 30px;
    color: #888;
}
.placeholder-content {
    text-align: center;
    padding: 40px;
    color: #aaa;
    font-style: italic;
}
</style>
