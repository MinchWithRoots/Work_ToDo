import { useState } from "react";
import { defaultWeekdaysFor, type TaskKind } from "@/lib/planner";

export function useTaskDraft(weekday: number, initialKind: TaskKind) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TaskKind>(initialKind);
  const [weekdays, setWeekdays] = useState<number[]>(() =>
    defaultWeekdaysFor(initialKind, weekday),
  );

  const changeKind = (next: TaskKind) => {
    setKind(next);
    setWeekdays(defaultWeekdaysFor(next, weekday));
  };

  const reset = () => setTitle("");

  const canSubmit =
    title.trim().length > 0 && (kind === "once" || weekdays.length > 0);

  return {
    title,
    setTitle,
    kind,
    changeKind,
    weekdays,
    setWeekdays,
    canSubmit,
    reset,
  };
}
