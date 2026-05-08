import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FolderSidebar from '@/components/FolderSidebar';
import type { Folder } from '@/lib/types';

const folders: Folder[] = [
  { id: 1, name: 'Work', created_at: '2026-05-01 00:00:00' },
  { id: 2, name: 'Personal', created_at: '2026-05-01 00:00:00' },
];

describe('FolderSidebar', () => {
  it('renders All Todos and folder list', () => {
    render(
      <FolderSidebar
        folders={folders}
        selectedFolderId={null}
        onSelect={() => {}}
        onCreateFolder={() => {}}
        onDeleteFolder={() => {}}
      />
    );
    expect(screen.getByText('All Todos')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('highlights All Todos when selectedFolderId is null', () => {
    render(
      <FolderSidebar
        folders={folders}
        selectedFolderId={null}
        onSelect={() => {}}
        onCreateFolder={() => {}}
        onDeleteFolder={() => {}}
      />
    );
    const allBtn = screen.getByText('All Todos');
    expect(allBtn.className).toMatch(/bg-blue/);
  });

  it('highlights selected folder', () => {
    render(
      <FolderSidebar
        folders={folders}
        selectedFolderId={1}
        onSelect={() => {}}
        onCreateFolder={() => {}}
        onDeleteFolder={() => {}}
      />
    );
    const workBtn = screen.getByText('Work');
    expect(workBtn.className).toMatch(/bg-blue/);
  });

  it('calls onSelect with null when All Todos clicked', () => {
    const onSelect = jest.fn();
    render(
      <FolderSidebar
        folders={folders}
        selectedFolderId={null}
        onSelect={onSelect}
        onCreateFolder={() => {}}
        onDeleteFolder={() => {}}
      />
    );
    fireEvent.click(screen.getByText('All Todos'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('calls onSelect with folder id when folder clicked', () => {
    const onSelect = jest.fn();
    render(
      <FolderSidebar
        folders={folders}
        selectedFolderId={null}
        onSelect={onSelect}
        onCreateFolder={() => {}}
        onDeleteFolder={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Work'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('calls onCreateFolder with name on form submit', () => {
    const onCreateFolder = jest.fn();
    render(
      <FolderSidebar
        folders={folders}
        selectedFolderId={null}
        onSelect={() => {}}
        onCreateFolder={onCreateFolder}
        onDeleteFolder={() => {}}
      />
    );
    fireEvent.change(screen.getByLabelText('New folder name'), {
      target: { value: 'Projects' },
    });
    fireEvent.submit(screen.getByLabelText('New folder name').closest('form')!);
    expect(onCreateFolder).toHaveBeenCalledWith('Projects');
  });

  it('calls onDeleteFolder with folder id when trash clicked', () => {
    const onDeleteFolder = jest.fn();
    render(
      <FolderSidebar
        folders={folders}
        selectedFolderId={null}
        onSelect={() => {}}
        onCreateFolder={() => {}}
        onDeleteFolder={onDeleteFolder}
      />
    );
    fireEvent.click(screen.getByLabelText('Delete folder "Work"'));
    expect(onDeleteFolder).toHaveBeenCalledWith(1);
  });
});
