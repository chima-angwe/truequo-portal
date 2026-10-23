import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from '../components/BrandMark';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'verifier' ? '/my-tasks' : user.role === 'client' ? '/client' : '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'We could not sign you in. Check your details and try again.');
    } finally { setLoading(false); }
  }

  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <BrandWordmark />
        <div className="login-brand-message">
          <div className="eyebrow">VERIFICATION OPERATIONS</div>
          <h1>Make every decision <span>count.</span></h1>
          <p>One clear view of every verification, every finding, and every next step.</p>
        </div>
        <div className="login-brand-foot">A clearer standard for trusted work.</div>
      </section>
      <section className="login-form-side">
        <form onSubmit={handleSubmit} className="login-card">
          <div className="page-eyebrow">YOUR WORKSPACE</div>
          <h2>Welcome back</h2>
          <p className="login-card-intro">Sign in to continue to TrueQuo.</p>
          <div className="login-field"><label htmlFor="email">Work email</label><input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></div>
          <div className="login-field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" /></div>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button type="submit" disabled={loading} className="login-submit">{loading ? 'Signing in…' : 'Sign in'}</button>
          <div className="login-helper">Your access and workspace are based on your account role.</div>
        </form>
      </section>
    </main>
  );
}
