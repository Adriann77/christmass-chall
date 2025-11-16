'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-primary/10 via-background to-secondary/10'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'
      >
        <Card className='border-2 shadow-xl'>
          <CardHeader className='text-center space-y-2'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className='text-6xl mb-4'
            >
              🎄
            </motion.div>
            <CardTitle className='text-3xl font-bold text-primary'>
              Utwórz Konto
            </CardTitle>
            <CardDescription className='text-base'>
              Dołącz do wyzwania świątecznego!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <Label htmlFor='name'>Imię</Label>
                <Input
                  id='name'
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Wprowadź swoje imię'
                  required
                  disabled={loading}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='username'>Nazwa użytkownika</Label>
                <Input
                  id='username'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder='Wybierz nazwę użytkownika'
                  required
                  disabled={loading}
                  minLength={3}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>Hasło</Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Wybierz hasło'
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='text-sm text-destructive'
                >
                  {error}
                </motion.p>
              )}
              <Button
                type='submit'
                className='w-full'
                disabled={loading}
              >
                {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
              </Button>
              <p className='text-sm text-center text-muted-foreground mt-4'>
                Masz już konto?{' '}
                <Link
                  href='/login'
                  className='text-primary hover:underline font-medium'
                >
                  Zaloguj się
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
