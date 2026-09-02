import React, { useState } from 'react';
import { FileDown, Archive, Loader2, ShieldCheck } from 'lucide-react';
import { generateEvidenceLogPdf, generateEvidenceZip } from '../../services/export';
import useAppStore from '../../store/useAppStore';

export default function EvidenceExport({ activeCase, items = [] }) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingZip, setGeneratingZip] = useState(false);
  const addToast = useAppStore((s) => s.addToast);

  const handleExportPdf = async () => {
    if (!activeCase) return;
    try {
      setGeneratingPdf(true);
      const pdfBlob = generateEvidenceLogPdf(activeCase, items);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SafeStep_EvidenceLog_${activeCase.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        message: 'Evidence log PDF exported successfully'
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      addToast({
        type: 'error',
        message: `Failed to export PDF: ${err.message}`
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleExportZip = async () => {
    if (!activeCase) return;
    try {
      setGeneratingZip(true);
      const zipBlob = await generateEvidenceZip(activeCase, items);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SafeStep_EvidenceVault_${activeCase.id}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        message: 'Evidence ZIP archive packaged with manifest and hashes'
      });
    } catch (err) {
      console.error('ZIP export failed:', err);
      addToast({
        type: 'error',
        message: `Failed to package ZIP: ${err.message}`
      });
    } finally {
      setGeneratingZip(false);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
            Export Tamper-Evident Package
          </h4>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Generate structured logs with SHA-256 hashes and timestamp manifests for police or legal counsel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportPdf}
            disabled={generatingPdf || generatingZip}
          >
            {generatingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            <span>Export PDF Log</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleExportZip}
            disabled={generatingPdf || generatingZip}
          >
            {generatingZip ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
            <span>Download All (.ZIP)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
