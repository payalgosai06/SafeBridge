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
  ExternalLink
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
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 'var(--space-xs)' }}>
          <ShieldAlert size={16} style={{ color: 'var(--danger)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--danger)' }}>
            Immediate Emergency Assistance (India)
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

      {/* Hero Welcome */}
      <section className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.35rem 0.85rem', 
          borderRadius: '9999px', 
          background: 'var(--accent-subtle)', 
          color: 'var(--accent)', 
          fontSize: '0.8rem',
          fontWeight: 500,
          marginBottom: 'var(--space-sm)'
        }}>
          <Lock size={13} />
          <span>Anonymous-first • Zero tracking • Client-side encryption</span>
        </div>

        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 'var(--space-sm)' }}>
          Know Your Legal Rights.<br />
          <span style={{ 
            background: 'linear-gradient(135deg, #4A9EFF 0%, #A78BFA 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Preserve Tamper-Proof Evidence.
          </span>
        </h2>
        <p style={{ maxWidth: '620px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>
          SafeStep provides step-by-step guidance for filing complaints with official cybercrime, women's helpline, and police authorities — paired with a local cryptographic vault.
        </p>
      </section>

      {/* Active Case Banner or Quick Actions */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        {activeCase ? (
          <div className="card card-glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="tag tag-accent" style={{ fontSize: '0.75rem' }}>Active Session</span>
                <span className="text-mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Case #{activeCase.id}</span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {activeCase.title || 'Ongoing complaint preparation'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/cases/${activeCase.id}`)}
              >
                <span>Open Case</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Start or Resume a Case</h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                No email or phone required. Cases use pseudonymous 12-digit keys.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
              <form onSubmit={handleResumeCase} style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  placeholder="Enter Case ID"
                  className="form-input"
                  style={{ width: '150px', padding: '6px 10px', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}
                  value={inputCaseId}
                  onChange={(e) => setInputCaseId(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Resume
                </button>
              </form>

              <button className="btn btn-primary btn-sm" onClick={handleCreateQuickCase}>
                <PlusCircle size={14} />
                <span>New Case</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Guided Complaint Flows Section */}
      <section className="section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>
              Guided Complaint Flows
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Select a situation category to view verified checklist steps, official portals, and authorities.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {categoriesData.categories.map((category) => {
            const IconComponent = categoryIcons[category.icon] || ShieldAlert;
            return (
              <div
                key={category.id}
                className="card card-interactive category-card"
                style={{
                  '--category-color': category.color,
                  '--category-bg': `${category.color}18`
                }}
                onClick={() => handleSelectCategory(category.id)}
              >
                <div className="category-icon">
                  <IconComponent size={22} />
                </div>
                <div className="category-content">
                  <h3>{category.label}</h3>
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

      {/* Key Safeguards & Features */}
      <section className="section" style={{ marginTop: 'var(--space-2xl)' }}>
        <h3 className="section-title">
          SafeStep Core Privacy Safeguards
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
          <div className="card">
            <FolderLock size={24} style={{ color: 'var(--accent)', marginBottom: 'var(--space-sm)' }} />
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '4px' }}>
              Cryptographic Integrity
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Computes client-side SHA-256 hashes and captures device timestamps so evidence cannot be claimed as fabricated later.
            </p>
          </div>

          <div className="card">
            <Lock size={24} style={{ color: 'var(--color-stalking)', marginBottom: 'var(--space-sm)' }} />
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '4px' }}>
              Pseudonymous-First
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              No accounts, no email, no phone required. All data resides solely in your browser's encrypted IndexedDB storage.
            </p>
          </div>

          <div className="card">
            <ClockAlert size={24} style={{ color: 'var(--color-workplace)', marginBottom: 'var(--space-sm)' }} />
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '4px' }}>
              Manual Status Tracker
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Log complaint reference numbers, official authorities, and set follow-up schedule reminders without external API tracking.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
