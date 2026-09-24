import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PhoneCall, 
  ShieldAlert, 
  Monitor, 
  Eye, 
  Home as HomeIcon, 
  Building2, 
  ArrowRight, 
  FolderLock, 
  ClockAlert, 
  Lock, 
  Sparkles,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Cpu,
  KeyRound,
  FileCheck2
} from 'lucide-react';
import categoriesData from '../data/categories.json';
import helplinesData from '../data/helplines.json';
import useAppStore from '../store/useAppStore';
import { generateCaseId } from '../services/crypto';
import { createCase } from '../services/storage';

const categoryIcons = {
  Monitor: Monitor,
  Eye: Eye,
  ShieldAlert: ShieldAlert,
  Home: HomeIcon,
  Building2: Building2,
};

export default function HomePage() {
  const navigate = useNavigate();
  const activeCase = useAppStore((s) => s.activeCase);
  const setActiveCase = useAppStore((s) => s.setActiveCase);
  const addCase = useAppStore((s) => s.addCase);
  const addToast = useAppStore((s) => s.addToast);

  const [inputCaseId, setInputCaseId] = useState('');

  const handleSelectCategory = async (categoryId) => {
    // If no active case, create one automatically
    if (!activeCase) {
      const newId = generateCaseId();
      const cat = categoriesData.categories.find(c => c.id === categoryId);
      const created = await createCase({
        id: newId,
        categoryId,
        title: `${cat?.label || 'General'} Incident`
      });
      addCase(created);
      setActiveCase(created);
      addToast({
        type: 'info',
        message: `New Anonymous Case created: ${newId}`
      });
    }
    navigate(`/flow/${categoryId}`);
  };

  const handleCreateQuickCase = async () => {
    const newId = generateCaseId();
    const created = await createCase({
      id: newId,
      categoryId: 'cyber_harassment',
      title: 'New Incident Case'
    });
    addCase(created);
    setActiveCase(created);
    addToast({
      type: 'success',
      message: `Created Case ${newId}. Save this ID to resume later!`
    });
    navigate(`/cases/${newId}`);
  };

  const handleResumeCase = (e) => {
    e.preventDefault();
    if (!inputCaseId.trim()) return;
    const cleanId = inputCaseId.trim().toUpperCase();
    navigate(`/cases/${cleanId}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Emergency Helpline Strip */}
      <section className="emergency-strip-container">
        <div className="emergency-strip-header">
          <span className="beacon-dot" />
          <span className="emergency-badge">
            24/7 Immediate Emergency Hotlines (India)
          </span>
        </div>
        <div className="emergency-strip">
          {helplinesData.emergency.map((item) => (
            <a key={item.id} href={`tel:${item.number}`} className="emergency-item">
              <PhoneCall size={14} />
              <span>
                <strong>{item.number}</strong> — {item.name}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Hero Welcome (Bold & High Impact) */}
      <section className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)', paddingTop: 'var(--space-sm)' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.6rem', 
          padding: '0.4rem 1.1rem', 
          borderRadius: '9999px', 
          background: 'rgba(99, 102, 241, 0.14)', 
          border: '1px solid rgba(99, 102, 241, 0.35)',
          color: '#C7D2FE', 
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: 'var(--space-md)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)'
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#10B981', 
            boxShadow: '0 0 8px #10B981' 
          }} />
          <span>ZERO-KNOWLEDGE VAULT • CLIENT-SIDE ENCRYPTION • 100% OFFLINE</span>
        </div>

        <h2 style={{ 
          fontSize: 'clamp(2.2rem, 5.5vw, 3.4rem)', 
          fontWeight: 900, 
          letterSpacing: '-0.035em', 
          lineHeight: 1.12, 
          marginBottom: 'var(--space-md)' 
        }}>
          Take Back Control.<br />
          <span className="text-gradient-bold">
            Preserve Tamper-Proof Evidence.
          </span>
        </h2>
        
        <p style={{ 
          maxWidth: '640px', 
          margin: '0 auto var(--space-lg) auto', 
          color: 'var(--text-secondary)', 
          fontSize: '1.05rem',
          lineHeight: 1.6
        }}>
          SafeStep provides battle-tested guidance for filing complaints with official cybercrime, women's helpline, and police authorities — paired with a local cryptographic vault.
        </p>

        {/* Feature Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: 'var(--space-md)'
        }}>
          <div className="tag tag-accent" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
            <FolderLock size={13} />
            <span>100% Offline IndexedDB</span>
          </div>
          <div className="tag tag-success" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
            <Cpu size={13} />
            <span>Client SHA-256 Hashes</span>
          </div>
          <div className="tag tag-warning" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
            <FileCheck2 size={13} />
            <span>BNS & IT Act Ready</span>
          </div>
        </div>
      </section>

      {/* Active Case Banner or Quick Actions */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        {activeCase ? (
          <div className="card card-glass" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 'var(--space-md)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.18)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="tag tag-accent" style={{ fontSize: '0.75rem' }}>Active Session</span>
                <span className="text-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  Case #{activeCase.id}
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {activeCase.title || 'Ongoing complaint preparation'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/cases/${activeCase.id}`)}
              >
                <span>Open Active Case</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="card card-glass" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 'var(--space-md)',
            background: 'linear-gradient(135deg, rgba(14, 19, 34, 0.9) 0%, rgba(22, 28, 50, 0.8) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <KeyRound size={16} style={{ color: 'var(--accent-light)' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Anonymous Case Terminal
                </h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Zero signup. Enter a 12-digit case key or generate an instant private session.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
              <form onSubmit={handleResumeCase} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Enter Case ID"
                  className="form-input"
                  style={{ 
                    width: '160px', 
                    padding: '8px 12px', 
                    fontSize: '0.82rem', 
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono)'
                  }}
                  value={inputCaseId}
                  onChange={(e) => setInputCaseId(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Resume
                </button>
              </form>

              <button className="btn btn-primary btn-sm" onClick={handleCreateQuickCase}>
                <PlusCircle size={15} />
                <span>New Case</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Guided Complaint Flows Section (Bold & Lively Cards) */}
      <section className="section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>
              Guided Complaint Flows
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Select a situation category to view verified checklist steps, official statutory portals, and authorities.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {categoriesData.categories.map((category) => {
            const IconComponent = categoryIcons[category.icon] || ShieldAlert;
            return (
              <div
                key={category.id}
                className="category-card card-interactive"
                style={{
                  '--category-color': category.color,
                  '--category-bg': `${category.color}20`,
                  '--category-glow': `${category.color}40`
                }}
                onClick={() => handleSelectCategory(category.id)}
              >
                <div className="category-icon">
                  <IconComponent size={24} />
                </div>
                <div className="category-content">
                  <h3>
                    <span>{category.label}</span>
                  </h3>
                  <p>{category.description}</p>
                </div>
                <div className="category-arrow">
                  <ArrowRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Safeguards & Features (Punchy & Alive) */}
      <section className="section" style={{ marginTop: 'var(--space-2xl)' }}>
        <h3 className="section-title">
          SafeStep Core Privacy Safeguards
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
          <div className="card" style={{ borderTop: '2px solid var(--accent)', background: '#F1F5F9' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-sm)',
              color: 'var(--accent-light)',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)'
            }}>
              <FolderLock size={22} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#fff' }}>
              Cryptographic Integrity
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Computes client-side SHA-256 hashes and captures device timestamps so digital evidence cannot be challenged as fabricated.
            </p>
          </div>

          <div className="card" style={{ borderTop: '2px solid var(--color-stalking)', background: '#F1F5F9' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(167, 139, 250, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-sm)',
              color: 'var(--color-stalking)',
              boxShadow: '0 0 16px rgba(167, 139, 250, 0.3)'
            }}>
              <Lock size={22} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#fff' }}>
              Pseudonymous Architecture
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              No login, no phone number, no tracking cookies. All data resides solely in your browser's encrypted IndexedDB storage.
            </p>
          </div>

          <div className="card" style={{ borderTop: '2px solid var(--color-workplace)', background: '#F1F5F9' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(52, 211, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-sm)',
              color: 'var(--color-workplace)',
              boxShadow: '0 0 16px rgba(52, 211, 153, 0.3)'
            }}>
              <ClockAlert size={22} />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: '#fff' }}>
              Manual Status Tracker
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Log official police acknowledgement receipts, track statutory turnaround periods, and set local reminders without server leaks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
