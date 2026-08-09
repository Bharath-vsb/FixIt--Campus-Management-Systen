import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/FormField';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: loginEmail, password: loginPassword });
      navigate('/dashboard'); // Will be redirected by layout
    } catch (err) {
      // Error handled by context
    }
  };

  const fillDemoStudent = () => {
    setLoginEmail('alex@student.edu');
    setLoginPassword('');
  };

  const fillDemoAdmin = () => {
    setLoginEmail('admin@campus.edu');
    setLoginPassword('');
  };

  const fillDemoStaff = () => {
    setLoginEmail('john.doe@campus.edu');
    setLoginPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-container-low flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-headline-lg font-bold text-primary mb-2">Welcome Back</h2>
          <p className="text-body-md text-on-surface-variant">Sign in to report or manage campus issues.</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-6 text-label-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <FormField
            label="Email Address"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="name@campus.edu"
            required
          />
          <FormField
            label="Password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          
          <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-label-md text-on-surface-variant">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="text-primary font-bold hover:underline">
            Register here
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant">
          <p className="text-label-sm text-outline text-center mb-3">DEMO SHORTCUTS</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={fillDemoStudent} type="button" className="text-xs bg-surface-container-high px-3 py-1.5 rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors">Student</button>
            <button onClick={fillDemoStaff} type="button" className="text-xs bg-surface-container-high px-3 py-1.5 rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors">Staff</button>
            <button onClick={fillDemoAdmin} type="button" className="text-xs bg-surface-container-high px-3 py-1.5 rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors">Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
