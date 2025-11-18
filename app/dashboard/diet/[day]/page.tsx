'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckSquare,
  DollarSign,
  Salad,
  Calendar,
  ChevronLeft,
  Flame,
  Utensils,
  Apple,
} from 'lucide-react';
import Link from 'next/link';
import dietData from '@/app/data/diet.json';
import { Button } from '@/components/ui/button';

interface Ingredient {
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Meal {
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  ingredients: Ingredient[];
}

interface DayData {
  day: number;
  total: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  meals: Meal[];
}

export default function DayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dayNumber = parseInt(params.day as string);

  const dayData = dietData.find((d) => d.day === dayNumber) as
    | DayData
    | undefined;

  if (!dayData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-lg text-muted-foreground'>
          Nie znaleziono danych dla tego dnia
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      {/* Main Content */}
      <main className='flex-1 overflow-y-auto pb-20'>
        <div className='container mx-auto px-4 py-6 space-y-6 max-w-2xl'>
          {/* Daily Summary */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className='bg-linear-to-br from-primary/10 to-secondary/10 border-2'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Flame className='h-5 w-5 text-orange-500' />
                  Podsumowanie dnia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-3'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Kalorie</p>
                      <p className='text-2xl font-bold text-primary'>
                        {dayData.total.kcal}{' '}
                        <span className='text-sm'>kcal</span>
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Makroskładniki
                      </p>
                      <div className='space-y-1 mt-2'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='font-medium text-blue-600'>
                            Białko:
                          </span>
                          <span className='font-semibold'>
                            {dayData.total.protein}g
                          </span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='font-medium text-yellow-600'>
                            Tłuszcz:
                          </span>
                          <span className='font-semibold'>
                            {dayData.total.fat}g
                          </span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='font-medium text-green-600'>
                            Węgle:
                          </span>
                          <span className='font-semibold'>
                            {dayData.total.carbs}g
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Meals Section */}
          <div className='space-y-3'>
            <h2 className='text-xl font-bold px-1 flex items-center gap-2'>
              <Utensils className='h-5 w-5' />
              Posiłki
            </h2>

            <Accordion
              type='single'
              collapsible
              className='space-y-3'
            >
              {dayData.meals.map((meal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                >
                  <AccordionItem
                    value={`meal-${index}`}
                    className='border-0'
                  >
                    <Card className='overflow-hidden'>
                      <AccordionTrigger className='hover:no-underline px-6 py-4'>
                        <div className='flex items-start justify-between w-full pr-4'>
                          <div className='flex items-start gap-3'>
                            <div className='bg-primary/10 rounded-full p-2 mt-1'>
                              <Apple className='h-4 w-4 text-primary' />
                            </div>
                            <div className='text-left'>
                              <h3 className='font-semibold text-base'>
                                {meal.name}
                              </h3>
                              <p className='text-sm text-muted-foreground mt-1'>
                                {meal.kcal} kcal
                              </p>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className='px-6 pb-4 space-y-4'>
                          {/* Meal Macros */}
                          <div className='bg-secondary/30 rounded-lg p-4'>
                            <p className='text-sm font-semibold mb-3'>
                              Wartości odżywcze
                            </p>
                            <div className='grid grid-cols-4 gap-2 text-center'>
                              <div>
                                <p className='text-xs text-muted-foreground'>
                                  Kalorie
                                </p>
                                <p className='font-bold text-sm'>{meal.kcal}</p>
                              </div>
                              <div>
                                <p className='text-xs text-blue-600'>Białko</p>
                                <p className='font-bold text-sm'>
                                  {meal.protein}g
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-yellow-600'>
                                  Tłuszcz
                                </p>
                                <p className='font-bold text-sm'>{meal.fat}g</p>
                              </div>
                              <div>
                                <p className='text-xs text-green-600'>Węgle</p>
                                <p className='font-bold text-sm'>
                                  {meal.carbs}g
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Ingredients */}
                          <div>
                            <p className='text-sm font-semibold mb-3'>
                              Składniki
                            </p>
                            <div className='space-y-2'>
                              {meal.ingredients.map((ingredient, idx) => (
                                <div
                                  key={idx}
                                  className='bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors'
                                >
                                  <div className='flex items-center justify-between mb-2'>
                                    <span className='font-medium text-sm'>
                                      {ingredient.name}
                                    </span>
                                    <span className='text-sm text-muted-foreground'>
                                      {ingredient.kcal} kcal
                                    </span>
                                  </div>
                                  <div className='flex gap-4 text-xs'>
                                    <span className='text-blue-600'>
                                      B: {ingredient.protein}g
                                    </span>
                                    <span className='text-yellow-600'>
                                      T: {ingredient.fat}g
                                    </span>
                                    <span className='text-green-600'>
                                      W: {ingredient.carbs}g
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
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
