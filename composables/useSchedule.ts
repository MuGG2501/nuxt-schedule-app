import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query } from "firebase/firestore";
import { ref, computed } from "vue";
import { getDb, useAuth } from "~/composables/useFirebase";

export type ScheduleInput = {
  title: string;
  day: string;
  period: number;
};

export type ScheduleItem = ScheduleInput & {
  id: string;
  absences: number;
  memo: string;
  createdAt?: any;
};

const schedules = ref<ScheduleItem[]>([]);
const loading = ref(false);
const error = ref("");

const { user } = useAuth();

const getScheduleCollection = () => {
  const db = getDb();
  if (!db) {
    error.value = "Firebase の設定が必要です。環境変数を .env に追加してください。";
    return null;
  }

  if (!user.value?.uid) {
    error.value = "ログインしてください。";
    return null;
  }

  return collection(db, "users", user.value.uid, "schedules");
};

const loadSchedules = async () => {
  const scheduleCollection = getScheduleCollection();
  if (!scheduleCollection) {
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const q = query(scheduleCollection, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    schedules.value = snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title ?? "",
        day: data.day ?? "Monday",
        period: data.period ?? 1,
        absences: data.absences ?? 0,
        memo: data.memo ?? "",
        createdAt: data.createdAt,
      } as ScheduleItem;
    });
  } catch (err) {
    error.value = "スケジュールの読み込み中にエラーが発生しました。";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const addSchedule = async (item: ScheduleInput) => {
  const scheduleCollection = getScheduleCollection();
  if (!scheduleCollection) {
    return;
  }

  const trimmedTitle = item.title?.trim() ?? "";
  if (!trimmedTitle || trimmedTitle.length > 100) {
    error.value = "科目名は1〜100文字で入力してください。";
    return;
  }
  if (!validDays.includes(item.day)) {
    error.value = "無効な曜日です。";
    return;
  }
  if (!Number.isInteger(item.period) || item.period < 1 || item.period > 12) {
    error.value = "時限は1〜12の整数で指定してください。";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await addDoc(scheduleCollection, {
      title: trimmedTitle,
      day: item.day,
      period: item.period,
      createdAt: serverTimestamp(),
    });
    await loadSchedules();
  } catch (err) {
    error.value = "スケジュールの保存中にエラーが発生しました。";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteSchedule = async (id: string) => {
  const db = getDb();
  if (!db) {
    error.value = "Firebase の設定が必要です。環境変数を .env に追加してください。";
    return;
  }

  if (!user.value?.uid) {
    error.value = "ログインしてください。";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await deleteDoc(doc(db, "users", user.value.uid, "schedules", id));
    await loadSchedules();
  } catch (err) {
    error.value = "スケジュールの削除中にエラーが発生しました。";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const updateAbsences = async (id: string, absences: number) => {
  const db = getDb();
  if (!db || !user.value?.uid) return;

  const safeAbsences = Math.max(0, Math.min(999, Math.floor(absences)));

  try {
    await updateDoc(doc(db, "users", user.value.uid, "schedules", id), { absences: safeAbsences });
    const item = schedules.value.find((s) => s.id === id);
    if (item) item.absences = safeAbsences;
  } catch (err) {
    error.value = "欠席回数の更新中にエラーが発生しました。";
    console.error(err);
  }
};

const updateMemo = async (id: string, memo: string) => {
  const db = getDb();
  if (!db || !user.value?.uid) return;

  const safeMemo = memo.slice(0, 500);

  try {
    await updateDoc(doc(db, "users", user.value.uid, "schedules", id), { memo: safeMemo });
    const item = schedules.value.find((s) => s.id === id);
    if (item) item.memo = safeMemo;
  } catch (err) {
    error.value = "メモの更新中にエラーが発生しました。";
    console.error(err);
  }
};

const maxPeriod = computed(() =>
  Math.max(4, ...schedules.value.map((s) => s.period))
);

export const useSchedule = () => ({
  schedules,
  loading,
  error,
  maxPeriod,
  loadSchedules,
  addSchedule,
  deleteSchedule,
  updateAbsences,
  updateMemo,
});
