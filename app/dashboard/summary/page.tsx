'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  DollarSign,
  TrendingUp,
  Dumbbell,
  Apple,
  Book,
  GraduationCap,
  Droplet,
  Heart,
  Utensils,
  Coffee,
  Moon,
  Sun,
  Zap,
  Target,
  Award,
  Smile,
  Music,
  Camera,
  Pill,
  Bike,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Pencil,
  Trash2,
  Loader2,
  Flame,
  Percent,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { isSameDay, parseISO, format } from 'date-fns';

interface Spending {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  createdAt: string;
}

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
  spendings: Spending[];
  taskCompletions?: TaskCompletion[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp,
  Dumbbell,
  Apple,
  Book,
  GraduationCap,
  Droplet,
  CheckSquare,
  Heart,
  Utensils,
  Coffee,
  Moon,
  Sun,
  Zap,
  Target,
  Award,
  Smile,
  Music,
  Camera,
  Pill,
  Bike,
};

export default function SummaryPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);

  const [editingSpending, setEditingSpending] = useState<Spending | null>(null);
  const [spendingForm, setSpendingForm] = useState({
    amount: '',
    category: '',
    description: '',
  });
  const [togglingTask, setTogglingTask] = useState<string | null>(null);
  const [deletingSpending, setDeletingSpending] = useState<string | null>(null);
  const router = useRouter();

  const fetchCalendarData = async (month: number, year: number) => {
    setLoading(true);
    try {
      const calendarResponse = await fetch(
        `/api/calendar?month=${month}&year=${year}`,
      );
      const calendarData = await calendarResponse.json();
      setTasks(calendarData.tasks || []);
    } catch (error) {
      console.error('Failed to fetch calendar data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/login');
        return;
      }

      await fetchCalendarData(
        currentMonth.getMonth(),
        currentMonth.getFullYear(),
      );
    }

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Refetch when month changes
  useEffect(() => {
    fetchCalendarData(currentMonth.getMonth(), currentMonth.getFullYear());
  }, [currentMonth]);

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    // Reset selected task initially, will be populated by effect
    setSelectedTask(null);
  };

  useEffect(() => {
    const fetchDailyTask = async () => {
      if (!selectedDate) return;

      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/tasks/today?date=${formattedDate}`);

        if (response.ok) {
          const data = await response.json();
          setSelectedTask(data.task);
        } else {
          setSelectedTask(null);
        }
      } catch (error) {
        console.error('Failed to fetch daily task:', error);
        setSelectedTask(null);
      }
    };

    fetchDailyTask();
  }, [selectedDate]);

  const handleToggleTask = async (
    completionId: string,
    currentValue: boolean,
    taskId: string,
  ) => {
    setTogglingTask(completionId);
    try {
      const response = await fetch(`/api/task-completions/${completionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentValue }),
      });

      if (response.ok) {
        // Update local state
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === taskId) {
              const updatedCompletions = task.taskCompletions?.map((c) =>
                c.id === completionId ? { ...c, completed: !currentValue } : c,
              );
              return { ...task, taskCompletions: updatedCompletions };
            }
            return task;
          }),
        );

        // Also update selected task if it's the one being modified
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask((prev) => {
            if (!prev) return null;
            const updatedCompletions = prev.taskCompletions?.map((c) =>
              c.id === completionId ? { ...c, completed: !currentValue } : c,
            );
            return { ...prev, taskCompletions: updatedCompletions };
          });
        }
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    } finally {
      setTogglingTask(null);
    }
  };

  const handleEditSpending = (spending: Spending) => {
    setEditingSpending(spending);
    setSpendingForm({
      amount: spending.amount.toString(),
      category: spending.category,
      description: spending.description || '',
    });
  };

  const handleSaveSpending = async () => {
    if (!editingSpending) return;

    try {
      const response = await fetch(`/api/spendings/${editingSpending.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spendingForm),
      });

      if (response.ok) {
        // Refresh data
        await fetchCalendarData(
          currentMonth.getMonth(),
          currentMonth.getFullYear(),
        );
        setEditingSpending(null);
        setSpendingForm({ amount: '', category: '', description: '' });
        setSelectedDate(undefined); // Close details modal
      }
    } catch (error) {
      console.error('Error updating spending:', error);
    }
  };

  const handleDeleteSpending = async (spendingId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten wydatek?')) return;

    setDeletingSpending(spendingId);
    try {
      const response = await fetch(`/api/spendings/${spendingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCalendarData(
          currentMonth.getMonth(),
          currentMonth.getFullYear(),
        );
        setSelectedDate(undefined); // Close details modal
      }
    } catch (error) {
      console.error('Error deleting spending:', error);
    } finally {
      setDeletingSpending(null);
    }
  };

  const getTaskCompletion = (task: DailyTask) => {
    const completions = task.taskCompletions || [];
    const completed = completions.filter((c) => c.completed).length;
    return { completed, total: completions.length };
  };

  const getDayStatus = (task: DailyTask) => {
    const { completed, total } = getTaskCompletion(task);
    if (total === 0) return { percentage: 0, status: 'zero' };
    const percentage = (completed / total) * 100;
    if (percentage > 70) return { percentage, status: 'good' };
    return { percentage, status: 'bad' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'bad':
        return 'bg-yellow-400';
      default:
        return 'bg-muted';
    }
  };

  // Custom day renderer for Calendar
  const modifiers = {
    hasData: (date: Date) => {
      return tasks.some((t) => isSameDay(parseISO(t.date), date));
    },
  };

  const modifiersStyles = {
    hasData: {
      fontWeight: 'bold',
    },
  };

  const calculateStreak = () => {
    if (tasks.length === 0) return 0;

    // Sort tasks by date descending (newest first)
    const sortedTasks = [...tasks].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = today;

    // Check if the most recent task is today or yesterday
    const mostRecentTask = sortedTasks[0];
    if (!mostRecentTask) return 0;

    const mostRecentDate = parseISO(mostRecentTask.date);
    mostRecentDate.setHours(0, 0, 0, 0);

    // If the most recent data is older than yesterday, streak is broken (0)
    const diffTime = Math.abs(today.getTime() - mostRecentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      return 0;
    }

    // Start checking from the most recent task date
    checkDate = mostRecentDate;

    for (const task of sortedTasks) {
      const taskDate = parseISO(task.date);
      taskDate.setHours(0, 0, 0, 0);

      // Skip if we have multiple entries for same day (shouldn't happen but safety)
      if (taskDate.getTime() > checkDate.getTime()) continue;

      // If gap found
      if (taskDate.getTime() < checkDate.getTime()) {
        break;
      }

      // Check completion
      const { percentage } = getDayStatus(task);
      if (percentage > 0) {
        streak++;
        // Move to expected previous day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break; // Streak broken by 0% day
      }
    }

    return streak;
  };

  const calculateMonthlySpending = () => {
    return tasks
      .reduce(
        (acc, t) =>
          acc + (t.spendings?.reduce((s, sp) => s + sp.amount, 0) || 0),
        0,
      )
      .toFixed(0);
  };

  const calculateAverageCompletion = () => {
    if (tasks.length === 0) return 0;
    const totalPercentage = tasks.reduce((acc, task) => {
      const { percentage } = getDayStatus(task);
      return acc + percentage;
    }, 0);
    return Math.round(totalPercentage / tasks.length);
  };

  return (
    <div className='h-screen flex flex-col bg-background overflow-hidden'>
      {/* Main Content */}
      <main className='flex-1 overflow-y-auto pb-20 pt-16'>
        <div className='container mx-auto px-4 py-6 space-y-6 max-w-4xl flex flex-col items-center'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle className='text-center'>
                Kalendarz Podsumowania
              </CardTitle>
            </CardHeader>
            <CardContent className='flex justify-center'>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={handleDayClick}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                locale={pl}
                disabled={(date) => date > new Date()}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                components={{
                  DayButton: (props) => {
                    const { day } = props;
                    const date = day.date;
                    const task = tasks.find((t) =>
                      isSameDay(parseISO(t.date), date),
                    );

                    let statusColor = null;

                    if (task) {
                      const status = getDayStatus(task);
                      if (status.status !== 'zero') {
                        statusColor = getStatusColor(status.status);
                      }
                    }

                    return (
                      <CalendarDayButton {...props}>
                        <div className='relative w-full h-full flex items-center justify-center'>
                          <span>{date.getDate()}</span>
                          {statusColor && (
                            <div
                              className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${statusColor}`}
                            />
                          )}
                        </div>
                      </CalendarDayButton>
                    );
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Stats for current month */}
          <div className='grid grid-cols-2 gap-4 w-full max-w-md'>
            <Card>
              <CardContent className='p-4 text-center flex flex-col items-center justify-center h-full'>
                <DollarSign className='h-8 w-8 text-green-500 mb-2' />
                <p className='text-2xl font-bold'>
                  {calculateMonthlySpending()} zł
                </p>
                <p className='text-xs text-muted-foreground'>
                  Wydatki (miesiąc)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center flex flex-col items-center justify-center h-full'>
                <Percent className='h-8 w-8 text-blue-500 mb-2' />
                <p className='text-2xl font-bold'>
                  {calculateAverageCompletion()}%
                </p>
                <p className='text-xs text-muted-foreground'>
                  Średnie wykonanie
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Day Details Dialog */}
      <Dialog
        open={!!selectedDate}
        onOpenChange={(open) => !open && setSelectedDate(undefined)}
      >
        <DialogContent className='max-w-md top-0 mt-12 translate-y-0 max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {selectedDate?.toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </DialogTitle>
            <DialogDescription>Szczegóły dnia</DialogDescription>
          </DialogHeader>

          {selectedTask ? (
            <div className='space-y-6'>
              {/* Tasks */}
              <div>
                <h4 className='font-medium mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground'>
                  <CheckSquare className='h-4 w-4' />
                  Zadania
                </h4>
                <div className='space-y-2'>
                  {selectedTask.taskCompletions
                    ?.sort(
                      (a, b) =>
                        a.taskTemplate.sortOrder - b.taskTemplate.sortOrder,
                    )
                    .map((completion) => {
                      const Icon =
                        ICON_MAP[completion.taskTemplate.icon] || CheckSquare;
                      const isCompleted = completion.completed;
                      const isToggling = togglingTask === completion.id;

                      return (
                        <div
                          key={completion.id}
                          className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                            isCompleted
                              ? 'bg-secondary/20 border-secondary'
                              : 'bg-card border-border'
                          } ${isToggling ? 'opacity-60' : ''}`}
                          onClick={() =>
                            !isToggling &&
                            handleToggleTask(
                              completion.id,
                              isCompleted,
                              selectedTask.id,
                            )
                          }
                        >
                          {isToggling ? (
                            <Loader2 className='h-5 w-5 animate-spin text-primary' />
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                isCompleted
                                  ? 'bg-secondary text-secondary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isCompleted ? '✓' : '○'}
                            </div>
                          )}
                          <Icon
                            className={`h-4 w-4 ${
                              isCompleted
                                ? 'text-secondary'
                                : 'text-muted-foreground'
                            }`}
                          />
                          <span
                            className={`text-sm font-medium flex-1 ${
                              isCompleted ? 'line-through' : ''
                            }`}
                          >
                            {completion.taskTemplate.name}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Spendings */}
              <div>
                <h4 className='font-medium mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground'>
                  <DollarSign className='h-4 w-4' />
                  Wydatki
                </h4>
                {selectedTask.spendings && selectedTask.spendings.length > 0 ? (
                  <div className='space-y-2'>
                    {selectedTask.spendings.map((spending) => (
                      <Card key={spending.id}>
                        <CardContent className='p-4'>
                          <div className='flex justify-between items-start'>
                            <div className='flex-1'>
                              <p className='font-semibold text-lg'>
                                {spending.amount.toFixed(2)} zł
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                {spending.category}
                              </p>
                              {spending.description && (
                                <p className='text-sm mt-1'>
                                  {spending.description}
                                </p>
                              )}
                            </div>
                            <div className='flex flex-col items-end gap-2'>
                              <span className='text-xs text-muted-foreground'>
                                {new Date(
                                  spending.createdAt,
                                ).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <div className='flex gap-1'>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7'
                                  onClick={() => handleEditSpending(spending)}
                                >
                                  <Pencil className='h-3 w-3' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50'
                                  onClick={() =>
                                    handleDeleteSpending(spending.id)
                                  }
                                >
                                  <Trash2 className='h-3 w-3' />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className='py-8 text-center text-muted-foreground'>
                      <DollarSign className='h-12 w-12 mx-auto mb-2 opacity-50' />
                      <p>Brak zarejestrowanych wydatków</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className='py-10 text-center text-muted-foreground'>
              Brak danych dla tego dnia.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Spending Dialog */}
      <Dialog
        open={!!editingSpending}
        onOpenChange={() => {
          setEditingSpending(null);
          setSpendingForm({ amount: '', category: '', description: '' });
        }}
      >
        <DialogContent className='top-0 mt-12 translate-y-0'>
          <DialogHeader>
            <DialogTitle>Edytuj wydatek</DialogTitle>
            <DialogDescription>Zmień szczegóły wydatku</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='category'>Kategoria</Label>
              <Input
                id='category'
                value={spendingForm.category}
                onChange={(e) =>
                  setSpendingForm({ ...spendingForm, category: e.target.value })
                }
                placeholder='Kategoria'
                required
              />
            </div>
            <div>
              <Label htmlFor='amount'>Kwota</Label>
              <Input
                id='amount'
                type='number'
                step='0.01'
                value={spendingForm.amount}
                onChange={(e) =>
                  setSpendingForm({ ...spendingForm, amount: e.target.value })
                }
                placeholder='0.00'
                required
              />
            </div>
            <div>
              <Label htmlFor='description'>Opis (opcjonalnie)</Label>
              <Input
                id='description'
                value={spendingForm.description}
                onChange={(e) =>
                  setSpendingForm({
                    ...spendingForm,
                    description: e.target.value,
                  })
                }
                placeholder='Opis'
              />
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={handleSaveSpending}
                className='flex-1'
              >
                Zapisz
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setEditingSpending(null);
                  setSpendingForm({
                    amount: '',
                    category: '',
                    description: '',
                  });
                }}
              >
                Anuluj
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
