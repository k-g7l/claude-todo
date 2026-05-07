'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Todo, FilterStatus } from '@/lib/types';
import TodoForm from '@/components/TodoForm';
import FilterTabs from '@/components/FilterTabs';
import TodoList from '@/components/TodoList';

function TodoApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const filter = (searchParams.get('filter') ?? 'all') as FilterStatus;

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/todos?filter=${filter}`);
      const data = await res.json();
      setTodos(data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  function handleFilterChange(next: FilterStatus) {
    router.push(`/?filter=${next}`);
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

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
        Todo List
      </h1>
      <div className="flex flex-col gap-6">
        <TodoForm onAdded={fetchTodos} />
        <FilterTabs current={filter} onChange={handleFilterChange} />
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
        ) : (
          <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
        )}
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
