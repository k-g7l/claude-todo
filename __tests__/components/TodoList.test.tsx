import React from 'react';
import { render, screen } from '@testing-library/react';
import TodoList from '@/components/TodoList';
import type { Todo } from '@/lib/types';

const todos: Todo[] = [
  { id: 1, title: 'First', due_date: null, priority: 'low', completed: false, created_at: '', folder_id: null },
  { id: 2, title: 'Second', due_date: null, priority: 'high', completed: true, created_at: '', folder_id: null },
];

describe('TodoList', () => {
  it('renders all todos', () => {
    render(<TodoList todos={todos} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('shows empty state when list is empty', () => {
    render(<TodoList todos={[]} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/no todos/i)).toBeInTheDocument();
  });
});
