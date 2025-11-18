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

async function fetchTodayTask(): Promise<{ task: DailyTask }> {
  const response = await fetch('/api/tasks/today');
  if (!response.ok) throw new Error('Failed to fetch today task');
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

// Hooks
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false,
  });
}

export function useTaskTemplates() {
  return useQuery({
    queryKey: ['taskTemplates'],
    queryFn: fetchTaskTemplates,
    select: (data) => data.filter((t) => t.isActive),
  });
}

export function useTodayTask() {
  return useQuery({
    queryKey: ['todayTask'],
    queryFn: fetchTodayTask,
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
      await queryClient.cancelQueries({ queryKey: ['todayTask'] });

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData(['todayTask']);

      // Optimistically update to the new value while maintaining order
      queryClient.setQueryData(
        ['todayTask'],
        (old: { task: DailyTask } | undefined) => {
          if (!old?.task?.taskCompletions) return old;

          // Keep the original order, just update the completed status
          return {
            ...old,
            task: {
              ...old.task,
              taskCompletions: old.task.taskCompletions.map(
                (tc: TaskCompletion) =>
                  tc.id === completionId ? { ...tc, completed } : tc,
              ),
            },
          };
        },
      );

      return { previousTask };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(['todayTask'], context.previousTask);
      }
    },
    onSuccess: () => {
      // Don't invalidate immediately, let optimistic update persist
      // This prevents the list from jumping during the update
    },
    onSettled: () => {
      // Refetch in background to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['todayTask'] });
    },
  });
}

export type { TaskTemplate, TaskCompletion, DailyTask, User };
