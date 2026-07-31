import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    const res = await api.adminLogin(username.trim(), password);
    setLoading(false);

    if (res.success && res.data) {
      sessionStorage.setItem('admin_token', res.data.token);
      navigate('/admin/dashboard');
    } else {
      setError(res.error || 'Login failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-paper px-gutter">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-ash rounded p-8">
          <h1 className="font-serif text-headline-md text-ink-black text-center mb-1">
            <span className="butter-underline">Upanishad Mobile Store</span>
          </h1>
          <p className="font-sans text-body-sm text-smoke text-center mb-8">
            Sign in to manage your store
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-5">
              <p className="font-sans text-body-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-md text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6] transition-colors"
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-md text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6] transition-colors"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#004ac6] text-white font-sans text-label-md uppercase tracking-widest rounded hover:bg-[#003b9e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="font-sans text-caption text-smoke text-center mt-4">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
