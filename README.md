# Tablero

Tablero Kanban hecho con React, TypeScript, Vite y dnd-kit.

## Ejecutar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # comprobación de tipos + build de producción
```

## Estructura

```
src/
  types.ts                 modelo de datos
  store/boardReducer.ts    lógica pura del tablero (add, update, delete, move)
  hooks/useLocalStorage.ts hook reutilizable
  components/
    Board.tsx              DndContext y lógica de arrastre
    Column.tsx             zona soltable + lista ordenable
    Card.tsx               tarjeta ordenable
    TaskDialog.tsx         formulario de crear/editar
  App.tsx                  estado, filtros y persistencia
```

## Decisiones técnicas

- **Estado normalizado**: `tasks` por id y `columns` con el orden de ids. Mover una tarea solo toca arreglos de ids.
- **Reducer puro**: la lógica de `move` es testeable sin React.
- **dnd-kit**: sensores de puntero y teclado (accesible), `DragOverlay` y reordenamiento entre y dentro de columnas.
- Con filtros activos el arrastre se desactiva para evitar índices inconsistentes.
