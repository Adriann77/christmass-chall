'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  CheckSquare
} from 'lucide-react';
import Link from 'next/link';

interface DailyTask {
  id: string;
  date: string;
  steps: boolean;
  training: boolean;
  diet: boolean;
  book: boolean;
  learning: boolean;
  spendings: unknown[];
}

const tasks = [
  { key: 'steps', label: '10 000 kroków', icon: TrendingUp },
  { key: 'training', label: 'Trening/Rozciąganie', icon: Dumbbell },
  { key: 'diet', label: 'Zdrowa dieta', icon: Apple },
  { key: 'book', label: 'Czytanie książki', icon: Book },
  { key: 'learning', label: 'Nauka (1 godzina)', icon: GraduationCap },
];

export default function DashboardPage() {
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null);
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

  const handleTaskToggle = async (taskKey: string) => {
    if (!dailyTask) return;

    const newValue = !dailyTask[taskKey as keyof DailyTask];
    
    // Optimistic update
    setDailyTask({ ...dailyTask, [taskKey]: newValue });

    try {
      const response = await fetch(`/api/tasks/${dailyTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [taskKey]: newValue }),
      });

      const data = await response.json();
      setDailyTask(data.task);
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert on error
      setDailyTask({ ...dailyTask, [taskKey]: !newValue });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          🎄
        </motion.div>
      </div>
    );
  }

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January, 11 = December)
  
  // Calculate days until December 24, 2025
  const christmasDate = new Date(2025, 11, 24); // December 24, 2025
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysUntilChristmas = Math.ceil((christmasDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Format current date
  const monthNames = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                      'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  const currentDateStr = `${currentDay} ${monthNames[currentMonth]}`;
  
  const completedTasks = dailyTask ? tasks.filter(t => dailyTask[t.key as keyof DailyTask] === true).length : 0;
  const totalTasks = tasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex justify-end px-4 py-2">
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
          {/* Day Counter */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-secondary text-secondary-foreground border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-2xl">
                  {currentDateStr}
                </CardTitle>
                <CardDescription className="text-center text-secondary-foreground/80">
                  {daysUntilChristmas <= 0 ? 'Wesołych Świąt! 🎉🎄' : `${daysUntilChristmas} ${daysUntilChristmas === 1 ? 'dzień' : daysUntilChristmas < 5 ? 'dni' : 'dni'} do Świąt Bożego Narodzenia! 🎅`}
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
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dzisiejszy postęp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{completedTasks} z {totalTasks} zadań ukończonych</span>
                    <span className="font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-full bg-linear-to-r from-primary to-secondary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Tasks */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold px-1">Dzisiejsze zadania</h2>
            {tasks.map((task, index) => {
              const Icon = task.icon;
              const isCompleted = dailyTask?.[task.key as keyof DailyTask] === true;
              
              return (
                <motion.div
                  key={task.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isCompleted ? 'bg-accent border-primary' : ''
                    }`}
                    onClick={() => handleTaskToggle(task.key)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <Checkbox 
                        checked={isCompleted}
                        onCheckedChange={() => handleTaskToggle(task.key)}
                        className="h-6 w-6"
                      />
                      <Icon className={`h-6 w-6 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`flex-1 font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {task.label}
                      </span>
                      {isCompleted && <span className="text-2xl">✅</span>}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary">
              <CheckSquare className="h-6 w-6" />
              <span className="text-xs font-medium">Zadania</span>
            </Link>
            <Link href="/dashboard/spending" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
              <DollarSign className="h-6 w-6" />
              <span className="text-xs">Wydatki</span>
            </Link>
            <Link href="/dashboard/calendar" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
              <Calendar className="h-6 w-6" />
              <span className="text-xs">Kalendarz</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
