<template>
  <div class="list-view">
    <div class="day-tabs">
      <button
        v-for="d in filteredDays"
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
        </div>
        <span v-if="item.absences > 0" class="card-absence">{{ item.absences }}欠席</span>
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
  showWeekend: boolean;
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
  { key: "Saturday", label: "土" },
  { key: "Sunday", label: "日" },
] as const;

const dayIndexMap: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

const dayToKey: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday",
};

const isToday = (key: string) => new Date().getDay() === dayIndexMap[key];

const filteredDays = computed(() =>
  props.showWeekend ? days : days.filter((d) => d.key !== "Saturday" && d.key !== "Sunday")
);

const activeDay = ref(dayToKey[new Date().getDay()] || "Monday");

const daySchedules = computed(() =>
  props.schedules
    .filter((s) => s.day === activeDay.value)
    .sort((a, b) => a.period - b.period)
);
</script>

<style scoped>
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
  gap: 0.5rem;
}

.day-empty {
  text-align: center;
  color: #71717a;
  padding: 3rem 0;
  font-size: 0.9rem;
}

.card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: #111113;
  border: none;
  border-radius: 14px;
  padding: 1rem;
  min-height: 3.5rem;
  text-align: left;
  color: #fafafa;
  cursor: pointer;
  transition: background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.card:active {
  background: #1a1a1d;
}

.card-period {
  display: flex;
  align-items: baseline;
  justify-content: center;
  min-width: 2.8rem;
  gap: 0.1rem;
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
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-chevron {
  color: #71717a;
  flex-shrink: 0;
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
