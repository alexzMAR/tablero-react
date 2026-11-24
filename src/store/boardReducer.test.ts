import { describe, it, expect } from "vitest";
import { boardReducer } from "./boardReducer";
import type { BoardState, Task } from "../types";

const task = (id: string): Task => ({
  id, title: `Tarea ${id}`, description: "", priority: "media", due: "",
});

const base: BoardState = {
  tasks: { a: task("a"), b: task("b"), c: task("c") },
  columns: { todo: ["a", "b"], doing: ["c"], done: [] },
};

describe("boardReducer", () => {
  it("add: agrega la tarea al final de 'todo'", () => {
    const next = boardReducer(base, { type: "add", task: task("d") });
    expect(next.tasks.d).toBeDefined();
    expect(next.columns.todo).toEqual(["a", "b", "d"]);
  });

  it("update: cambia los datos sin tocar el orden", () => {
    const next = boardReducer(base, { type: "update", task: { ...task("a"), title: "Nuevo" } });
    expect(next.tasks.a.title).toBe("Nuevo");
    expect(next.columns).toEqual(base.columns);
  });

  it("delete: elimina la tarea de tasks y de la columna", () => {
    const next = boardReducer(base, { type: "delete", id: "a" });
    expect(next.tasks.a).toBeUndefined();
    expect(next.columns.todo).toEqual(["b"]);
  });

  it("move: reordena dentro de la misma columna", () => {
    const next = boardReducer(base, { type: "move", id: "a", to: "todo", index: 1 });
    expect(next.columns.todo).toEqual(["b", "a"]);
  });

  it("move: pasa una tarea a otra columna en una posición", () => {
    const next = boardReducer(base, { type: "move", id: "a", to: "doing", index: 0 });
    expect(next.columns.todo).toEqual(["b"]);
    expect(next.columns.doing).toEqual(["a", "c"]);
  });

  it("move: funciona con una columna vacía", () => {
    const next = boardReducer(base, { type: "move", id: "c", to: "done", index: 0 });
    expect(next.columns.doing).toEqual([]);
    expect(next.columns.done).toEqual(["c"]);
  });

  it("move: limita el índice si se pasa del final", () => {
    const next = boardReducer(base, { type: "move", id: "a", to: "doing", index: 99 });
    expect(next.columns.doing).toEqual(["c", "a"]);
  });

  it("move: ignora ids desconocidos", () => {
    expect(boardReducer(base, { type: "move", id: "zzz", to: "done", index: 0 })).toBe(base);
  });

  it("no muta el estado original", () => {
    const copy = structuredClone(base);
    boardReducer(base, { type: "move", id: "a", to: "doing", index: 0 });
    expect(base).toEqual(copy);
  });
});