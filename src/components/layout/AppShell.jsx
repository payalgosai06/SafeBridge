import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShieldCheck, 
  FolderLock, 
  ClockAlert, 
  Briefcase, 
  Settings,
  Shield,
  FileCheck2
} from 'lucide-react';
import DisclaimerBanner from './DisclaimerBanner';
import PanicButton from './PanicButton';
import PasscodeLock from './PasscodeLock';
import useAppStore from '../../store/useAppStore';
import { getSetting } from '../../services/storage';

export default function AppShell() {
  const [hasPasscode, setHasPasscode] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [checkingPasscode, setCheckingPasscode] = useState(true);
  
  const activeCase = useAppStore((s) => s.activeCase);
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);
  const location = useLocation();

  useEffect(() => {
    async function checkLock() {
      try {
        const storedHash = await getSetting('passcode_hash');
        if (storedHash) {
          setHasPasscode(true);
          // Check if unlocked in this tab session
          const sessionUnlock = sessionStorage.getItem('safestep_unlocked');
          if (sessionUnlock === 'true') {
            setUnlocked(true);
          }
        } else {
          setUnlocked(true);
        }
      } catch (err) {
        console.error('Lock check error:', err);
        setUnlocked(true);
      } finally {
        setCheckingPasscode(false);
      }
    }
    checkLock();
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem('safestep_unlocked', 'true');
    setUnlocked(true);
  };

  if (checkingPasscode) {
    return (
      <div className="lock-screen" style={{ color: 'var(--text-secondary)' }}>
        <Shield size={36} className="animate-spin" style={{ opacity: 0.8 }} />
      </div>
    );
  }

  if (hasPasscode && !unlocked) {
    return <PasscodeLock onUnlock={handleUnlock} />;
  }

  return (
    <div className="app-layout">
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Top Header bar */}
      <header style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: '33px', // Below disclaimer
        zIndex: 100
      }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.2 }}>
              <span style={{ color: '#000000' }}>Safe</span>
              <span style={{ color: '#1E3A8A' }}>Step</span>
            </h1>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              Legal Vault & Guidance
            </span>
          </div>
        </NavLink>

        {/* Active case badge or quick selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeCase ? (
            <NavLink 
              to={`/cases/${activeCase.id}`}
              className="tag tag-accent"
              style={{ textDecoration: 'none', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem' }}
              title="Current Active Case"
            >
              <Briefcase size={12} />
              <span className="text-mono">{activeCase.id}</span>
            </NavLink>
          ) : (
            <NavLink 
              to="/cases" 
              className="tag" 
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)', textDecoration: 'none', border: '1px solid var(--border)' }}
            >
              <Briefcase size={12} />
              <span>No Active Case</span>
            </NavLink>
          )}

          <NavLink to="/settings" aria-label="Settings" style={{ color: 'var(--text-secondary)' }}>
            <Settings size={18} />
          </NavLink>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* Persistent Panic / Quick Exit FAB */}
      <PanicButton />

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={20} />
          <span className="nav-label">Home</span>
        </NavLink>

        <NavLink to="/flow" className={({ isActive }) => `nav-item ${isActive || location.pathname.startsWith('/flow') ? 'active' : ''}`}>
          <FileCheck2 size={20} />
          <span className="nav-label">Checklist</span>
        </NavLink>

        <NavLink to="/vault" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FolderLock size={20} />
          <span className="nav-label">Vault</span>
        </NavLink>

        <NavLink to="/tracker" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ClockAlert size={20} />
          <span className="nav-label">Tracker</span>
        </NavLink>

        <NavLink to="/cases" className={({ isActive }) => `nav-item ${isActive || location.pathname.startsWith('/cases') ? 'active' : ''}`}>
          <Briefcase size={20} />
          <span className="nav-label">Cases</span>
        </NavLink>
      </nav>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
              <span className="toast-message">{toast.message}</span>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
