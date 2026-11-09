import { format, getDay } from "date-fns";

export type TaskKind = "once" | "daily" | "weekly";

export interface Task {
  id: string;
  title: string;
  kind: TaskKind;
  date: string | null;
  weekdays: number[];
  createdAt: number;
}

export type NewTask = Omit<Task, "id" | "createdAt">;

export interface Template {
  id: string;
  title: string;
  kind: TaskKind;
  weekdays: number[];
}

export type NewTemplate = Omit<Template, "id">;

export interface PlannerState {
  tasks: Task[];
  templates: Template[];
  completions: Record<string, string[]>;
}

export const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];

export const WEEKDAYS = [
  { value: 1, short: "Пн" },
  { value: 2, short: "Вт" },
  { value: 3, short: "Ср" },
  { value: 4, short: "Чт" },
  { value: 5, short: "Пт" },
  { value: 6, short: "Сб" },
  { value: 0, short: "Вс" },
];

export const KIND_OPTIONS: { value: TaskKind; label: string }[] = [
  { value: "once", label: "Разово" },
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Еженедельно" },
];

const KIND_ORDER: Record<TaskKind, number> = { once: 0, daily: 1, weekly: 2 };

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "tpl-water",
    title: "Стакан воды",
    kind: "daily",
    weekdays: ALL_WEEKDAYS,
  },
  {
    id: "tpl-read",
    title: "Почитать 20 минут",
    kind: "daily",
    weekdays: ALL_WEEKDAYS,
  },
  {
    id: "tpl-plan",
    title: "Составить план на неделю",
    kind: "weekly",
    weekdays: [1],
  },
  {
    id: "tpl-clean",
    title: "Генеральная уборка",
    kind: "weekly",
    weekdays: [6],
  },
];

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function defaultWeekdaysFor(kind: TaskKind, weekday: number): number[] {
  if (kind === "daily") return ALL_WEEKDAYS;
  if (kind === "weekly") return [weekday];
  return [];
}

export function describeWeekdays(weekdays: number[]) {
  return WEEKDAYS.filter((day) => weekdays.includes(day.value))
    .map((day) => day.short)
    .join(", ");
}

export function isScheduledOn(task: Task, date: Date) {
  if (task.kind === "once") return task.date === toDateKey(date);
  return task.weekdays.includes(getDay(date));
}

export function tasksOn(tasks: Task[], date: Date) {
  return tasks
    .filter((task) => isScheduledOn(task, date))
    .sort(
      (a, b) =>
        KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.createdAt - b.createdAt,
    );
}

export function isCompletedOn(
  task: Task,
  completions: Record<string, string[]>,
  date: Date,
) {
  return (completions[task.id] ?? []).includes(toDateKey(date));
}

export function toggleCompletion(
  completions: Record<string, string[]>,
  task: Task,
  date: Date,
): Record<string, string[]> {
  const key = toDateKey(date);
  const marks = completions[task.id] ?? [];
  return {
    ...completions,
    [task.id]: marks.includes(key)
      ? marks.filter((mark) => mark !== key)
      : [...marks, key],
  };
}
