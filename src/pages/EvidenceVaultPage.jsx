import React, { useState, useEffect } from 'react';
import { 
  FolderLock, 
  ShieldCheck, 
  PlusCircle, 
  FileDown, 
  Lock, 
  AlertCircle,
  Briefcase
} from 'lucide-react';
import FileUploader from '../components/vault/FileUploader';
import EvidenceList from '../components/vault/EvidenceList';
import EvidenceExport from '../components/vault/EvidenceExport';
import useAppStore from '../store/useAppStore';
import { getEvidenceByCaseId, getAllCases, createCase } from '../services/storage';
import { generateCaseId } from '../services/crypto';

export default function EvidenceVaultPage() {
  const activeCase = useAppStore((s) => s.activeCase);
  const setActiveCase = useAppStore((s) => s.setActiveCase);
  const evidence = useAppStore((s) => s.evidence);
  const setEvidence = useAppStore((s) => s.setEvidence);
  const addCase = useAppStore((s) => s.addCase);
  const addToast = useAppStore((s) => s.addToast);

  const [availableCases, setAvailableCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all cases and evidence for active case
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const cases = await getAllCases();
        setAvailableCases(cases);

        // If no active case but cases exist, select the first one
        if (!activeCase && cases.length > 0) {
          setActiveCase(cases[0]);
          const evItems = await getEvidenceByCaseId(cases[0].id);
          setEvidence(evItems);
        } else if (activeCase) {
          const evItems = await getEvidenceByCaseId(activeCase.id);
          setEvidence(evItems);
        }
      } catch (err) {
        console.error('Failed to load vault items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeCase?.id]);

  const handleCreateCase = async () => {
    const newId = generateCaseId();
    const created = await createCase({
      id: newId,
      categoryId: 'cyber_harassment',
      title: 'Evidence Vault Case'
    });
    addCase(created);
    setAvailableCases((prev) => [created, ...prev]);
    setActiveCase(created);
    setEvidence([]);
    addToast({
      type: 'success',
      message: `Created Vault Case #${newId}`
    });
  };

  const handleCaseChange = async (e) => {
    const selectedId = e.target.value;
    const found = availableCases.find(c => c.id === selectedId);
    if (found) {
      setActiveCase(found);
      const evItems = await getEvidenceByCaseId(found.id);
      setEvidence(evItems);
    }
  };

  const handleUploadSuccess = async () => {
    if (activeCase) {
      const evItems = await getEvidenceByCaseId(activeCase.id);
      setEvidence(evItems);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderLock size={24} style={{ color: 'var(--accent)' }} />
              Evidence Vault
            </h2>
            <p className="page-subtitle">
              Upload and seal tamper-evident records. Each file is stamped with device metadata and a cryptographic SHA-256 hash.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            {availableCases.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={16} style={{ color: 'var(--text-tertiary)' }} />
                <select 
                  className="form-select" 
                  style={{ width: 'auto', padding: '6px 28px 6px 12px', fontSize: 'var(--text-xs)' }}
                  value={activeCase?.id || ''}
                  onChange={handleCaseChange}
                >
                  {availableCases.map(c => (
                    <option key={c.id} value={c.id}>
                      Case #{c.id} ({c.title || 'Untitled'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className="btn btn-secondary btn-sm" onClick={handleCreateCase}>
              <PlusCircle size={14} />
              <span>New Case</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vault Info Badge */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: 'var(--radius-sm)', 
            background: 'var(--accent-subtle)', 
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              {activeCase ? `Case Vault: ${activeCase.id}` : 'No Case Selected'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {evidence.length} evidence {evidence.length === 1 ? 'file' : 'files'} recorded • Zero cloud ML scanning
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          <span className="tag tag-success" style={{ fontSize: '0.72rem' }}>
            AES-256 Encrypted
          </span>
          <span className="tag tag-accent" style={{ fontSize: '0.72rem' }}>
            SHA-256 Hashed
          </span>
        </div>
      </div>

      {/* Case Requirement check */}
      {!activeCase ? (
        <div className="card text-center" style={{ padding: 'var(--space-2xl)' }}>
          <Briefcase size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-md)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
            Start a Case to Ingest Evidence
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto var(--space-lg)' }}>
            Every piece of evidence is tied to a pseudonymous Case ID, allowing structured chronological log exports for authorities.
          </p>
          <button className="btn btn-primary" onClick={handleCreateCase}>
            <PlusCircle size={16} />
            <span>Generate Case ID</span>
          </button>
        </div>
      ) : (
        <>
          {/* Ingest Uploader */}
          <FileUploader caseId={activeCase.id} onUploadSuccess={handleUploadSuccess} />

          {/* Evidence List */}
          <div className="section">
            <h3 className="section-title">
              Preserved Evidence Log ({evidence.length})
            </h3>
            <EvidenceList 
              items={evidence} 
              onDeleteItem={handleUploadSuccess} 
            />
          </div>

          {/* Export Options (PDF Log and ZIP Package) */}
          <EvidenceExport activeCase={activeCase} items={evidence} />
        </>
      )}
    </div>
  );
}
