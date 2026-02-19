import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/src/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  major?: string;
};

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterFormData>();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [studyHabitInput, setStudyHabitInput] = useState('');
  const [studyHabits, setStudyHabits] = useState<string[]>([]);

  const addStudyHabit = (value: string) => {
    const next = value.trim();
    if (!next) return;
    if (studyHabits.some((habit) => habit.toLowerCase() === next.toLowerCase())) return;
    setStudyHabits((prev) => [...prev, next]);
    setStudyHabitInput('');
  };

  const removeStudyHabit = (value: string) => {
    setStudyHabits((prev) => prev.filter((habit) => habit !== value));
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const mergedHabits = [...studyHabits];
      if (studyHabitInput.trim()) mergedHabits.push(studyHabitInput.trim());
      const uniqueHabits = mergedHabits.filter((habit, idx, arr) => arr.findIndex((h) => h.toLowerCase() === habit.toLowerCase()) === idx);
      await registerUser({
        ...data,
        major: data.major?.trim() ? data.major : undefined,
        studyHabits: uniqueHabits.length ? uniqueHabits.join(', ') : undefined,
      });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded bg-gray-800 text-sm font-bold text-white">
            S
          </div>
          <h1 className="text-lg font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-gray-600">Get started in 30 seconds</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" type="text" placeholder="Jane" required {...register('firstName')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" type="text" placeholder="Doe" required {...register('lastName')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required {...register('email')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required {...register('password')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="major">Major</Label>
              <select
                id="major"
                {...register('major')}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
                defaultValue=""
              >
                <option value="" disabled>Select your major</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Biology">Biology</option>
                <option value="Psychology">Psychology</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="studyHabits">Study habits</Label>
              <Input
                id="studyHabits"
                type="text"
                value={studyHabitInput}
                onChange={(e) => setStudyHabitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === ' ') {
                    e.preventDefault();
                    addStudyHabit(studyHabitInput);
                  } else if (e.key === 'Backspace' && !studyHabitInput && studyHabits.length) {
                    e.preventDefault();
                    setStudyHabits((prev) => prev.slice(0, -1));
                  }
                }}
                placeholder="Type a habit and press Space"
              />
              {studyHabits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {studyHabits.map((habit) => (
                    <Badge key={habit} variant="secondary" className="gap-1 pr-1">
                      {habit}
                      <button
                        type="button"
                        className="rounded p-0.5 hover:bg-gray-200"
                        onClick={() => removeStudyHabit(habit)}
                        aria-label={`Remove ${habit}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-gray-900 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
