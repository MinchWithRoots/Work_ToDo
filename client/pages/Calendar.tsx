import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlanner } from "@/lib/planner-context";
import { isCompletedOn, tasksOn } from "@/lib/planner";
import { cn } from "@/lib/utils";

const WEEK_HEADERS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MAX_TITLES_PER_DAY = 2;

export default function Calendar() {
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const { tasks, completions, toggleTask } = usePlanner();

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }),
    [month],
  );

  const dayItems = useMemo(
    () =>
      Object.fromEntries(
        days.map((day) => {
          const items = tasksOn(tasks, day).map((task) => ({
            task,
            done: isCompletedOn(task, completions, day),
          }));
          return [format(day, "yyyy-MM-dd"), items];
        }),
      ),
    [days, tasks, completions],
  );

  const selectedItems =
    dayItems[format(selected, "yyyy-MM-dd")] ?? [];

  const selectMonth = (next: Date) => {
    setMonth(next);
    setSelected(startOfMonth(next));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">Календарь</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight capitalize sm:text-4xl">
            {format(month, "LLLL yyyy", { locale: ru })}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => selectMonth(startOfMonth(today))}
          >
            Сегодня
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Предыдущий месяц"
            onClick={() => selectMonth(addMonths(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Следующий месяц"
            onClick={() => selectMonth(addMonths(month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-3 shadow-sm sm:p-5">
        <div className="grid grid-cols-7 gap-1 pb-2 text-center text-xs font-bold uppercase text-muted-foreground">
          {WEEK_HEADERS.map((header) => (
            <span key={header}>{header}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const items = dayItems[format(day, "yyyy-MM-dd")] ?? [];
            const isSelected = isSameDay(day, selected);
            const isToday = isSameDay(day, today);
            const visible = items.slice(0, MAX_TITLES_PER_DAY);
            const hidden = items.length - visible.length;
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelected(day)}
                aria-pressed={isSelected}
                className={cn(
                  "flex min-h-24 min-w-0 flex-col items-stretch gap-1 overflow-hidden rounded-2xl p-1.5 text-left text-sm transition-colors sm:min-h-28 sm:p-2",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                  !isSameMonth(day, month) && !isSelected && "text-muted-foreground/50",
                )}
              >
                <span
                  className={cn(
                    "font-bold tabular-nums",
                    isToday && !isSelected && "text-primary",
                  )}
                >
                  {format(day, "d")}
                </span>
                {visible.map(({ task, done }) => (
                  <span
                    key={task.id}
                    className={cn(
                      "truncate rounded-md px-1 py-0.5 text-[10px] font-semibold leading-tight sm:text-[11px]",
                      isSelected
                        ? "bg-primary-foreground/15"
                        : done
                          ? "bg-success/15 text-success"
                          : "bg-muted text-foreground",
                      done && "line-through decoration-1",
                    )}
                  >
                    {task.title}
                  </span>
                ))}
                {hidden > 0 && (
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      isSelected ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    +{hidden}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="font-bold capitalize">
          {format(selected, "EEEE, d MMMM", { locale: ru })}
        </p>
        {selectedItems.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Задач нет</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {selectedItems.map(({ task, done }) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => toggleTask(task.id, selected)}
                  className="flex w-full items-center gap-3 rounded-xl px-1 py-1.5 text-left hover:bg-muted"
                >
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
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
