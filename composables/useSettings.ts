import { ref, watch } from "vue";

const showWeekend = ref(false);

if (import.meta.client) {
  const saved = localStorage.getItem("schedule-show-weekend");
  if (saved !== null) showWeekend.value = saved === "true";
}

watch(showWeekend, (v) => {
  if (import.meta.client) {
    localStorage.setItem("schedule-show-weekend", String(v));
  }
});

export const useSettings = () => ({
  showWeekend,
});
