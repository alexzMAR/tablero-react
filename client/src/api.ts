import type { BoardState, ColumnId, Task } from "./types";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

type TaskData = Omit<Task, "id">;

export const api = {
  board: () => req<BoardState>("/api/board"),
  create: (t: TaskData) => req<Task>("/api/tasks", { method: "POST", body: JSON.stringify(t) }),
  update: (t: Task) => req<Task>(`/api/tasks/${t.id}`, { method: "PUT", body: JSON.stringify(t) }),
  remove: (id: string) => req<void>(`/api/tasks/${id}`, { method: "DELETE" }),
  move: (id: string, columnId: ColumnId, index: number) =>
    req<void>(`/api/tasks/${id}/move`, { method: "PATCH", body: JSON.stringify({ columnId, index }) }),
};