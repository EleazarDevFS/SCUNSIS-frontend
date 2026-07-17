<script>
import { api } from '../utils/api.js';

export default {
    mounted() {
        const getFolio = async () => {
            try {
                const folioResponse = await api('/api/v1/folio');
                if (!folioResponse.ok) {
                    throw new Error(`Http error! status: ${folioResponse.status}`);
                }
                await folioResponse.json();
            } catch (error) {
                if (error.message !== 'Sesion expirada') alert('Error de respuesta al servidor ' + error);
            }
        }
    }
}
</script>
<template>
    <div class="nav-bar">
        <span class="nav-bar-title">Generación de constancias</span>
    </div>
</template>
<style scoped>
.nav-bar {
    display: flex;
    align-items: center;
    padding: 0;
}
.nav-bar-title {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.95rem;
}
</style>
