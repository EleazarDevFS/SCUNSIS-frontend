<script>
export default {
    computed: {
        username() {
            return localStorage.getItem('username') || 'Usuario';
        }
    }
}
</script>
<template>
    <header class="app-header">
      <div class="header-left">
        <div class="header-brand-mark">
          <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="currentColor">
            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560ZM160-160v-112q0-34 17.5-62.5T224-346q62-31 126-46.5T480-408q66 0 130 15.5T736-346q29 15 46.5 43.5T800-240v112H160Zm80-80h480v-32q0-11-5.5-20T700-290q-54-27-109-40.5T480-344q-56 0-111 13.5T260-290q-9 5-14.5 14t-5.5 20v32Z"/>
          </svg>
        </div>
        <div class="header-brand-text">
          <span class="header-title">SC-UNSIS</span>
          <span class="header-subtitle">Sistema de Constancias</span>
        </div>
      </div>
      <div class="header-right">
        <span class="header-user">{{ username }}</span>
        <div class="user-avatar">{{ username.charAt(0).toUpperCase() }}</div>
      </div>
    </header>
</template>
<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-brand-mark {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), #a11a1a);
  color: #fff;
  border-radius: 10px;
}

.header-brand-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-user {
  font-size: 0.88rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), #a11a1a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}
</style>
