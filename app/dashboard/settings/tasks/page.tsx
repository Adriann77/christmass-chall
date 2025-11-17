'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Dumbbell,
  Apple,
  Book,
  GraduationCap,
  Droplet,
  CheckCircle,
  Heart,
  Utensils,
  Coffee,
  Moon,
  Sun,
  Zap,
  Target,
  Award,
  Smile,
  Music,
  Camera,
  Pill,
  Bike,
} from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

const ICON_OPTIONS = [
  { value: 'TrendingUp', label: 'Kroki', Icon: TrendingUp },
  { value: 'Dumbbell', label: 'Trening', Icon: Dumbbell },
  { value: 'Apple', label: 'Jabłko', Icon: Apple },
  { value: 'Book', label: 'Książka', Icon: Book },
  { value: 'GraduationCap', label: 'Nauka', Icon: GraduationCap },
  { value: 'Droplet', label: 'Woda', Icon: Droplet },
  { value: 'CheckCircle', label: 'Check', Icon: CheckCircle },
  { value: 'Heart', label: 'Serce', Icon: Heart },
  { value: 'Utensils', label: 'Jedzenie', Icon: Utensils },
  { value: 'Coffee', label: 'Kawa', Icon: Coffee },
  { value: 'Moon', label: 'Sen', Icon: Moon },
  { value: 'Sun', label: 'Słońce', Icon: Sun },
  { value: 'Zap', label: 'Energia', Icon: Zap },
  { value: 'Target', label: 'Cel', Icon: Target },
  { value: 'Award', label: 'Nagroda', Icon: Award },
  { value: 'Smile', label: 'Uśmiech', Icon: Smile },
  { value: 'Music', label: 'Muzyka', Icon: Music },
  { value: 'Camera', label: 'Zdjęcia', Icon: Camera },
  { value: 'Pill', label: 'Zdrowie', Icon: Pill },
  { value: 'Bike', label: 'Rower', Icon: Bike },
];

export default function TaskTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: '',
    icon: 'CheckCircle',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/task-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTemplate) {
        // Update existing
        const res = await fetch(`/api/task-templates/${editingTemplate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchTemplates();
          resetForm();
        }
      } else {
        // Create new
        const res = await fetch('/api/task-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          await fetchTemplates();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) return;

    try {
      const res = await fetch(`/api/task-templates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      icon: template.icon,
      isActive: template.isActive,
      sortOrder: template.sortOrder,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'CheckCircle',
      isActive: true,
      sortOrder: templates.length,
    });
    setEditingTemplate(null);
    setDialogOpen(false);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
    return iconOption ? iconOption.Icon : CheckCircle;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-red-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-green-600 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Zarządzaj Zadaniami</h1>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edytuj Zadanie' : 'Nowe Zadanie'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nazwa</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nazwa zadania"
                    required
                  />
                </div>

                <div>
                  <Label>Ikona</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2 max-h-60 overflow-y-auto">
                    {ICON_OPTIONS.map((option) => {
                      const Icon = option.Icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, icon: option.value })
                          }
                          className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                            formData.icon === option.value
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: !!checked })
                    }
                  />
                  <Label htmlFor="isActive">Aktywne</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingTemplate ? 'Zapisz' : 'Dodaj'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Anuluj
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-4 space-y-4">
        {templates.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              Nie masz jeszcze żadnych zadań
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj pierwsze zadanie
            </Button>
          </Card>
        ) : (
          templates.map((template) => {
            const Icon = getIconComponent(template.icon);
            return (
              <Card key={template.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        template.isActive
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-500">
                        Kolejność: {template.sortOrder} •{' '}
                        {template.isActive ? 'Aktywne' : 'Nieaktywne'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
