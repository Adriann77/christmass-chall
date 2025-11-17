'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Calendar,
  LogOut,
  DollarSign,
  CheckSquare,
  Salad,
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
} from 'lucide-react';
import Link from 'next/link';

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

export default function DashboardPage() {
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/login');
        return;
      }

      setUser(data.user);

      // Fetch task templates
      const templatesResponse = await fetch('/api/task-templates');
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTaskTemplates(templatesData.filter((t: TaskTemplate) => t.isActive));
      }

      // Fetch today's task
      const taskResponse = await fetch('/api/tasks/today');
      const taskData = await taskResponse.json();
      setDailyTask(taskData.task);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleTaskToggle = async (
    completionId: string,
    currentValue: boolean,
  ) => {
    if (!dailyTask) return;

    try {
      const response = await fetch(`/api/task-completions/${completionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentValue }),
      });

      if (response.ok) {
        // Refetch task to get updated completions
        const taskResponse = await fetch('/api/tasks/today');
        const taskData = await taskResponse.json();
        setDailyTask(taskData.task);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (loading || !user) {
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
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();

  // Calculate days since challenge start
  const challengeStart = new Date(user.challengeStartDate);
  challengeStart.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setHours(0, 0, 0, 0);

  const daysSinceStart =
    Math.floor(
      (today.getTime() - challengeStart.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1; // +1 because day 1 is the start date

  const challengeEndDate = new Date(challengeStart);
  challengeEndDate.setDate(challengeStart.getDate() + 37); // 38 days total (day 1 to day 38)

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (challengeEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
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

  const completions = dailyTask?.taskCompletions || [];
  const completedTasks = completions.filter((c) => c.completed).length;
  const totalTasks = completions.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className='h-screen flex flex-col bg-background overflow-hidden'>
      {/* Header */}
      <header className='shrink-0 flex justify-between items-center px-4 py-2 border-b bg-background'>
        <Link href='/dashboard/settings/tasks'>
          <Button
            variant='ghost'
            size='icon'
          >
            <Settings className='h-5 w-5' />
          </Button>
        </Link>
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
          {/* Day Counter */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className='bg-secondary text-secondary-foreground border-2'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-center text-2xl'>
                  {currentDateStr}
                </CardTitle>
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
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg'>Dzisiejszy postęp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>
                      {completedTasks} z {totalTasks} zadań ukończonych
                    </span>
                    <span className='font-bold'>{Math.round(progress)}%</span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-3 overflow-hidden'>
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
            <h2 className='text-xl font-bold px-1'>Dzisiejsze zadania</h2>
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
              completions.map((completion, index) => {
                const Icon =
                  ICON_MAP[completion.taskTemplate.icon] || CheckSquare;
                const isCompleted = completion.completed;

                return (
                  <motion.div
                    key={completion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        isCompleted ? 'bg-accent border-primary' : ''
                      }`}
                      onClick={() =>
                        handleTaskToggle(completion.id, isCompleted)
                      }
                    >
                      <CardContent className='flex items-center gap-4 p-4'>
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() =>
                            handleTaskToggle(completion.id, isCompleted)
                          }
                          className='h-6 w-6'
                        />
                        <Icon
                          className={`h-6 w-6 ${
                            isCompleted
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <span
                          className={`flex-1 font-medium ${
                            isCompleted
                              ? 'line-through text-muted-foreground'
                              : ''
                          }`}
                        >
                          {completion.taskTemplate.name}
                        </span>
                        {isCompleted && <span className='text-2xl'>✅</span>}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className='fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-around py-3'>
            <Link
              href='/dashboard'
              className='flex flex-col items-center gap-1 text-primary'
            >
              <CheckSquare className='h-6 w-6' />
              <span className='text-xs font-medium'>Zadania</span>
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
              className='flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground'
            >
              <Calendar className='h-6 w-6' />
              <span className='text-xs'>Kalendarz</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
