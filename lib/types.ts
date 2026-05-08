export type Priority = 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'active' | 'completed';

export interface Folder {
  id: number;
  name: string;
  created_at: string;
}

export interface Todo {
  id: number;
  title: string;
  due_date: string | null;
  priority: Priority;
  completed: boolean;
  created_at: string;
  folder_id: number | null;
}
