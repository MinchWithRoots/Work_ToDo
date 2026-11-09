import { useMemo, useState } from "react";
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlanner } from "@/lib/planner-context";
import { isCompletedOn, tasksOn } from "@/lib/planner";
import { cn } from "@/lib/utils";

export default function Summary() {
  const today = startOfDay(new Date());
  const [anchor, setAnchor] = useState(today);
  const { tasks, completions } = usePlanner();

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(anchor, { weekStartsOn: 1 }),
        end: endOfWeek(anchor, { weekStartsOn: 1 }),
      }),
    [anchor],
  );

  const summary = useMemo(
    () =>
      days.map((day) => ({
        day,
        items: tasksOn(tasks, day).map((task) => ({
            task,
            done: isCompletedOn(task, completions, day),
          })),
      })),
    [days, tasks, completions],
  );

  const totalPlanned = summary.reduce((sum, day) => sum + day.items.length, 0);
  const totalDone = summary.reduce(
    (sum, day) => sum + day.items.filter((item) => item.done).length,
    0,
  );
  const percent = totalPlanned
    ? Math.round((totalDone / totalPlanned) * 100)
    : 0;
  const isThisWeek = isSameDay(
    startOfWeek(anchor, { weekStartsOn: 1 }),
    startOfWeek(today, { weekStartsOn: 1 }),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">Итоги недели</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Сводка
          </h1>
          <p className="mt-2 text-muted-foreground">
            {format(days[0], "d MMMM", { locale: ru })} —{" "}
            {format(days[6], "d MMMM yyyy", { locale: ru })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isThisWeek && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setAnchor(today)}
            >
              Эта неделя
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Предыдущая неделя"
            onClick={() => setAnchor((date) => addWeeks(date, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Следующая неделя"
            onClick={() => setAnchor((date) => addWeeks(date, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Выполнено за неделю</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">
              {totalDone}{" "}
              <span className="text-base font-semibold text-muted-foreground">
                из {totalPlanned}
              </span>
            </p>
          </div>
          <p className="text-sm font-bold tabular-nums text-success">
            {percent}%
          </p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {summary.map(({ day, items }) => {
          const doneOnDay = items.filter((item) => item.done).length;
          const isDayToday = isSameDay(day, today);
          return (
            <li
              key={day.toISOString()}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl",
                      isDayToday
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    <span className="text-[11px] font-bold uppercase leading-none">
                      {format(day, "EEEEEE", { locale: ru })}
                    </span>
                    <span className="mt-1 text-xl font-extrabold leading-none">
                      {format(day, "d")}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold capitalize">
                      {format(day, "EEEE", { locale: ru })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {items.length === 0
                        ? "Задач нет"
                        : doneOnDay === 0
                          ? "Ничего не отмечено"
                          : `Отмечено ${doneOnDay} из ${items.length}`}
                    </p>
                  </div>
                </div>
                {items.length > 0 && (
                  <span className="text-sm font-bold tabular-nums">
                    {doneOnDay}/{items.length}
                  </span>
                )}
              </div>

              {items.length > 0 && (
                <ul className="mt-4 space-y-2.5 border-t border-border pt-4">
                  {items.map(({ task, done }) => (
                    <li key={task.id} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                          done
                            ? "border-success bg-success text-success-foreground"
                            : "border-border",
                        )}
                      >
                        {done && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 break-words text-[15px] font-medium",
                          !done && "text-muted-foreground",
                        )}
                      >
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
