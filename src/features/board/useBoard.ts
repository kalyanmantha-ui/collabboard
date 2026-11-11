import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api";
import type { BoardDetail, NewTaskInput, Status, Task, TaskPatch } from "../../types";

type Phase = "loading" | "error" | "ready";

function applyMove(tasks: Task[], id: string, status: Status, toIndex: number): Task[] {
  const moving = tasks.find((t) => t.id === id);
  if (!moving) return tasks;
  const rest = tasks.filter((t) => t.id !== id);
  const target = rest.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
  target.splice(Math.max(0, Math.min(toIndex, target.length)), 0, {
    ...moving,
    status,
    completedAt: status === "done" ? (moving.completedAt ?? new Date().toISOString().slice(0, 10)) : null,
  });
  const renumbered = new Map<string, Task>();
  target.forEach((t, i) => renumbered.set(t.id, { ...t, order: i }));
  const source = rest.filter((t) => t.status === moving.status && moving.status !== status).sort((a, b) => a.order - b.order);
  source.forEach((t, i) => renumbered.set(t.id, { ...t, order: i }));
  return [...rest.filter((t) => !renumbered.has(t.id)), ...renumbered.values()];
}

export function useBoard(boardId: string) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [data, setData] = useState<BoardDetail | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setPhase("loading");
    api.getBoard(boardId).then(
      (d) => {
        if (id !== requestId.current) return;
        setData(d);
        setPhase("ready");
      },
      () => {
        if (id !== requestId.current) return;
        setPhase("error");
      },
    );
  }, [boardId]);

  useEffect(load, [load]);

  const setTasks = (fn: (t: Task[]) => Task[]) => setData((d) => (d ? { ...d, tasks: fn(d.tasks) } : d));

  async function optimistic(apply: () => void, call: () => Promise<unknown>, message: string) {
    apply();
    try {
      await call();
    } catch {
      setActionError(message);
      const fresh = await api.getBoard(boardId).catch(() => null);
      if (fresh) setData(fresh);
    }
  }

  return {
    phase,
    data,
    reload: load,
    actionError,
    clearActionError: () => setActionError(null),

    moveTask: (id: string, status: Status, index: number) =>
      optimistic(() => setTasks((t) => applyMove(t, id, status, index)), () => api.moveTask(id, status, index), "Couldn't move that task. It was put back."),

    updateTask: (id: string, patch: TaskPatch) =>
      optimistic(
        () =>
          setTasks((all) => {
            const cur = all.find((t) => t.id === id);
            if (cur && patch.status && patch.status !== cur.status) {
              const end = all.filter((t) => t.status === patch.status).length;
              return applyMove(all, id, patch.status, end).map((t) => (t.id === id ? { ...t, ...patch } : t));
            }
            return all.map((t) => (t.id === id ? { ...t, ...patch } : t));
          }),
        () => api.updateTask(id, patch),
        "Couldn't save that change.",
      ),

    async createTask(input: NewTaskInput, userId: string) {
      const task = await api.createTask(boardId, input, userId);
      setTasks((t) => [...t, task]);
      return task;
    },

    deleteTask: (id: string) => optimistic(() => setTasks((t) => t.filter((x) => x.id !== id)), () => api.deleteTask(id), "Couldn't delete that task."),

    async addComment(taskId: string, authorId: string, body: string) {
      const c = await api.addComment(taskId, authorId, body);
      setTasks((all) => all.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, c] } : t)));
    },
  };
}
