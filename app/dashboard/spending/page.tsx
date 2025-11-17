'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckSquare,
  DollarSign,
  LogOut,
  Plus,
  Salad,
} from 'lucide-react';
import Link from 'next/link';

interface Spending {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  createdAt: string;
}

interface DailyTask {
  id: string;
}

const CATEGORIES = [
  'Jedzenie i picie',
  'Zakupy',
  'Transport',
  'Rozrywka',
  'Zdrowie i fitness',
  'Rachunki',
  'Inne',
];

export default function SpendingPage() {
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/login');
        return;
      }

      await fetchData();
    }

    checkAuth();
  }, [router]);

  const fetchData = async () => {
    const [taskResponse, spendingsResponse] = await Promise.all([
      fetch('/api/tasks/today'),
      fetch('/api/spendings'),
    ]);

    const taskData = await taskResponse.json();
    const spendingsData = await spendingsResponse.json();

    setDailyTask(taskData.task);
    setSpendings(spendingsData.spendings);
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyTask) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/spendings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyTaskId: dailyTask.id,
          amount,
          category,
          description: description || null,
        }),
      });

      if (response.ok) {
        await fetchData();
        setAmount('');
        setDescription('');
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to add spending:', error);
    } finally {
      setSubmitting(false);
    }
  };

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

  const totalSpending = spendings.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      {/* Header */}
      <header className='sticky top-0 z-10 flex justify-end px-4 py-2'>
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
          {/* Total Spending */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className='bg-secondary text-secondary-foreground border-2'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-center text-3xl'>
                  {totalSpending.toFixed(2)} zł
                </CardTitle>
                <p className='text-center text-sm text-secondary-foreground/80'>
                  Łącznie wydane dzisiaj
                </p>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Add Spending Button */}
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className='w-full'
                size='lg'
              >
                <Plus className='mr-2 h-5 w-5' />
                Dodaj wydatek
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Dodaj nowy wydatek</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit}
                className='space-y-4'
              >
                <div className='space-y-2'>
                  <Label htmlFor='amount'>Kwota (zł)</Label>
                  <Input
                    id='amount'
                    type='number'
                    step='0.01'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='0.00'
                    required
                    disabled={submitting}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='category'>Kategoria</Label>
                  <select
                    id='category'
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className='w-full h-10 px-3 rounded-md border border-input bg-background'
                    disabled={submitting}
                  >
                    {CATEGORIES.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                      >
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>Opis (opcjonalny)</Label>
                  <Input
                    id='description'
                    type='text'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='Co kupiłeś?'
                    disabled={submitting}
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={submitting}
                >
                  {submitting ? 'Dodawanie...' : 'Dodaj wydatek'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Spending List */}
          <div className='space-y-3'>
            <h2 className='text-xl font-bold px-1'>Dzisiejsze wydatki</h2>
            {spendings.length === 0 ? (
              <Card>
                <CardContent className='py-8 text-center text-muted-foreground'>
                  <DollarSign className='h-12 w-12 mx-auto mb-2 opacity-50' />
                  <p>Brak zarejestrowanych wydatków dzisiaj</p>
                  <p className='text-sm'>
                    Kliknij przycisk powyżej, aby dodać!
                  </p>
                </CardContent>
              </Card>
            ) : (
              spendings.map((spending, index) => (
                <motion.div
                  key={spending.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card>
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
                        <span className='text-xs text-muted-foreground'>
                          {new Date(spending.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
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
              className='flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground'
            >
              <CheckSquare className='h-6 w-6' />
              <span className='text-xs'>Zadania</span>
            </Link>
            <Link
              href='/dashboard/spending'
              className='flex flex-col items-center gap-1 text-primary'
            >
              <DollarSign className='h-6 w-6' />
              <span className='text-xs font-medium'>Wydatki</span>
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
