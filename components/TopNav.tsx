'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Only show on dashboard routes
  if (!pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className='fixed top-0 right-0 z-50 p-4'>
      <Button
        variant='ghost'
        size='icon'
        onClick={handleLogout}
        className='border-0'
      >
        <LogOut className='h-5 w-5' />
      </Button>
    </nav>
  );
}

