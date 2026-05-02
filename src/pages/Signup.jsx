// src/pages/Signup.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Signup() {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signup(email, password, name.trim());
      navigate('/rooms');
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email':        'Please enter a valid email address.',
        'auth/weak-password':        'Password is too weak.',
      };
      setError(msgs[err.code] || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-surface-900 to-accent-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30 mb-4">
            <span className="text-white text-2xl font-bold">CP</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Join CivicPulse</h1>
          <p className="text-surface-400">Help your community thrive</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="signup-name" className="label text-surface-300">Full Name</label>
              <input
                id="signup-name"
                type="text"
                className="input bg-surface-800/60 border-surface-600 text-surface-100 placeholder-surface-500 focus:ring-primary-400"
                placeholder="Rahul Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="label text-surface-300">Email</label>
              <input
                id="signup-email"
                type="email"
                className="input bg-surface-800/60 border-surface-600 text-surface-100 placeholder-surface-500 focus:ring-primary-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="label text-surface-300">Password</label>
              <input
                id="signup-password"
                type="password"
                className="input bg-surface-800/60 border-surface-600 text-surface-100 placeholder-surface-500 focus:ring-primary-400"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-confirm" className="label text-surface-300">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                className="input bg-surface-800/60 border-surface-600 text-surface-100 placeholder-surface-500 focus:ring-primary-400"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base shadow-lg shadow-primary-500/30 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-surface-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
