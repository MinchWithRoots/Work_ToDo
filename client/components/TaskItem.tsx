import { Check, Trash2 } from "lucide-react";
import { describeWeekdays, type Task } from "@/lib/planner";
import { cn } from "@/lib/utils";

function scheduleLabel(task: Task) {
  if (task.kind === "daily") {
    return task.weekdays.length === 7
      ? "Каждый день"
      : `Дни: ${describeWeekdays(task.weekdays)}`;
  }
  if (task.kind === "weekly") {
    return `Дни: ${describeWeekdays(task.weekdays)}`;
  }
  return null;
}

interface TaskItemProps {
  task: Task;
  done: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

export function TaskItem({ task, done, onToggle, onRemove }: TaskItemProps) {
  const label = scheduleLabel(task);

  return (
    <li className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm transition-colors hover:border-foreground/15">
      <button
        type="button"
        aria-pressed={done}
        aria-label={
          done ? "Отметить как невыполненную" : "Отметить как выполненную"
        }
        onClick={onToggle}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          done
            ? "border-success bg-success text-success-foreground"
            : "border-foreground/25 hover:border-primary",
        )}
      >
        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "break-words text-[15px] font-semibold transition-colors",
            done && "text-muted-foreground line-through decoration-2",
          )}
        >
          {task.title}
        </p>
        {label && (
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {label}
          </p>
        )}
      </div>
      <button
        type="button"
        aria-label="Удалить задачу"
        onClick={onRemove}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
