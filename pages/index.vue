<template>
  <main class="page">
    <!-- ログイン前 -->
    <div v-if="!user" class="login-screen">
      <div class="login-icon">📅</div>
      <h1 class="login-title">時間割</h1>
      <p class="login-sub">Google アカウントでログインして<br />あなた専用の時間割を管理しましょう</p>
      <button class="btn-google" @click="handleLogin">
        <svg class="g-icon" viewBox="0 0 48 48" width="20" height="20"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Google でログイン
      </button>
      <p v-if="authError" class="error-text">{{ authError }}</p>
    </div>

    <!-- ログイン後 -->
    <div v-else class="app-shell">
      <header class="top-bar">
        <span class="app-name">時間割</span>
        <div class="top-bar-right">
          <button class="btn-icon" @click="showSettings = !showSettings" title="設定">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button class="btn-icon" @click="handleLogout" title="ログアウト">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <!-- 設定パネル -->
      <div v-if="showSettings" class="settings-panel">
        <label class="setting-row">
          <span>土日を表示</span>
          <input type="checkbox" v-model="showWeekend" class="toggle-check" />
        </label>
      </div>

      <div v-if="error" class="error-banner">{{ error }}</div>

      <ScheduleList :schedules="schedules" :max-period="maxPeriod" :show-weekend="showWeekend" @delete="deleteSchedule" @add="handleGridAdd" @update-absences="updateAbsences" @update-memo="updateMemo" />

      <!-- FAB -->
      <button class="fab" @click="showModal = true" aria-label="時間割を追加">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>

    <!-- ボトムシート -->
    <transition name="sheet">
      <div v-if="showModal" class="sheet-backdrop" @click.self="showModal = false">
        <div class="sheet-content">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <h2>時間割を追加</h2>
            <button class="btn-icon" @click="showModal = false">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <ScheduleForm @submit="handleSubmitModal" :loading="loading" :max-period="maxPeriod" :initial-day="prefill?.day" :initial-period="prefill?.period" />
        </div>
      </div>
    </transition>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuth } from "~/composables/useFirebase";
import { useSchedule } from "~/composables/useSchedule";
import { useSettings } from "~/composables/useSettings";
import ScheduleForm from "~/components/ScheduleForm.vue";
import ScheduleList from "~/components/ScheduleList.vue";

const authError = ref("");
const showModal = ref(false);
const showSettings = ref(false);
const prefill = ref<{ day: string; period: number } | null>(null);
const { user, login, logout } = useAuth();
const { schedules, loading, error, maxPeriod, loadSchedules, addSchedule, deleteSchedule, updateAbsences, updateMemo } = useSchedule();
const { showWeekend } = useSettings();

const handleSubmitModal = async (payload: { title: string; day: string; period: number }) => {
  await addSchedule(payload);
  showModal.value = false;
  prefill.value = null;
};

const handleGridAdd = (data: { day: string; period: number }) => {
  prefill.value = data;
  showModal.value = true;
};

const handleLogin = async () => {
  authError.value = "";
  try {
    await login();
  } catch (err) {
    authError.value = "ログインに失敗しました。再度お試しください。";
    console.error(err);
  }
};

const handleLogout = async () => {
  try {
    await logout();
  } catch (err) {
    console.error(err);
  }
};

watch(
  user,
  async (value) => {
    if (value) {
      await loadSchedules();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* ===== Base ===== */
.page {
  min-height: 100dvh;
  background: #09090b;
  color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
  overscroll-behavior-y: contain;
}

.app-shell {
  padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
}

/* ===== Login ===== */
.login-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 2rem 1.5rem;
  padding-top: calc(2rem + env(safe-area-inset-top, 0px));
  text-align: center;
  gap: 0.5rem;
}

.login-icon {
  font-size: 3rem;
  margin-bottom: 0.4rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.login-sub {
  color: #71717a;
  font-size: 0.92rem;
  line-height: 1.6;
  margin: 0.3rem 0 1.4rem;
}

.btn-google {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: #fafafa;
  color: #18181b;
  border: none;
  border-radius: 14px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 3rem;
  transition: transform 0.15s, box-shadow 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.btn-google:active {
  transform: scale(0.97);
}

.g-icon {
  flex-shrink: 0;
}

.error-text {
  color: #f87171;
  font-size: 0.85rem;
  margin-top: 0.75rem;
}

/* ===== Top Bar ===== */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  padding-top: calc(0.75rem + env(safe-area-inset-top, 0px));
  position: sticky;
  top: 0;
  background: rgba(9, 9, 11, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 30;
}

.app-name {
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.01em;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.settings-panel {
  padding: 0.5rem 1rem;
  background: #111113;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.25rem;
  font-size: 0.9rem;
  color: #a1a1aa;
  cursor: pointer;
}

.toggle-check {
  width: 2.6rem;
  height: 1.5rem;
  appearance: none;
  -webkit-appearance: none;
  background: #27272a;
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  border: none;
}

.toggle-check::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 1.1rem;
  height: 1.1rem;
  background: #71717a;
  border-radius: 50%;
  transition: transform 0.2s, background 0.2s;
}

.toggle-check:checked {
  background: #6d28d9;
}

.toggle-check:checked::after {
  transform: translateX(1.1rem);
  background: #fafafa;
}

.btn-icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: #a1a1aa;
  cursor: pointer;
  transition: background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.btn-icon:active {
  background: #27272a;
}

.error-banner {
  margin: 0.5rem 1rem 0;
  padding: 0.75rem 1rem;
  background: #450a0a;
  border-radius: 12px;
  color: #fca5a5;
  font-size: 0.85rem;
}

/* ===== FAB ===== */
.fab {
  position: fixed;
  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  right: 1rem;
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #6d28d9;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(109, 40, 217, 0.5);
  transition: transform 0.15s;
  z-index: 20;
  -webkit-tap-highlight-color: transparent;
}

.fab:active {
  transform: scale(0.9);
}

/* ===== Bottom Sheet ===== */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet-content {
  width: 100%;
  max-width: 480px;
  max-height: 88dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #111113;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 0.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
}

.sheet-handle {
  width: 2.4rem;
  height: 0.22rem;
  background: #3f3f46;
  border-radius: 999px;
  margin: 0.4rem auto 0.75rem;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.sheet-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

/* Transition */
.sheet-enter-active {
  transition: opacity 0.2s ease;
}

.sheet-enter-active .sheet-content {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-leave-active {
  transition: opacity 0.15s ease;
}

.sheet-leave-active .sheet-content {
  transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet-content,
.sheet-leave-to .sheet-content {
  transform: translateY(100%);
}

/* ===== Desktop ===== */
@media (min-width: 640px) {
  .top-bar {
    padding-top: 0.75rem;
  }

  .login-screen {
    padding-top: 2rem;
  }

  .user-name {
    max-width: 180px;
  }

  .fab {
    bottom: 2rem;
    right: 2rem;
    width: 4rem;
    height: 4rem;
  }

  .fab:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 12px 36px rgba(109, 40, 217, 0.55);
  }

  .sheet-backdrop {
    align-items: center;
  }

  .sheet-content {
    border-radius: 20px;
    margin: 1rem;
    max-height: 80vh;
    padding-bottom: 1.5rem;
  }

  .sheet-handle {
    display: none;
  }
}
</style>
