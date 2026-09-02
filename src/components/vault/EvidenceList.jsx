import React, { useState } from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  File, 
  Copy, 
  Check, 
  Trash2, 
  Info, 
  Calendar, 
  Hash, 
  Download 
} from 'lucide-react';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import { deleteEvidence } from '../../services/storage';
import useAppStore from '../../store/useAppStore';

function getFileIcon(fileType) {
  if (fileType.startsWith('image/')) return <Image size={20} />;
  if (fileType.startsWith('video/')) return <Video size={20} />;
  if (fileType.startsWith('audio/')) return <Music size={20} />;
  if (fileType.includes('pdf') || fileType.includes('text')) return <FileText size={20} />;
  return <File size={20} />;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export default function EvidenceList({ items = [], onDeleteItem }) {
  const [copiedId, setCopiedId] = useState(null);
  const [inspectItem, setInspectItem] = useState(null);
  const addToast = useAppStore((s) => s.addToast);
  const removeEvidenceItem = useAppStore((s) => s.removeEvidenceItem);

  const copyFullHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    addToast({
      type: 'info',
      message: 'Full SHA-256 hash copied to clipboard'
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this evidence file from local storage? This cannot be undone.')) {
      return;
    }
    try {
      await deleteEvidence(itemId);
      removeEvidenceItem(itemId);
      if (onDeleteItem) onDeleteItem(itemId);
      addToast({
        type: 'info',
        message: 'Evidence file deleted from local storage'
      });
      if (inspectItem?.id === itemId) setInspectItem(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDownload = (item) => {
    if (!item.fileData) {
      addToast({
        type: 'error',
        message: 'Encrypted file cannot be downloaded without decryption key'
      });
      return;
    }
    const blob = new Blob([item.fileData], { type: item.fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="No Evidence Ingested"
        description="Upload screenshots, audio, chat logs, or documents to establish tamper-evident chronological proof."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {items.map((item) => (
        <div key={item.id} className="evidence-item">
          <div className="evidence-icon">
            {getFileIcon(item.fileType)}
          </div>

          <div className="evidence-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="evidence-name">{item.fileName}</span>
              <span className="tag" style={{ background: 'var(--bg-elevated)', fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                {formatBytes(item.fileSize)}
              </span>
            </div>

            <div className="evidence-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={11} /> {formatTime(item.createdAt)}
              </span>

              {item.description && (
                <span className="truncate" style={{ maxWidth: '200px', color: 'var(--text-secondary)' }}>
                  • {item.description}
                </span>
              )}
            </div>

            <div style={{ marginTop: '0.35rem' }}>
              <span 
                className="evidence-hash" 
                onClick={() => copyFullHash(item.hash, item.id)}
                title="Click to copy complete 64-character SHA-256 hash"
              >
                <Hash size={11} style={{ color: 'var(--accent)' }} />
                <span>SHA-256: {item.hash.substring(0, 12)}...{item.hash.substring(item.hash.length - 6)}</span>
                {copiedId === item.id ? (
                  <Check size={11} style={{ color: 'var(--success)' }} />
                ) : (
                  <Copy size={11} />
                )}
              </span>
            </div>
          </div>

          <div className="evidence-actions">
            <button
              className="btn-icon sm btn-ghost"
              onClick={() => setInspectItem(item)}
              title="Inspect metadata & integrity details"
              aria-label="Inspect metadata"
            >
              <Info size={16} />
            </button>

            {item.fileData && (
              <button
                className="btn-icon sm btn-ghost"
                onClick={() => handleDownload(item)}
                title="Download original file"
                aria-label="Download original file"
              >
                <Download size={16} />
              </button>
            )}

            <button
              className="btn-icon sm btn-danger"
              onClick={() => handleDelete(item.id)}
              title="Remove evidence"
              aria-label="Delete evidence"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Metadata Inspector Modal */}
      {inspectItem && (
        <Modal
          isOpen={true}
          onClose={() => setInspectItem(null)}
          title="Evidence Integrity Record"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => copyFullHash(inspectItem.hash, inspectItem.id)}
              >
                <Copy size={14} /> Copy Hash
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setInspectItem(null)}>
                Close
              </button>
            </div>
          }
        >
          <div style={{ fontSize: 'var(--text-sm)' }}>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>File Name</label>
              <strong>{inspectItem.fileName}</strong>
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>Complete SHA-256 Digest</label>
              <div style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.75rem', 
                background: 'var(--bg-primary)', 
                padding: '0.5rem', 
                borderRadius: '6px', 
                wordBreak: 'break-all',
                color: 'var(--accent)'
              }}>
                {inspectItem.hash}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div>
                <label style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>Upload Timestamp</label>
                <span>{formatTime(inspectItem.createdAt)}</span>
              </div>
              <div>
                <label style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>File Size / Type</label>
                <span>{formatBytes(inspectItem.fileSize)} ({inspectItem.fileType})</span>
              </div>
            </div>

            {inspectItem.description && (
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>User Note</label>
                <p style={{ background: 'var(--bg-elevated)', padding: '0.5rem', borderRadius: '6px' }}>
                  {inspectItem.description}
                </p>
              </div>
            )}

            {inspectItem.deviceMetadata && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
                <label style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>
                  Device Metadata Stamped at Capture
                </label>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Timezone:</strong> {inspectItem.deviceMetadata.timezone || 'N/A'}</div>
                  <div><strong>Screen:</strong> {inspectItem.deviceMetadata.screenResolution || 'N/A'}</div>
                  <div><strong>Platform:</strong> {inspectItem.deviceMetadata.platform || 'N/A'}</div>
                  <div style={{ wordBreak: 'break-all' }}><strong>User-Agent:</strong> {inspectItem.deviceMetadata.userAgent || 'N/A'}</div>
                </div>
              </div>
            )}

            <div style={{ 
              marginTop: 'var(--space-md)', 
              background: 'var(--warning-subtle)', 
              border: '1px solid rgba(245, 158, 11, 0.2)', 
              borderRadius: '6px', 
              padding: '0.5rem', 
              fontSize: '0.75rem', 
              color: 'var(--warning)' 
            }}>
              SafeStep preserves evidence hashes and timestamps. This records what you preserved and when. A legal professional can advise on formal admissibility.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
