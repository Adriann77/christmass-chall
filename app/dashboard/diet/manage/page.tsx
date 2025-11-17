'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';

interface DietMeal {
  id: string;
  day: number;
  mealType: string;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  ingredients: string;
  sortOrder: number;
}

export default function DietManagePage() {
  const router = useRouter();
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<DietMeal | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [formData, setFormData] = useState({
    day: 1,
    mealType: 'Śniadanie',
    name: '',
    kcal: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    ingredients: '',
    sortOrder: 0,
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const res = await fetch('/api/diet-meals');
      if (res.ok) {
        const data = await res.json();
        setMeals(data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMeal) {
        const res = await fetch(`/api/diet-meals/${editingMeal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchMeals();
          resetForm();
        }
      } else {
        const res = await fetch('/api/diet-meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchMeals();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten posiłek?')) return;

    try {
      const res = await fetch(`/api/diet-meals/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchMeals();
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleEdit = (meal: DietMeal) => {
    setEditingMeal(meal);
    setFormData({
      day: meal.day,
      mealType: meal.mealType,
      name: meal.name,
      kcal: meal.kcal,
      protein: meal.protein,
      fat: meal.fat,
      carbs: meal.carbs,
      ingredients: meal.ingredients,
      sortOrder: meal.sortOrder,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      day: selectedDay,
      mealType: 'Śniadanie',
      name: '',
      kcal: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      ingredients: '',
      sortOrder: 0,
    });
    setEditingMeal(null);
    setDialogOpen(false);
  };

  const mealsByDay = meals.reduce((acc, meal) => {
    if (!acc[meal.day]) acc[meal.day] = [];
    acc[meal.day].push(meal);
    return acc;
  }, {} as Record<number, DietMeal[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-red-50 via-green-50 to-red-50 overflow-hidden">
      <div className="shrink-0 bg-gradient-to-r from-red-600 to-green-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/diet')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Zarządzaj Dietą</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={resetForm}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMeal ? 'Edytuj Posiłek' : 'Nowy Posiłek'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="day">Dzień (1-7)</Label>
                    <Input
                      id="day"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.day}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          day: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mealType">Typ posiłku</Label>
                    <select
                      id="mealType"
                      value={formData.mealType}
                      onChange={(e) =>
                        setFormData({ ...formData, mealType: e.target.value })
                      }
                      className="w-full border rounded-md p-2"
                    >
                      <option>Śniadanie</option>
                      <option>Obiad</option>
                      <option>Kolacja</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Nazwa</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nazwa posiłku"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kcal">Kalorie</Label>
                    <Input
                      id="kcal"
                      type="number"
                      value={formData.kcal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kcal: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Białko (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={formData.protein}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          protein: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat">Tłuszcze (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      value={formData.fat}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fat: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs">Węglowodany (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      value={formData.carbs}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          carbs: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ingredients">Składniki (JSON)</Label>
                  <textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                    className="w-full border rounded-md p-2 min-h-[100px]"
                    placeholder='[{"name": "Jajka", "kcal": 150}]'
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingMeal ? 'Zapisz' : 'Dodaj'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Anuluj
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <Button
              key={day}
              variant={selectedDay === day ? 'default' : 'outline'}
              onClick={() => setSelectedDay(day)}
            >
              Dzień {day}
            </Button>
          ))}
        </div>

        {(mealsByDay[selectedDay] || []).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              Brak posiłków dla dnia {selectedDay}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj posiłek
            </Button>
          </Card>
        ) : (
          (mealsByDay[selectedDay] || []).map((meal) => (
            <Card key={meal.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-red-600">
                      {meal.mealType}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{meal.name}</h3>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Kcal:</span>
                      <br />
                      <span className="font-semibold">{meal.kcal}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Białko:</span>
                      <br />
                      <span className="font-semibold">{meal.protein}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tłuszcz:</span>
                      <br />
                      <span className="font-semibold">{meal.fat}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Węgle:</span>
                      <br />
                      <span className="font-semibold">{meal.carbs}g</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(meal)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(meal.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
        </div>
      </div>
    </div>
  );
}
