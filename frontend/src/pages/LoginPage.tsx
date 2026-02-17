import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/src/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      await login(data);
      navigate('/discovery');
    } catch (error) {
      console.error('Login failed:', error);
      // You can add user-facing error handling here
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required {...register('password')} />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
