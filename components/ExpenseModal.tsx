'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORIES = [
  'Jedzenie i picie',
  'Zakupy',
  'Transport',
  'Rozrywka',
  'Zdrowie i fitness',
  'Rachunki',
  'Inne',
];

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
}

interface ExpenseModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function ExpenseModal({ trigger, onSuccess }: ExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyExpenses, setDailyExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  // Reset date to today when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDate(new Date());
      setAmount('');
      setDescription('');
      setCategory(CATEGORIES[0]);
    }
  }, [open]);

  const fetchDailyExpenses = async (date: Date) => {
    setLoadingExpenses(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/tasks/by-date?date=${formattedDate}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.task && data.task.spendings) {
          setDailyExpenses(data.task.spendings);
        } else {
          setDailyExpenses([]);
        }
      } else {
        setDailyExpenses([]);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setDailyExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDailyExpenses(selectedDate);
    }
  }, [open, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Close modal immediately
    setOpen(false);
    
    // Show pending toast
    const toastId = toast.loading('Dodawanie wydatku...');

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      let taskId;
      
      // 1. Try to get existing task
      const taskRes = await fetch(`/api/tasks/by-date?date=${formattedDate}`);
      if (taskRes.ok) {
          const taskData = await taskRes.json();
          taskId = taskData.task?.id;
      }

      // 2. If not found, create it
      if (!taskId) {
           const createRes = await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date: formattedDate }),
           });
           
           if (createRes.ok) {
               const createData = await createRes.json();
               taskId = createData.task.id;
           }
      }

      if (!taskId) {
          throw new Error('Could not find or create daily task for this date');
      }

      const response = await fetch('/api/spendings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyTaskId: taskId,
          amount: parseFloat(amount),
          category,
          description: description || null,
        }),
      });

      if (response.ok) {
        toast.success('Wydatek dodany!', { id: toastId });
        
        if (onSuccess) onSuccess();
        
        // Refresh the page data in background if needed, or rely on next visit/swr
        // Since we closed the modal, the user is back on the previous screen.
        // If they are on the dashboard, we might want to refresh.
        // window.location.reload() is too jarring.
        // Ideally we use router.refresh() but we are in a client component.
        // Let's assume the user will see updated data when they navigate or we can try to refresh if possible.
        // For now, just success toast is good.
      } else {
        throw new Error('Failed to add spending');
      }
    } catch (error) {
      console.error('Failed to add spending:', error);
      toast.error('Błąd podczas dodawania wydatku', { id: toastId });
      // Re-open modal? Maybe not, user might have moved on.
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Dodaj wydatek
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md top-0 mt-12 translate-y-0 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj nowy wydatek</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        locale={pl}
                    />
                    </PopoverContent>
                </Popover>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Kwota (zł)</Label>
                <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Kategoria</Label>
                <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                    {cat}
                    </option>
                ))}
                </select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Opis (opcjonalny)</Label>
                <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Co kupiłeś?"
                />
            </div>
            <Button type="submit" className="w-full">
                Dodaj wydatek
            </Button>
            </form>

            {/* Daily Expenses List */}
            <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Wydatki z tego dnia</h4>
                {loadingExpenses ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : dailyExpenses.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {dailyExpenses.map((expense) => (
                            <div key={expense.id} className="flex justify-between items-center text-sm p-2 bg-secondary/10 rounded-md">
                                <span className="font-medium">{expense.category}</span>
                                <span className="font-bold">{expense.amount.toFixed(2)} zł</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center text-sm p-2 font-bold border-t mt-2">
                            <span>Suma:</span>
                            <span>{dailyExpenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)} zł</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">Brak wydatków tego dnia</p>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
