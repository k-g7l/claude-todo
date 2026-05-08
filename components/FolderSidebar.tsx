'use client';

import { useState, FormEvent } from 'react';
import type { Folder } from '@/lib/types';

interface Props {
  folders: Folder[];
  selectedFolderId: number | null;
  onSelect: (id: number | null) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: number) => void;
}

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onSelect,
  onCreateFolder,
  onDeleteFolder,
}: Props) {
  const [newName, setNewName] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateFolder(newName.trim());
    setNewName('');
  }

  const itemBase =
    'flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors text-left';
  const activeStyle = 'bg-blue-100 text-blue-700 font-medium dark:bg-blue-900/40 dark:text-blue-300';
  const inactiveStyle =
    'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700';

  return (
    <nav className="flex flex-col gap-1 w-56 shrink-0">
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Folders
      </p>

      <button
        onClick={() => onSelect(null)}
        className={`${itemBase} ${selectedFolderId === null ? activeStyle : inactiveStyle}`}
        aria-current={selectedFolderId === null ? 'page' : undefined}
      >
        All Todos
      </button>

      {folders.map((folder) => (
        <div key={folder.id} className="group flex items-center gap-1">
          <button
            onClick={() => onSelect(folder.id)}
            className={`${itemBase} flex-1 ${selectedFolderId === folder.id ? activeStyle : inactiveStyle}`}
            aria-current={selectedFolderId === folder.id ? 'page' : undefined}
          >
            {folder.name}
          </button>
          <button
            onClick={() => onDeleteFolder(folder.id)}
            className="shrink-0 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all dark:text-gray-600"
            aria-label={`Delete folder "${folder.name}"`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="mt-2 flex gap-1">
        <input
          type="text"
          placeholder="New folder"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          aria-label="New folder name"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          +
        </button>
      </form>
    </nav>
  );
}
