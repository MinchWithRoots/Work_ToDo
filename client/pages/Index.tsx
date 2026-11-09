import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/TaskItem";
import { SkeletonCelebration } from "@/components/SkeletonCelebration";
import { TaskComposer } from "@/components/TaskComposer";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { isCompletedOn, tasksOn, type Task, type TaskKind } from "@/lib/planner";
import { pickMotivation } from "@/lib/motivation";
import { usePlanner } from "@/lib/planner-context";
import { cn } from "@/lib/utils";

const GROUPS: { kind: TaskKind; title: string }[] = [
  { kind: "once", title: "На этот день" },
  { kind: "daily", title: "Ежедневные" },
  { kind: "weekly", title: "Еженедельные" },
];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Index() {
  const today = startOfDay(new Date());
  const [selected, setSelected] = useState(today);
  const { tasks, completions, toggleTask, removeTask } = usePlanner();
  const [praise, setPraise] = useState<{ text: string; id: number } | null>(
    null,
  );

  useEffect(() => {
    if (!praise) return;
    const timer = setTimeout(() => setPraise(null), 3500);
    return () => clearTimeout(timer);
  }, [praise]);

  const handleToggle = (task: Task) => {
    const wasDone = isCompletedOn(task, completions, selected);
    toggleTask(task.id, selected);
    if (!wasDone) {
      setPraise((previous) => ({
        text: pickMotivation(previous?.text),
        id: Date.now(),
      }));
    }
  };

  const isToday = isSameDay(selected, today);
  const week = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(selected, { weekStartsOn: 1 }),
        end: endOfWeek(selected, { weekStartsOn: 1 }),
      }),
    [selected],
  );

  const weekStats = useMemo(
    () =>
      week.map((day) => {
        const dayTasks = tasksOn(tasks, day);
        const done = dayTasks.filter((task) =>
          isCompletedOn(task, completions, day),
        ).length;
        return { day, total: dayTasks.length, done };
      }),
    [week, tasks, completions],
  );

  const dayTasks = useMemo(() => tasksOn(tasks, selected), [tasks, selected]);
  const doneCount = dayTasks.filter((task) =>
    isCompletedOn(task, completions, selected),
  ).length;
  const progress = dayTasks.length ? (doneCount / dayTasks.length) * 100 : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              {isToday ? "Сегодня" : "Выбранный день"}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {capitalize(format(selected, "EEEE, d MMMM", { locale: ru }))}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isToday && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setSelected(today)}
              >
                К сегодня
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Предыдущий день"
              onClick={() => setSelected((day) => addDays(day, -1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Следующий день"
              onClick={() => setSelected((day) => addDays(day, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekStats.map(({ day, total, done }) => {
            const active = isSameDay(day, selected);
            const dayIsToday = isSameDay(day, today);
            const complete = total > 0 && done === total;
            const partial = done > 0 && !complete;
            return (
              <button
                key={day.toISOString()}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(day)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "border border-border bg-card hover:border-foreground/20",
                  dayIsToday && !active && "border-primary/60",
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                  {format(day, "EEEEEE", { locale: ru })}
                </span>
                <span className="text-lg font-extrabold leading-none">
                  {format(day, "d")}
                </span>
                <span
                  className={cn(
                    "mt-0.5 h-1.5 w-1.5 rounded-full",
                    total === 0 && "bg-transparent",
                    total > 0 && done === 0 && "bg-muted-foreground/35",
                    partial && "bg-amber-400",
                    complete && "bg-success",
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Выполнено</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">
                {doneCount}{" "}
                <span className="text-base font-semibold text-muted-foreground">
                  из {dayTasks.length}
                </span>
              </p>
            </div>
            <p className="text-sm font-bold tabular-nums text-success">
              {Math.round(progress)}%
            </p>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {dayTasks.length > 0 && doneCount === dayTasks.length && (
          <SkeletonCelebration />
        )}

        {praise && (
          <p
            key={praise.id}
            role="status"
            className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
          >
            {praise.text}
          </p>
        )}

        {dayTasks.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-lg font-bold">На этот день пока пусто</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Добавьте задачу справа или выберите шаблон.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {GROUPS.map((group) => {
              const items = dayTasks.filter((task) => task.kind === group.kind);
              if (items.length === 0) return null;
              return (
                <section key={group.kind}>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    {group.title} · {items.length}
                  </h2>
                  <ul className="space-y-2.5">
                    {items.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        done={isCompletedOn(task, completions, selected)}
                        onToggle={() => handleToggle(task)}
                        onRemove={() => removeTask(task.id)}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <TaskComposer date={selected} />
        <TemplatesPanel date={selected} />
      </aside>
    </div>
  );
}
