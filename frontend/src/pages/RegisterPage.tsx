import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/FormField';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobileNumber, setRegMobileNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'STUDENT' | 'STAFF'>('STUDENT');

  const [formError, setFormError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (regPassword !== regConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!regMobileNumber.trim()) {
      setFormError('Mobile number is required.');
      return;
    }

    try {
      const result = await register({
        fullName: regFullName,
        email: regEmail,
        mobileNumber: regMobileNumber,
        password: regPassword,
        role: regRole,
      });

      if (result.pending) {
        setRegistrationSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error handled by context
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-surface-container-low flex items-center justify-center p-4">
        <div className="w-full max-w-md card p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface mb-4">Registration Successful</h2>
          <p className="text-body-lg text-on-surface-variant mb-8">
            Your staff account has been submitted for admin approval. Once an administrator approves your account, you can sign in.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface-container-low flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-headline-lg font-bold text-primary mb-2">Create Account</h2>
          <p className="text-body-md text-on-surface-variant">Join FixIt to help improve our campus.</p>
        </div>

        {(error || formError) && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-6 text-label-md">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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
            label="Mobile Number *"
            type="tel"
            value={regMobileNumber}
            onChange={(e) => setRegMobileNumber(e.target.value)}
            placeholder="+91 9876543210"
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
            label="Confirm Password"
            type="password"
            value={regConfirmPassword}
            onChange={(e) => setRegConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
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
          
          <div className="text-label-sm text-on-surface-variant pt-2 pb-4">
            {regRole === 'STUDENT' 
              ? "Your account will be ready to use after registration."
              : "Staff accounts require administrator approval before you can sign in."}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-label-md text-on-surface-variant">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
