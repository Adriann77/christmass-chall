import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Spending {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  createdAt: string;
}

interface DailyTask {
  id: string;
  date: string;
  spendings: Spending[];
}

// API Functions
async function fetchSpendings(dailyTaskId: string): Promise<Spending[]> {
  const response = await fetch(`/api/spendings?dailyTaskId=${dailyTaskId}`);
  if (!response.ok) throw new Error('Failed to fetch spendings');
  const data = await response.json();
  return data.spendings || [];
}

async function createSpending(data: {
  dailyTaskId: string;
  amount: number;
  category: string;
  description?: string;
}): Promise<Spending> {
  const response = await fetch('/api/spendings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create spending');
  const result = await response.json();
  return result.spending;
}

async function deleteSpending(spendingId: string): Promise<void> {
  const response = await fetch(`/api/spendings/${spendingId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete spending');
}

async function deleteDailyTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete daily task');
}

// Hooks
export function useSpendings(dailyTaskId: string | undefined) {
  return useQuery({
    queryKey: ['spendings', dailyTaskId],
    queryFn: () => fetchSpendings(dailyTaskId!),
    enabled: !!dailyTaskId,
  });
}

export function useCreateSpending() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSpending,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['spendings', variables.dailyTaskId],
      });
      queryClient.invalidateQueries({ queryKey: ['todayTask'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useDeleteSpending() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSpending,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] });
      queryClient.invalidateQueries({ queryKey: ['todayTask'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useDeleteDailyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDailyTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['todayTask'] });
    },
  });
}

export type { Spending, DailyTask };
