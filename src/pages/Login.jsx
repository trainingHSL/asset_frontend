import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { saveSession } from '../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('organization');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'organization' ? '/auth/organization-login' : '/auth/user-login';
      const { data } = await api.post(endpoint, form);
      saveSession(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-hero">
        <p className="eyebrow">Hero Steels Inspired</p>
        <h1>Control every laptop, cable, signature and return from one beautiful cockpit.</h1>
        <p>
          Organization-wise and user-wise IT asset management with assignment, digital sign,
          returns, material stock and reports.
        </p>
        <div className="hero-grid">
          <span>QR-ready Assets</span>
          <span>Digital Signature</span>
          <span>Excel Import</span>
          <span>Material Stock</span>
        </div>
      </div>

      <form className="login-card glass" onSubmit={submit}>
        <div className="brand center">
          <div className="brand-mark">IT</div>
          <div>
            <h2>AssetHub</h2>
            <span>Sign in to continue</span>
          </div>
        </div>

        <div className="toggle">
          <button type="button" className={mode === 'organization' ? 'active' : ''} onClick={() => setMode('organization')}>
            Organization
          </button>
          <button type="button" className={mode === 'user' ? 'active' : ''} onClick={() => setMode('user')}>
            User
          </button>
        </div>

        {error && <div className="alert">{error}</div>}

        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        <button className="btn full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <small className="hint">First create organization using backend API: POST /api/organizations/register</small>
      </form>
    </div>
  );
}
