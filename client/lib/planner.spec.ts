import { describe, expect, it } from "vitest";
import {
  isCompletedOn,
  tasksOn,
  toggleCompletion,
  type Task,
} from "@/lib/planner";

const monday = new Date(2026, 10, 9);
const wednesday = new Date(2026, 10, 11);

const weekly: Task = {
  id: "w",
  title: "Уборка",
  kind: "weekly",
  date: null,
  weekdays: [1, 3],
  createdAt: 1,
};

const daily: Task = { ...weekly, id: "d", kind: "daily", weekdays: [1, 3] };

describe("planner", () => {
  it("shows recurring tasks only on their weekdays", () => {
    expect(tasksOn([weekly, daily], monday)).toHaveLength(2);
    expect(tasksOn([weekly, daily], new Date(2026, 10, 10))).toHaveLength(0);
  });

  it("marks a weekly task done only on the day it was checked", () => {
    const completions = toggleCompletion({}, weekly, monday);
    expect(isCompletedOn(weekly, completions, monday)).toBe(true);
    expect(isCompletedOn(weekly, completions, wednesday)).toBe(false);
  });

  it("unchecks a task on the same day only", () => {
    const completions = toggleCompletion({}, daily, monday);
    const undone = toggleCompletion(completions, daily, monday);
    expect(isCompletedOn(daily, undone, monday)).toBe(false);
  });

  it("tracks daily tasks per day", () => {
    const completions = toggleCompletion({}, daily, monday);
    expect(isCompletedOn(daily, completions, monday)).toBe(true);
    expect(isCompletedOn(daily, completions, wednesday)).toBe(false);
  });
});
