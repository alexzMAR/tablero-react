import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ColumnId, Task } from "../types";
import { Card } from "./Card";

interface Props {
  id: ColumnId;
  title: string;
  tasks: Task[]; // tareas visibles (ya filtradas)
  dragDisabled: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function Column({ id, title, tasks, dragDisabled, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section ref={setNodeRef} className={`col${isOver ? " over" : ""}`} aria-label={title}>
      <h2>
        {title} <span>{tasks.length}</span>
      </h2>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((t) => (
          <Card key={t.id} task={t} done={id === "done"} disabled={dragDisabled} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </SortableContext>
      {tasks.length === 0 && <div className="empty">Arrastra una tarea aquí.</div>}
    </section>
  );
}
