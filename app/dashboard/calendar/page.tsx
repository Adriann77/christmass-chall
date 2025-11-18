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
import { motion } from 'framer-motion';
import {
  CheckSquare,
  DollarSign,
  ChevronLeft,
  ChevronRight,
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
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

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

export default function CalendarPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const router = useRouter();

  const fetchCalendarData = async (month: number, year: number) => {
    const calendarResponse = await fetch(
      `/api/calendar?month=${month}&year=${year}`,
    );
    const calendarData = await calendarResponse.json();
    setTasks(calendarData.tasks);
    setLoading(false);
  };

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/login');
        return;
      }

      const month = currentMonth.getMonth();
      const year = currentMonth.getFullYear();
      await fetchCalendarData(month, year);
    }

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (!loading) {
      const month = currentMonth.getMonth();
      const year = currentMonth.getFullYear();
      fetchCalendarData(month, year);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't open modal for future dates
    if (clickedDate > today) {
      return;
    }

    setSelectedDate(clickedDate);

    const task = tasks.find((t) => {
      const taskDate = new Date(t.date);
      return (
        taskDate.getFullYear() === clickedDate.getFullYear() &&
        taskDate.getMonth() === clickedDate.getMonth() &&
        taskDate.getDate() === clickedDate.getDate()
      );
    });

    // Create a default task structure if no task exists for the day
    setSelectedTask(
      task || {
        id: '',
        date: clickedDate.toISOString(),
        steps: false,
        training: false,
        diet: false,
        book: false,
        learning: false,
        water: false,
        spendings: [],
        taskCompletions: [],
      },
    );
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień',
  ];

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className='text-6xl'
        >
          🎄
        </motion.div>
      </div>
    );
  }

  const getTaskCompletion = (task: DailyTask) => {
    const completions = task.taskCompletions || [];
    const completed = completions.filter((c) => c.completed).length;
    return { completed, total: completions.length };
  };

  const getDayStatus = (task: DailyTask | undefined) => {
    if (!task) return { percentage: 0, status: 'zero' };
    const { completed, total } = getTaskCompletion(task);
    if (total === 0) return { percentage: 0, status: 'zero' };
    const percentage = (completed / total) * 100;
    if (percentage === 100) return { percentage, status: 'perfect' };
    if (percentage >= 75) return { percentage, status: 'good' };
    if (percentage >= 25) return { percentage, status: 'partial' };
    if (percentage > 0) return { percentage, status: 'low' };
    return { percentage: 0, status: 'zero' };
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'perfect':
        return {
          bg: 'bg-yellow-400',
          icon: Star,
          iconColor: 'text-yellow-600',
          textColor: 'text-gray-900',
        };
      case 'good':
        return {
          bg: 'bg-green-500',
          icon: CheckCircle2,
          iconColor: 'text-green-700',
          textColor: 'text-white',
        };
      case 'partial':
        return {
          bg: 'bg-yellow-300',
          icon: AlertCircle,
          iconColor: 'text-yellow-700',
          textColor: 'text-gray-900',
        };
      case 'low':
        return {
          bg: 'bg-yellow-600',
          icon: AlertCircle,
          iconColor: 'text-yellow-900',
          textColor: 'text-white',
        };
      default:
        return {
          bg: 'bg-red-500',
          icon: XCircle,
          iconColor: 'text-red-700',
          textColor: 'text-white',
        };
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate statistics
  const perfectDays = tasks.filter((t) => {
    const status = getDayStatus(t);
    return status.status === 'perfect';
  }).length;

  const goodDays = tasks.filter((t) => {
    const status = getDayStatus(t);
    return status.status === 'good';
  }).length;

  const totalSpending = tasks.reduce((sum, task) => {
    return (
      sum +
      (task.spendings?.reduce((s, spending) => s + spending.amount, 0) || 0)
    );
  }, 0);

  const totalDays = tasks.length;
  const averageCompletion =
    totalDays > 0
      ? tasks.reduce((sum, task) => {
          const { completed, total } = getTaskCompletion(task);
          return sum + (total > 0 ? (completed / total) * 100 : 0);
        }, 0) / totalDays
      : 0;

  const calendarDays = [];
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className='h-screen flex flex-col bg-background overflow-hidden'>
      {/* Main Content */}
      <main className='flex-1 overflow-y-auto pb-20 pt-16'>
        <div className='container mx-auto px-4 py-6 space-y-6 max-w-4xl'>
          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className='border-2'>
              <CardHeader>
                <CardTitle className='text-center'>Podsumowanie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center p-3 rounded-lg bg-yellow-400/20 border border-yellow-400'>
                    <p className='text-3xl font-bold text-yellow-600'>
                      {perfectDays}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Perfekcyjne dni ⭐
                    </p>
                  </div>
                  <div className='text-center p-3 rounded-lg bg-green-500/20 border border-green-500'>
                    <p className='text-3xl font-bold text-green-600'>
                      {goodDays}
                    </p>
                    <p className='text-sm text-muted-foreground'>Dobre dni ✓</p>
                  </div>
                  <div className='text-center p-3 rounded-lg bg-primary/20 border border-primary'>
                    <p className='text-3xl font-bold text-primary'>
                      {totalSpending.toFixed(2)} zł
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Łączne wydatki
                    </p>
                  </div>
                  <div className='text-center p-3 rounded-lg bg-accent/20 border border-accent'>
                    <p className='text-3xl font-bold text-accent-foreground'>
                      {averageCompletion.toFixed(0)}%
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Średnie wykonanie
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Calendar Grid */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between px-1'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className='h-5 w-5' />
              </Button>
              <h2 className='text-xl font-bold'>
                {monthNames[currentMonth.getMonth()]}{' '}
                {currentMonth.getFullYear()}
              </h2>
              <Button
                variant='outline'
                size='icon'
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className='h-5 w-5' />
              </Button>
            </div>

            {/* Day names */}
            <div className='grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted-foreground mb-2'>
              <div>Nd</div>
              <div>Pn</div>
              <div>Wt</div>
              <div>Śr</div>
              <div>Cz</div>
              <div>Pt</div>
              <div>Sb</div>
            </div>

            <div className='grid grid-cols-7 gap-1.5'>
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className='aspect-square'
                    />
                  );
                }

                const currentDate = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day,
                );
                const isFuture = currentDate > today;
                const isToday =
                  currentDate.getFullYear() === today.getFullYear() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getDate() === today.getDate();

                const task = tasks.find((t) => {
                  const taskDate = new Date(t.date);
                  return (
                    taskDate.getFullYear() === currentDate.getFullYear() &&
                    taskDate.getMonth() === currentDate.getMonth() &&
                    taskDate.getDate() === currentDate.getDate()
                  );
                });

                const dayStatus = getDayStatus(task);
                const statusStyles = isFuture
                  ? {
                      bg: 'bg-muted',
                      icon: null as React.ElementType | null,
                      iconColor: '',
                      textColor: 'text-muted-foreground',
                    }
                  : getStatusStyles(dayStatus.status);
                const Icon = statusStyles.icon;

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01, duration: 0.2 }}
                    className='aspect-square'
                  >
                    <Card
                      className={`relative ${statusStyles.bg} ${
                        isFuture ? 'opacity-40' : 'cursor-pointer'
                      } ${
                        isToday ? 'ring-2 ring-primary ring-offset-2' : ''
                      } transition-all hover:scale-105 h-full border-0`}
                      onClick={() => !isFuture && handleDayClick(day)}
                    >
                      <CardContent className='p-1.5 h-full flex flex-col items-center justify-center relative'>
                        <p
                          className={`text-sm font-bold ${statusStyles.textColor}`}
                        >
                          {day}
                        </p>
                        {!isFuture && Icon && (
                          <Icon
                            className={`absolute -top-6 right-0 h-3.5 w-3.5 ${statusStyles.iconColor}`}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Day Details Modal */}
      <Dialog
        open={!!selectedTask}
        onOpenChange={() => setSelectedTask(null)}
      >
        <DialogContent className='max-w-lg max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-2xl'>
              {selectedDate &&
                `${selectedDate.getDate()} ${
                  monthNames[selectedDate.getMonth()]
                } ${selectedDate.getFullYear()}`}
            </DialogTitle>
            <DialogDescription>
              Szczegóły dnia - zadania i wydatki
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className='space-y-6'>
              {/* Tasks Section */}
              <div>
                <h3 className='font-semibold text-lg mb-3 flex items-center gap-2'>
                  <CheckSquare className='h-5 w-5' />
                  Zadania
                </h3>
                <div className='space-y-2'>
                  {selectedTask.taskCompletions &&
                  selectedTask.taskCompletions.length > 0 ? (
                    selectedTask.taskCompletions.map((completion) => {
                      const Icon =
                        ICON_MAP[completion.taskTemplate.icon] || CheckSquare;
                      const isCompleted = completion.completed;
                      return (
                        <div
                          key={completion.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isCompleted
                              ? 'bg-secondary/20 border-secondary'
                              : 'bg-muted/20 border-muted'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-secondary text-secondary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isCompleted ? '✓' : '○'}
                          </div>
                          <Icon
                            className={`h-5 w-5 ${
                              isCompleted
                                ? 'text-secondary'
                                : 'text-muted-foreground'
                            }`}
                          />
                          <span className='font-medium'>
                            {completion.taskTemplate.name}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className='p-8 text-center rounded-lg border-2 border-dashed bg-muted/20'>
                      <CheckSquare className='h-12 w-12 mx-auto mb-2 text-muted-foreground' />
                      <p className='text-muted-foreground'>
                        Brak zadań w tym dniu
                      </p>
                    </div>
                  )}
                </div>

                {selectedTask.taskCompletions &&
                  selectedTask.taskCompletions.length > 0 && (
                    <div className='mt-4 p-3 rounded-lg bg-accent/10 border border-accent'>
                      <p className='text-sm font-medium'>
                        Ukończono:{' '}
                        {
                          selectedTask.taskCompletions.filter(
                            (c) => c.completed,
                          ).length
                        }{' '}
                        / {selectedTask.taskCompletions.length} zadań
                      </p>
                    </div>
                  )}
              </div>

              {/* Spendings Section */}
              <div>
                <h3 className='font-semibold text-lg mb-3 flex items-center gap-2'>
                  <DollarSign className='h-5 w-5' />
                  Wydatki
                </h3>

                {selectedTask.spendings && selectedTask.spendings.length > 0 ? (
                  <div className='space-y-3'>
                    {selectedTask.spendings.map((spending) => (
                      <div
                        key={spending.id}
                        className='p-4 rounded-lg border bg-card'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <div className='flex-1'>
                            <p className='font-semibold text-lg'>
                              {spending.category}
                            </p>
                            {spending.description && (
                              <p className='text-sm text-muted-foreground mt-1'>
                                {spending.description}
                              </p>
                            )}
                          </div>
                          <p className='text-xl font-bold text-primary ml-3'>
                            {spending.amount.toFixed(2)} zł
                          </p>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(spending.createdAt).toLocaleString('pl-PL')}
                        </p>
                      </div>
                    ))}

                    <div className='p-4 rounded-lg bg-primary/10 border-2 border-primary'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        Suma wydatków
                      </p>
                      <p className='text-2xl font-bold text-primary'>
                        {selectedTask.spendings
                          .reduce((sum, s) => sum + s.amount, 0)
                          .toFixed(2)}{' '}
                        zł
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='p-8 text-center rounded-lg border-2 border-dashed bg-muted/20'>
                    <DollarSign className='h-12 w-12 mx-auto mb-2 text-muted-foreground' />
                    <p className='text-muted-foreground'>
                      Brak wydatków w tym dniu
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
