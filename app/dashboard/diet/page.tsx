'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckSquare,
  DollarSign,
  Salad,
  Calendar,
  ChevronRight,
  Flame,
  Apple,
} from 'lucide-react';
import dietData from '@/app/data/diet.json';

export default function DietPage() {
  return (
    <div className='min-h-screen flex flex-col bg-background'>
      {/* Header */}
      <header className='sticky top-0 z-10 bg-card border-b shadow-sm'>
        <div className='container mx-auto px-4 py-4'>
          <h1 className='text-2xl font-bold text-center flex items-center justify-center gap-2'>
            <Salad className='h-7 w-7 text-primary' />
            Plan Diety
          </h1>
          <p className='text-center text-sm text-muted-foreground mt-1'>
            7-dniowy plan żywieniowy
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 overflow-y-auto pb-20'>
        <div className='container mx-auto px-4 py-6 space-y-4 max-w-2xl'>
          {dietData.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link href={`/dashboard/diet/${day.day}`}>
                <Card className='cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center justify-between'>
                      <span className='text-xl'>Dzień {day.day}</span>
                      <ChevronRight className='h-5 w-5 text-muted-foreground' />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    {/* Meals Summary */}
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Apple className='h-4 w-4' />
                      <span>{day.meals.length} posiłki</span>
                    </div>

                    {/* Macros Summary */}
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='bg-secondary/50 rounded-lg p-3'>
                        <div className='flex items-center gap-2 mb-1'>
                          <Flame className='h-4 w-4 text-orange-500' />
                          <span className='text-xs text-muted-foreground'>
                            Kalorie
                          </span>
                        </div>
                        <p className='text-lg font-bold'>
                          {day.total.kcal} kcal
                        </p>
                      </div>
                      <div className='bg-secondary/50 rounded-lg p-3'>
                        <div className='text-xs text-muted-foreground mb-1'>
                          Makroskładniki
                        </div>
                        <div className='space-y-1 text-sm'>
                          <p>
                            <span className='font-semibold text-blue-600'>
                              B:
                            </span>{' '}
                            {day.total.protein}g
                          </p>
                          <p>
                            <span className='font-semibold text-yellow-600'>
                              T:
                            </span>{' '}
                            {day.total.fat}g
                          </p>
                          <p>
                            <span className='font-semibold text-green-600'>
                              W:
                            </span>{' '}
                            {day.total.carbs}g
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
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
              className='flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground'
            >
              <DollarSign className='h-6 w-6' />
              <span className='text-xs'>Wydatki</span>
            </Link>
            <Link
              href='/dashboard/diet'
              className='flex flex-col items-center gap-1 text-primary'
            >
              <Salad className='h-6 w-6' />
              <span className='text-xs font-medium'>Dieta</span>
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
