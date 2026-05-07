export type Priority = 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'active' | 'completed';

export interface Todo {
  id: number;
  title: string;
  due_date: string | null;
  priority: Priority;
  completed: boolean;
  created_at: string;
}
