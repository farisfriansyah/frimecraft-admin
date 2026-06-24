'use client';

import { Button } from '@/src/app/ui/button';
import { Input } from '@/src/app/ui/input';
import { Label } from '@/src/app/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/app/ui/card';
import { toast } from 'sonner';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/src/actions/auth-actions'; // Impor Server Action

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);

      if (result.success) {
        toast.success('Login berhasil!', {
          description: 'Selamat datang di dashboard admin.',
        });
        // Gunakan replace agar user tidak bisa kembali ke halaman login via tombol "Back"
        router.replace('/admin'); 
      } else {
        toast.error('Gagal login', {
          description: result.message || 'Email atau password salah.',
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Frimecraft Admin</CardTitle>
          <CardDescription className="text-center">
            Masuk untuk mengelola dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}