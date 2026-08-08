import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/FormField';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuth();
  
  const isRegister = location.pathname === '/register';

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'STUDENT' | 'STAFF'>('STUDENT');

  useEffect(() => {
    clearError();
  }, [location.pathname, clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: loginEmail, password: loginPassword });
      navigate('/dashboard'); // Will be redirected by layout
    } catch (err) {
      // Error handled by context
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole,
      });
      navigate('/dashboard');
    } catch (err) {
      // Error handled by context
    }
  };

  // Demo shortcuts
  const fillDemoStudent = () => {
    if (isRegister) {
      setRegFullName('Alex Student');
      setRegEmail('alex@student.edu');
      setRegPassword('Student123!');
      setRegRole('STUDENT');
    } else {
      setLoginEmail('alex@student.edu');
      setLoginPassword('Student123!');
    }
  };

  const fillDemoAdmin = () => {
    if (!isRegister) {
      setLoginEmail('admin@campus.edu');
      setLoginPassword('Admin123!');
    }
  };

  const fillDemoStaff = () => {
    if (!isRegister) {
      setLoginEmail('john.doe@campus.edu');
      setLoginPassword('Staff123!');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-container-low flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-start">
        
        {/* Login Card */}
        <div className={`card p-8 md:p-12 transition-all duration-300 ${isRegister ? 'opacity-50 scale-95 md:scale-100 hidden md:block' : 'opacity-100 scale-100'}`}>
          <div className="text-center mb-8">
            <h2 className="text-headline-lg font-bold text-primary mb-2">Welcome Back</h2>
            <p className="text-body-md text-on-surface-variant">Sign in to report or manage campus issues.</p>
          </div>

          {error && !isRegister && (
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

          {!isRegister && (
            <div className="mt-8 text-center text-label-md text-on-surface-variant">
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')} className="text-primary font-bold hover:underline">
                Register here
              </button>
            </div>
          )}

          {!isRegister && (
            <div className="mt-8 pt-6 border-t border-outline-variant">
              <p className="text-label-sm text-outline text-center mb-3">DEMO SHORTCUTS</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={fillDemoStudent} type="button" className="text-xs bg-surface-container-high px-3 py-1.5 rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors">Student</button>
                <button onClick={fillDemoStaff} type="button" className="text-xs bg-surface-container-high px-3 py-1.5 rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors">Staff</button>
                <button onClick={fillDemoAdmin} type="button" className="text-xs bg-surface-container-high px-3 py-1.5 rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors">Admin</button>
              </div>
            </div>
          )}
        </div>

        {/* Register Card */}
        <div className={`card p-8 md:p-12 transition-all duration-300 ${!isRegister ? 'opacity-50 scale-95 md:scale-100 hidden md:block' : 'opacity-100 scale-100'}`}>
          <div className="text-center mb-8">
            <h2 className="text-headline-lg font-bold text-primary mb-2">Create Account</h2>
            <p className="text-body-md text-on-surface-variant">Join FixIt to help improve our campus.</p>
          </div>

          {error && isRegister && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-6 text-label-md">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <FormField
              label="Full Name"
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
            <FormField
              label="Email Address"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="name@campus.edu"
              required
            />
            <FormField
              label="Password"
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="Create a strong password"
              required
            />
            <FormField
              label="Role"
              as="select"
              value={regRole}
              onChange={(e) => setRegRole(e.target.value as any)}
              options={[
                { value: 'STUDENT', label: 'Student' },
                { value: 'STAFF', label: 'Staff Member' }
              ]}
              required
            />
            
            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {isRegister && (
            <div className="mt-8 text-center text-label-md text-on-surface-variant">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">
                Sign in here
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
