<template>
  <div class="grid-view">
    <div class="scroll-area">
      <div class="grid" :style="{ gridTemplateColumns: `3.2rem repeat(${days.length}, minmax(3rem, 1fr))`, gridTemplateRows: `auto repeat(${periods.length}, 1fr)` }">
        <div class="cell corner"></div>
        <div
          v-for="d in days"
          :key="d.key"
          class="cell col-head"
          :class="{ today: isToday(d.key) }"
        >{{ d.label }}</div>

        <template v-for="p in periods" :key="p">
          <div class="cell row-head">{{ p }}限</div>
          <div
            v-for="d in days"
            :key="d.key + p"
            class="cell body"
            :class="{
              filled: getItem(d.key, p),
              today: isToday(d.key),
              empty: !getItem(d.key, p),
              'row-even': p % 2 === 0,
            }"
            @click="tapCell(d.key, p)"
          >
            <template v-if="getItem(d.key, p)">
              <span class="subject">{{ getItem(d.key, p)!.title }}</span>
              <span v-if="getItem(d.key, p)!.absences > 0" class="absence-badge">{{ getItem(d.key, p)!.absences }}欠</span>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ScheduleItem } from "~/composables/useSchedule";

const props = defineProps<{
  schedules: ScheduleItem[];
  maxPeriod: number;
  showWeekend: boolean;
}>();

const emit = defineEmits<{
  (event: "select", item: ScheduleItem): void;
  (event: "add", payload: { day: string; period: number }): void;
}>();

const allDays = [
  { key: "Monday", label: "月" },
  { key: "Tuesday", label: "火" },
  { key: "Wednesday", label: "水" },
  { key: "Thursday", label: "木" },
  { key: "Friday", label: "金" },
  { key: "Saturday", label: "土" },
  { key: "Sunday", label: "日" },
] as const;

const days = computed(() =>
  props.showWeekend ? allDays : allDays.filter((d) => d.key !== "Saturday" && d.key !== "Sunday")
);

const dayIndexMap: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

const periods = computed(() => Array.from({ length: props.maxPeriod }, (_, i) => i + 1));

const isToday = (key: string) => new Date().getDay() === dayIndexMap[key];

const getItem = (day: string, period: number) =>
  props.schedules.find((s) => s.day === day && s.period === period) ?? null;

const tapCell = (day: string, period: number) => {
  const item = getItem(day, period);
  if (item) {
    emit("select", item);
  } else {
    emit("add", { day, period });
  }
};
</script>

<style scoped>
.scroll-area {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1rem 1rem 2rem;
}

.grid {
  display: grid;
  border-radius: 14px;
  overflow: hidden;
  background: #0d0d10;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0.25rem;
  min-height: 3rem;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  gap: 0.15rem;
  transition: background 0.12s;
}

.corner {
  background: #16161a;
}

.col-head {
  background: #16161a;
  color: #a1a1aa;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
}

.col-head.today {
  color: #a78bfa;
  background: #1a1726;
}

.row-head {
  background: #111115;
  color: #a1a1aa;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.body {
  cursor: default;
  background: #0d0d10;
}

.body.row-even {
  background: #101014;
}

.body.empty {
  cursor: pointer;
}

.body.empty:active {
  background: rgba(109, 40, 217, 0.1);
}

.body.today {
  background: rgba(139, 92, 246, 0.06);
}

.body.today.row-even {
  background: rgba(139, 92, 246, 0.08);
}

.body.filled {
  background: rgba(109, 40, 217, 0.15);
  cursor: pointer;
}

.body.filled:active {
  background: rgba(109, 40, 217, 0.25);
}

.body.filled:hover {
  background: rgba(109, 40, 217, 0.22);
}

.subject {
  color: #e4e4e7;
  font-weight: 700;
  font-size: 0.72rem;
  line-height: 1.25;
  text-align: center;
  word-break: break-all;
}

.absence-badge {
  font-size: 0.6rem;
  font-weight: 600;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 4px;
  padding: 0.05rem 0.25rem;
  line-height: 1.2;
}
</style>
