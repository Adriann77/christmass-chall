import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface TaskTemplate {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

interface TaskCompletion {
  id: string;
  completed: boolean;
  taskTemplate: TaskTemplate;
}

interface DailyTask {
  id: string;
  date: string;
  steps: boolean;
  training: boolean;
  diet: boolean;
  book: boolean;
  learning: boolean;
  water: boolean;
  spendings: unknown[];
  taskCompletions?: TaskCompletion[];
}

interface User {
  id: string;
  username: string;
  name: string;
  challengeStartDate: string;
}

// API Functions
async function fetchUser(): Promise<{ user: User | null }> {
  const response = await fetch('/api/auth/me');
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

async function fetchTaskTemplates(): Promise<TaskTemplate[]> {
  const response = await fetch('/api/task-templates');
  if (!response.ok) throw new Error('Failed to fetch task templates');
  return response.json();
}

async function fetchDailyTask(date?: Date): Promise<{ task: DailyTask }> {
  const params = date ? `?date=${date.toISOString()}` : '';
  const response = await fetch(`/api/tasks/today${params}`);
  if (!response.ok) throw new Error('Failed to fetch daily task');
  return response.json();
}

async function updateTaskCompletion(
  completionId: string,
  completed: boolean,
): Promise<TaskCompletion> {
  const response = await fetch(`/api/task-completions/${completionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) throw new Error('Failed to update task completion');
  return response.json();
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false,
  });
}

export function useDailyTask(date?: Date) {
  return useQuery({
    queryKey: ['dailyTask', date?.toISOString().split('T')[0]],
    queryFn: () => fetchDailyTask(date),
  });
}

export function useToggleTaskCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      completionId,
      completed,
    }: {
      completionId: string;
      completed: boolean;
    }) => updateTaskCompletion(completionId, completed),
    onMutate: async ({ completionId, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['dailyTask'] });

      // Snapshot the previous value
      // Note: We can't easily optimistically update for all dates without the date context here
      // So we'll skip complex optimistic updates for now or implement a simpler one if needed
      // For now, let's just rely on invalidation or simple cache update if we know the key
    },
    onSuccess: () => {
      // Invalidate all daily tasks to be safe
      queryClient.invalidateQueries({ queryKey: ['dailyTask'] });
    },
  });
}


export type { TaskTemplate, TaskCompletion, DailyTask, User };
