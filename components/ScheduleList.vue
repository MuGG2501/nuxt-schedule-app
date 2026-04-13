<template>
  <div class="timetable-wrapper">
    <!-- 空状態 -->
    <div v-if="schedules.length === 0" class="empty">
      <div class="empty-icon">📋</div>
      <p>まだ時間割がありません</p>
      <span>右下の＋ボタンから追加してください</span>
    </div>

    <template v-else>
      <!-- 表示切替バー -->
      <div class="view-toggle-bar">
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          リスト
        </button>
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          グリッド
        </button>
      </div>

      <!-- リスト表示 -->
      <ScheduleListView
        v-if="viewMode === 'list'"
        :schedules="schedules"
        @select="selected = $event"
      />

      <!-- グリッド表示 -->
      <ScheduleGridView
        v-if="viewMode === 'grid'"
        :schedules="schedules"
        :max-period="maxPeriod"
        @select="selected = $event"
        @add="emit('add', $event)"
      />
    </template>

    <!-- 詳細ボトムシート -->
    <transition name="sheet">
      <div v-if="selected" class="sheet-backdrop" @click.self="selected = null">
        <div class="sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-row">
            <div>
              <h3 class="sheet-title">{{ selected.title }}</h3>
              <p class="sheet-meta">{{ formatDay(selected.day) }}　{{ selected.period }}限</p>
            </div>
            <button class="btn-close" @click="selected = null">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="absence-section">
            <span class="absence-label">欠席回数</span>
            <div class="absence-controls">
              <button class="absence-btn" :disabled="selected.absences <= 0" @click="changeAbsences(-1)">−</button>
              <span class="absence-count">{{ selected.absences }}</span>
              <button class="absence-btn" @click="changeAbsences(1)">＋</button>
            </div>
          </div>
          <button class="btn-delete" @click="handleDelete(selected.id)">この時間割を削除</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { ScheduleItem } from "~/composables/useSchedule";

const props = defineProps<{ schedules: ScheduleItem[]; maxPeriod: number }>();
const emit = defineEmits<{
  (event: "delete", id: string): void;
  (event: "add", payload: { day: string; period: number }): void;
  (event: "update-absences", id: string, absences: number): void;
}>();

const selected = ref<ScheduleItem | null>(null);
const viewMode = ref<"list" | "grid">("list");

const handleDelete = (id: string) => {
  emit("delete", id);
  selected.value = null;
};

const changeAbsences = (delta: number) => {
  if (!selected.value) return;
  const next = Math.max(0, selected.value.absences + delta);
  selected.value.absences = next;
  emit("update-absences", selected.value.id, next);
};

const formatDay = (v: string) =>
  ({ Monday:"月曜",Tuesday:"火曜",Wednesday:"水曜",Thursday:"木曜",Friday:"金曜",Saturday:"土曜",Sunday:"日曜" }[v] ?? v);
</script>

<style scoped>
/* ===== Empty ===== */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5rem 1.5rem;
  color: #52525b;
}

.empty-icon {
  font-size: 2.6rem;
  margin-bottom: 0.75rem;
}

.empty p {
  margin: 0;
  font-weight: 600;
  color: #71717a;
}

.empty span {
  font-size: 0.84rem;
  margin-top: 0.3rem;
  color: #71717a;
}

/* ===== View Toggle Bar ===== */
.view-toggle-bar {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1rem 0;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: none;
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  min-height: 2.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  background: transparent;
  color: #52525b;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.toggle-btn.active {
  background: #1c1c1e;
  color: #fafafa;
}

.toggle-btn:active {
  transform: scale(0.96);
}

/* ===== Detail Sheet ===== */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet {
  width: 100%;
  max-width: 440px;
  background: #111113;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 0.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
}

.sheet-handle {
  width: 2rem;
  height: 0.22rem;
  background: #3f3f46;
  border-radius: 999px;
  margin: 0.35rem auto 1rem;
}

.sheet-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.sheet-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.sheet-meta {
  color: #71717a;
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
}

.btn-close {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: #71717a;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.btn-close:active {
  background: #27272a;
}

/* ===== Absence Controls ===== */
.absence-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.25rem;
  padding: 0.85rem 1rem;
  background: #18181b;
  border-radius: 14px;
}

.absence-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #a1a1aa;
}

.absence-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.absence-btn {
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border: none;
  border-radius: 10px;
  background: #27272a;
  color: #fafafa;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.absence-btn:active {
  background: #3f3f46;
}

.absence-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.absence-count {
  font-size: 1.15rem;
  font-weight: 700;
  min-width: 1.5rem;
  text-align: center;
  color: #fafafa;
}

.btn-delete {
  display: block;
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  border: none;
  border-radius: 14px;
  background: #7f1d1d;
  color: #fca5a5;
  font-weight: 600;
  font-size: 0.95rem;
  min-height: 3rem;
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.btn-delete:active {
  background: #991b1b;
}

/* Sheet transition */
.sheet-enter-active { transition: opacity 0.2s ease; }
.sheet-enter-active .sheet { transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-leave-active { transition: opacity 0.16s ease; }
.sheet-leave-active .sheet { transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }

/* ===== Desktop (640px+) ===== */
@media (min-width: 640px) {
  .sheet-backdrop {
    align-items: center;
  }

  .sheet {
    border-radius: 18px;
    margin-bottom: 0;
    padding-bottom: 1.5rem;
  }

  .sheet-handle {
    display: none;
  }

  .grid {
    grid-template-columns: 4.2rem repeat(7, 1fr);
  }

  .cell {
    min-height: 3.8rem;
    padding: 0.65rem 0.4rem;
  }

  .subject {
    font-size: 0.82rem;
  }

  .hours {
    font-size: 0.68rem;
  }
}
</style>
