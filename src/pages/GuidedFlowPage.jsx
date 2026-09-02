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
      <div style={{ display: 'flex', gap: 'var(--space-xs)', overflowX: 'auto', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {categoriesData.categories.map((cat) => (
          <button
            key={cat.id}
            className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <div>
            <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck2 size={24} style={{ color: currentCategoryMeta?.color || 'var(--accent)' }} />
              {currentChecklist.title}
            </h2>
            <p className="page-subtitle">
              Structured guidance and verification steps before approaching legal or police authorities.
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
          background: 'var(--danger-subtle)',
          border: '1px solid rgba(229, 57, 53, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)'
        }}>
          <AlertTriangle size={22} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
            <strong>Safety Warning: </strong>
            {currentChecklist.urgentNote}
          </div>
        </div>
      )}

      {/* Progress tracker */}
      {activeCase && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Checklist Completion: Case #{activeCase.id}</span>
            <strong style={{ color: 'var(--accent)' }}>{completedCount} of {totalSteps} steps ({percentComplete}%)</strong>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-elevated)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${percentComplete}%`, 
                height: '100%', 
                background: percentComplete === 100 ? 'var(--success)' : 'var(--accent)',
                transition: 'width 0.3s ease'
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
