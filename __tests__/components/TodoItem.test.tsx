import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '@/components/TodoItem';
import type { Todo, Folder } from '@/lib/types';

const todo: Todo = {
  id: 1,
  title: 'Write unit tests',
  due_date: '2026-12-31',
  priority: 'high',
  completed: false,
  created_at: '2026-05-01 00:00:00',
  folder_id: null,
};

const folders: Folder[] = [
  { id: 10, name: 'Work', created_at: '2026-05-01 00:00:00' },
  { id: 20, name: 'Personal', created_at: '2026-05-01 00:00:00' },
];

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

  it('renders folder dropdown when folders are provided', () => {
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={() => {}} folders={folders} />);
    expect(screen.getByLabelText(/folder for/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Personal' })).toBeInTheDocument();
  });

  it('shows current folder_id as selected value in dropdown', () => {
    const todoInFolder = { ...todo, folder_id: 10 };
    render(
      <TodoItem todo={todoInFolder} onToggle={() => {}} onDelete={() => {}} folders={folders} />
    );
    const select = screen.getByLabelText(/folder for/i) as HTMLSelectElement;
    expect(select.value).toBe('10');
  });

  it('calls onFolderChange with folder id when dropdown changes', () => {
    const onFolderChange = jest.fn();
    render(
      <TodoItem
        todo={todo}
        onToggle={() => {}}
        onDelete={() => {}}
        folders={folders}
        onFolderChange={onFolderChange}
      />
    );
    fireEvent.change(screen.getByLabelText(/folder for/i), { target: { value: '10' } });
    expect(onFolderChange).toHaveBeenCalledWith(1, 10);
  });

  it('calls onFolderChange with null when "None" selected', () => {
    const onFolderChange = jest.fn();
    const todoInFolder = { ...todo, folder_id: 10 };
    render(
      <TodoItem
        todo={todoInFolder}
        onToggle={() => {}}
        onDelete={() => {}}
        folders={folders}
        onFolderChange={onFolderChange}
      />
    );
    fireEvent.change(screen.getByLabelText(/folder for/i), { target: { value: '' } });
    expect(onFolderChange).toHaveBeenCalledWith(1, null);
  });

  it('does not render folder dropdown when no folders provided', () => {
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={() => {}} folders={[]} />);
    expect(screen.queryByLabelText(/folder for/i)).not.toBeInTheDocument();
  });
});
