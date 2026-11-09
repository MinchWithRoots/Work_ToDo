import { KIND_OPTIONS, WEEKDAYS, type TaskKind } from "@/lib/planner";
import { cn } from "@/lib/utils";

export function KindSelector({
  value,
  onChange,
}: {
  value: TaskKind;
  onChange: (kind: TaskKind) => void;
}) {
  return (
    <div
      role="radiogroup"
      className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1"
    >
      {KIND_OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-xl px-2 text-sm font-semibold transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function WeekdayPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (weekdays: number[]) => void;
}) {
  const toggle = (day: number) =>
    onChange(
      value.includes(day)
        ? value.filter((item) => item !== day)
        : [...value, day],
    );

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {WEEKDAYS.map((day) => {
        const active = value.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(day.value)}
            className={cn(
              "h-9 rounded-xl text-xs font-bold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {day.short}
          </button>
        );
      })}
    </div>
  );
}
