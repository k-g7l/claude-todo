'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Todo, Folder, FilterStatus } from '@/lib/types';
import TodoForm from '@/components/TodoForm';
import FilterTabs from '@/components/FilterTabs';
import TodoList from '@/components/TodoList';
import FolderSidebar from '@/components/FolderSidebar';

function TodoApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const filter = (searchParams.get('filter') ?? 'all') as FilterStatus;
  const folderParam = searchParams.get('folder');
  const selectedFolderId = folderParam ? Number(folderParam) : null;

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/todos?filter=${filter}${selectedFolderId !== null ? `&folder=${selectedFolderId}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setTodos(data);
    } finally {
      setLoading(false);
    }
  }, [filter, selectedFolderId]);

  const fetchFolders = useCallback(async () => {
    const res = await fetch('/api/folders');
    const data = await res.json();
    setFolders(data);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  function handleFilterChange(next: FilterStatus) {
    const folderSuffix = selectedFolderId !== null ? `&folder=${selectedFolderId}` : '';
    router.push(`/?filter=${next}${folderSuffix}`);
  }

  function handleFolderSelect(id: number | null) {
    if (id === null) {
      router.push(`/?filter=${filter}`);
    } else {
      router.push(`/?filter=${filter}&folder=${id}`);
    }
  }

  async function handleToggle(id: number, completed: boolean) {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    fetchTodos();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    fetchTodos();
  }

  async function handleFolderChange(id: number, folderId: number | null) {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_id: folderId }),
    });
    fetchTodos();
  }

  async function handleCreateFolder(name: string) {
    await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    fetchFolders();
  }

  async function handleDeleteFolder(id: number) {
    await fetch(`/api/folders/${id}`, { method: 'DELETE' });
    await fetchFolders();
    fetchTodos();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
        Todo List
      </h1>
      <div className="flex gap-8">
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={handleFolderSelect}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
        />
        <div className="flex flex-1 flex-col gap-6">
          <TodoForm onAdded={fetchTodos} />
          <FilterTabs current={filter} onChange={handleFilterChange} />
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
          ) : (
            <TodoList
              todos={todos}
              onToggle={handleToggle}
              onDelete={handleDelete}
              folders={folders}
              onFolderChange={handleFolderChange}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <TodoApp />
    </Suspense>
  );
}
