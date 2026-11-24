import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { pool } from "../db.js";

export const tasksRouter = Router();

const taskInput = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).default(""),
  priority: z.enum(["alta", "media", "baja"]),
  due: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]).default(""),
});
const moveInput = z.object({
  columnId: z.enum(["todo", "doing", "done"]),
  index: z.number().int().min(0),
});

// Express 4 no captura errores async solos: este wrapper los pasa al manejador global.
const ah = (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);

const FIELDS = `id, title, description, priority, coalesce(to_char(due,'YYYY-MM-DD'), '') AS due`;

// Devuelve el tablero con la misma forma que usa el frontend: { tasks, columns }
tasksRouter.get("/board", ah(async (_req, res) => {
  const { rows } = await pool.query(`SELECT ${FIELDS}, column_id FROM tasks ORDER BY column_id, position`);
  const tasks: Record<string, unknown> = {};
  const columns: Record<string, string[]> = { todo: [], doing: [], done: [] };
  for (const { column_id, ...t } of rows) {
    tasks[t.id] = t;
    columns[column_id].push(t.id);
  }
  res.json({ tasks, columns });
}));

tasksRouter.post("/tasks", ah(async (req, res) => {
  const t = taskInput.parse(req.body);
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, description, priority, due, column_id, position)
     VALUES ($1, $2, $3, NULLIF($4, '')::date, 'todo',
             (SELECT COALESCE(MAX(position) + 1, 0) FROM tasks WHERE column_id = 'todo'))
     RETURNING ${FIELDS}`,
    [t.title, t.description, t.priority, t.due],
  );
  res.status(201).json(rows[0]);
}));

tasksRouter.put("/tasks/:id", ah(async (req, res) => {
  const t = taskInput.parse(req.body);
  const { rows } = await pool.query(
    `UPDATE tasks SET title=$1, description=$2, priority=$3, due=NULLIF($4,'')::date
     WHERE id=$5 RETURNING ${FIELDS}`,
    [t.title, t.description, t.priority, t.due, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: "No encontrada" });
  res.json(rows[0]);
}));

tasksRouter.delete("/tasks/:id", ah(async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM tasks WHERE id=$1", [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: "No encontrada" });
  res.status(204).end();
}));

// Mueve una tarea a (columna, índice) y renumera las posiciones en una transacción.
tasksRouter.patch("/tasks/:id/move", ah(async (req, res) => {
  const { columnId, index } = moveInput.parse(req.body);
  const id = req.params.id;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const exists = await client.query("SELECT 1 FROM tasks WHERE id=$1 FOR UPDATE", [id]);
    if (!exists.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "No encontrada" });
    }
    const { rows } = await client.query(
      "SELECT id FROM tasks WHERE column_id=$1 AND id<>$2 ORDER BY position", [columnId, id],
    );
    const ids: string[] = rows.map((r) => r.id);
    ids.splice(Math.min(index, ids.length), 0, id);
    for (let i = 0; i < ids.length; i++) {
      await client.query("UPDATE tasks SET column_id=$1, position=$2 WHERE id=$3", [columnId, i, ids[i]]);
    }
    await client.query("COMMIT");
    res.status(204).end();
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}));