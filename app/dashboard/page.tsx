'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Dumbbell,
  Apple,
  Book,
  GraduationCap,
  CheckSquare,
  Droplet,
  Settings,
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
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  useUser,
  useDailyTask,
  useToggleTaskCompletion,
} from '@/lib/hooks/useTasks';

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

import { Suspense } from 'react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: userData, isLoading: isLoadingUser } = useUser();

  // Get date from URL or default to today
  const dateParam = searchParams.get('date');
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

  const { data: taskData, isLoading: isLoadingTask } =
    useDailyTask(selectedDate);
  const toggleTask = useToggleTaskCompletion();

  const user = userData?.user;
  const dailyTask = taskData?.task;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login');
    }
  }, [isLoadingUser, user, router]);

  const handleTaskToggle = (completionId: string, currentValue: boolean) => {
    toggleTask.mutate({ completionId, completed: !currentValue });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const formattedDate = newDate.toISOString().split('T')[0];
    router.push(`/dashboard?date=${formattedDate}`);
  };

  const resetDate = () => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    router.push(`/dashboard?date=${formattedDate}`);
  };

  if (isLoadingUser || isLoadingTask || !user) {
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

  const now = new Date();
  const currentDay = selectedDate.getDate();
  const currentMonth = selectedDate.getMonth();

  // Calculate days since challenge start
  const challengeStart = new Date(user.challengeStartDate);
  challengeStart.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setHours(0, 0, 0, 0);

  const selectedDateObj = new Date(selectedDate);
  selectedDateObj.setHours(0, 0, 0, 0);

  const daysSinceStart =
    Math.floor(
      (selectedDateObj.getTime() - challengeStart.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1; // +1 because day 1 is the start date

  const challengeEndDate = new Date(challengeStart);
  challengeEndDate.setDate(challengeStart.getDate() + 37); // 38 days total (day 1 to day 38)

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (challengeEndDate.getTime() - selectedDateObj.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  const monthNames = [
    'stycznia',
    'lutego',
    'marca',
    'kwietnia',
    'maja',
    'czerwca',
    'lipca',
    'sierpnia',
    'września',
    'października',
    'listopada',
    'grudnia',
  ];
  const currentDateStr = `${currentDay} ${monthNames[currentMonth]}`;
  const isToday = selectedDateObj.getTime() === today.getTime();

  const completions = dailyTask?.taskCompletions || [];
  const completedTasks = completions.filter((c: any) => c.completed).length;
  const totalTasks = completions.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className='h-screen flex flex-col bg-background overflow-hidden'>
      {/* Main Content */}
      <main className='flex-1 overflow-y-auto pb-20 pt-10'>
        <div className='container mx-auto px-4 py-6 space-y-6 max-w-2xl'>
          {/* Date Navigation */}
          <div className='flex items-center justify-between mb-4'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => changeDate(-1)}
            >
              <ChevronLeft className='h-5 w-5' />
            </Button>

            <div className='flex flex-col items-center'>
              <h2 className='font-bold text-lg'>{currentDateStr}</h2>
              {!isToday && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={resetDate}
                  className='h-6 text-xs text-primary'
                >
                  Wróć do dzisiaj
                </Button>
              )}
            </div>

            <Button
              variant='outline'
              size='icon'
              onClick={() => changeDate(1)}
              disabled={selectedDateObj >= today}
            >
              <ChevronRight className='h-5 w-5' />
            </Button>
          </div>

          {/* Day Counter */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className='bg-primary/90 text-secondary-foreground '>
              <CardHeader className=''>
                <CardDescription className='text-center text-secondary-foreground/80'>
                  {daysRemaining <= 0
                    ? 'Wyzwanie ukończone! 🎉🎄'
                    : `Dzień ${daysSinceStart} • ${daysRemaining} ${
                        daysRemaining === 1
                          ? 'dzień'
                          : daysRemaining < 5
                          ? 'dni'
                          : 'dni'
                      } pozostało 💪`}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-center self-center '>
                      {completedTasks} z {totalTasks} zadań ukończonych
                    </span>
                    <span className='font-bold'>{Math.round(progress)}%</span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className='h-full bg-linear-to-r from-primary to-secondary'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Tasks */}
          <div className='space-y-3'>
            {completions.length === 0 ? (
              <Card className='p-6 text-center'>
                <p className='text-muted-foreground mb-4'>
                  Nie masz jeszcze żadnych zadań
                </p>
                <Link href='/dashboard/settings/tasks'>
                  <Button>Dodaj zadania</Button>
                </Link>
              </Card>
            ) : (
              <>
                {completions
                  .sort(
                    (a: any, b: any) =>
                      a.taskTemplate.sortOrder - b.taskTemplate.sortOrder,
                  )
                  .map((completion: any, index: number) => {
                    const Icon =
                      ICON_MAP[completion.taskTemplate.icon] || CheckSquare;
                    const isCompleted = completion.completed;
                    const isPending =
                      toggleTask.isPending &&
                      toggleTask.variables?.completionId === completion.id;

                    return (
                      <motion.div
                        key={completion.taskTemplate.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                      >
                        <Card
                          className={` transition-all  ${
                            isCompleted ? 'bg-green-500 ' : ''
                          } ${isPending ? 'opacity-60' : ''}`}
                          onClick={() =>
                            !isPending &&
                            handleTaskToggle(completion.id, isCompleted)
                          }
                        >
                          <CardContent className='flex items-center gap-4 p-1 px-6'>
                            {isPending ? (
                              <Loader2 className='h-6 w-6 animate-spin text-primary' />
                            ) : (
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() =>
                                  handleTaskToggle(completion.id, isCompleted)
                                }
                                className='h-6 w-6'
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <Icon
                              className={`h-6 w-6 ${
                                isCompleted ? 'text-primary' : 'text-success'
                              }`}
                            />
                            <span
                              className={`flex-1 font-medium ${
                                isCompleted ? 'line-through text-success' : ''
                              }`}
                            >
                              {completion.taskTemplate.name}
                            </span>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className='text-6xl'
          >
            🎄
          </motion.div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
