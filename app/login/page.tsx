'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // In production, this would use Supabase Auth
    // For now, redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-scrapbook-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold text-scrapbook-900 mb-2">Digital Scrapbook Studio</h1>
        <p className="text-scrapbook-500 text-sm mb-6">Sign in to continue</p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-scrapbook-700 hover:bg-scrapbook-800 text-white rounded-lg font-medium transition-smooth disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Continue as Admin'}
        </button>
      </div>
    </div>
  );
}
