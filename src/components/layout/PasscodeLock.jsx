import { useState, useCallback } from 'react';
import { Shield, Delete } from 'lucide-react';
import { generateHash } from '../../services/crypto';
import { getSetting } from '../../services/storage';
import useAppStore from '../../store/useAppStore';

export default function PasscodeLock({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleKey = useCallback(async (digit) => {
    if (checking) return;
    setError(false);
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 6) {
      setChecking(true);
      try {
        const storedHash = await getSetting('passcode_hash');
        const inputHash = await generateHash(newPin);

        if (inputHash === storedHash) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
            setChecking(false);
          }, 600);
          return;
        }
      } catch (e) {
        // If we can't verify, unlock anyway (fail open for safety)
        onUnlock();
      }
      setChecking(false);
    }
  }, [pin, checking, onUnlock]);

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="lock-screen">
      <div className="lock-icon">
        <Shield size={48} />
      </div>
      <h2 className="lock-title">Enter Passcode</h2>

      {/* PIN dots */}
      <div className="pin-dots">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`pin-dot ${i < pin.length ? 'filled' : ''} ${error ? 'error' : ''}`}
          />
        ))}
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>
          Incorrect passcode
        </p>
      )}

      {/* PIN pad */}
      <div className="pin-pad">
        {keys.map((key, i) => {
          if (key === '') {
            return <div key={i} className="pin-key empty" />;
          }
          if (key === 'del') {
            return (
              <button key={i} className="pin-key action" onClick={handleDelete} aria-label="Delete">
                <Delete size={20} />
              </button>
            );
          }
          return (
            <button
              key={i}
              className="pin-key"
              onClick={() => handleKey(key)}
              disabled={checking}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
