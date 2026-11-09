import type { FormEvent } from "react";
import { format, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KindSelector, WeekdayPicker } from "@/components/RecurrenceFields";
import { toDateKey, type TaskKind } from "@/lib/planner";
import { usePlanner } from "@/lib/planner-context";
import { useTaskDraft } from "@/lib/use-task-draft";

const HINTS: Record<TaskKind, string> = {
  once: "",
  daily: "Появляется в выбранные дни и отмечается каждый раз.",
  weekly: "Появляется в выбранные дни и отмечается в каждый из них.",
};

export function TaskComposer({ date }: { date: Date }) {
  const { addTask } = usePlanner();
  const draft = useTaskDraft(getDay(date), "once");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.canSubmit) return;
    const isOnce = draft.kind === "once";
    addTask({
      title: draft.title.trim(),
      kind: draft.kind,
      date: isOnce ? toDateKey(date) : null,
      weekdays: isOnce ? [] : draft.weekdays,
    });
    draft.reset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <h2 className="text-lg font-extrabold">Новая задача</h2>
      <Input
        value={draft.title}
        onChange={(event) => draft.setTitle(event.target.value)}
        placeholder="Например, купить продукты"
        maxLength={120}
        aria-label="Название задачи"
        className="mt-4 h-12 rounded-2xl px-4 text-base"
      />
      <div className="mt-4">
        <KindSelector value={draft.kind} onChange={draft.changeKind} />
      </div>
      {draft.kind !== "once" && (
        <div className="mt-3">
          <WeekdayPicker value={draft.weekdays} onChange={draft.setWeekdays} />
        </div>
      )}
      <p className="mt-3 min-h-10 text-sm text-muted-foreground">
        {draft.kind === "once"
          ? `Появится ${format(date, "d MMMM", { locale: ru })}.`
          : HINTS[draft.kind]}
      </p>
      <Button
        type="submit"
        disabled={!draft.canSubmit}
        className="mt-4 h-12 w-full rounded-2xl text-base font-bold"
      >
        <Plus />
        Добавить
      </Button>
    </form>
  );
}
