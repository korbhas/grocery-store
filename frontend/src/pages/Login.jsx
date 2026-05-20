import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-fm-paper)',
      padding: '24px 16px',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--color-fm-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: 22, fontWeight: 800, color: '#fff',
            letterSpacing: -0.5,
          }}>
            FM
          </div>
        </div>

        {/* Headings */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 13, color: 'var(--color-fm-ink3)', fontWeight: 500, marginBottom: 6,
          }}>
            Your groceries, delivered in minutes
          </div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 22, fontWeight: 700, color: 'var(--color-fm-ink)',
          }}>
            Log in or Sign up
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%', height: 48, borderRadius: 8,
              border: '1.5px solid var(--color-fm-line-soft)',
              padding: '0 14px', fontSize: 14,
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-fm-ink)',
              background: '#fff', outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-fm-green)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-fm-line-soft)'}
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%', height: 48, borderRadius: 8,
              border: '1.5px solid var(--color-fm-line-soft)',
              padding: '0 14px', fontSize: 14,
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-fm-ink)',
              background: '#fff', outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-fm-green)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-fm-line-soft)'}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 48, borderRadius: 8,
              background: loading ? 'var(--color-fm-ink3)' : 'var(--color-fm-green)',
              color: '#fff', border: 'none',
              fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              marginTop: 4,
            }}
          >
            {loading ? 'Logging in…' : 'Continue'}
          </button>
        </form>

        {/* Register link */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--color-fm-ink2)' }}>
          New to FreshMart?{' '}
          <Link to="/register" style={{
            color: 'var(--color-fm-green)', fontWeight: 600, textDecoration: 'none',
          }}>
            Create account
          </Link>
        </div>

        {/* Terms */}
        <div style={{
          textAlign: 'center', marginTop: 24,
          fontSize: 11, color: 'var(--color-fm-ink3)', lineHeight: 1.6,
        }}>
          By continuing, you agree to our{' '}
          <a href="/terms" style={{ color: 'var(--color-fm-ink2)', textDecoration: 'underline' }}>
            Terms of service
          </a>
          {' '}&amp;{' '}
          <a href="/privacy" style={{ color: 'var(--color-fm-ink2)', textDecoration: 'underline' }}>
            Privacy policy
          </a>
        </div>

      </div>
    </div>
  );
}
