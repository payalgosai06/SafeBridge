import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  FolderLock, 
  FileCheck2, 
  ClockAlert, 
  Copy, 
  Check, 
  ArrowLeft, 
  Save, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import categoriesData from '../data/categories.json';
import checklistsData from '../data/checklists.json';
import StepCard from '../components/flow/StepCard';
import FileUploader from '../components/vault/FileUploader';
import EvidenceList from '../components/vault/EvidenceList';
import EvidenceExport from '../components/vault/EvidenceExport';
import useAppStore from '../store/useAppStore';
import { 
  getCase, 
  updateCase, 
  deleteCase, 
  getEvidenceByCaseId, 
  getTrackerEntriesByCaseId 
} from '../services/storage';

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const setActiveCase = useAppStore((s) => s.setActiveCase);
  const addToast = useAppStore((s) => s.addToast);

  const [currentCase, setCurrentCase] = useState(null);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [trackerItems, setTrackerItems] = useState([]);
  const [activeTab, setActiveTab] = useState('vault'); // 'vault', 'checklist', 'tracker', 'notes'
  const [notesText, setNotesText] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      const c = await getCase(id);
      if (!c) {
        addToast({ type: 'error', message: `Case ${id} not found.` });
        navigate('/cases');
        return;
      }
      setCurrentCase(c);
      setActiveCase(c);
      setNotesText(c.notes || '');

      const ev = await getEvidenceByCaseId(id);
      setEvidenceItems(ev);

      const tr = await getTrackerEntriesByCaseId(id);
      setTrackerItems(tr);
    } catch (err) {
      console.error('Error loading case detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadCaseData();
  }, [id]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    addToast({ type: 'info', message: 'Case ID copied to clipboard' });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveNotes = async () => {
    if (!currentCase) return;
    try {
      const updated = await updateCase(id, { notes: notesText });
      setCurrentCase(updated);
      addToast({ type: 'success', message: 'Case notes updated' });
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const handleToggleChecklist = async (stepId) => {
    if (!currentCase) return;
    const progress = currentCase.checklistProgress || {};
    const updatedProgress = { ...progress, [stepId]: !progress[stepId] };

    try {
      const updated = await updateCase(id, { checklistProgress: updatedProgress });
      setCurrentCase(updated);
      setActiveCase(updated);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleDeleteCurrentCase = async () => {
    if (!window.confirm(`Permanently delete Case #${id} and all its stored evidence files?`)) {
      return;
    }
    try {
      await deleteCase(id);
      addToast({ type: 'info', message: `Case ${id} deleted` });
      navigate('/cases');
    } catch (err) {
      console.error('Failed to delete case:', err);
    }
  };

  if (loading || !currentCase) {
    return (
      <div className="text-center" style={{ padding: 'var(--space-3xl)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading case details...</p>
      </div>
    );
  }

  const categoryMeta = categoriesData.categories.find(c => c.id === currentCase.categoryId);
  const checklist = checklistsData.checklists[currentCase.categoryId] || checklistsData.checklists.cyber_harassment;
  const completedMap = currentCase.checklistProgress || {};
  const completedCount = checklist.steps.filter(s => completedMap[s.id]).length;
  const totalSteps = checklist.steps.length;

  return (
    <div className="animate-fade-in">
      {/* Back button & header */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/cases')}
          style={{ paddingLeft: 0 }}
        >
          <ArrowLeft size={16} />
          <span>All Cases</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="text-mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>
                Case #{currentCase.id}
              </span>
              <button 
                className="btn-icon sm btn-ghost" 
                onClick={handleCopyId}
                title="Copy Case ID"
              >
                {copied ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
              </button>

              {categoryMeta && (
                <span 
                  className="tag"
                  style={{ 
                    background: `${categoryMeta.color}18`, 
                    color: categoryMeta.color,
                    fontSize: '0.72rem' 
                  }}
                >
                  {categoryMeta.label}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: '2px 0 6px' }}>
              {currentCase.title || 'Untitled Case'}
            </h2>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              Created: {new Date(currentCase.createdAt).toLocaleString()} • {evidenceItems.length} Evidence Items • {trackerItems.length} Status Logs
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteCurrentCase}>
              <Trash2 size={14} />
              <span>Delete Case</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-xs)', borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-lg)' }}>
        <button
          className={`btn btn-sm ${activeTab === 'vault' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          onClick={() => setActiveTab('vault')}
        >
          <FolderLock size={15} />
          <span>Evidence Vault ({evidenceItems.length})</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'checklist' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          onClick={() => setActiveTab('checklist')}
        >
          <FileCheck2 size={15} />
          <span>Checklist ({completedCount}/{totalSteps})</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'tracker' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          onClick={() => setActiveTab('tracker')}
        >
          <ClockAlert size={15} />
          <span>Tracker ({trackerItems.length})</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'notes' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          onClick={() => setActiveTab('notes')}
        >
          <span>Private Notes</span>
        </button>
      </div>

      {/* Tab 1: Evidence Vault */}
      {activeTab === 'vault' && (
        <div className="animate-fade-in">
          <FileUploader caseId={currentCase.id} onUploadSuccess={loadCaseData} />
          <EvidenceList items={evidenceItems} onDeleteItem={loadCaseData} />
          <EvidenceExport activeCase={currentCase} items={evidenceItems} />
        </div>
      )}

      {/* Tab 2: Guided Checklist */}
      {activeTab === 'checklist' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
              {checklist.title}
            </h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {completedCount} of {totalSteps} steps completed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {checklist.steps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                isCompleted={!!completedMap[step.id]}
                onToggleComplete={handleToggleChecklist}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Tracker */}
      {activeTab === 'tracker' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
              Official Filing Records ({trackerItems.length})
            </h3>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/tracker')}
            >
              <ClockAlert size={14} />
              <span>Go to Full Tracker</span>
            </button>
          </div>

          {trackerItems.length === 0 ? (
            <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                No complaint records logged yet for this case.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {trackerItems.map((item) => (
                <div key={item.id} className="card" style={{ padding: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`tracker-type ${item.type}`}>
                      {item.type.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {item.date}
                    </span>
                  </div>
                  {item.authority && (
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: '4px' }}>
                      {item.authority}
                    </div>
                  )}
                  {item.referenceNumber && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Ref No: <strong className="text-mono">{item.referenceNumber}</strong>
                    </div>
                  )}
                  {item.notes && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Private Notes */}
      {activeTab === 'notes' && (
        <div className="animate-fade-in card">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
            Case Notes & Observations
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            Store personal notes, officer badge names, or chronological reminders. These stay strictly inside local browser storage.
          </p>

          <textarea
            className="form-textarea"
            rows={8}
            placeholder="Type your private notes here..."
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
          />

          <div style={{ marginTop: 'var(--space-md)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSaveNotes}>
              <Save size={14} />
              <span>Save Notes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
