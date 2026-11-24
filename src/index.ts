import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { tasksRouter } from "./routes/tasks.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());
app.use("/api", tasksRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) return res.status(400).json({ error: "Datos inválidos", details: err.issues });
  console.error(err);
  res.status(500).json({ error: "Error interno" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`API en http://localhost:${port}`));