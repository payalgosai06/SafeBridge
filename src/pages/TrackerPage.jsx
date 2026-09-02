import React, { useState, useEffect } from 'react';
import { 
  ClockAlert, 
  Plus, 
  Calendar, 
  Building2, 
  Hash, 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Trash2, 
  AlertCircle,
  FileText,
  Briefcase
} from 'lucide-react';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import useAppStore from '../store/useAppStore';
import { 
  getTrackerEntriesByCaseId, 
  addTrackerEntry, 
  deleteTrackerEntry, 
  getAllCases 
} from '../../src/services/storage';

export default function TrackerPage() {
  const activeCase = useAppStore((s) => s.activeCase);
  const setActiveCase = useAppStore((s) => s.setActiveCase);
  const trackerEntries = useAppStore((s) => s.trackerEntries);
  const setTrackerEntries = useAppStore((s) => s.setTrackerEntries);
  const addToast = useAppStore((s) => s.addToast);

  const [availableCases, setAvailableCases] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('filed'); // filed, follow_up, update, resolved
  const [authority, setAuthority] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    async function loadCasesAndEntries() {
      try {
        const cases = await getAllCases();
        setAvailableCases(cases);

        if (!activeCase && cases.length > 0) {
          setActiveCase(cases[0]);
          const entries = await getTrackerEntriesByCaseId(cases[0].id);
          setTrackerEntries(entries);
        } else if (activeCase) {
          const entries = await getTrackerEntriesByCaseId(activeCase.id);
          setTrackerEntries(entries);
        }
      } catch (err) {
        console.error('Tracker load error:', err);
      }
    }
    loadCasesAndEntries();
  }, [activeCase?.id]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      addToast({
        type: 'info',
        message: 'Browser notifications are not supported in this browser.'
      });
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsGranted(true);
        addToast({
          type: 'success',
          message: 'Notification permission granted for follow-up reminders'
        });
      } else {
        addToast({
          type: 'error',
          message: 'Notification permission denied.'
        });
      }
    } catch (e) {
      console.error('Notification permission error:', e);
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!activeCase) {
      addToast({ type: 'error', message: 'Please select or create a case first.' });
      return;
    }

    if (!authority.trim() && !referenceNumber.trim()) {
      addToast({ type: 'error', message: 'Please provide either an authority or a reference number.' });
      return;
    }

    try {
      const record = {
        caseId: activeCase.id,
        date,
        type,
        authority: authority.trim(),
        referenceNumber: referenceNumber.trim(),
        notes: notes.trim(),
        followUpDate: followUpDate || null,
        reminderSet,
      };

      await addTrackerEntry(record);
      const entries = await getTrackerEntriesByCaseId(activeCase.id);
      setTrackerEntries(entries);

      addToast({
        type: 'success',
        message: 'Complaint filing log saved'
      });

      // Reset & close
      setIsModalOpen(false);
      setAuthority('');
      setReferenceNumber('');
      setNotes('');
      setFollowUpDate('');
      setReminderSet(false);
    } catch (err) {
      console.error('Failed to save tracker entry:', err);
      addToast({ type: 'error', message: `Failed to save: ${err.message}` });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tracker log entry?')) return;
    try {
      await deleteTrackerEntry(id);
      if (activeCase) {
        const entries = await getTrackerEntriesByCaseId(activeCase.id);
        setTrackerEntries(entries);
      }
      addToast({ type: 'info', message: 'Log entry removed' });
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClockAlert size={24} style={{ color: 'var(--accent)' }} />
              Complaint Status Tracker
            </h2>
            <p className="page-subtitle">
              Manually record acknowledgment numbers, official departments, and track scheduled follow-ups.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {!notificationsGranted && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={requestNotificationPermission}
                title="Enable browser reminders for follow-up dates"
              >
                <Bell size={14} />
                <span>Enable Reminders</span>
              </button>
            )}

            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setIsModalOpen(true)}
              disabled={!activeCase}
            >
              <Plus size={14} />
              <span>Log Complaint Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Case Selector Banner */}
      {availableCases.length > 0 && (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 'var(--text-sm)' }}>Currently Viewing:</span>
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '4px 28px 4px 10px', fontSize: 'var(--text-xs)' }}
              value={activeCase?.id || ''}
              onChange={async (e) => {
                const found = availableCases.find(c => c.id === e.target.value);
                if (found) {
                  setActiveCase(found);
                  const entries = await getTrackerEntriesByCaseId(found.id);
                  setTrackerEntries(entries);
                }
              }}
            >
              {availableCases.map(c => (
                <option key={c.id} value={c.id}>
                  Case #{c.id} — {c.title || 'Untitled'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Manual local tracker • No third-party data transmission
          </div>
        </div>
      )}

      {/* Entries Timeline List */}
      {trackerEntries.length === 0 ? (
        <EmptyState
          icon={ClockAlert}
          title="No Complaint Actions Logged"
          description="Record official reference numbers (e.g., cybercrime.gov.in acknowledgment or police FIR number) and set reminder dates."
          action={
            activeCase ? (
              <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
                <Plus size={14} />
                <span>Log First Complaint Record</span>
              </button>
            ) : null
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {trackerEntries.map((entry) => {
            const isFollowUpDue = entry.followUpDate && new Date(entry.followUpDate) <= new Date();

            return (
              <div key={entry.id} className="tracker-entry">
                <div className="tracker-date">
                  <div className="tracker-date-day">
                    {entry.date ? new Date(entry.date).getDate() : '--'}
                  </div>
                  <div className="tracker-date-month">
                    {entry.date ? new Date(entry.date).toLocaleString('default', { month: 'short' }) : 'LOG'}
                  </div>
                </div>

                <div className="tracker-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`tracker-type ${entry.type}`}>
                      {entry.type.replace('_', ' ')}
                    </span>

                    <button
                      className="btn-icon sm btn-ghost"
                      onClick={() => handleDelete(entry.id)}
                      title="Delete log entry"
                    >
                      <Trash2 size={14} style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  </div>

                  <div style={{ marginTop: '0.25rem' }}>
                    {entry.authority && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                        <Building2 size={14} style={{ color: 'var(--accent)' }} />
                        <span>{entry.authority}</span>
                      </div>
                    )}

                    {entry.referenceNumber && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <Hash size={13} />
                        <span>Ref / Ack No: <strong className="text-mono" style={{ color: 'var(--text-primary)' }}>{entry.referenceNumber}</strong></span>
                      </div>
                    )}

                    {entry.notes && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.5rem', background: 'var(--bg-elevated)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                        {entry.notes}
                      </p>
                    )}

                    {entry.followUpDate && (
                      <div style={{ 
                        marginTop: '0.5rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isFollowUpDue ? 'var(--danger-subtle)' : 'var(--warning-subtle)',
                        color: isFollowUpDue ? 'var(--danger)' : 'var(--warning)',
                        fontWeight: 500
                      }}>
                        <BellRing size={12} />
                        <span>Follow-up Scheduled: {entry.followUpDate} {isFollowUpDue ? '(Due Now)' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Log Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Complaint Status / Action"
      >
        <form onSubmit={handleSaveEntry}>
          <div className="form-group">
            <label className="form-label">Action Type</label>
            <select 
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="filed">Initial Complaint Filed</option>
              <option value="follow_up">Follow-Up Made</option>
              <option value="update">Official Update / Status Received</option>
              <option value="resolved">Case Resolved / Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Action</label>
            <input 
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Authority / Agency Contacted</label>
            <input 
              type="text"
              className="form-input"
              placeholder="e.g. cybercrime.gov.in / Cyber Cell Delhi / NCW / Station House"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official Acknowledgment / Ref / FIR Number</label>
            <input 
              type="text"
              className="form-input text-mono"
              placeholder="e.g. 2024-CC-982741 or Zero-FIR #44/24"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Next Scheduled Follow-Up Date (Optional)</label>
            <input 
              type="date"
              className="form-input"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Instructions Given</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Officer requested bank statement printout; stated enquiry will initiate within 3 working days."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ marginTop: 'var(--space-lg)' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
