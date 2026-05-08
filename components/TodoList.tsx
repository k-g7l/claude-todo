'use client';

import type { Todo, Folder } from '@/lib/types';
import TodoItem from './TodoItem';

interface Props {
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  folders?: Folder[];
  onFolderChange?: (id: number, folderId: number | null) => void;
}

export default function TodoList({ todos, onToggle, onDelete, folders, onFolderChange }: Props) {
  if (todos.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 dark:text-gray-500">
        <p className="text-sm">No todos here. Add one above!</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          folders={folders}
          onFolderChange={onFolderChange}
        />
      ))}
    </ul>
  );
}
