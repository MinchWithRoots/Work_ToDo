import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { parseISO } from "date-fns";
import {
  DEFAULT_TEMPLATES,
  toDateKey,
  toggleCompletion,
  type NewTask,
  type NewTemplate,
  type PlannerState,
  type Task,
  type Template,
} from "@/lib/planner";

const STORAGE_KEY = "ritm:planner:v1";

type Action =
  | { type: "task/add"; task: Task }
  | { type: "task/remove"; id: string }
  | { type: "task/toggle"; id: string; dateKey: string }
  | { type: "template/add"; template: Template }
  | { type: "template/remove"; id: string };

function plannerReducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case "task/add":
      return { ...state, tasks: [...state.tasks, action.task] };
    case "task/remove": {
      const completions = { ...state.completions };
      delete completions[action.id];
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
        completions,
      };
    }
    case "task/toggle": {
      const task = state.tasks.find((item) => item.id === action.id);
      if (!task) return state;
      return {
        ...state,
        completions: toggleCompletion(
          state.completions,
          task,
          parseISO(action.dateKey),
        ),
      };
    }
    case "template/add":
      return { ...state, templates: [...state.templates, action.template] };
    case "template/remove":
      return {
        ...state,
        templates: state.templates.filter((item) => item.id !== action.id),
      };
  }
}

function loadState(): PlannerState {
  const fallback: PlannerState = {
    tasks: [],
    templates: DEFAULT_TEMPLATES,
    completions: {},
  };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlannerState) : fallback;
  } catch {
    return fallback;
  }
}

function createId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface PlannerContextValue extends PlannerState {
  addTask: (task: NewTask) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string, date: Date) => void;
  addTemplate: (template: NewTemplate) => void;
  removeTemplate: (id: string) => void;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(plannerReducer, undefined, loadState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<PlannerContextValue>(
    () => ({
      ...state,
      addTask: (task) =>
        dispatch({
          type: "task/add",
          task: { ...task, id: createId(), createdAt: Date.now() },
        }),
      removeTask: (id) => dispatch({ type: "task/remove", id }),
      toggleTask: (id, date) =>
        dispatch({ type: "task/toggle", id, dateKey: toDateKey(date) }),
      addTemplate: (template) =>
        dispatch({
          type: "template/add",
          template: { ...template, id: createId() },
        }),
      removeTemplate: (id) => dispatch({ type: "template/remove", id }),
    }),
    [state],
  );

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlanner must be used within PlannerProvider");
  }
  return context;
}
