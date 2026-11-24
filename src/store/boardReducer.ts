import type { BoardState, ColumnId, Task } from "../types";

export type Action =
  | { type: "add"; task: Task }
  | { type: "update"; task: Task }
  | { type: "delete"; id: string }
  | { type: "move"; id: string; to: ColumnId; index: number };

export function findColumn(state: BoardState, id: string): ColumnId | undefined {
  if (id in state.columns) return id as ColumnId;
  return (Object.keys(state.columns) as ColumnId[]).find((c) => state.columns[c].includes(id));
}

export function boardReducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case "add":
      return {
        tasks: { ...state.tasks, [action.task.id]: action.task },
        columns: { ...state.columns, todo: [...state.columns.todo, action.task.id] },
      };
    case "update":
      return { ...state, tasks: { ...state.tasks, [action.task.id]: action.task } };
    case "delete": {
      const { [action.id]: _removed, ...tasks } = state.tasks;
      const columns = { ...state.columns };
      (Object.keys(columns) as ColumnId[]).forEach((c) => {
        columns[c] = columns[c].filter((id) => id !== action.id);
      });
      return { tasks, columns };
    }
    case "move": {
      const from = findColumn(state, action.id);
      if (!from) return state;
      const source = state.columns[from].filter((id) => id !== action.id);
      const dest = from === action.to ? source : [...state.columns[action.to]];
      const i = Math.min(Math.max(action.index, 0), dest.length);
      dest.splice(i, 0, action.id);
      return { ...state, columns: { ...state.columns, [from]: source, [action.to]: dest } };
    }
  }
}

export const initialState: BoardState = {
  tasks: {
    a: { id: "a", title: "Diseñar el modelo de datos", description: "Usuarios, tableros, columnas y tareas", priority: "alta", due: "" },
    b: { id: "b", title: "Escribir el README", description: "Capturas, stack y cómo ejecutarlo", priority: "media", due: "" },
    c: { id: "c", title: "Maquetar el tablero", description: "", priority: "baja", due: "" },
  },
  columns: { todo: ["b"], doing: ["a"], done: ["c"] },
};
