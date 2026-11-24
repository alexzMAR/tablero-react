import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

interface BodyProps {
  task: Task;
  done?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

/** Contenido visual de la tarjeta. Se reutiliza en el DragOverlay. */
export function CardBody({ task, done, onEdit, onDelete }: BodyProps) {
  const today = new Date().toISOString().slice(0, 10);
  const late = task.due !== "" && task.due < today && !done;
  return (
    <>
      <b>{task.title}</b>
      {task.description && <p>{task.description}</p>}
      <div className="meta">
        <span className={late ? "late" : ""}>
          {task.due ? `Vence ${task.due}` : "Sin fecha"} · {task.priority}
        </span>
        {onEdit && onDelete && (
          <span>
            <button onClick={() => onEdit(task)}>Editar</button>{" "}
            <button onClick={() => onDelete(task.id)} aria-label={`Eliminar ${task.title}`}>
              Eliminar
            </button>
          </span>
        )}
      </div>
    </>
  );
}

interface Props extends BodyProps {
  disabled: boolean;
}

export function Card({ task, done, disabled, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled,
  });

  return (
    <article
      ref={setNodeRef}
      className={`card ${task.priority}${isDragging ? " dragging" : ""}${disabled ? "" : " draggable"}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <CardBody task={task} done={done} onEdit={onEdit} onDelete={onDelete} />
    </article>
  );
}
