'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckSquare, DollarSign, LogOut } from 'lucide-react';
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

export default function CalendarPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
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
      
      const calendarResponse = await fetch('/api/calendar');
      const calendarData = await calendarResponse.json();
      setTasks(calendarData.tasks);
      setLoading(false);
    }
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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

  const getTaskCompletion = (task: DailyTask) => {
    const completed = [
      task.steps,
      task.training,
      task.diet,
      task.book,
      task.learning,
    ].filter(Boolean).length;
    return { completed, total: 5 };
  };

  const getDayStatus = (task: DailyTask) => {
    const { completed, total } = getTaskCompletion(task);
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
  const incompleteDays = tasks.filter((t) => getDayStatus(t) === 'incomplete').length;

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
          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-center">Podsumowanie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-secondary/20 border border-secondary">
                    <p className="text-3xl font-bold text-secondary">{perfectDays}</p>
                    <p className="text-sm text-muted-foreground">Perfekcyjne dni 🌟</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/20 border border-accent">
                    <p className="text-3xl font-bold text-accent-foreground">{goodDays}</p>
                    <p className="text-sm text-muted-foreground">Dobre dni ✅</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-3xl font-bold">{partialDays}</p>
                    <p className="text-sm text-muted-foreground">Częściowe ⚠️</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <p className="text-3xl font-bold text-destructive">{incompleteDays}</p>
                    <p className="text-sm text-muted-foreground">Nieukończone ❌</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Calendar Grid */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold px-1">Grudzień 2025</h2>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 24 }, (_, i) => i + 1).map((day) => {
                const task = tasks.find((t) => {
                  const taskDate = new Date(t.date);
                  return taskDate.getMonth() === 11 && taskDate.getDate() === day; // December (month 11)
                });
                
                const status = task ? getDayStatus(task) : 'incomplete';
                const { completed, total } = task ? getTaskCompletion(task) : { completed: 0, total: 5 };
                
                // Check if this December day is in the future
                const today = new Date();
                const decemberDay = new Date(2025, 11, day); // December day in 2025
                const isFuture = decemberDay > today;

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: day * 0.02, duration: 0.3 }}
                  >
                    <Card 
                      className={`relative ${getStatusColor(status)} ${
                        isFuture ? 'opacity-40' : ''
                      } transition-all hover:scale-105`}
                    >
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold mb-1">{day}</p>
                        <p className="text-3xl mb-1">{getStatusEmoji(status)}</p>
                        {!isFuture && (
                          <p className="text-xs">
                            {completed}/{total}
                          </p>
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
              <CardTitle className="text-lg">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌟</span>
                <span className="text-sm">Perfekcyjne - Wszystkie 5 zadań ukończonych</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="text-sm">Dobre - 3-4 zadania ukończone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <span className="text-sm">Częściowe - 1-2 zadania ukończone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">❌</span>
                <span className="text-sm">Nieukończone - Brak ukończonych zadań</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
              <CheckSquare className="h-6 w-6" />
              <span className="text-xs">Zadania</span>
            </Link>
            <Link href="/dashboard/spending" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
              <DollarSign className="h-6 w-6" />
              <span className="text-xs">Wydatki</span>
            </Link>
            <Link href="/dashboard/calendar" className="flex flex-col items-center gap-1 text-primary">
              <CalendarIcon className="h-6 w-6" />
              <span className="text-xs font-medium">Kalendarz</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
