<script>
import { ref } from 'vue';
import MyForm from '../components/MyForm.vue';

export default {
    name: 'GenConsView',
    components: { MyForm },
    setup() {
        const mostrarFormularioId = ref('');
        const nombreConstanciaOtro = ref('');
        const otroValue = ref('');

        const mostrarFormulario = (idFormulario) => {
            mostrarFormularioId.value = idFormulario;
        };

        return {
            mostrarFormularioId,
            nombreConstanciaOtro,
            mostrarFormulario,
            otroValue
        };
    }
};
</script>

<template>
    <div class="gen-cons-container">
        <div class="page-header">
            <div class="header-content">
                <span class="page-badge">Generación</span>
                <h2>Generar constancias</h2>
                <p class="page-subtitle">Selecciona el tipo de constancia que deseas generar</p>
            </div>
        </div>
        <div class="event-selector">
            <button class="event-btn" @click="mostrarFormulario('form-jornadas')">
                <div class="event-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
                        <path d="M840-120v-640H120v320H40v-320q0-33 23.5-56.5T120-840h720q33 0 56.5 23.5T920-760v560q0 33-23.5 56.5T840-120ZM360-400q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T440-560q0-33-23.5-56.5T360-640q-33 0-56.5 23.5T280-560q0 33 23.5 56.5T360-480ZM40-80v-112q0-34 17.5-62.5T104-298q62-31 126-46.5T360-360q66 0 130 15.5T616-298q29 15 46.5 43.5T680-192v112H40Zm80-80h480v-32q0-11-5.5-20T580-226q-54-27-109-40.5T360-280q-56 0-111 13.5T140-226q-9 5-14.5 14t-5.5 20v32Zm240-400Zm0 400Z"/>
                    </svg>
                </div>
                <span class="event-label">Jornadas académicas</span>
                <span class="event-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                    </svg>
                </span>
            </button>
            <button class="event-btn" @click="mostrarFormulario('form-congresos')">
                <div class="event-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
                        <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z"/>
                    </svg>
                </div>
                <span class="event-label">Congresos</span>
                <span class="event-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                    </svg>
                </span>
            </button>
            <button class="event-btn" @click="mostrarFormulario('form-ponencias')">
                <div class="event-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
                        <path d="M820-300q-25 0-42.5-17.5T760-360v-100q0-25 17.5-42.5T820-520q25 0 42.5 17.5T880-460v100q0 25-17.5 42.5T820-300Zm-20 140v-62q-51-8-85.5-46.5T680-360h40q0 42 29 71t71 29q42 0 71-29t29-71h40q0 53-34.5 91.5T840-222v62h-40ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q14 0 27.5 2t26.5 7q-26 31-40 69.5T360-640q0 43 14 81.5t40 69.5q-13 5-26.5 7t-27.5 2ZM40-160v-111q0-34 17-63t47-44q38-20 82.5-34.5T284-435q-40 28-62 71t-22 93v111H40Zm560-320q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T680-640q0-33-23.5-56.5T600-720q-33 0-56.5 23.5T520-640q0 33 23.5 56.5T600-560ZM280-160v-111q0-34 17-63t47-44q51-26 115.5-44T600-440q12 0 23.5.5T646-438q-10 18-16.5 37.5T621-360h-21q-72 0-127.5 18T381-306q-10 5-15.5 14.5T360-271v31h287q15 26 37 46t49 34H280Z"/>
                    </svg>
                </div>
                <span class="event-label">Ponencias</span>
                <span class="event-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                    </svg>
                </span>
            </button>
            <button class="event-btn" @click="mostrarFormulario('form-reconocimientos')">
                <div class="event-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
                        <path d="M240-40v-329L110-580l185-300h370l185 300-130 211v329l-240-80-240 80Zm80-111 160-53 160 53v-129H320v129Zm20-649L204-580l136 220h280l136-220-136-220H340Zm98 383L296-558l57-57 85 85 169-170 57 56-226 227ZM320-280h320-320Z"/>
                    </svg>
                </div>
                <span class="event-label">Reconocimientos</span>
                <span class="event-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                    </svg>
                </span>
            </button>
            <button class="event-btn" @click="mostrarFormulario('form-otros')">
                <div class="event-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
                        <path d="M160-400v-80h280v80H160Zm0-160v-80h440v80H160Zm0-160v-80h440v80H160Zm360 560v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T863-380L643-160H520Zm300-263-37-37 37 37ZM580-220h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z"/>
                    </svg>
                </div>
                <span class="event-label">Otros</span>
                <span class="event-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                    </svg>
                </span>
            </button>
        </div>
        <div class="form-section">
            <MyForm v-if="mostrarFormularioId === 'form-jornadas'" titulo="Jornadas académicas"
                mensajePlaceholder="Por haber asistido a la Jornada académica X..." />
            <MyForm v-if="mostrarFormularioId === 'form-congresos'" titulo="Congresos"
                mensajePlaceholder="Por haber asistido al congreso X..." />
            <MyForm v-if="mostrarFormularioId === 'form-ponencias'" titulo="Ponencias"
                mensajePlaceholder="Por haber sido ponente en X evento..." />
            <MyForm v-if="mostrarFormularioId === 'form-reconocimientos'" titulo="Reconocimientos"
                mensajePlaceholder="Se le otorga el siguiente reconocimiento por X..." />
            <div v-if="mostrarFormularioId === 'form-otros'" class="otros-section">
                <v-text-field
                    v-model="nombreConstanciaOtro"
                    hide-details="auto"
                    label="Tipo de evento"
                    placeholder="Nombre del evento"
                    variant="outlined"
                    density="comfortable"
                />
                <MyForm v-if="nombreConstanciaOtro" :titulo="nombreConstanciaOtro" :value="otroValue"
                    mensajePlaceholder="Se le otorga la siguiente constancia X por X razón..." />
            </div>
        </div>
    </div>
</template>

<style scoped>
.gen-cons-container {
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.page-header {
    display: flex;
    align-items: flex-start;
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.page-badge {
    display: inline-block;
    width: fit-content;
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

.header-content h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.page-subtitle {
    color: var(--text-secondary);
    font-size: 0.92rem;
    margin-top: 2px;
}

.event-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
}

.event-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px 16px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.event-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), #c0392b);
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: left;
}

.event-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.12);
    transform: translateY(-3px);
}

.event-btn:hover::before {
    transform: scaleX(1);
}

.event-icon {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: var(--background);
    color: inherit;
    transition: all 0.3s ease;
}

.event-btn:hover .event-icon {
    background: var(--primary-bg);
    color: var(--primary);
}

.event-label {
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
}

.event-arrow {
    opacity: 0;
    transition: all 0.3s ease;
}

.event-btn:hover .event-arrow {
    opacity: 1;
    transform: translateX(4px);
}

.form-section {
    background: var(--surface);
    border-radius: 16px;
    padding: 28px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
}

.otros-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

@media (max-width: 600px) {
    .event-selector {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
