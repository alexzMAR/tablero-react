CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '',
  priority    text NOT NULL CHECK (priority IN ('alta','media','baja')),
  due         date,
  column_id   text NOT NULL CHECK (column_id IN ('todo','doing','done')),
  position    integer NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_column_position ON tasks (column_id, position);