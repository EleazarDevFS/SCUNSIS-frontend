const API_URL = '/api/v1';
const PORT = 8082;
const BASE_PATH = '/api/v1';
const API_ENDPOINTS = {
    FOLIO: '/folio',
    PROOF: '/proof',
    ACTIVITY: '/congresos',
    EVENT: '/event',
    SIGNATURE: '/signature',
    RECEIVER: '/receiver',
    SENDER: '/sender'
};
const CONFIG = {
    API_BASE_URL: '/api/v1',
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
