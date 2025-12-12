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
  Pencil,
  Trash2,
  Loader2,
  Percent,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { pl } from 'date-fns/locale';
import { isSameDay, parseISO, format, isWithinInterval } from 'date-fns';

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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);

  // Filter states
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined);
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('');
  const [availableTasks, setAvailableTasks] = useState<TaskTemplate[]>([]);

  const [editingSpending, setEditingSpending] = useState<Spending | null>(null);
  const [spendingForm, setSpendingForm] = useState({
    amount: '',
    category: '',
    description: '',
  });
  const [togglingTask, setTogglingTask] = useState<string | null>(null);
  const router = useRouter();

  const fetchCalendarData = async (month: number, year: number) => {
    try {
      const calendarResponse = await fetch(
        `/api/calendar?month=${month}&year=${year}`,
      );
      const calendarData = await calendarResponse.json();
      setTasks(calendarData.tasks || []);
      
      // Extract unique task templates
      const templates = new Map<string, TaskTemplate>();
      calendarData.tasks?.forEach((task: DailyTask) => {
        task.taskCompletions?.forEach((completion) => {
          if (!templates.has(completion.taskTemplate.id)) {
            templates.set(completion.taskTemplate.id, completion.taskTemplate);
          }
        });
      });
      setAvailableTasks(Array.from(templates.values()).sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      console.error('Failed to fetch calendar data', error);
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

  const calculateMonthlySpending = () => {
    const filteredTasks = getFilteredTasks();
    return filteredTasks
      .reduce(
        (acc, t) =>
          acc + (t.spendings?.reduce((s, sp) => s + sp.amount, 0) || 0),
        0,
      )
      .toFixed(0);
  };

  const calculateAverageCompletion = () => {
    const filteredTasks = getFilteredTasks();
    if (filteredTasks.length === 0) return 0;
    const totalPercentage = filteredTasks.reduce((acc, task) => {
      const { percentage } = getDayStatus(task);
      return acc + percentage;
    }, 0);
    return Math.round(totalPercentage / filteredTasks.length);
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Filter by date range
    if (dateRangeStart && dateRangeEnd) {
      filtered = filtered.filter((task) => {
        const taskDate = parseISO(task.date);
        return isWithinInterval(taskDate, { start: dateRangeStart, end: dateRangeEnd });
      });
    }
    
    return filtered;
  };

  const calculateTaskStats = () => {
    if (!selectedTaskFilter) return null;
    
    const filteredTasks = getFilteredTasks();
    let completedCount = 0;
    let totalCount = 0;

    filteredTasks.forEach((task) => {
      const completion = task.taskCompletions?.find(
        (c) => c.taskTemplate.id === selectedTaskFilter
      );
      if (completion) {
        totalCount++;
        if (completion.completed) {
          completedCount++;
        }
      }
    });

    return { completedCount, totalCount, percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0 };
  };

  const clearFilters = () => {
    setDateRangeStart(undefined);
    setDateRangeEnd(undefined);
    setSelectedTaskFilter('');
  };

  const hasActiveFilters = dateRangeStart || dateRangeEnd || selectedTaskFilter;

  return (
    <div className='h-screen flex flex-col bg-background overflow-hidden'>
      {/* Main Content */}
      <main className='flex-1 overflow-y-auto pb-20 pt-16'>
        <div className='container mx-auto px-4 py-6 space-y-6 max-w-4xl flex flex-col items-center'>
          
          {/* Filters Section */}
          <Card className='w-full max-w-md'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>Filtry</CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearFilters}
                    className='h-8 gap-1'
                  >
                    <X className='h-4 w-4' />
                    Wyczyść
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Date Range Filter */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Zakres dat</Label>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <Label htmlFor='dateStart' className='text-xs text-muted-foreground'>
                      Od
                    </Label>
                    <Input
                      id='dateStart'
                      type='date'
                      value={dateRangeStart ? format(dateRangeStart, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setDateRangeStart(e.target.value ? new Date(e.target.value) : undefined)}
                      className='text-sm'
                    />
                  </div>
                  <div>
                    <Label htmlFor='dateEnd' className='text-xs text-muted-foreground'>
                      Do
                    </Label>
                    <Input
                      id='dateEnd'
                      type='date'
                      value={dateRangeEnd ? format(dateRangeEnd, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setDateRangeEnd(e.target.value ? new Date(e.target.value) : undefined)}
                      className='text-sm'
                    />
                  </div>
                </div>
              </div>

              {/* Task Filter */}
              <div className='space-y-2'>
                <Label htmlFor='taskFilter' className='text-sm font-medium'>
                  Zadanie do analizy
                </Label>
                <select
                  id='taskFilter'
                  value={selectedTaskFilter}
                  onChange={(e) => setSelectedTaskFilter(e.target.value)}
                  className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                >
                  <option value=''>Wybierz zadanie...</option>
                  {availableTasks.map((task) => {
                    return (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Task Stats Display */}
              {selectedTaskFilter && (() => {
                const stats = calculateTaskStats();
                const selectedTask = availableTasks.find(t => t.id === selectedTaskFilter);
                const Icon = selectedTask ? ICON_MAP[selectedTask.icon] || CheckSquare : CheckSquare;
                
                return stats ? (
                  <Card className='bg-secondary/20 border-secondary'>
                    <CardContent className='p-4'>
                      <div className='flex items-center gap-3 mb-2'>
                        <Icon className='h-5 w-5 text-secondary' />
                        <h4 className='font-semibold text-sm'>{selectedTask?.name}</h4>
                      </div>
                      <div className='grid grid-cols-3 gap-2 text-center'>
                        <div>
                          <p className='text-2xl font-bold text-green-600'>{stats.completedCount}</p>
                          <p className='text-xs text-muted-foreground'>Wykonane</p>
                        </div>
                        <div>
                          <p className='text-2xl font-bold'>{stats.totalCount}</p>
                          <p className='text-xs text-muted-foreground'>Razem dni</p>
                        </div>
                        <div>
                          <p className='text-2xl font-bold text-blue-600'>{stats.percentage}%</p>
                          <p className='text-xs text-muted-foreground'>Skuteczność</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}
            </CardContent>
          </Card>

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
                  {hasActiveFilters ? 'Wydatki (filtr)' : 'Wydatki (miesiąc)'}
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
                  {hasActiveFilters ? 'Średnia (filtr)' : 'Średnie wykonanie'}
                </p>
              </CardContent>
            </Card>
            {hasActiveFilters && (
              <Card className='col-span-2'>
                <CardContent className='p-4 text-center flex flex-col items-center justify-center'>
                  <CalendarIcon className='h-8 w-8 text-purple-500 mb-2' />
                  <p className='text-2xl font-bold'>
                    {getFilteredTasks().length}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Dni w filtrze
                  </p>
                </CardContent>
              </Card>
            )}
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
