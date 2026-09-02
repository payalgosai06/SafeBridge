import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  FolderLock, 
  ArrowRight,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import categoriesData from '../data/categories.json';
import useAppStore from '../store/useAppStore';
import { getAllCases, createCase, deleteCase } from '../services/storage';
import { generateCaseId } from '../services/crypto';

export default function CasesPage() {
  const navigate = useNavigate();
  const cases = useAppStore((s) => s.cases);
  const setCases = useAppStore((s) => s.setCases);
  const activeCase = useAppStore((s) => s.activeCase);
  const setActiveCase = useAppStore((s) => s.setActiveCase);
  const removeCase = useAppStore((s) => s.removeCase);
  const addToast = useAppStore((s) => s.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cyber_harassment');
  const [newNotes, setNewNotes] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadCases() {
      try {
        const storedCases = await getAllCases();
        setCases(storedCases);
      } catch (err) {
        console.error('Failed to load cases:', err);
      }
    }
    loadCases();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const generatedId = generateCaseId();
      const cat = categoriesData.categories.find(c => c.id === selectedCategory);
      
      const newCaseObj = {
        id: generatedId,
        categoryId: selectedCategory,
        title: newTitle.trim() || `${cat?.label || 'General'} Case`,
        notes: newNotes.trim(),
      };

      const created = await createCase(newCaseObj);
      setCases([created, ...cases]);
      setActiveCase(created);

      addToast({
        type: 'success',
        message: `Case ${generatedId} created! Write this ID down to resume.`
      });

      setIsModalOpen(false);
      setNewTitle('');
      setNewNotes('');
      navigate(`/cases/${generatedId}`);
    } catch (err) {
      console.error('Create case error:', err);
      addToast({ type: 'error', message: 'Failed to create case.' });
    }
  };

  const handleDeleteCase = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete Case #${id} and all its stored evidence files? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteCase(id);
      removeCase(id);
      addToast({ type: 'info', message: `Case ${id} deleted.` });
    } catch (err) {
      console.error('Delete case error:', err);
    }
  };

  const copyCaseId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    addToast({ type: 'info', message: `Case ID ${id} copied!` });
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={24} style={{ color: 'var(--accent)' }} />
              Anonymous Cases
            </h2>
            <p className="page-subtitle">
              Each case holds isolated evidence files, checklist progress, and complaint logs under an unguessable 12-character ID.
            </p>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={14} />
            <span>Create New Case</span>
          </button>
        </div>
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Cases Created"
          description="Create a case to start preserving evidence files, organizing complaint drafts, and logging official communications."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
              <Plus size={14} />
              <span>Create First Case</span>
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {cases.map((c) => {
            const categoryMeta = categoriesData.categories.find(cat => cat.id === c.categoryId);
            const isActive = activeCase?.id === c.id;

            return (
              <div 
                key={c.id} 
                className="card card-interactive"
                style={{
                  borderLeft: isActive ? '4px solid var(--accent)' : '1px solid var(--border)',
                  background: isActive ? 'var(--bg-elevated)' : 'var(--bg-surface)'
                }}
                onClick={() => {
                  setActiveCase(c);
                  navigate(`/cases/${c.id}`);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                      <span className="text-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {c.id}
                      </span>
                      <button 
                        className="btn-icon sm btn-ghost" 
                        onClick={(e) => copyCaseId(c.id, e)}
                        title="Copy Case ID"
                      >
                        {copiedId === c.id ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                      </button>

                      {isActive && (
                        <span className="tag tag-accent" style={{ fontSize: '0.7rem' }}>
                          Active Case
                        </span>
                      )}

                      {categoryMeta && (
                        <span 
                          className="tag" 
                          style={{ 
                            fontSize: '0.7rem', 
                            background: `${categoryMeta.color}15`, 
                            color: categoryMeta.color 
                          }}
                        >
                          {categoryMeta.label}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: '4px 0' }}>
                      {c.title || 'Untitled Case'}
                    </h3>

                    {c.notes && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: '500px' }}>
                        {c.notes}
                      </p>
                    )}

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '0.5rem', display: 'flex', gap: 'var(--space-md)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={11} /> Created: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                    <button
                      className="btn-icon sm btn-danger"
                      onClick={(e) => handleDeleteCase(c.id, e)}
                      title="Permanently delete case & evidence"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div className="btn-icon sm btn-ghost" style={{ color: 'var(--text-tertiary)' }}>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Case Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Anonymous Case"
      >
        <form onSubmit={handleCreateCase}>
          <div className="form-group">
            <label className="form-label">Situation Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoriesData.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Case Title / Reference Label</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Instagram Blackmail Threat / Loan App Harassment"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Private Summary / Context (Optional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Private details for your own reference..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </div>

          <div style={{ 
            background: 'var(--bg-elevated)', 
            padding: 'var(--space-sm) var(--space-md)', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-lg)'
          }}>
            A random 12-character pseudonymous Case ID will be generated upon creation. No email or personal identifiers are stored.
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Generate Case
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
