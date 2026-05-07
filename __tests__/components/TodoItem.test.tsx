import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '@/components/TodoItem';
import type { Todo } from '@/lib/types';

const todo: Todo = {
  id: 1,
  title: 'Write unit tests',
  due_date: '2026-12-31',
  priority: 'high',
  completed: false,
  created_at: '2026-05-01 00:00:00',
};

describe('TodoItem', () => {
  it('renders the title', () => {
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Write unit tests')).toBeInTheDocument();
  });

  it('renders the due date', () => {
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/2026-12-31/)).toBeInTheDocument();
  });

  it('renders the priority badge', () => {
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('calls onToggle with correct args when checkbox clicked', () => {
    const onToggle = jest.fn();
    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={() => {}} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = jest.fn();
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText(/delete/i));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('shows strikethrough when completed', () => {
    const completedTodo = { ...todo, completed: true };
    render(<TodoItem todo={completedTodo} onToggle={() => {}} onDelete={() => {}} />);
    const title = screen.getByText('Write unit tests');
    expect(title.className).toMatch(/line-through/);
  });
});
