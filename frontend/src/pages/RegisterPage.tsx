import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/src/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      // You can add user-facing error handling here
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" type="text" required {...register('firstName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" type="text" required {...register('lastName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required {...register('password')} />
            </div>
            <Button type="submit" className="w-full">Register</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
