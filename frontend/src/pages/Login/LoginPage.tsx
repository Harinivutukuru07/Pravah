import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome to PRAVAH!');
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1>PRAVAH</h1>
          <p>Industrial ERP Platform</p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--color-error-light)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              color: 'var(--color-error)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pravah.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Demo Credentials
          </p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Admin: admin@pravah.com &nbsp;|&nbsp; Sales: sales@pravah.com
          </p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
}
