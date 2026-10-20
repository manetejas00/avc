import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface border border-white/5 rounded-2xl p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gold-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-gold-primary w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-text">Admin Login</h1>
          <p className="text-text-muted mt-2 text-center text-sm">Sign in to manage consultations and website settings</p>
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 break-words">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-text mb-1">Email</label>
            <input
              id="admin-email" autoComplete="username" type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              className="w-full px-4 py-2.5 bg-background border border-white/5 rounded-lg text-text focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-text mb-1">Password</label>
            <input
              id="admin-password" autoComplete="current-password" type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-background border border-white/5 rounded-lg text-text focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-primary hover:bg-gold-secondary text-bg-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
