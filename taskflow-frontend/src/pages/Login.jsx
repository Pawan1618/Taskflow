import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: '#0C0F1A',
  },
  left: {
    flex: '0 0 45%',
    background: 'linear-gradient(135deg, #0D1B4B 0%, #0C2040 50%, #091529 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftOrb1: {
    position: 'absolute',
    top: '-80px',
    left: '-80px',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,82,204,0.35) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  leftOrb2: {
    position: 'absolute',
    bottom: '-60px',
    right: '-60px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(76,154,255,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    zIndex: 1,
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: '#0052CC',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '0.3px',
  },
  hero: {
    position: 'relative',
    zIndex: 1,
  },
  heroTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0,82,204,0.25)',
    border: '1px solid rgba(76,154,255,0.3)',
    borderRadius: '100px',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#4C9AFF',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '38px',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1.15',
    letterSpacing: '-0.5px',
    marginBottom: '16px',
  },
  heroAccent: {
    color: '#4C9AFF',
  },
  heroSub: {
    fontSize: '15px',
    color: '#6B84AA',
    lineHeight: '1.7',
    maxWidth: '340px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    zIndex: 1,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#B8D0EB',
  },
  featureDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#4C9AFF',
    flexShrink: 0,
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
    background: '#0C0F1A',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
  },
  cardHeader: {
    marginBottom: '32px',
  },
  cardTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '6px',
    letterSpacing: '-0.3px',
  },
  cardSub: {
    fontSize: '14px',
    color: '#6B84AA',
  },
  tabs: {
    display: 'flex',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '28px',
  },
  tab: (active) => ({
    flex: 1,
    padding: '8px 0',
    border: 'none',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: active ? '#0052CC' : 'transparent',
    color: active ? '#fff' : '#6B84AA',
    letterSpacing: '0.2px',
  }),
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,86,48,0.1)',
    border: '1px solid rgba(255,86,48,0.2)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#FF8F6B',
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#8696AD',
    marginBottom: '7px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6B84AA',
    fontSize: '15px',
    pointerEvents: 'none',
    lineHeight: 1,
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 40px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
  },
  submitBtn: (loading) => ({
    width: '100%',
    padding: '13px',
    background: loading ? 'rgba(0,82,204,0.6)' : '#0052CC',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '8px',
    letterSpacing: '0.3px',
    transition: 'background 0.2s, transform 0.1s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }),
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.07)',
  },
  dividerText: {
    fontSize: '12px',
    color: '#6B84AA',
    fontWeight: '500',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#6B84AA',
  },
};

const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

export default function Login() {
  const [mode, setMode] = useState('login');   // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = mode === 'login'
      ? await login({ email, password })
      : await signup({ name, email, password });
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setName(''); setEmail(''); setPassword('');
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-input:focus { border-color: rgba(0,82,204,0.7) !important; background: rgba(255,255,255,0.08) !important; }
        .auth-submit:hover:not(:disabled) { background: #0747A6 !important; transform: translateY(-1px); }
        @media (max-width: 768px) { .auth-left { display: none !important; } }
      `}</style>

      {/* ── Left panel ─────────────────────────────────── */}
      <div style={S.left} className="auth-left">
        <div style={S.leftOrb1} />
        <div style={S.leftOrb2} />

        <div style={S.logo}>
          <div style={S.logoIcon}>TF</div>
          <span style={S.logoText}>TaskFlow</span>
        </div>

        <div style={S.hero}>
          <div style={S.heroTag}>
            <span>●</span> Project Management Platform
          </div>
          <h1 style={S.heroTitle}>
            Ship faster.<br />
            <span style={S.heroAccent}>Stay aligned.</span>
          </h1>
          <p style={S.heroSub}>
            A Jira-inspired workspace to plan sprints,
            track tasks across kanban boards, and keep your
            entire team in sync — in real time.
          </p>
        </div>

        <div style={S.features}>
          {[
            'Drag-and-drop Kanban boards',
            'Gantt timeline view',
            'Team task assignment',
            'Real-time project tracking',
          ].map((f) => (
            <div key={f} style={S.featureItem}>
              <div style={S.featureDot} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────── */}
      <div style={S.right}>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h2 style={S.cardTitle}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={S.cardSub}>
              {mode === 'login'
                ? 'Sign in to your TaskFlow workspace'
                : 'Get started for free — no credit card required'}
            </p>
          </div>

          {/* Tab toggle */}
          <div style={S.tabs}>
            <button style={S.tab(mode === 'login')} onClick={() => switchMode('login')}>
              Sign In
            </button>
            <button style={S.tab(mode === 'signup')} onClick={() => switchMode('signup')}>
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={S.error}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={S.formGroup}>
                <label style={S.label}>Full Name</label>
                <div style={S.inputWrap}>
                  <span style={S.inputIcon}>👤</span>
                  <input
                    className="auth-input"
                    style={S.input}
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div style={S.formGroup}>
              <label style={S.label}>Email Address</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>✉</span>
                <input
                  className="auth-input"
                  style={S.input}
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Password</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>🔒</span>
                <input
                  className="auth-input"
                  style={S.input}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
              style={S.submitBtn(loading)}
            >
              {loading ? <Spinner /> : null}
              {loading
                ? 'Please wait…'
                : mode === 'login' ? 'Sign In to TaskFlow' : 'Create Account'}
            </button>
          </form>

          <div style={S.footer}>
            {mode === 'login' ? (
              <>
                New to TaskFlow?{' '}
                <span
                  onClick={() => switchMode('signup')}
                  style={{ color: '#4C9AFF', cursor: 'pointer', fontWeight: '600' }}
                >
                  Create an account
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span
                  onClick={() => switchMode('login')}
                  style={{ color: '#4C9AFF', cursor: 'pointer', fontWeight: '600' }}
                >
                  Sign in
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
