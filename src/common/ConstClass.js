// Constante simple
const API_URL = 'http://localhost:8082/api/v1';

// Múltiples constantes
const PORT = 8082;
const BASE_PATH = '/api/v1';

// Objeto con constantes mas comunes
const API_ENDPOINTS = {
    FOLIO: '/folio',
    PROOF: '/proof',
    ACTIVITY: '/congresos',
    EVENT: '/event',
    SIGNATURE: '/signature',
    RECEIVER: '/receiver',
    SENDER: '/sender'
};

// Constantes de configuración
const CONFIG = {
    API_BASE_URL: 'http://localhost:8082/api/v1',
    TIMEOUT: 5000,
    RETRY_ATTEMPTS: 3
};

export default {
    API_URL,
    PORT,
    BASE_PATH,
    API_ENDPOINTS,
    CONFIG
};
