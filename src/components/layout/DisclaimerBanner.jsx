import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function DisclaimerBanner() {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div
        className="disclaimer-banner minimized"
        onClick={() => setMinimized(false)}
        role="button"
        tabIndex={0}
        aria-label="Expand disclaimer"
      >
        <AlertTriangle size={14} />
        <span>SafeStep — General information only, not legal advice</span>
        <ChevronDown size={14} />
      </div>
    );
  }

  return (
    <div className="disclaimer-banner">
      <AlertTriangle size={14} />
      <span>
        SafeStep provides general information only and is not a substitute for
        legal advice. In an emergency, contact local police immediately (112).
      </span>
      <button
        className="btn-icon sm"
        onClick={(e) => {
          e.stopPropagation();
          setMinimized(true);
        }}
        aria-label="Minimize disclaimer"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', flexShrink: 0 }}
      >
        <ChevronUp size={14} />
      </button>
    </div>
  );
}
