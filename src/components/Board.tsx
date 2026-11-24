import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { COLUMNS, type BoardState, type Task } from "../types";
import { findColumn, type Action } from "../store/boardReducer";
import { Column } from "./Column";
import { CardBody } from "./Card";

interface Props {
  state: BoardState;
  dispatch: React.Dispatch<Action>;
  filtering: boolean;
  matches: (task: Task) => boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function Board({ state, dispatch, filtering, matches, onEdit, onDelete }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    // distance evita que un clic en "Editar" se interprete como arrastre
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  // Mientras se arrastra sobre otra columna, movemos la tarjeta para que la lista "haga espacio".
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeCol = findColumn(state, String(active.id));
    const overCol = findColumn(state, String(over.id));
    if (!activeCol || !overCol || activeCol === overCol) return;

    const overIsColumn = over.id === overCol;
    const index = overIsColumn ? state.columns[overCol].length : state.columns[overCol].indexOf(String(over.id));
    dispatch({ type: "move", id: String(active.id), to: overCol, index });
  };

  // Al soltar, reordenamos dentro de la misma columna.
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const col = findColumn(state, String(active.id));
    const overCol = findColumn(state, String(over.id));
    if (!col || col !== overCol) return;
    const index = over.id === col ? state.columns[col].length : state.columns[col].indexOf(String(over.id));
    dispatch({ type: "move", id: String(active.id), to: col, index });
  };

  const activeTask = activeId ? state.tasks[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <main className="board">
        {COLUMNS.map(({ id, title }) => (
          <Column
            key={id}
            id={id}
            title={title}
            tasks={state.columns[id].map((tid) => state.tasks[tid]).filter(matches)}
            dragDisabled={filtering}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </main>
      <DragOverlay>
        {activeTask && (
          <div className={`card ${activeTask.priority} overlay`}>
            <CardBody task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
