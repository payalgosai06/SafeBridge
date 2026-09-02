import React, { useState, useRef } from 'react';
import { UploadCloud, File, ShieldAlert, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { generateHash, encrypt, getDeviceMetadata } from '../../services/crypto';
import { addEvidence } from '../../services/storage';
import useAppStore from '../../store/useAppStore';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUploader({ caseId, onUploadSuccess }) {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [computedHash, setComputedHash] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const addToast = useAppStore((s) => s.addToast);
  const addEvidenceItem = useAppStore((s) => s.addEvidenceItem);

  const processSelectedFile = async (file) => {
    setError('');
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('File exceeds 50MB limit. Please upload a smaller file or compress it.');
      return;
    }

    try {
      setProcessing(true);
      setCurrentFile(file);

      // 1. Client-side SHA-256 computation before any storage/transmission
      const hash = await generateHash(file);
      setComputedHash(hash);

      // 2. Read file data as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // 3. Optional AES-256 encryption at rest
      const passcode = sessionStorage.getItem('safestep_session_passcode');
      let storageRecord;

      const deviceMeta = getDeviceMetadata();

      if (passcode) {
        const { encrypted, salt, iv } = await encrypt(arrayBuffer, passcode);
        storageRecord = {
          caseId,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          hash,
          description: description.trim(),
          deviceMetadata: deviceMeta,
          encryptedData: encrypted,
          encryptionSalt: salt,
          encryptionIv: iv,
          fileData: null,
        };
      } else {
        storageRecord = {
          caseId,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          hash,
          description: description.trim(),
          deviceMetadata: deviceMeta,
          fileData: arrayBuffer,
        };
      }

      // 4. Save to IndexedDB
      const savedItem = await addEvidence(storageRecord);
      addEvidenceItem(savedItem);

      addToast({
        type: 'success',
        message: `Evidence stored securely. SHA-256: ${hash.substring(0, 10)}...`
      });

      if (onUploadSuccess) {
        onUploadSuccess(savedItem);
      }

      // Reset
      setCurrentFile(null);
      setComputedHash('');
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Evidence upload error:', err);
      setError(`Failed to process file: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Lock size={18} style={{ color: 'var(--accent)' }} />
        Secure Evidence Ingestion
      </h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
        Files are hashed locally using client-side SHA-256 and stored in your browser's encrypted vault. No ML analysis, no remote cloud inspection.
      </p>

      {/* Description input */}
      <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
        <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
          Optional Note / Incident Context:
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Threatening WhatsApp message received from unknown number"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={processing}
          style={{ fontSize: 'var(--text-sm)' }}
        />
      </div>

      {/* Drag and Drop Zone */}
      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !processing && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && processSelectedFile(e.target.files[0])}
          disabled={processing}
          accept="image/*,video/*,audio/*,.pdf,.txt,.zip,.doc,.docx"
        />

        {processing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <p className="upload-zone-text">Computing cryptographic hash (SHA-256)...</p>
            <span className="upload-zone-hint">Encrypting and writing to local vault...</span>
          </div>
        ) : (
          <div>
            <UploadCloud size={40} className="upload-zone-icon" />
            <p className="upload-zone-text">
              <strong>Click to upload</strong> or drag & drop evidence file
            </p>
            <p className="upload-zone-hint">
              Screenshots, screen recordings, chat exports, audio clips, PDFs (Max 50MB)
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{ 
          marginTop: 'var(--space-sm)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--danger)', 
          fontSize: 'var(--text-xs)' 
        }}>
          <ShieldAlert size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
