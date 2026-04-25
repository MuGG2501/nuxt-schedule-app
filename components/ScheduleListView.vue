<template>
  <div class="list-view">
    <div class="list-header">
      <div>
        <p class="list-kicker">List view</p>
        <h2 class="list-title">曜日ごとの授業一覧</h2>
      </div>
      <span class="list-summary">{{ daySchedules.length }}件</span>
    </div>

    <div class="day-tabs">
      <button
        v-for="d in days"
        :key="d.key"
        class="day-tab"
        :class="{ active: activeDay === d.key, today: isToday(d.key) }"
        @click="activeDay = d.key"
      >{{ d.label }}</button>
    </div>

    <div class="card-list">
      <div v-if="daySchedules.length === 0" class="day-empty">
        この日の時間割はありません
      </div>
      <button
        v-for="item in daySchedules"
        :key="item.id"
        class="card"
        @click="emit('select', item)"
      >
        <div class="card-period">
          <span class="card-period-num">{{ item.period }}</span>
          <span class="card-period-label">限</span>
        </div>
        <div class="card-body">
          <span class="card-title">{{ item.title }}</span>
          <span class="card-subline">{{ formatDay(item.day) }} / {{ item.period }}限</span>
          <span v-if="item.memo" class="card-memo">{{ item.memo }}</span>
        </div>
        <div class="card-meta">
          <span v-if="item.memo" class="card-note-tag">メモ</span>
          <span v-if="item.absences > 0" class="card-absence">{{ item.absences }}欠席</span>
        </div>
        <svg class="card-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ScheduleItem } from "~/composables/useSchedule";

const props = defineProps<{
  schedules: ScheduleItem[];
}>();

const emit = defineEmits<{
  (event: "select", item: ScheduleItem): void;
}>();

const days = [
  { key: "Monday", label: "月" },
  { key: "Tuesday", label: "火" },
  { key: "Wednesday", label: "水" },
  { key: "Thursday", label: "木" },
  { key: "Friday", label: "金" },
] as const;

const dayIndexMap: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

const dayToKey: Record<number, string> = {
  1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday",
};

const isToday = (key: string) => new Date().getDay() === dayIndexMap[key];

const activeDay = ref(dayToKey[new Date().getDay()] || "Monday");

const daySchedules = computed(() =>
  props.schedules
    .filter((s) => s.day === activeDay.value)
    .sort((a, b) => a.period - b.period)
);

const formatDay = (v: string) =>
  ({ Monday:"月曜",Tuesday:"火曜",Wednesday:"水曜",Thursday:"木曜",Friday:"金曜",Saturday:"土曜",Sunday:"日曜" }[v] ?? v);
</script>

<style scoped>
.list-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 0.25rem;
}

.list-kicker {
  margin: 0 0 0.2rem;
  color: #8b5cf6;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.list-title {
  margin: 0;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}

.list-summary {
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #d4d4d8;
  font-size: 0.75rem;
  font-weight: 700;
}

.day-tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.day-tabs::-webkit-scrollbar {
  display: none;
}

.day-tab {
  flex: 1;
  min-width: 2.8rem;
  min-height: 2.8rem;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #52525b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.day-tab.today {
  color: #a78bfa;
}

.day-tab.active {
  background: #6d28d9;
  color: #fff;
}

.day-tab:active {
  transform: scale(0.95);
}

.card-list {
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.day-empty {
  text-align: center;
  color: #71717a;
  padding: 3rem 0;
  font-size: 0.9rem;
}

.card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
  border: none;
  border-radius: 18px;
  padding: 1rem;
  min-height: 4.25rem;
  text-align: left;
  color: #fafafa;
  cursor: pointer;
  transition: background 0.12s, transform 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.card:active {
  background: #1a1a1d;
  transform: scale(0.985);
}

.card-period {
  display: flex;
  align-items: baseline;
  justify-content: center;
  min-width: 2.8rem;
  gap: 0.1rem;
  padding: 0.55rem 0.45rem;
  border-radius: 14px;
  background: rgba(109, 40, 217, 0.16);
}

.card-period-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: #c4b5fd;
}

.card-period-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #a1a1aa;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.18rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-subline {
  color: #8a8a95;
  font-size: 0.75rem;
}

.card-memo {
  color: #c7c7d1;
  font-size: 0.8rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.card-note-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: #67e8f9;
  background: rgba(6, 182, 212, 0.14);
  border-radius: 999px;
  padding: 0.2rem 0.45rem;
}

.card-chevron {
  color: #71717a;
  flex-shrink: 0;
  margin-top: 0.35rem;
}

.card-absence {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.12);
  border-radius: 8px;
  padding: 0.2rem 0.5rem;
  flex-shrink: 0;
}
</style>
