import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { SeekerDashboard } from './components/SeekerDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { api } from './services/api';
import { LogOut, User, ShieldAlert, Loader2 } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'seeker' | 'employer' | 'admin' | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = api.getToken();
    const role = api.getUserRole();
    const email = api.getUserEmail();

    if (token && role && email) {
      try {
        // Validate with backend
        await api.getCurrentUser();
        setUserRole(role as 'seeker' | 'employer' | 'admin');
        setUserEmail(email);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Session validation failed, logging out:', e);
        api.logout();
      }
    }
    setInitializing(false);
  };

  const handleAuthSuccess = (role: 'seeker' | 'employer' | 'admin', email: string) => {
    setUserRole(role);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
  };

  if (initializing) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        color: 'var(--text-secondary)'
      }}>
        <Loader2 size={36} className="spin" style={{ animation: 'spin-slow 1s linear infinite', color: 'var(--accent-primary)' }} />
        <div>ShaqoDooon Portal-ka waxaa loo diyaarinayaa...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Header Bar */}
      <header className="glass-panel" style={{
        borderRadius: '0px',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff'
          }}>S</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>ShaqoDooon</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{userEmail}</span>
            <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
              {userRole === 'seeker' ? 'Job Seeker' : userRole === 'employer' ? 'Employer' : 'Admin'}
            </span>
          </div>

          <button 
            onClick={handleLogout}
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}
          >
            <LogOut size={14} />
            Kabax (Logout)
          </button>
        </div>
      </header>

      {/* Conditional Dashboard Rendering */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {userRole === 'seeker' || userRole === 'admin' ? (
          <SeekerDashboard userEmail={userEmail} />
        ) : userRole === 'employer' ? (
          <EmployerDashboard userEmail={userEmail} />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <ShieldAlert size={48} style={{ color: 'var(--accent-rose)', marginBottom: '16px' }} />
            <h2>System Error</h2>
            <p>Your user account does not have a valid authorization role.</p>
            <button className="btn btn-primary" onClick={handleLogout} style={{ marginTop: '20px' }}>Log Out</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
