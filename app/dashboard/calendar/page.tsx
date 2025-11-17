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
  Calendar as CalendarIcon,
  CheckSquare,
  DollarSign,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Salad,
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
} from 'lucide-react';
import Link from 'next/link';

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

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

  const getDayStatus = (task: DailyTask) => {
    const { completed, total } = getTaskCompletion(task);
    if (total === 0) return 'incomplete';
    if (completed === total) return 'perfect';
    if (completed >= total * 0.6) return 'good';
    if (completed > 0) return 'partial';
    return 'incomplete';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect':
        return 'bg-secondary text-secondary-foreground border-secondary';
      case 'good':
        return 'bg-accent text-accent-foreground border-accent';
      case 'partial':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-card text-card-foreground border-border';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'perfect':
        return '🌟';
      case 'good':
        return '✅';
      case 'partial':
        return '⚠️';
      default:
        return '❌';
    }
  };

  const perfectDays = tasks.filter((t) => getDayStatus(t) === 'perfect').length;
  const goodDays = tasks.filter((t) => getDayStatus(t) === 'good').length;
  const partialDays = tasks.filter((t) => getDayStatus(t) === 'partial').length;
  const incompleteDays = tasks.filter(
    (t) => getDayStatus(t) === 'incomplete',
  ).length;

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
      {/* Header */}
      <header className='shrink-0 flex justify-end px-4 py-2 border-b bg-background'>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleLogout}
        >
          <LogOut className='h-5 w-5' />
        </Button>
      </header>

      {/* Main Content */}
      <main className='flex-1 overflow-y-auto pb-20'>
        <div className='container mx-auto px-4 py-6 space-y-6 max-w-2xl'>
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
                  <div className='text-center p-3 rounded-lg bg-secondary/20 border border-secondary'>
                    <p className='text-3xl font-bold text-secondary'>
                      {perfectDays}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Perfekcyjne dni 🌟
                    </p>
                  </div>
                  <div className='text-center p-3 rounded-lg bg-accent/20 border border-accent'>
                    <p className='text-3xl font-bold text-accent-foreground'>
                      {goodDays}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Dobre dni ✅
                    </p>
                  </div>
                  <div className='text-center p-3 rounded-lg bg-muted/50 border'>
                    <p className='text-3xl font-bold'>{partialDays}</p>
                    <p className='text-sm text-muted-foreground'>
                      Częściowe ⚠️
                    </p>
                  </div>
                  <div className='text-center p-3 rounded-lg bg-destructive/10 border border-destructive/30'>
                    <p className='text-3xl font-bold text-destructive'>
                      {incompleteDays}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Nieukończone ❌
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
            <div className='grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground mb-2'>
              <div>Nd</div>
              <div>Pn</div>
              <div>Wt</div>
              <div>Śr</div>
              <div>Cz</div>
              <div>Pt</div>
              <div>Sb</div>
            </div>

            <div className='grid grid-cols-7 gap-2'>
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} />;
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

                const status = task ? getDayStatus(task) : 'incomplete';
                const { completed, total } = task
                  ? getTaskCompletion(task)
                  : { completed: 0, total: 5 };

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01, duration: 0.2 }}
                  >
                    <Card
                      className={`relative ${getStatusColor(status)} ${
                        isFuture ? 'opacity-40' : 'cursor-pointer'
                      } ${
                        isToday ? 'ring-2 ring-primary' : ''
                      } transition-all hover:scale-105`}
                      onClick={() => !isFuture && handleDayClick(day)}
                    >
                      <CardContent className='p-2 text-center'>
                        <p className='text-lg font-bold mb-0.5'>{day}</p>
                        {!isFuture && (
                          <>
                            <p className='text-2xl mb-0.5'>
                              {getStatusEmoji(status)}
                            </p>
                            <p className='text-xs'>
                              {completed}/{total}
                            </p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Legenda</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>🌟</span>
                <span className='text-sm'>
                  Perfekcyjne - Wszystkie zadania ukończone
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>✅</span>
                <span className='text-sm'>Dobre - 60%+ zadań ukończonych</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>⚠️</span>
                <span className='text-sm'>
                  Częściowe - Niektóre zadania ukończone
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>❌</span>
                <span className='text-sm'>
                  Nieukończone - Brak ukończonych zadań
                </span>
              </div>
            </CardContent>
          </Card>
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
                          selectedTask.taskCompletions.filter((c) => c.completed)
                            .length
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

      {/* Bottom Navigation */}
      <nav className='fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-around py-3'>
            <Link
              href='/dashboard'
              className='flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground'
            >
              <CheckSquare className='h-6 w-6' />
              <span className='text-xs'>Zadania</span>
            </Link>
            <Link
              href='/dashboard/spending'
              className='flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground'
            >
              <DollarSign className='h-6 w-6' />
              <span className='text-xs'>Wydatki</span>
            </Link>
            <Link
              href='/dashboard/diet'
              className='flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground'
            >
              <Salad className='h-6 w-6' />
              <span className='text-xs'>Dieta</span>
            </Link>
            <Link
              href='/dashboard/calendar'
              className='flex flex-col items-center gap-1 text-primary'
            >
              <CalendarIcon className='h-6 w-6' />
              <span className='text-xs font-medium'>Kalendarz</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
