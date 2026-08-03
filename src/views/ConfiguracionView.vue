<script>
import { api } from '../utils/api.js';
import { useToast } from 'vue-toastification';
import PaginationToolbar from '../components/PaginationToolbar.vue';

export default {
    name: 'ConfiguracionView',
    components: { PaginationToolbar },
    setup() {
        return { toast: useToast() };
    },
    data() {
        return {
            activeTab: 'senders',
            senders: [],
            senderPage: 0,
            senderSize: 20,
            senderTotalPages: 0,
            senderTotalElements: 0,
            senderSortField: 'name',
            senderSortDirection: 'ASC',
            senderSortFields: [{ field: 'name', label: 'Nombre' }, { field: 'campus', label: 'Campus' }, { field: 'senderId', label: 'ID' }],
            senderSearch: '',
            showSenderForm: false,
            editingSender: null,
            senderForm: { name: '', campus: '' },
            events: [],
            eventPage: 0,
            eventSize: 20,
            eventTotalPages: 0,
            eventTotalElements: 0,
            eventSortField: 'eventName',
            eventSortDirection: 'ASC',
            eventSortFields: [{ field: 'eventName', label: 'Nombre' }, { field: 'startDate', label: 'Inicio' }, { field: 'eventId', label: 'ID' }],
            showEventForm: false,
            editingEvent: null,
            eventForm: { eventName: '', eventType: '', eventPlace: '', eventDescription: '', startDate: '', endDate: '' },
            activities: [],
            activityPage: 0,
            activitySize: 20,
            activityTotalPages: 0,
            activityTotalElements: 0,
            activitySortField: 'activityName',
            activitySortDirection: 'ASC',
            activitySortFields: [{ field: 'activityName', label: 'Nombre' }, { field: 'startDate', label: 'Inicio' }, { field: 'activityId', label: 'ID' }],
            showActivityForm: false,
            editingActivity: null,
            activityForm: { eventId: '', activityName: '', activityDescription: '', activityPlace: '', startDate: '', endDate: '' },
            receivers: [],
            receiverPage: 0,
            receiverSize: 20,
            receiverTotalPages: 0,
            receiverTotalElements: 0,
            receiverSortField: 'name',
            receiverSortDirection: 'ASC',
            receiverSortFields: [{ field: 'name', label: 'Nombre' }, { field: 'lastName', label: 'Apellido' }, { field: 'receiverId', label: 'ID' }],
            receiverSearch: '',
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
            users: [],
            userPage: 0,
            userSize: 20,
            userTotalPages: 0,
            userTotalElements: 0,
            userSortField: 'username',
            userSortDirection: 'ASC',
            userSortFields: [{ field: 'username', label: 'Usuario' }, { field: 'role', label: 'Rol' }, { field: 'id', label: 'ID' }],
            showUserForm: false,
            editingUser: null,
            userForm: { username: '', password: '', role: 'CAPTURISTA' },
            loading: false
        }
    },
    computed: {
        filteredSenders() {
            if (!this.senderSearch) return this.senders;
            const q = this.senderSearch.toLowerCase();
            return this.senders.filter(s =>
                s.name?.toLowerCase().includes(q) || s.campus?.toLowerCase().includes(q)
            );
        },
        filteredReceivers() {
            if (!this.receiverSearch) return this.receivers;
            const q = this.receiverSearch.toLowerCase();
            return this.receivers.filter(r =>
                r.name?.toLowerCase().includes(q) || r.lastName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)
            );
        }
    },
    methods: {
        async fetchSenders() {
            this.loading = true;
            try {
                const res = await api(`/api/v1/sender?page=${this.senderPage}&size=${this.senderSize}&sort=${this.senderSortField}&direction=${this.senderSortDirection}`);
                if (!res.ok) throw new Error('Error al cargar emisores');
                const page = await res.json();
                if (this.senderPage > 0 && page.totalPages && this.senderPage >= page.totalPages) {
                    this.senderPage = Math.max(0, page.totalPages - 1);
                    await this.fetchSenders();
                    return;
                }
                this.senders = page.content ?? page;
                this.senderTotalPages = page.totalPages ?? 0;
                this.senderTotalElements = page.totalElements ?? this.senders.length;
            } catch (err) {
                if (err.message !== 'Sesion expirada') this.toast.error(err.message);
            } finally { this.loading = false; }
        },
        openNewSender() { this.editingSender = null; this.senderForm = { name: '', campus: '' }; this.showSenderForm = true; },
        openEditSender(s) { this.editingSender = s; this.senderForm = { name: s.name, campus: s.campus || '' }; this.showSenderForm = true; },
        cancelSenderForm() { this.showSenderForm = false; this.editingSender = null; this.senderForm = { name: '', campus: '' }; },
        async saveSender() {
            if (!this.senderForm.name.trim()) { this.toast.error('El nombre es requerido'); return; }
            try {
                const res = await api('/api/v1/sender', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.senderForm) });
                if (!res.ok) throw new Error('Error al guardar');
                this.cancelSenderForm(); await this.fetchSenders(); this.toast.success('Emisor guardado');
            } catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        async deleteSender(id) {
            if (!confirm('¿Eliminar este emisor?')) return;
            try { const res = await api(`/api/v1/sender/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); await this.fetchSenders(); this.toast.success('Emisor eliminado'); }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        async fetchEvents(full = false) {
            this.loading = true;
            try {
                const url = full
                    ? '/api/v1/event?page=0&size=1000&sort=eventName&direction=ASC'
                    : `/api/v1/event?page=${this.eventPage}&size=${this.eventSize}&sort=${this.eventSortField}&direction=${this.eventSortDirection}`;
                const res = await api(url);
                if (!res.ok) throw new Error();
                const page = await res.json();
                if (!full && this.eventPage > 0 && page.totalPages && this.eventPage >= page.totalPages) {
                    this.eventPage = Math.max(0, page.totalPages - 1);
                    await this.fetchEvents();
                    return;
                }
                this.events = page.content ?? page;
                if (!full) {
                    this.eventTotalPages = page.totalPages ?? 0;
                    this.eventTotalElements = page.totalElements ?? this.events.length;
                }
            }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); } finally { this.loading = false; }
        },
        openNewEvent() { this.editingEvent = null; this.eventForm = { eventName: '', eventType: 'FISICO', eventPlace: '', eventDescription: '', startDate: '', endDate: '' }; this.showEventForm = true; },
        openEditEvent(e) { this.editingEvent = e; this.eventForm = { eventName: e.eventName, eventType: e.eventType || 'FISICO', eventPlace: e.eventPlace || '', eventDescription: e.eventDescription || '', startDate: e.startDate || '', endDate: e.endDate || '' }; this.showEventForm = true; },
        cancelEventForm() { this.showEventForm = false; this.editingEvent = null; this.eventForm = { eventName: '', eventType: 'FISICO', eventPlace: '', eventDescription: '', startDate: '', endDate: '' }; },
        async saveEvent() {
            if (!this.eventForm.eventName.trim()) { this.toast.error('El nombre del evento es requerido'); return; }
            try {
                const url = this.editingEvent ? `/api/v1/event/${this.editingEvent.eventId}` : '/api/v1/event';
                const method = this.editingEvent ? 'PUT' : 'POST';
                const res = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.eventForm) });
                if (!res.ok) throw new Error(); this.cancelEventForm(); await this.fetchEvents(); this.toast.success('Evento guardado');
            } catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        async deleteEvent(id) {
            if (!confirm('¿Eliminar este evento?')) return;
            try { const res = await api(`/api/v1/event/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); await this.fetchEvents(); this.toast.success('Evento eliminado'); }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        async fetchActivities() {
            this.loading = true;
            try {
                const [actRes, evtRes] = await Promise.all([
                    api(`/api/v1/activity?page=${this.activityPage}&size=${this.activitySize}&sort=${this.activitySortField}&direction=${this.activitySortDirection}`),
                    api('/api/v1/event?page=0&size=1000&sort=eventName&direction=ASC')
                ]);
                if (!actRes.ok) throw new Error();
                let actPage = await actRes.json();
                if (this.activityPage > 0 && actPage.totalPages && this.activityPage >= actPage.totalPages) {
                    this.activityPage = Math.max(0, actPage.totalPages - 1);
                    await this.fetchActivities();
                    return;
                }
                this.activities = actPage.content ?? actPage;
                this.activityTotalPages = actPage.totalPages ?? 0;
                this.activityTotalElements = actPage.totalElements ?? this.activities.length;
                let evtPage = await evtRes.json(); this.events = evtPage.content ?? evtPage;
            }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); } finally { this.loading = false; }
        },
        openNewActivity() { this.editingActivity = null; this.activityForm = { eventId: '', activityName: '', activityDescription: '', activityPlace: '', startDate: '', endDate: '' }; this.showActivityForm = true; this.fetchEvents(true); },
        openEditActivity(a) { this.editingActivity = a; this.activityForm = { eventId: a.eventId || '', activityName: a.activityName, activityDescription: a.activityDescription || '', activityPlace: a.activityPlace || '', startDate: a.startDate || '', endDate: a.endDate || '' }; this.showActivityForm = true; this.fetchEvents(true); },
        cancelActivityForm() { this.showActivityForm = false; this.editingActivity = null; this.activityForm = { eventId: '', activityName: '', activityDescription: '', activityPlace: '', startDate: '', endDate: '' }; },
        async saveActivity() {
            if (!this.activityForm.activityName.trim()) { this.toast.error('El nombre es requerido'); return; }
            if (!this.activityForm.eventId) { this.toast.error('Debe seleccionar un evento'); return; }
            try {
                const body = { ...this.activityForm, eventId: Number(this.activityForm.eventId) };
                const url = this.editingActivity ? `/api/v1/activity/${this.editingActivity.activityId}` : '/api/v1/activity';
                const method = this.editingActivity ? 'PUT' : 'POST';
                const res = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                if (!res.ok) throw new Error(); this.cancelActivityForm(); await this.fetchActivities(); this.toast.success('Actividad guardada');
            } catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        async deleteActivity(id) {
            if (!confirm('¿Eliminar esta actividad?')) return;
            try { const res = await api(`/api/v1/activity/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); await this.fetchActivities(); this.toast.success('Actividad eliminada'); }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        setPageFor(prefix, fetchFn, newPage) {
            if (newPage < 0 || newPage >= this[`${prefix}TotalPages`] || newPage === this[`${prefix}Page`]) return;
            this[`${prefix}Page`] = newPage;
            fetchFn();
        },
        setSizeFor(prefix, fetchFn, size) {
            if (this[`${prefix}Size`] === size) return;
            this[`${prefix}Size`] = size;
            this[`${prefix}Page`] = 0;
            fetchFn();
        },
        setSortFor(prefix, fetchFn, field) {
            if (this[`${prefix}SortField`] === field) {
                this[`${prefix}SortDirection`] = this[`${prefix}SortDirection`] === 'ASC' ? 'DESC' : 'ASC';
            } else {
                this[`${prefix}SortField`] = field;
                this[`${prefix}SortDirection`] = 'ASC';
            }
            this[`${prefix}Page`] = 0;
            fetchFn();
        },
        setDirectionFor(prefix, fetchFn, direction) {
            if (this[`${prefix}SortDirection`] === direction) return;
            this[`${prefix}SortDirection`] = direction;
            this[`${prefix}Page`] = 0;
            fetchFn();
        },
        async fetchReceivers() {
            this.loading = true;
            try {
                const res = await api(`/api/v1/receiver?page=${this.receiverPage}&size=${this.receiverSize}&sort=${this.receiverSortField}&direction=${this.receiverSortDirection}`);
                if (!res.ok) throw new Error();
                const page = await res.json();
                if (this.receiverPage > 0 && page.totalPages && this.receiverPage >= page.totalPages) {
                    this.receiverPage = Math.max(0, page.totalPages - 1);
                    await this.fetchReceivers();
                    return;
                }
                this.receivers = page.content ?? page;
                this.receiverTotalPages = page.totalPages ?? 0;
                this.receiverTotalElements = page.totalElements ?? this.receivers.length;
            }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); } finally { this.loading = false; }
        },
        openNewReceiver() { this.editingReceiver = null; this.receiverForm = { nombre: '', primer_apellido: '', segundo_apellido: '', telefono: '', email: '', grado_academico: '' }; this.showReceiverForm = true; },
        openEditReceiver(r) { this.editingReceiver = r; this.receiverForm = { nombre: r.name, primer_apellido: r.lastName, segundo_apellido: r.twoLastName || '', telefono: r.phone || '', email: r.email || '', grado_academico: r.academicGrade || '' }; this.showReceiverForm = true; },
        cancelReceiverForm() { this.showReceiverForm = false; this.editingReceiver = null; this.receiverForm = { nombre: '', primer_apellido: '', segundo_apellido: '', telefono: '', email: '', grado_academico: '' }; },
        async saveReceiver() {
            if (!this.receiverForm.nombre.trim() || !this.receiverForm.primer_apellido.trim()) { this.toast.error('Nombre y primer apellido son requeridos'); return; }
            try {
                const url = this.editingReceiver ? `/api/v1/receiver/${this.editingReceiver.receiverId}` : '/api/v1/receiver';
                const method = this.editingReceiver ? 'PUT' : 'POST';
                const res = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.receiverForm) });
                if (!res.ok) throw new Error(); this.cancelReceiverForm(); await this.fetchReceivers(); this.toast.success('Receptor guardado');
            } catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        async deleteReceiver(id) {
            if (!confirm('¿Eliminar este receptor?')) return;
            try { const res = await api(`/api/v1/receiver/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); await this.fetchReceivers(); this.toast.success('Receptor eliminado'); }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        async openBulkUpload() {
            this.bulkResult = null; this.bulkFile = null; this.bulkEventId = ''; this.bulkActivityId = ''; this.bulkSenderId = ''; this.bulkRole = '';
            try {
                const [evtRes, actRes, sndRes] = await Promise.all([
                    api('/api/v1/event?size=1000'), api('/api/v1/activity?page=0&size=1000&sort=activityName&direction=ASC'), api('/api/v1/sender?size=1000')
                ]);
                let evtPage = await evtRes.json(); this.bulkEvents = evtPage.content ?? evtPage;
                let actPage = await actRes.json(); this.bulkActivities = actPage.content ?? actPage;
                let sndPage = await sndRes.json(); this.bulkSenders = sndPage.content ?? sndPage;
            }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error('Error al cargar datos'); }
        },
        onBulkFileChange(e) { this.bulkFile = e.target.files[0]; },
        getFilteredActivities() { if (!this.bulkEventId) return this.bulkActivities; return this.bulkActivities.filter(a => a.eventId === Number(this.bulkEventId)); },
        async submitBulkUpload() {
            if (!this.bulkFile) { this.toast.error('Seleccione un archivo Excel'); return; }
            if (!this.bulkEventId) { this.toast.error('Seleccione un evento'); return; }
            if (!this.bulkActivityId) { this.toast.error('Seleccione una actividad'); return; }
            if (!this.bulkSenderId) { this.toast.error('Seleccione un emisor'); return; }
            this.bulkSubmitting = true; this.bulkResult = null;
            try {
                const formData = new FormData();
                formData.append('file', this.bulkFile); formData.append('eventId', this.bulkEventId);
                formData.append('activityId', this.bulkActivityId); formData.append('senderId', this.bulkSenderId);
                if (this.bulkRole) formData.append('role', this.bulkRole);
                const res = await api('/api/v1/proof/upload', { method: 'POST', body: formData });
                this.bulkResult = await res.json(); this.toast.success('Carga masiva procesada');
            } catch (err) { if (err.message !== 'Sesion expirada') this.toast.error('Error al procesar la carga masiva'); }
            finally { this.bulkSubmitting = false; }
        },
        async fetchUsers() {
            this.loading = true;
            try {
                const res = await api(`/api/v1/users?page=${this.userPage}&size=${this.userSize}&sort=${this.userSortField}&direction=${this.userSortDirection}`);
                if (!res.ok) throw new Error();
                const page = await res.json();
                if (this.userPage > 0 && page.totalPages && this.userPage >= page.totalPages) {
                    this.userPage = Math.max(0, page.totalPages - 1);
                    await this.fetchUsers();
                    return;
                }
                this.users = page.content ?? page;
                this.userTotalPages = page.totalPages ?? 0;
                this.userTotalElements = page.totalElements ?? this.users.length;
            }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); } finally { this.loading = false; }
        },
        openNewUser() { this.editingUser = null; this.userForm = { username: '', password: '', role: 'CAPTURISTA' }; this.showUserForm = true; },
        openEditUser(u) { this.editingUser = u; this.userForm = { username: u.username, password: '', role: u.role }; this.showUserForm = true; },
        cancelUserForm() { this.showUserForm = false; this.editingUser = null; this.userForm = { username: '', password: '', role: 'CAPTURISTA' }; },
        async saveUser() {
            if (!this.userForm.username.trim()) { this.toast.error('El nombre de usuario es requerido'); return; }
            if (!this.editingUser && !this.userForm.password.trim()) { this.toast.error('La contraseña es requerida'); return; }
            try {
                const isEdit = !!this.editingUser;
                const url = isEdit ? `/api/v1/users/${this.editingUser.id}` : '/api/v1/users';
                const method = isEdit ? 'PUT' : 'POST';
                const res = await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.userForm) });
                if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Error al guardar'); }
                this.cancelUserForm(); await this.fetchUsers(); this.toast.success(isEdit ? 'Usuario actualizado' : 'Usuario creado');
            } catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        async deleteUser(id) {
            if (!confirm('¿Eliminar este usuario?')) return;
            try { const res = await api(`/api/v1/users/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); await this.fetchUsers(); this.toast.success('Usuario eliminado'); }
            catch (err) { if (err.message !== 'Sesion expirada') this.toast.error(err.message); }
        },
        switchTab(tab) {
            this.activeTab = tab;
            if (tab === 'senders') this.fetchSenders();
            else if (tab === 'events') this.fetchEvents();
            else if (tab === 'activities') this.fetchActivities();
            else if (tab === 'receivers') this.fetchReceivers();
            else if (tab === 'bulk') this.openBulkUpload();
            else if (tab === 'users') this.fetchUsers();
        }
    },
    mounted() { this.fetchSenders(); }
}
</script>
<template>
    <div class="config-container">
        <div class="page-header">
            <div>
                <span class="page-badge">Administración</span>
                <h2>Configuración del sistema</h2>
            </div>
        </div>
        <div class="tabs">
            <button :class="['tab', { active: activeTab === 'senders' }]" @click="switchTab('senders')">
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Zm200-40h240v-80H360v80Zm-160-80h80v-80h-80v80Zm0-120h80v-80h-80v80Zm160 0h240v-80H360v80Zm240 120h80v-80h-80v80Zm80-120h80v-80h-80v80ZM160-640h640v-80H160v80Z"/></svg>
                Emisores
            </button>
            <button :class="['tab', { active: activeTab === 'events' }]" @click="switchTab('events')">
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
                Eventos
            </button>
            <button :class="['tab', { active: activeTab === 'activities' }]" @click="switchTab('activities')">
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                Actividades
            </button>
            <button :class="['tab', { active: activeTab === 'receivers' }]" @click="switchTab('receivers')">
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560ZM160-240v-32q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v32q0 33-23.5 56.5T720-160H240q-33 0-56.5-23.5T160-240Zm80 0h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Z"/></svg>
                Receptores
            </button>
            <button :class="['tab', { active: activeTab === 'bulk' }]" @click="switchTab('bulk')">
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                Carga masiva
            </button>
            <button :class="['tab', { active: activeTab === 'users' }]" @click="switchTab('users')">
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-240v-32q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v32q0 33-23.5 56.5T720-160H240q-33 0-56.5-23.5T160-240Z"/></svg>
                Usuarios
            </button>
        </div>
        <div class="tab-content">
            <!-- Emisores -->
            <div v-if="activeTab === 'senders'">
                <div class="section-header">
                    <h3>Emisores (Instituciones)</h3>
                    <button class="btn-primary" @click="openNewSender">+ Nuevo emisor</button>
                </div>
                <div class="search-bar">
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M796-121 533-384q-30 26-69.5 41T378-328q-108 0-183-75t-75-183q0-108 75-183t183-75q108 0 183 75t75 183q0 46-15 85.5T597-507l263 263-64 64ZM378-408q70 0 119-49t49-119q0-70-49-119t-119-49q-70 0-119 49T210-576q0 70 49 119t119 49Z"/></svg>
                    <input v-model="senderSearch" placeholder="Buscar emisor por nombre o campus..." class="search-input" />
                </div>
                <div v-if="showSenderForm" class="form-card">
                    <h4>{{ editingSender ? 'Editar emisor' : 'Nuevo emisor' }}</h4>
                    <div class="form-row"><label>Nombre:</label><input v-model="senderForm.name" placeholder="Nombre de la institución" class="form-input" /></div>
                    <div class="form-row"><label>Sede/Campus:</label><input v-model="senderForm.campus" placeholder="Sede o campus" class="form-input" /></div>
                    <div class="form-actions"><button @click="saveSender" class="btn-primary">Guardar</button><button @click="cancelSenderForm" class="btn-secondary">Cancelar</button></div>
                </div>
                <div v-if="loading" class="loading"><div class="spinner"></div></div>
                <PaginationToolbar v-else
                    :page="senderPage" :size="senderSize"
                    :total-pages="senderTotalPages" :total-elements="senderTotalElements"
                    :sort-field="senderSortField" :sort-direction="senderSortDirection"
                    :sort-fields="senderSortFields"
                    @set-page="setPageFor('sender', fetchSenders, $event)"
                    @set-size="setSizeFor('sender', fetchSenders, $event)"
                    @set-sort="setSortFor('sender', fetchSenders, $event)"
                    @set-direction="setDirectionFor('sender', fetchSenders, $event)" />
                <table v-if="!loading && filteredSenders.length" class="data-table">
                    <thead><tr><th>ID</th><th>Nombre</th><th>Sede/Campus</th><th>Acciones</th></tr></thead>
                    <tbody>
                        <tr v-for="s in filteredSenders" :key="s.senderId">
                            <td><span class="id-badge">{{ s.senderId }}</span></td>
                            <td class="cell-primary">{{ s.name }}</td>
                            <td>{{ s.campus || '—' }}</td>
                            <td class="actions-cell">
                                <button @click="openEditSender(s)" class="btn-edit">Editar</button>
                                <button @click="deleteSender(s.senderId)" class="btn-delete-sm">Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!loading && !filteredSenders.length" class="empty">{{ senderSearch ? 'No se encontraron emisores' : 'No hay emisores registrados' }}</div>
            </div>
            <!-- Eventos -->
            <div v-if="activeTab === 'events'">
                <div class="section-header"><h3>Eventos</h3><button class="btn-primary" @click="openNewEvent">+ Nuevo evento</button></div>
                <div v-if="showEventForm" class="form-card">
                    <h4>{{ editingEvent ? 'Editar evento' : 'Nuevo evento' }}</h4>
                    <div class="form-row"><label>Nombre:</label><input v-model="eventForm.eventName" placeholder="Nombre" class="form-input" /></div>
                    <div class="form-row"><label>Tipo:</label><select v-model="eventForm.eventType" class="form-input"><option value="FISICO">Presencial</option><option value="VIRTUAL">Virtual</option></select></div>
                    <div class="form-row"><label>Lugar:</label><input v-model="eventForm.eventPlace" placeholder="Lugar" class="form-input" /></div>
                    <div class="form-row"><label>Descripción:</label><textarea v-model="eventForm.eventDescription" placeholder="Descripción" class="form-input" rows="3"></textarea></div>
                    <div class="form-row"><label>Inicio:</label><input type="date" v-model="eventForm.startDate" class="form-input" /></div>
                    <div class="form-row"><label>Fin:</label><input type="date" v-model="eventForm.endDate" class="form-input" /></div>
                    <div class="form-actions"><button @click="saveEvent" class="btn-primary">Guardar</button><button @click="cancelEventForm" class="btn-secondary">Cancelar</button></div>
                </div>
                <div v-if="loading" class="loading"><div class="spinner"></div></div>
                <PaginationToolbar v-else
                    :page="eventPage" :size="eventSize"
                    :total-pages="eventTotalPages" :total-elements="eventTotalElements"
                    :sort-field="eventSortField" :sort-direction="eventSortDirection"
                    :sort-fields="eventSortFields"
                    @set-page="setPageFor('event', fetchEvents, $event)"
                    @set-size="setSizeFor('event', fetchEvents, $event)"
                    @set-sort="setSortFor('event', fetchEvents, $event)"
                    @set-direction="setDirectionFor('event', fetchEvents, $event)" />
                <table v-if="!loading && events.length" class="data-table">
                    <thead><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Lugar</th><th>Inicio</th><th>Fin</th><th>Acciones</th></tr></thead>
                    <tbody>
                        <tr v-for="e in events" :key="e.eventId">
                            <td><span class="id-badge">{{ e.eventId }}</span></td>
                            <td class="cell-primary">{{ e.eventName }}</td>
                            <td><span class="type-badge" :class="'type-' + (e.eventType || '').toLowerCase()">{{ e.eventType === 'FISICO' ? 'Presencial' : 'Virtual' }}</span></td>
                            <td>{{ e.eventPlace || '—' }}</td>
                            <td>{{ e.startDate || '—' }}</td>
                            <td>{{ e.endDate || '—' }}</td>
                            <td class="actions-cell"><button @click="openEditEvent(e)" class="btn-edit">Editar</button><button @click="deleteEvent(e.eventId)" class="btn-delete-sm">Eliminar</button></td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!loading && !events.length" class="empty">No hay eventos registrados</div>
            </div>
            <!-- Actividades -->
            <div v-if="activeTab === 'activities'">
                <div class="section-header"><h3>Actividades</h3><button class="btn-primary" @click="openNewActivity">+ Nueva actividad</button></div>
                <div v-if="showActivityForm" class="form-card">
                    <h4>{{ editingActivity ? 'Editar actividad' : 'Nueva actividad' }}</h4>
                    <div class="form-row"><label>Evento:</label><select v-model="activityForm.eventId" class="form-input"><option value="">Seleccione un evento</option><option v-for="e in events" :key="e.eventId" :value="e.eventId">{{ e.eventName }}</option></select></div>
                    <div class="form-row"><label>Nombre:</label><input v-model="activityForm.activityName" placeholder="Nombre" class="form-input" /></div>
                    <div class="form-row"><label>Descripción:</label><textarea v-model="activityForm.activityDescription" placeholder="Descripción" class="form-input" rows="3"></textarea></div>
                    <div class="form-row"><label>Lugar:</label><input v-model="activityForm.activityPlace" placeholder="Lugar" class="form-input" /></div>
                    <div class="form-row"><label>Inicio:</label><input type="date" v-model="activityForm.startDate" class="form-input" /></div>
                    <div class="form-row"><label>Fin:</label><input type="date" v-model="activityForm.endDate" class="form-input" /></div>
                    <div class="form-actions"><button @click="saveActivity" class="btn-primary">Guardar</button><button @click="cancelActivityForm" class="btn-secondary">Cancelar</button></div>
                </div>
                <div v-if="loading" class="loading"><div class="spinner"></div></div>
                <PaginationToolbar v-else
                    :page="activityPage" :size="activitySize"
                    :total-pages="activityTotalPages" :total-elements="activityTotalElements"
                    :sort-field="activitySortField" :sort-direction="activitySortDirection"
                    :sort-fields="activitySortFields"
                    @set-page="setPageFor('activity', fetchActivities, $event)"
                    @set-size="setSizeFor('activity', fetchActivities, $event)"
                    @set-sort="setSortFor('activity', fetchActivities, $event)"
                    @set-direction="setDirectionFor('activity', fetchActivities, $event)" />
                <table v-if="!loading && activities.length" class="data-table">
                    <thead><tr><th>ID</th><th>Nombre</th><th>Evento</th><th>Lugar</th><th>Inicio</th><th>Acciones</th></tr></thead>
                    <tbody>
                        <tr v-for="a in activities" :key="a.activityId">
                            <td><span class="id-badge">{{ a.activityId }}</span></td>
                            <td class="cell-primary">{{ a.activityName }}</td>
                            <td>{{ a.eventName || '—' }}</td>
                            <td>{{ a.activityPlace || '—' }}</td>
                            <td>{{ a.startDate || '—' }}</td>
                            <td class="actions-cell"><button @click="openEditActivity(a)" class="btn-edit">Editar</button><button @click="deleteActivity(a.activityId)" class="btn-delete-sm">Eliminar</button></td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!loading && !activities.length" class="empty">No hay actividades registradas</div>
            </div>
            <!-- Receptores -->
            <div v-if="activeTab === 'receivers'">
                <div class="section-header"><h3>Receptores</h3><button class="btn-primary" @click="openNewReceiver">+ Nuevo receptor</button></div>
                <div class="search-bar">
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M796-121 533-384q-30 26-69.5 41T378-328q-108 0-183-75t-75-183q0-108 75-183t183-75q108 0 183 75t75 183q0 46-15 85.5T597-507l263 263-64 64ZM378-408q70 0 119-49t49-119q0-70-49-119t-119-49q-70 0-119 49T210-576q0 70 49 119t119 49Z"/></svg>
                    <input v-model="receiverSearch" placeholder="Buscar receptor por nombre, apellido o email..." class="search-input" />
                </div>
                <div v-if="showReceiverForm" class="form-card">
                    <h4>{{ editingReceiver ? 'Editar receptor' : 'Nuevo receptor' }}</h4>
                    <div class="form-row"><label>Nombre:</label><input v-model="receiverForm.nombre" placeholder="Nombre" class="form-input" /></div>
                    <div class="form-row"><label>1er apellido:</label><input v-model="receiverForm.primer_apellido" placeholder="Primer apellido" class="form-input" /></div>
                    <div class="form-row"><label>2do apellido:</label><input v-model="receiverForm.segundo_apellido" placeholder="Segundo apellido" class="form-input" /></div>
                    <div class="form-row"><label>Teléfono:</label><input v-model="receiverForm.telefono" placeholder="Teléfono" class="form-input" /></div>
                    <div class="form-row"><label>Email:</label><input v-model="receiverForm.email" placeholder="Email" type="email" class="form-input" /></div>
                    <div class="form-row"><label>Grado académico:</label><input v-model="receiverForm.grado_academico" placeholder="Grado académico" class="form-input" /></div>
                    <div class="form-actions"><button @click="saveReceiver" class="btn-primary">Guardar</button><button @click="cancelReceiverForm" class="btn-secondary">Cancelar</button></div>
                </div>
                <div v-if="loading" class="loading"><div class="spinner"></div></div>
                <PaginationToolbar v-else
                    :page="receiverPage" :size="receiverSize"
                    :total-pages="receiverTotalPages" :total-elements="receiverTotalElements"
                    :sort-field="receiverSortField" :sort-direction="receiverSortDirection"
                    :sort-fields="receiverSortFields"
                    @set-page="setPageFor('receiver', fetchReceivers, $event)"
                    @set-size="setSizeFor('receiver', fetchReceivers, $event)"
                    @set-sort="setSortFor('receiver', fetchReceivers, $event)"
                    @set-direction="setDirectionFor('receiver', fetchReceivers, $event)" />
                <table v-if="!loading && filteredReceivers.length" class="data-table">
                    <thead><tr><th>ID</th><th>Nombre</th><th>Apellidos</th><th>Email</th><th>Teléfono</th><th>Grado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        <tr v-for="r in filteredReceivers" :key="r.receiverId">
                            <td><span class="id-badge">{{ r.receiverId }}</span></td>
                            <td class="cell-primary">{{ r.name }}</td>
                            <td>{{ r.lastName }} {{ r.twoLastName || '' }}</td>
                            <td>{{ r.email || '—' }}</td>
                            <td>{{ r.phone || '—' }}</td>
                            <td>{{ r.academicGrade || '—' }}</td>
                            <td class="actions-cell"><button @click="openEditReceiver(r)" class="btn-edit">Editar</button><button @click="deleteReceiver(r.receiverId)" class="btn-delete-sm">Eliminar</button></td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!loading && !filteredReceivers.length" class="empty">{{ receiverSearch ? 'No se encontraron receptores' : 'No hay receptores registrados' }}</div>
            </div>
        <!-- Usuarios -->
        <div v-if="activeTab === 'users'">
            <div class="section-header"><h3>Usuarios del sistema</h3><button class="btn-primary" @click="openNewUser">+ Nuevo usuario</button></div>
            <div v-if="showUserForm" class="form-card">
                <h4>{{ editingUser ? 'Editar usuario' : 'Nuevo usuario' }}</h4>
                <div class="form-row"><label>Usuario:</label><input v-model="userForm.username" placeholder="Nombre de usuario" class="form-input" /></div>
                <div class="form-row"><label>Contraseña {{ editingUser ? '(dejar en blanco para mantener)' : '' }}:</label><input v-model="userForm.password" type="password" :placeholder="editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'" class="form-input" /></div>
                <div class="form-row"><label>Rol:</label><select v-model="userForm.role" class="form-input"><option value="ADMIN">Administrador</option><option value="CAPTURISTA">Capturista</option></select></div>
                <div class="form-actions"><button @click="saveUser" class="btn-primary">Guardar</button><button @click="cancelUserForm" class="btn-secondary">Cancelar</button></div>
            </div>
            <div v-if="loading" class="loading"><div class="spinner"></div></div>
            <PaginationToolbar v-else
                :page="userPage" :size="userSize"
                :total-pages="userTotalPages" :total-elements="userTotalElements"
                :sort-field="userSortField" :sort-direction="userSortDirection"
                :sort-fields="userSortFields"
                @set-page="setPageFor('user', fetchUsers, $event)"
                @set-size="setSizeFor('user', fetchUsers, $event)"
                @set-sort="setSortFor('user', fetchUsers, $event)"
                @set-direction="setDirectionFor('user', fetchUsers, $event)" />
            <table v-if="!loading && users.length" class="data-table">
                <thead><tr><th>ID</th><th>Usuario</th><th>Rol</th><th>Acciones</th></tr></thead>
                <tbody>
                    <tr v-for="u in users" :key="u.id">
                        <td><span class="id-badge">{{ u.id }}</span></td>
                        <td class="cell-primary">{{ u.username }}</td>
                        <td><span class="type-badge" :class="'role-' + u.role.toLowerCase()">{{ u.role === 'ADMIN' ? 'Administrador' : 'Capturista' }}</span></td>
                        <td class="actions-cell"><button @click="openEditUser(u)" class="btn-edit">Editar</button><button @click="deleteUser(u.id)" class="btn-delete-sm">Eliminar</button></td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!loading && !users.length" class="empty">No hay usuarios registrados</div>
        </div>
        <!-- Carga masiva -->
        <div v-if="activeTab === 'bulk'">
                <div class="section-header"><h3>Carga masiva de constancias</h3></div>
                <div class="form-card">
                    <div class="form-row"><label>Archivo Excel:</label><input type="file" accept=".xlsx" @change="onBulkFileChange" class="form-input" /></div>
                    <div class="form-row"><label>Evento:</label><select v-model="bulkEventId" @change="bulkActivityId = ''" class="form-input"><option value="">Seleccione un evento</option><option v-for="e in bulkEvents" :key="e.eventId" :value="e.eventId">{{ e.eventName }}</option></select></div>
                    <div class="form-row"><label>Actividad:</label><select v-model="bulkActivityId" class="form-input"><option value="">Seleccione una actividad</option><option v-for="a in getFilteredActivities()" :key="a.activityId" :value="a.activityId">{{ a.activityName }}</option></select></div>
                    <div class="form-row"><label>Emisor:</label><select v-model="bulkSenderId" class="form-input"><option value="">Seleccione un emisor</option><option v-for="s in bulkSenders" :key="s.senderId" :value="s.senderId">{{ s.name }}</option></select></div>
                    <div class="form-row"><label>Rol (opcional):</label><select v-model="bulkRole" class="form-input"><option value="">Usar columna ROL del Excel</option><option value="PONENTE">Ponente</option><option value="PARTICIPANTE">Participante</option><option value="ORGANIZADOR">Organizador</option><option value="RECONOCIMIENTO">Reconocimiento</option></select></div>
                    <div class="form-actions"><button @click="submitBulkUpload" :disabled="bulkSubmitting" class="btn-primary">{{ bulkSubmitting ? 'Procesando...' : 'Generar constancias' }}</button></div>
                </div>
                <div v-if="bulkResult" class="result-card">
                    <h4>Resultado</h4>
                    <div class="result-stats">
                        <span class="stat-ok"><span class="stat-value">{{ bulkResult.successCount }}</span> Exitosas</span>
                        <span class="stat-err"><span class="stat-value">{{ bulkResult.errorCount }}</span> Errores</span>
                        <span class="stat-total"><span class="stat-value">{{ bulkResult.totalRows }}</span> Total filas</span>
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
    </div>
</template>
<style scoped>
.config-container { padding: 28px; display: flex; flex-direction: column; gap: 20px; }

.page-badge {
    display: inline-block; padding: 3px 12px; background: var(--primary-bg); color: var(--primary);
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 20px; margin-bottom: 8px;
}
.page-header h2 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0; }

.tabs {
    display: flex; gap: 4px; background: var(--surface); padding: 4px;
    border-radius: 14px; border: 1px solid var(--border);
}
.tab {
    display: flex; align-items: center; gap: 6px; flex: 1; padding: 10px 14px;
    border: none; background: transparent; cursor: pointer; font-weight: 600;
    color: var(--text-secondary); transition: all 0.2s ease; font-size: 0.82rem;
    border-radius: 10px; justify-content: center;
}
.tab:hover { background: var(--background); color: var(--text-primary); }
.tab.active { background: var(--primary); color: #fff; }
.tab.active svg { color: #fff; }

.tab-content {
    background: var(--surface); border-radius: 14px; padding: 24px;
    border: 1px solid var(--border);
}
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { margin: 0; color: var(--text-primary); font-size: 1.05rem; }

.search-bar {
    position: relative; margin-bottom: 16px;
}
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.search-input {
    width: 100%; padding: 10px 14px 10px 40px; border: 2px solid var(--border);
    border-radius: 10px; font-size: 0.9rem; background: var(--background);
    outline: none; transition: all 0.2s ease; box-sizing: border-box;
}
.search-input:focus { border-color: var(--primary); background: var(--surface); box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.08); }

.btn-primary {
    background: var(--primary); color: #fff; border: none; padding: 8px 20px;
    border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.88rem;
    transition: all 0.2s ease;
}
.btn-primary:hover { background: var(--primary-light); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
    background: var(--background); color: var(--text-secondary); border: 1px solid var(--border);
    padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.88rem; transition: all 0.2s ease;
}
.btn-secondary:hover { background: var(--border); }

.form-card { background: var(--background); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
.form-card h4 { margin: 0 0 16px 0; color: var(--text-primary); }
.form-row { margin-bottom: 12px; }
.form-row label { display: block; font-weight: 600; margin-bottom: 4px; color: var(--text-secondary); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px; }
.form-input { width: 100%; padding: 10px 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 0.9rem; background: var(--surface); outline: none; transition: border-color 0.2s ease; box-sizing: border-box; }
.form-input:focus { border-color: var(--primary); }
.form-actions { display: flex; gap: 10px; margin-top: 16px; }

.loading { text-align: center; padding: 30px; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.data-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.data-table th, .data-table td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--border-light); font-size: 0.88rem; }
.data-table th { background: var(--background); font-weight: 700; color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.6px; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--border-light); }

.id-badge { font-family: monospace; background: var(--background); padding: 2px 10px; border-radius: 6px; font-weight: 600; font-size: 0.82rem; color: var(--text-secondary); }
.cell-primary { font-weight: 600; color: var(--text-primary); }

.type-badge { padding: 2px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.type-fisico { background: #EDE9FE; color: #6D28D9; }
.type-virtual { background: #DBEAFE; color: #1D4ED8; }
.role-admin { background: #FEE2E2; color: #B91C1C; }
.role-capturista { background: #DBEAFE; color: #1D4ED8; }

.actions-cell { display: flex; gap: 6px; }
.btn-edit { background: var(--background); border: 1px solid var(--border); padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 0.82rem; transition: all 0.2s ease; color: var(--text-secondary); font-weight: 500; }
.btn-edit:hover { background: var(--border); color: var(--text-primary); }
.btn-delete-sm { background: var(--background); border: 1px solid var(--border); padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 0.82rem; transition: all 0.2s ease; color: #DC2626; font-weight: 500; }
.btn-delete-sm:hover { background: #FEF2F2; border-color: #FCA5A5; }

.empty { text-align: center; padding: 30px; color: var(--text-muted); }

.result-card { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin-top: 16px; }
.result-card h4 { margin: 0 0 12px 0; color: #166534; }
.result-stats { display: flex; gap: 20px; margin-bottom: 12px; flex-wrap: wrap; }
.stat-ok, .stat-err, .stat-total { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.9rem; }
.stat-ok .stat-value { font-size: 1.4rem; font-weight: 800; } .stat-ok { color: #166534; }
.stat-err .stat-value { font-size: 1.4rem; font-weight: 800; } .stat-err { color: #B91C1C; }
.stat-total .stat-value { font-size: 1.4rem; font-weight: 800; } .stat-total { color: var(--text-secondary); }
.folios-list { margin-bottom: 12px; }
.folio-badge { display: inline-block; background: #DCFCE7; color: #166534; padding: 3px 10px; border-radius: 12px; font-size: 0.82rem; margin: 3px; font-family: monospace; }
.errors-list { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 12px; }
.errors-list ul { margin: 8px 0 0 0; padding-left: 20px; }
.errors-list li { color: #B91C1C; font-size: 0.88rem; }
</style>
