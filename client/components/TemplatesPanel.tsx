import { useState, type FormEvent } from "react";
import { getDay } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KindSelector, WeekdayPicker } from "@/components/RecurrenceFields";
import { KIND_OPTIONS, toDateKey, type Template } from "@/lib/planner";
import { usePlanner } from "@/lib/planner-context";
import { useTaskDraft } from "@/lib/use-task-draft";

export function TemplatesPanel({ date }: { date: Date }) {
  const { templates, addTask } = usePlanner();

  const applyTemplate = (template: Template) => {
    const isOnce = template.kind === "once";
    addTask({
      title: template.title,
      kind: template.kind,
      date: isOnce ? toDateKey(date) : null,
      weekdays: isOnce ? [] : template.weekdays,
    });
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">Шаблоны</h2>
        <TemplatesDialog />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Нажмите, чтобы добавить на выбранный день.
      </p>
      {templates.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Шаблонов пока нет. Создайте первый, чтобы не повторять одно и то же.
        </p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {templates.map((template) => (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => applyTemplate(template)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-left text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="break-words">{template.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TemplatesDialog() {
  const { templates, addTemplate, removeTemplate } = usePlanner();
  const [open, setOpen] = useState(false);
  const draft = useTaskDraft(getDay(new Date()), "daily");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.canSubmit) return;
    addTemplate({
      title: draft.title.trim(),
      kind: draft.kind,
      weekdays: draft.kind === "once" ? [] : draft.weekdays,
    });
    draft.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-full text-primary">
          Управлять
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            Шаблоны задач
          </DialogTitle>
          <DialogDescription>
            Сохраняйте задачи, которые повторяются, и добавляйте их в один клик.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <Input
            value={draft.title}
            onChange={(event) => draft.setTitle(event.target.value)}
            placeholder="Название шаблона"
            maxLength={120}
            aria-label="Название шаблона"
            className="h-11 rounded-2xl px-4 text-base"
          />
          <KindSelector value={draft.kind} onChange={draft.changeKind} />
          {draft.kind !== "once" && (
            <WeekdayPicker
              value={draft.weekdays}
              onChange={draft.setWeekdays}
            />
          )}
          <Button
            type="submit"
            disabled={!draft.canSubmit}
            className="h-11 w-full rounded-2xl font-bold"
          >
            Сохранить шаблон
          </Button>
        </form>

        {templates.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Ваши шаблоны
            </h3>
            <ul className="mt-3 space-y-2">
              {templates.map((template) => (
                <li
                  key={template.id}
                  className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold">
                      {template.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {
                        KIND_OPTIONS.find(
                          (option) => option.value === template.kind,
                        )?.label
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Удалить шаблон"
                    onClick={() => removeTemplate(template.id)}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
