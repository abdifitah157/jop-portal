import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, Mail, Phone, Briefcase, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (role: 'seeker' | 'employer' | 'admin', email: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        await api.login(email, password);
        const loggedInRole = api.getUserRole() as 'seeker' | 'employer' | 'admin';
        const loggedInEmail = api.getUserEmail() || email;
        onAuthSuccess(loggedInRole, loggedInEmail);
      } else {
        // Register
        await api.register(email, password, phone, role);
        // Automatically login after registration
        await api.login(email, password);
        const loggedInRole = api.getUserRole() as 'seeker' | 'employer' | 'admin';
        const loggedInEmail = api.getUserEmail() || email;
        onAuthSuccess(loggedInRole, loggedInEmail);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      position: 'relative'
    }}>
      <div className="gradient-blob" style={{ top: '10%', left: '10%' }}></div>
      <div className="gradient-blob" style={{ bottom: '10%', right: '10%' }}></div>

      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px', background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ShaqoDooon
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isLogin 
              ? 'Ku soo dhowow Portal-ka Shaqo raadinta ee Soomaaliya' 
              : 'Abuur akoon si aad u bilowdo isticmaalka portal-ka'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          marginBottom: '28px'
        }}>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              background: isLogin ? 'var(--bg-tertiary)' : 'transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px'
            }}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Soo gal (Login)
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              background: !isLogin ? 'var(--bg-tertiary)' : 'transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px'
            }}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Isku qor (Register)
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--accent-rose-glow)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="tusaale@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Geli Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Registration Fields */}
          {!isLogin && (
            <>
              {/* Phone */}
              <div className="form-group">
                <label className="form-label font-bold">Nambarka Telefoonka</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    required
                    className="form-input"
                    style={{ paddingLeft: '44px' }}
                    placeholder="+252 61 XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Picker */}
              <div className="form-group">
                <label className="form-label">Dooro Kaalintaada (Role)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Seeker */}
                  <div
                    onClick={() => setRole('seeker')}
                    style={{
                      border: '1px solid',
                      borderColor: role === 'seeker' ? 'var(--accent-primary)' : 'var(--border-color)',
                      background: role === 'seeker' ? 'var(--accent-primary-glow)' : 'rgba(255, 255, 255, 0.02)',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <UserIcon size={24} style={{ color: role === 'seeker' ? 'var(--accent-primary)' : 'var(--text-muted)', marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Shaqo Doon</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Job Seeker</div>
                  </div>

                  {/* Employer */}
                  <div
                    onClick={() => setRole('employer')}
                    style={{
                      border: '1px solid',
                      borderColor: role === 'employer' ? 'var(--accent-primary)' : 'var(--border-color)',
                      background: role === 'employer' ? 'var(--accent-primary-glow)' : 'rgba(255, 255, 255, 0.02)',
                      padding: '16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <Briefcase size={24} style={{ color: role === 'employer' ? 'var(--accent-primary)' : 'var(--text-muted)', marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Shaqo Bixiye</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Employer</div>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '16px' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" style={{ animation: 'spin-slow 1s linear infinite' }} />
                Waxaa la socotaa codsiga...
              </>
            ) : (
              isLogin ? 'Soo Gal' : 'Abuur Akoon'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
