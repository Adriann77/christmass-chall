'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, DollarSign, Salad, Calendar, Settings } from 'lucide-react';
import ExpenseModal from './ExpenseModal';

export default function BottomNav() {
  const pathname = usePathname();

  // Only show on dashboard routes
  if (!pathname?.startsWith('/dashboard')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50 pb-safe'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-around py-3 items-center'>
          <Link
            href='/dashboard'
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/dashboard')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className='h-6 w-6' />
            <span className='text-xs font-medium'>Zadania</span>
          </Link>
          
          <ExpenseModal 
            trigger={
              <button
                className={`flex flex-col items-center gap-1 transition-colors text-muted-foreground hover:text-foreground`}
              >
                <DollarSign className='h-6 w-6' />
                <span className='text-xs'>Dodaj wydatek</span>
              </button>
            }
          />

          <Link
            href='/dashboard/settings/tasks'
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/dashboard/settings/tasks')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className='h-6 w-6' />
            <span className='text-xs'>Zarządzaj</span>
          </Link>

          <Link
            href='/dashboard/summary'
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/dashboard/summary')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className='h-6 w-6' />
            <span className='text-xs'>Podsumowanie</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
