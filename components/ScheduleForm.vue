<template>
  <form @submit.prevent="submitForm" class="form">
    <div class="form-head">
      <p class="form-kicker">Quick add</p>
      <h3 class="form-title">授業を追加</h3>
      <p class="form-sub">曜日と時限を選ぶだけで、グリッドにもすぐ反映されます。</p>
    </div>

    <div class="field">
      <label>科目 / イベント</label>
      <input
        v-model="title"
        type="text"
        placeholder="例: 数学"
        required
        autocomplete="off"
      />
    </div>

    <div class="field">
      <label>曜日</label>
      <select v-model="day" required>
        <option value="Monday">月曜</option>
        <option value="Tuesday">火曜</option>
        <option value="Wednesday">水曜</option>
        <option value="Thursday">木曜</option>
        <option value="Friday">金曜</option>
        <option value="Saturday">土曜</option>
        <option value="Sunday">日曜</option>
      </select>
    </div>

    <div class="field">
      <label>時限</label>
      <select v-model.number="period" required>
        <option v-for="n in maxPeriod" :key="n" :value="n">{{ n }}限</option>
      </select>
    </div>

    <button type="submit" :disabled="loading">
      {{ loading ? "保存中..." : "追加する" }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { ScheduleInput } from "~/composables/useSchedule";

const props = defineProps<{
  loading: boolean;
  maxPeriod: number;
  initialDay?: string;
  initialPeriod?: number;
}>();
const emit = defineEmits<{ (event: "submit", payload: ScheduleInput): void }>();

const title = ref("");
const day = ref(props.initialDay || "Monday");
const period = ref(props.initialPeriod || 1);

const submitForm = () => {
  if (!title.value.trim()) return;
  emit("submit", {
    title: title.value,
    day: day.value,
    period: period.value,
  });
};

watch(
  () => [props.initialDay, props.initialPeriod],
  ([newDay, newPeriod]) => {
    if (newDay) day.value = newDay;
    if (newPeriod) period.value = newPeriod;
  }
);

watch(
  () => props.loading,
  (v) => {
    if (!v) {
      title.value = "";
      day.value = props.initialDay || "Monday";
      period.value = props.initialPeriod || 1;
    }
  }
);
</script>

<style scoped>
.form {
  display: grid;
  gap: 1rem;
}

.form-head {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 0.2rem;
}

.form-kicker {
  margin: 0;
  color: #8b5cf6;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-title {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
}

.form-sub {
  margin: 0;
  color: #8a8a95;
  font-size: 0.86rem;
  line-height: 1.6;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.time-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

input,
select {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
  padding: 0.9rem 1rem;
  /* 16px prevents iOS zoom on focus */
  font-size: 1rem;
  background: #18181b;
  color: #fafafa;
  min-height: 3rem;
  transition: border-color 0.15s, box-shadow 0.15s;
  -webkit-appearance: none;
}

input::placeholder {
  color: #52525b;
}

input:focus,
select:focus {
  outline: none;
  border-color: #6d28d9;
  box-shadow: 0 0 0 3px rgba(109, 40, 217, 0.18);
}

button {
  width: 100%;
  border-radius: 14px;
  border: none;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  background: #6d28d9;
  color: #fff;
  cursor: pointer;
  min-height: 3.2rem;
  transition: transform 0.12s, opacity 0.12s;
  -webkit-tap-highlight-color: transparent;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:active:not(:disabled) {
  transform: scale(0.97);
}

@media (min-width: 640px) {
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(109, 40, 217, 0.35);
  }
}
</style>
