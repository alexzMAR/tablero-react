export type ColumnId = "todo" | "doing" | "done";
export type Priority = "alta" | "media" | "baja";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  due: string; // YYYY-MM-DD o ""
}

/** Las tareas se guardan una sola vez; cada columna solo guarda el orden de sus ids. */
export interface BoardState {
  tasks: Record<string, Task>;
  columns: Record<ColumnId, string[]>;
}

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "Por hacer" },
  { id: "doing", title: "En progreso" },
  { id: "done", title: "Hecho" },
];
