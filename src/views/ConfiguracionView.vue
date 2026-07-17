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
            events: [],
            showEventForm: false,
            editingEvent: null,
            eventForm: { eventName: '', eventType: '', eventPlace: '', eventDescription: '', startDate: '', endDate: '' },
            activities: [],
            showActivityForm: false,
            editingActivity: null,
            activityForm: { eventId: '', activityName: '', activityDescription: '', activityPlace: '', startDate: '', endDate: '' },
            receivers: [],
            showReceiverForm: false,
            editingReceiver: null,
            receiverForm: { nombre: '', primer_apellido: '', segundo_apellido: '', telefono: '', email: '', grado_academico: '' },
            bulkFile: null,
            bulkEventId: '',
            bulkActivityId: '',
            bulkSenderId: '',
            bulkRole: '',
            bulkEvents: [],
            bulkActivities: [],
            bulkSenders: [],
            bulkResult: null,
            bulkSubmitting: false,
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
        },
        async fetchEvents() {
            this.loading = true;
            try {
                const res = await fetch(`${API}/event`);
                if (!res.ok) throw new Error('Error al cargar eventos');
                this.events = await res.json();
            } catch (err) {
                alert(err.message);
            } finally {
                this.loading = false;
            }
        },
        openNewEvent() {
            this.editingEvent = null;
            this.eventForm = { eventName: '', eventType: 'FISICO', eventPlace: '', eventDescription: '', startDate: '', endDate: '' };
            this.showEventForm = true;
        },
        openEditEvent(event) {
            this.editingEvent = event;
            this.eventForm = {
                eventName: event.eventName,
                eventType: event.eventType || 'FISICO',
                eventPlace: event.eventPlace || '',
                eventDescription: event.eventDescription || '',
                startDate: event.startDate || '',
                endDate: event.endDate || ''
            };
            this.showEventForm = true;
        },
        cancelEventForm() {
            this.showEventForm = false;
            this.editingEvent = null;
            this.eventForm = { eventName: '', eventType: 'FISICO', eventPlace: '', eventDescription: '', startDate: '', endDate: '' };
        },
        async saveEvent() {
            if (!this.eventForm.eventName.trim()) {
                alert('El nombre del evento es requerido');
                return;
            }
            try {
                const url = this.editingEvent
                    ? `${API}/event/${this.editingEvent.eventId}`
                    : `${API}/event`;
                const method = this.editingEvent ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.eventForm)
                });
                if (!res.ok) throw new Error('Error al guardar evento');
                this.cancelEventForm();
                await this.fetchEvents();
            } catch (err) {
                alert(err.message);
            }
        },
        async deleteEvent(id) {
            if (!confirm('¿Eliminar este evento?')) return;
            try {
                const res = await fetch(`${API}/event/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Error al eliminar');
                await this.fetchEvents();
            } catch (err) {
                alert(err.message);
            }
        },
        async fetchActivities() {
            this.loading = true;
            try {
                const [actRes, evtRes] = await Promise.all([
                    fetch(`${API}/activity`),
                    fetch(`${API}/event`)
                ]);
                if (!actRes.ok) throw new Error('Error al cargar actividades');
                this.activities = await actRes.json();
                this.events = await evtRes.json();
            } catch (err) {
                alert(err.message);
            } finally {
                this.loading = false;
            }
        },
        openNewActivity() {
            this.editingActivity = null;
            this.activityForm = { eventId: '', activityName: '', activityDescription: '', activityPlace: '', startDate: '', endDate: '' };
            this.showActivityForm = true;
            this.fetchEvents();
        },
        openEditActivity(act) {
            this.editingActivity = act;
            this.activityForm = {
                eventId: act.eventId || '',
                activityName: act.activityName,
                activityDescription: act.activityDescription || '',
                activityPlace: act.activityPlace || '',
                startDate: act.startDate || '',
                endDate: act.endDate || ''
            };
            this.showActivityForm = true;
            this.fetchEvents();
        },
        cancelActivityForm() {
            this.showActivityForm = false;
            this.editingActivity = null;
            this.activityForm = { eventId: '', activityName: '', activityDescription: '', activityPlace: '', startDate: '', endDate: '' };
        },
        async saveActivity() {
            if (!this.activityForm.activityName.trim()) {
                alert('El nombre de la actividad es requerido');
                return;
            }
            if (!this.activityForm.eventId) {
                alert('Debe seleccionar un evento');
                return;
            }
            try {
                const body = { ...this.activityForm, eventId: Number(this.activityForm.eventId) };
                const url = this.editingActivity
                    ? `${API}/activity/${this.editingActivity.activityId}`
                    : `${API}/activity`;
                const method = this.editingActivity ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!res.ok) throw new Error('Error al guardar actividad');
                this.cancelActivityForm();
                await this.fetchActivities();
            } catch (err) {
                alert(err.message);
            }
        },
        async deleteActivity(id) {
            if (!confirm('¿Eliminar esta actividad?')) return;
            try {
                const res = await fetch(`${API}/activity/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Error al eliminar');
                await this.fetchActivities();
            } catch (err) {
                alert(err.message);
            }
        },
        async fetchReceivers() {
            this.loading = true;
            try {
                const res = await fetch(`${API}/receiver`);
                if (!res.ok) throw new Error('Error al cargar receptores');
                this.receivers = await res.json();
            } catch (err) {
                alert(err.message);
            } finally {
                this.loading = false;
            }
        },
        openNewReceiver() {
            this.editingReceiver = null;
            this.receiverForm = { nombre: '', primer_apellido: '', segundo_apellido: '', telefono: '', email: '', grado_academico: '' };
            this.showReceiverForm = true;
        },
        openEditReceiver(r) {
            this.editingReceiver = r;
            this.receiverForm = {
                nombre: r.name,
                primer_apellido: r.lastName,
                segundo_apellido: r.twoLastName || '',
                telefono: r.phone || '',
                email: r.email || '',
                grado_academico: r.academicGrade || ''
            };
            this.showReceiverForm = true;
        },
        cancelReceiverForm() {
            this.showReceiverForm = false;
            this.editingReceiver = null;
            this.receiverForm = { nombre: '', primer_apellido: '', segundo_apellido: '', telefono: '', email: '', grado_academico: '' };
        },
        async saveReceiver() {
            if (!this.receiverForm.nombre.trim() || !this.receiverForm.primer_apellido.trim()) {
                alert('Nombre y primer apellido son requeridos');
                return;
            }
            try {
                const url = this.editingReceiver
                    ? `${API}/receiver/${this.editingReceiver.receiverId}`
                    : `${API}/receiver`;
                const method = this.editingReceiver ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.receiverForm)
                });
                if (!res.ok) throw new Error('Error al guardar receptor');
                this.cancelReceiverForm();
                await this.fetchReceivers();
            } catch (err) {
                alert(err.message);
            }
        },
        async deleteReceiver(id) {
            if (!confirm('¿Eliminar este receptor?')) return;
            try {
                const res = await fetch(`${API}/receiver/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Error al eliminar');
                await this.fetchReceivers();
            } catch (err) {
                alert(err.message);
            }
        },
        async openBulkUpload() {
            this.bulkResult = null;
            this.bulkFile = null;
            this.bulkEventId = '';
            this.bulkActivityId = '';
            this.bulkSenderId = '';
            this.bulkRole = '';
            try {
                const [evtRes, actRes, sndRes] = await Promise.all([
                    fetch(`${API}/event`),
                    fetch(`${API}/activity`),
                    fetch(`${API}/sender`)
                ]);
                this.bulkEvents = await evtRes.json();
                this.bulkActivities = await actRes.json();
                this.bulkSenders = await sndRes.json();
            } catch (err) {
                alert('Error al cargar datos para el formulario');
            }
        },
        onBulkFileChange(event) {
            this.bulkFile = event.target.files[0];
        },
        getFilteredActivities() {
            if (!this.bulkEventId) return this.bulkActivities;
            return this.bulkActivities.filter(a => a.eventId === Number(this.bulkEventId));
        },
        async submitBulkUpload() {
            if (!this.bulkFile) { alert('Seleccione un archivo Excel'); return; }
            if (!this.bulkEventId) { alert('Seleccione un evento'); return; }
            if (!this.bulkActivityId) { alert('Seleccione una actividad'); return; }
            if (!this.bulkSenderId) { alert('Seleccione un emisor'); return; }
            this.bulkSubmitting = true;
            this.bulkResult = null;
            try {
                const formData = new FormData();
                formData.append('file', this.bulkFile);
                formData.append('eventId', this.bulkEventId);
                formData.append('activityId', this.bulkActivityId);
                formData.append('senderId', this.bulkSenderId);
                if (this.bulkRole) formData.append('role', this.bulkRole);
                const res = await fetch(`${API}/proof/upload`, {
                    method: 'POST',
                    body: formData
                });
                this.bulkResult = await res.json();
            } catch (err) {
                alert('Error al procesar la carga masiva');
            } finally {
                this.bulkSubmitting = false;
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
                <button :class="['tab', { active: activeTab === 'events' }]" @click="activeTab = 'events'; fetchEvents()">Eventos</button>
                <button :class="['tab', { active: activeTab === 'activities' }]" @click="activeTab = 'activities'; fetchActivities()">Actividades</button>
                <button :class="['tab', { active: activeTab === 'receivers' }]" @click="activeTab = 'receivers'; fetchReceivers()">Receptores</button>
                <button :class="['tab', { active: activeTab === 'bulk' }]" @click="activeTab = 'bulk'; openBulkUpload()">Carga masiva</button>
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
                        <button class="btn-add" @click="openNewEvent">+ Nuevo evento</button>
                    </div>
                    <div v-if="showEventForm" class="form-card">
                        <h4>{{ editingEvent ? 'Editar evento' : 'Nuevo evento' }}</h4>
                        <div class="form-row">
                            <label>Nombre del evento:</label>
                            <input v-model="eventForm.eventName" placeholder="Nombre" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Tipo:</label>
                            <select v-model="eventForm.eventType" class="form-input">
                                <option value="FISICO">Presencial</option>
                                <option value="VIRTUAL">Virtual</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label>Lugar:</label>
                            <input v-model="eventForm.eventPlace" placeholder="Lugar" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Descripción:</label>
                            <textarea v-model="eventForm.eventDescription" placeholder="Descripción" class="form-input" rows="3"></textarea>
                        </div>
                        <div class="form-row">
                            <label>Fecha inicio:</label>
                            <input type="date" v-model="eventForm.startDate" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Fecha fin:</label>
                            <input type="date" v-model="eventForm.endDate" class="form-input" />
                        </div>
                        <div class="form-actions">
                            <button @click="saveEvent" class="btn-save">Guardar</button>
                            <button @click="cancelEventForm" class="btn-cancel">Cancelar</button>
                        </div>
                    </div>
                    <div v-if="loading" class="loading">Cargando...</div>
                    <table v-else-if="events.length" class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Lugar</th>
                                <th>Fecha inicio</th>
                                <th>Fecha fin</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="e in events" :key="e.eventId">
                                <td>{{ e.eventId }}</td>
                                <td>{{ e.eventName }}</td>
                                <td>{{ e.eventType === 'FISICO' ? 'Presencial' : 'Virtual' }}</td>
                                <td>{{ e.eventPlace || '—' }}</td>
                                <td>{{ e.startDate || '—' }}</td>
                                <td>{{ e.endDate || '—' }}</td>
                                <td class="actions-cell">
                                    <button @click="openEditEvent(e)" class="btn-edit">Editar</button>
                                    <button @click="deleteEvent(e.eventId)" class="btn-delete">Eliminar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="empty">No hay eventos registrados</div>
                </div>
                <div v-if="activeTab === 'activities'">
                    <div class="section-header">
                        <h3>Actividades</h3>
                        <button class="btn-add" @click="openNewActivity">+ Nueva actividad</button>
                    </div>
                    <div v-if="showActivityForm" class="form-card">
                        <h4>{{ editingActivity ? 'Editar actividad' : 'Nueva actividad' }}</h4>
                        <div class="form-row">
                            <label>Evento:</label>
                            <select v-model="activityForm.eventId" class="form-input">
                                <option value="">Seleccione un evento</option>
                                <option v-for="e in events" :key="e.eventId" :value="e.eventId">{{ e.eventName }}</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label>Nombre de la actividad:</label>
                            <input v-model="activityForm.activityName" placeholder="Nombre" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Descripción:</label>
                            <textarea v-model="activityForm.activityDescription" placeholder="Descripción" class="form-input" rows="3"></textarea>
                        </div>
                        <div class="form-row">
                            <label>Lugar:</label>
                            <input v-model="activityForm.activityPlace" placeholder="Lugar" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Fecha inicio:</label>
                            <input type="date" v-model="activityForm.startDate" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Fecha fin:</label>
                            <input type="date" v-model="activityForm.endDate" class="form-input" />
                        </div>
                        <div class="form-actions">
                            <button @click="saveActivity" class="btn-save">Guardar</button>
                            <button @click="cancelActivityForm" class="btn-cancel">Cancelar</button>
                        </div>
                    </div>
                    <div v-if="loading" class="loading">Cargando...</div>
                    <table v-else-if="activities.length" class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Evento</th>
                                <th>Lugar</th>
                                <th>Fecha inicio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in activities" :key="a.activityId">
                                <td>{{ a.activityId }}</td>
                                <td>{{ a.activityName }}</td>
                                <td>{{ a.eventName || '—' }}</td>
                                <td>{{ a.activityPlace || '—' }}</td>
                                <td>{{ a.startDate || '—' }}</td>
                                <td class="actions-cell">
                                    <button @click="openEditActivity(a)" class="btn-edit">Editar</button>
                                    <button @click="deleteActivity(a.activityId)" class="btn-delete">Eliminar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="empty">No hay actividades registradas</div>
                </div>
                <div v-if="activeTab === 'receivers'">
                    <div class="section-header">
                        <h3>Receptores</h3>
                        <button class="btn-add" @click="openNewReceiver">+ Nuevo receptor</button>
                    </div>
                    <div v-if="showReceiverForm" class="form-card">
                        <h4>{{ editingReceiver ? 'Editar receptor' : 'Nuevo receptor' }}</h4>
                        <div class="form-row">
                            <label>Nombre:</label>
                            <input v-model="receiverForm.nombre" placeholder="Nombre" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Primer apellido:</label>
                            <input v-model="receiverForm.primer_apellido" placeholder="Primer apellido" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Segundo apellido:</label>
                            <input v-model="receiverForm.segundo_apellido" placeholder="Segundo apellido" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Teléfono:</label>
                            <input v-model="receiverForm.telefono" placeholder="Teléfono" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Email:</label>
                            <input v-model="receiverForm.email" placeholder="Email" type="email" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Grado académico:</label>
                            <input v-model="receiverForm.grado_academico" placeholder="Grado académico" class="form-input" />
                        </div>
                        <div class="form-actions">
                            <button @click="saveReceiver" class="btn-save">Guardar</button>
                            <button @click="cancelReceiverForm" class="btn-cancel">Cancelar</button>
                        </div>
                    </div>
                    <div v-if="loading" class="loading">Cargando...</div>
                    <table v-else-if="receivers.length" class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Grado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in receivers" :key="r.receiverId">
                                <td>{{ r.receiverId }}</td>
                                <td>{{ r.name }}</td>
                                <td>{{ r.lastName }} {{ r.twoLastName || '' }}</td>
                                <td>{{ r.email || '—' }}</td>
                                <td>{{ r.phone || '—' }}</td>
                                <td>{{ r.academicGrade || '—' }}</td>
                                <td class="actions-cell">
                                    <button @click="openEditReceiver(r)" class="btn-edit">Editar</button>
                                    <button @click="deleteReceiver(r.receiverId)" class="btn-delete">Eliminar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="empty">No hay receptores registrados</div>
                </div>
                <div v-if="activeTab === 'bulk'">
                    <div class="section-header">
                        <h3>Carga masiva de constancias</h3>
                    </div>
                    <div class="form-card">
                        <div class="form-row">
                            <label>Archivo Excel (.xlsx):</label>
                            <input type="file" accept=".xlsx" @change="onBulkFileChange" class="form-input" />
                        </div>
                        <div class="form-row">
                            <label>Evento:</label>
                            <select v-model="bulkEventId" @change="bulkActivityId = ''" class="form-input">
                                <option value="">Seleccione un evento</option>
                                <option v-for="e in bulkEvents" :key="e.eventId" :value="e.eventId">{{ e.eventName }}</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label>Actividad:</label>
                            <select v-model="bulkActivityId" class="form-input">
                                <option value="">Seleccione una actividad</option>
                                <option v-for="a in getFilteredActivities()" :key="a.activityId" :value="a.activityId">{{ a.activityName }}</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label>Emisor:</label>
                            <select v-model="bulkSenderId" class="form-input">
                                <option value="">Seleccione un emisor</option>
                                <option v-for="s in bulkSenders" :key="s.senderId" :value="s.senderId">{{ s.name }}</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label>Rol por defecto (opcional):</label>
                            <select v-model="bulkRole" class="form-input">
                                <option value="">Usar columna ROL del Excel</option>
                                <option value="PONENTE">Ponente</option>
                                <option value="PARTICIPANTE">Participante</option>
                                <option value="ORGANIZADOR">Organizador</option>
                                <option value="RECONOCIMIENTO">Reconocimiento</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button @click="submitBulkUpload" :disabled="bulkSubmitting" class="btn-save">
                                {{ bulkSubmitting ? 'Procesando...' : 'Generar constancias' }}
                            </button>
                        </div>
                    </div>
                    <div v-if="bulkResult" class="result-card">
                        <h4>Resultado</h4>
                        <div class="result-stats">
                            <span class="stat-ok">Exitosas: {{ bulkResult.successCount }}</span>
                            <span class="stat-err">Errores: {{ bulkResult.errorCount }}</span>
                            <span class="stat-total">Total filas: {{ bulkResult.totalRows }}</span>
                        </div>
                        <div v-if="bulkResult.generatedFolios?.length" class="folios-list">
                            <strong>Folios generados:</strong>
                            <span v-for="f in bulkResult.generatedFolios" :key="f" class="folio-badge">{{ f }}</span>
                        </div>
                        <div v-if="bulkResult.errors?.length" class="errors-list">
                            <strong>Errores:</strong>
                            <ul><li v-for="(err, i) in bulkResult.errors" :key="i">{{ err }}</li></ul>
                        </div>
                    </div>
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
.result-card {
    background: #f0faf0;
    border: 1px solid #c8e6c9;
    border-radius: 8px;
    padding: 20px;
    margin-top: 16px;
}
.result-card h4 {
    margin: 0 0 12px 0;
    color: #2e7d32;
}
.result-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}
.stat-ok { color: #2e7d32; font-weight: 600; }
.stat-err { color: #c62828; font-weight: 600; }
.stat-total { color: #555; font-weight: 600; }
.folios-list {
    margin-bottom: 12px;
}
.folio-badge {
    display: inline-block;
    background: #e8f5e9;
    color: #2e7d32;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    margin: 3px;
    font-family: monospace;
}
.errors-list {
    background: #fff5f5;
    border: 1px solid #ffcdd2;
    border-radius: 6px;
    padding: 12px;
}
.errors-list ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
}
.errors-list li {
    color: #c62828;
    font-size: 0.9rem;
}
</style>
