import { useEffect, useReducer, useState } from "react";
import { Board } from "./components/Board";
import { TaskDialog, type Editing } from "./components/TaskDialog";
import { boardReducer, initialState } from "./store/boardReducer";
import type { BoardState, Priority, Task } from "./types";

const KEY = "tablero-react:v1";

function loadState(): BoardState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as BoardState;
    return parsed?.tasks && parsed?.columns ? parsed : initialState;
  } catch {
    return initialState;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(boardReducer, undefined, loadState);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<"" | Priority>("");
  const [editing, setEditing] = useState<Editing>(null);
  const [theme, setTheme] = useState<"light" | "dark" | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignorar */
    }
  }, [state]);

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
  }, [theme]);

  const q = query.trim().toLowerCase();
  const filtering = q !== "" || priority !== "";
  const matches = (t: Task) =>
    (!priority || t.priority === priority) && (`${t.title} ${t.description}`).toLowerCase().includes(q);

  const save = (data: Omit<Task, "id">, id?: string) => {
    if (id) dispatch({ type: "update", task: { id, ...data } });
    else dispatch({ type: "add", task: { id: crypto.randomUUID(), ...data } });
    setEditing(null);
  };

  const remove = (id: string) => {
    if (confirm("¿Eliminar esta tarea?")) dispatch({ type: "delete", id });
  };

  const toggleTheme = () => {
    const dark = theme ? theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(dark ? "light" : "dark");
  };

  return (
    <>
      <header>
        <h1>Tablero</h1>
        <div className="tools">
          <input className="f search" type="search" placeholder="Buscar tareas" aria-label="Buscar tareas" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="f search" aria-label="Filtrar por prioridad" value={priority} onChange={(e) => setPriority(e.target.value as "" | Priority)}>
            <option value="">Todas las prioridades</option>
            <option value="alta">alta</option>
            <option value="media">media</option>
            <option value="baja">baja</option>
          </select>
          <button onClick={toggleTheme}>Tema</button>
          <button className="primary" onClick={() => setEditing("new")}>Nueva tarea</button>
        </div>
      </header>
      {filtering && <p className="hint">Hay un filtro activo: el arrastre está desactivado.</p>}
      <Board state={state} dispatch={dispatch} filtering={filtering} matches={matches} onEdit={setEditing} onDelete={remove} />
      <TaskDialog editing={editing} onSave={save} onClose={() => setEditing(null)} />
    </>
  );
}
