import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { saveSession } from '../services/api.js';

const emptyLogin = { email: '', password: '' };
const emptyRegister = {
  organizationName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
};

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('organization');
  const [screen, setScreen] = useState('login');
  const [form, setForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getErrorMessage = (err, fallback) => {
    if (err.response?.data?.message) {
      return Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
    }
    if (err.code === 'ERR_NETWORK') return 'Backend se connection nahi ho raha. Check karo backend 5000 port par running hai aur CORS enabled hai.';
    return fallback;
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const endpoint = mode === 'organization' ? '/auth/organization-login' : '/auth/user-login';
      const { data } = await api.post(endpoint, form);
      saveSession(data);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const registerOrganization = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/organizations/register', registerForm);
      setSuccess('Organization created. Ab Organization login se sign in karo.');
      setForm({ email: registerForm.email, password: registerForm.password });
      setRegisterForm(emptyRegister);
      setScreen('login');
      setMode('organization');
    } catch (err) {
      setError(getErrorMessage(err, 'Organization registration failed'));
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

      {screen === 'login' ? (
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
          {success && <div className="alert success-alert">{success}</div>}

          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

          <button className="btn full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          <button type="button" className="link-btn" onClick={() => { setScreen('register'); setError(''); setSuccess(''); }}>
            New organization? Create account
          </button>
        </form>
      ) : (
        <form className="login-card glass" onSubmit={registerOrganization}>
          <div className="brand center">
            <div className="brand-mark">IT</div>
            <div>
              <h2>Create Organization</h2>
              <span>First-time setup</span>
            </div>
          </div>

          {error && <div className="alert">{error}</div>}

          <label>Organization Name</label>
          <input value={registerForm.organizationName} onChange={(e) => setRegisterForm({ ...registerForm, organizationName: e.target.value })} required />

          <label>Email</label>
          <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />

          <label>Phone</label>
          <input value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} required />

          <label>Address</label>
          <input value={registerForm.address} onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })} />

          <label>Password</label>
          <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required minLength="6" />

          <button className="btn full" disabled={loading}>{loading ? 'Creating...' : 'Create Organization'}</button>
          <button type="button" className="link-btn" onClick={() => { setScreen('login'); setError(''); }}>
            Back to login
          </button>
        </form>
      )}
    </div>
  );
}
