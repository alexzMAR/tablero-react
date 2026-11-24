import { useEffect, useRef, useState } from "react";
import type { Priority, Task } from "../types";

export type Editing = Task | "new" | null;

interface Props {
  editing: Editing;
  onSave: (data: Omit<Task, "id">, id?: string) => void;
  onClose: () => void;
}

export function TaskDialog({ editing, onSave, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (editing && !d.open) d.showModal();
    if (!editing && d.open) d.close();
  }, [editing]);

  return (
    <dialog ref={ref} onClose={onClose}>
      {editing && (
        <TaskForm
          key={editing === "new" ? "new" : editing.id}
          task={editing === "new" ? undefined : editing}
          onSave={onSave}
          onCancel={onClose}
        />
      )}
    </dialog>
  );
}

interface FormProps {
  task?: Task;
  onSave: Props["onSave"];
  onCancel: () => void;
}

function TaskForm({ task, onSave, onCancel }: FormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "media");
  const [due, setDue] = useState(task?.due ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), priority, due }, task?.id);
  };

  return (
    <form onSubmit={submit}>
      <h2 className="dialog-title">{task ? "Editar tarea" : "Nueva tarea"}</h2>
      <label htmlFor="t">Título</label>
      <input id="t" className="f" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required autoFocus />
      <label htmlFor="d">Descripción</label>
      <textarea id="d" className="f" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
      <label htmlFor="p">Prioridad</label>
      <select id="p" className="f" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
        <option value="baja">baja</option>
        <option value="media">media</option>
        <option value="alta">alta</option>
      </select>
      <label htmlFor="due">Fecha límite</label>
      <input id="due" className="f" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <div className="row">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary">Guardar tarea</button>
      </div>
    </form>
  );
}
