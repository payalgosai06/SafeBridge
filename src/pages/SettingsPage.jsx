import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  KeyRound, 
  Lock, 
  Trash2, 
  HardDrive, 
  AlertTriangle, 
  Check, 
  Info,
  LogOut,
  ExternalLink
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { 
  getSetting, 
  setSetting, 
  wipeAllData, 
  getStorageEstimate 
} from '../services/storage';
import { generateHash } from '../services/crypto';

export default function SettingsPage() {
  const addToast = useAppStore((s) => s.addToast);
  const panicExit = useAppStore((s) => s.panicExit);

  const [hasPasscode, setHasPasscode] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const storedHash = await getSetting('passcode_hash');
        setHasPasscode(!!storedHash);

        const est = await getStorageEstimate();
        setStorageInfo(est);
      } catch (err) {
        console.error('Settings load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSetPasscode = async (e) => {
    e.preventDefault();
    setPinError('');

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setPinError('Passcode must be exactly 6 digits (0-9).');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('Passcodes do not match.');
      return;
    }

    try {
      const hash = await generateHash(newPin);
      await setSetting('passcode_hash', hash);
      sessionStorage.setItem('safestep_unlocked', 'true');
      sessionStorage.setItem('safestep_session_passcode', newPin);
      setHasPasscode(true);
      setIsChangingPin(false);
      setNewPin('');
      setConfirmPin('');

      addToast({
        type: 'success',
        message: '6-digit passcode configured. App will lock on next launch.'
      });
    } catch (err) {
      console.error('Passcode set error:', err);
      setPinError('Failed to save passcode.');
    }
  };

  const handleRemovePasscode = async () => {
    if (!window.confirm('Remove app passcode lock? Anyone with physical access to your device can open SafeStep.')) {
      return;
    }
    try {
      await setSetting('passcode_hash', null);
      sessionStorage.removeItem('safestep_unlocked');
      sessionStorage.removeItem('safestep_session_passcode');
      setHasPasscode(false);
      addToast({
        type: 'info',
        message: 'Passcode removed. App is now unlocked.'
      });
    } catch (err) {
      console.error('Passcode removal error:', err);
    }
  };

  const handleWipeAll = async () => {
    const confirmation = window.prompt(
      'DANGER: To permanently erase all cases, evidence files, hashes, and logs from this device, type "DELETE" below:'
    );
    if (confirmation !== 'DELETE') {
      addToast({ type: 'info', message: 'Wipe cancelled.' });
      return;
    }

    try {
      await wipeAllData();
      sessionStorage.clear();
      localStorage.clear();
      addToast({
        type: 'success',
        message: 'All local application data wiped permanently.'
      });
      setTimeout(() => {
        window.location.replace('/');
      }, 1000);
    } catch (err) {
      console.error('Wipe error:', err);
      addToast({ type: 'error', message: 'Failed to erase all data.' });
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={24} style={{ color: 'var(--accent)' }} />
          Privacy & Security Settings
        </h2>
        <p className="page-subtitle">
          Configure on-device passcode locks, manage local cryptographic storage, or trigger data sanitization.
        </p>
      </div>

      {/* Passcode / Local Security Lock */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-sm)' }}>
          <KeyRound size={20} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
            App Passcode Lock
          </h3>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          Protect your evidence and complaint logs with an on-device 6-digit PIN. The passcode is hashed via SHA-256 and never transmitted over the network.
        </p>

        {hasPasscode && !isChangingPin ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="tag tag-success" style={{ fontSize: '0.75rem' }}>
                <Check size={12} /> Lock Active
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                6-digit PIN required on app launch
              </span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsChangingPin(true)}
              >
                Change PIN
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={handleRemovePasscode}
              >
                Remove PIN
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSetPasscode} style={{ maxWidth: '360px' }}>
            <div className="form-group" style={{ marginBottom: 'var(--space-sm)' }}>
              <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                New 6-Digit Passcode:
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="form-input text-mono"
                placeholder="••••••"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                Confirm Passcode:
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="form-input text-mono"
                placeholder="••••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                required
              />
            </div>

            {pinError && (
              <p style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-sm)' }}>
                {pinError}
              </p>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Save Passcode
              </button>
              {isChangingPin && (
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setIsChangingPin(false); setPinError(''); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Panic / Quick Exit Routine */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-sm)' }}>
          <LogOut size={20} style={{ color: 'var(--danger)' }} />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
            Panic / Quick-Exit Routine
          </h3>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          The fixed exit button (bottom right on all screens) triggers an instant session wipe and redirects your browser to Google Search. Test it or use it if someone approaches.
        </p>

        <button 
          className="btn btn-danger btn-sm"
          onClick={() => {
            if (window.confirm('Test Panic Exit now? This will clear session memory and redirect to Google.')) {
              panicExit();
            }
          }}
        >
          <LogOut size={14} />
          <span>Test Quick Exit (Redirect to Google)</span>
        </button>
      </div>

      {/* Storage Breakdown */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-sm)' }}>
          <HardDrive size={20} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
            Browser Storage & Vault Footprint
          </h3>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
          All evidence and cases are stored in your device's private IndexedDB partition.
        </p>

        {storageInfo && (
          <div style={{ display: 'flex', gap: 'var(--space-lg)', margin: 'var(--space-sm) 0 var(--space-md)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <div>Approximate Used: <strong style={{ color: 'var(--text-primary)' }}>{storageInfo.usageFormatted}</strong></div>
            <div>Available Quota: <strong style={{ color: 'var(--text-primary)' }}>{storageInfo.quotaFormatted}</strong></div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)', fontWeight: 600, marginBottom: '4px' }}>
            Permanent Data Destruction
          </h4>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
            Wipes all cases, all uploaded evidence files, all hashes, and settings from this browser completely.
          </p>
          <button className="btn btn-danger btn-sm" onClick={handleWipeAll}>
            <Trash2 size={14} />
            <span>Permanent Local Data Wipe</span>
          </button>
        </div>
      </div>

      {/* Legal Architecture & Source Attribution */}
      <div className="card" style={{ background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-sm)' }}>
          <Info size={20} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
            Official Legal References & Portals
          </h3>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          SafeStep compiles publicly available complaint procedures from authorized Indian government and statutory bodies:
        </p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--text-xs)' }}>
          <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>National Cyber Crime Reporting Portal</span>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              cybercrime.gov.in <ExternalLink size={11} />
            </a>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>National Commission for Women (NCW)</span>
            <a href="http://ncw.nic.in/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              ncw.nic.in <ExternalLink size={11} />
            </a>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>National Legal Services Authority (NALSA)</span>
            <a href="https://nalsa.gov.in/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              nalsa.gov.in <ExternalLink size={11} />
            </a>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>RBI Banking Ombudsman</span>
            <a href="https://rbi.org.in/Scripts/Complaints.aspx" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              rbi.org.in <ExternalLink size={11} />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
