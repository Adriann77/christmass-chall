'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, DollarSign, Salad, Calendar } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Only show on dashboard routes
  if (!pathname?.startsWith('/dashboard')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-around py-3'>
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
          <Link
            href='/dashboard/spending'
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/dashboard/spending')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <DollarSign className='h-6 w-6' />
            <span className='text-xs'>Wydatki</span>
          </Link>
          <Link
            href='/dashboard/diet'
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname?.startsWith('/dashboard/diet')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Salad className='h-6 w-6' />
            <span className='text-xs'>Dieta</span>
          </Link>
          <Link
            href='/dashboard/calendar'
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/dashboard/calendar')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className='h-6 w-6' />
            <span className='text-xs'>Kalendarz</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
