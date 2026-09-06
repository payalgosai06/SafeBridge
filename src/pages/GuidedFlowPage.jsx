import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileCheck2, 
  AlertTriangle, 
  FolderLock, 
  ArrowRight, 
  ExternalLink,
  Building2,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import checklistsData from '../data/checklists.json';
import categoriesData from '../data/categories.json';
import StepCard from '../components/flow/StepCard';
import useAppStore from '../store/useAppStore';
import { updateCase } from '../services/storage';

export default function GuidedFlowPage() {
  const { categoryId: urlCategory } = useParams();
  const navigate = useNavigate();

  const activeCase = useAppStore((s) => s.activeCase);
  const setActiveCase = useAppStore((s) => s.setActiveCase);
  const addToast = useAppStore((s) => s.addToast);

  const initialCat = urlCategory || activeCase?.categoryId || 'cyber_harassment';
  const [selectedCategory, setSelectedCategory] = useState(initialCat);

  useEffect(() => {
    if (urlCategory && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  const currentChecklist = checklistsData.checklists[selectedCategory] || checklistsData.checklists.cyber_harassment;
  const currentCategoryMeta = categoriesData.categories.find(c => c.id === selectedCategory);

  // Check progress
  const completedMap = activeCase?.checklistProgress || {};
  const totalSteps = currentChecklist.steps.length;
  const completedCount = currentChecklist.steps.filter(s => completedMap[s.id]).length;
  const percentComplete = Math.round((completedCount / totalSteps) * 100);

  const handleToggleComplete = async (stepId) => {
    if (!activeCase) {
      addToast({
        type: 'info',
        message: 'Progress is tracked in your session. Create or select a case to save permanently.'
      });
      return;
    }

    const newProgress = {
      ...completedMap,
      [stepId]: !completedMap[stepId]
    };

    try {
      const updated = await updateCase(activeCase.id, { checklistProgress: newProgress });
      setActiveCase(updated);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleCategoryChange = (newCat) => {
    setSelectedCategory(newCat);
    navigate(`/flow/${newCat}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Category Navigation Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-lg)', scrollbarWidth: 'none' }}>
        {categoriesData.categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                borderRadius: 'var(--radius-full)', 
                whiteSpace: 'nowrap',
                fontWeight: isSelected ? 700 : 500,
                ...(isSelected ? {
                  boxShadow: `0 0 16px ${cat.color}40`,
                  borderColor: 'rgba(255, 255, 255, 0.25)'
                } : {})
              }}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <span style={{ 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                background: cat.color,
                boxShadow: isSelected ? `0 0 6px ${cat.color}` : 'none'
              }} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <div>
            <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: `${currentCategoryMeta?.color || 'var(--accent)'}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${currentCategoryMeta?.color || 'var(--accent)'}50`,
                boxShadow: `0 0 14px ${currentCategoryMeta?.color || 'var(--accent)'}35`
              }}>
                <FileCheck2 size={22} style={{ color: currentCategoryMeta?.color || 'var(--accent)' }} />
              </div>
              <span>{currentChecklist.title}</span>
            </h2>
            <p className="page-subtitle">
              Structured statutory checklist and evidence prerequisites before filing formal complaints.
            </p>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/vault')}
          >
            <FolderLock size={15} />
            <span>Open Vault</span>
          </button>
        </div>
      </div>

      {/* Urgent Note Banner */}
      {currentChecklist.urgentNote && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          boxShadow: '0 4px 16px rgba(244, 63, 94, 0.15)'
        }}>
          <AlertTriangle size={22} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.86rem', color: '#fff', lineHeight: 1.5 }}>
            <strong style={{ color: '#FB7185' }}>Safety Warning: </strong>
            {currentChecklist.urgentNote}
          </div>
        </div>
      )}

      {/* Progress tracker */}
      {activeCase && (
        <div className="card card-glass" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md) var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Checklist Completion: Case #{activeCase.id}</span>
            <strong style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-mono)' }}>
              {completedCount} of {totalSteps} steps ({percentComplete}%)
            </strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', padding: '1px' }}>
            <div 
              style={{ 
                width: `${percentComplete}%`, 
                height: '100%', 
                background: percentComplete === 100 
                  ? 'linear-gradient(90deg, #10B981, #34D399)' 
                  : 'linear-gradient(90deg, #6366F1 0%, #38BDF8 100%)',
                boxShadow: percentComplete > 0 ? '0 0 10px rgba(99, 102, 241, 0.6)' : 'none',
                borderRadius: '9999px',
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }} 
            />
          </div>
        </div>
      )}

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {currentChecklist.steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            isCompleted={!!completedMap[step.id]}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>

      {/* Bottom Legal Disclaimer Reminder */}
      <div style={{ 
        marginTop: 'var(--space-2xl)', 
        padding: 'var(--space-md)', 
        borderRadius: 'var(--radius-md)', 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-tertiary)',
        textAlign: 'center'
      }}>
        SafeStep provides general procedural information only and is not a substitute for legal advice. Laws and complaint procedures may differ by jurisdiction.
      </div>
    </div>
  );
}
