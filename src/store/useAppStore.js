/**
 * SafeStep — Zustand State Management
 * Central store for application state, cases, UI state, and navigation.
 */

import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // ──────────────────────── Active Case ────────────────────────
  activeCase: null,
  setActiveCase: (caseData) => set({ activeCase: caseData }),
  clearActiveCase: () => set({ activeCase: null }),

  // ──────────────────────── Cases List (in-memory cache) ────────────────────────
  cases: [],
  setCases: (cases) => set({ cases }),
  addCase: (newCase) => set((state) => ({ cases: [...state.cases, newCase] })),
  removeCase: (caseId) =>
    set((state) => ({
      cases: state.cases.filter((c) => c.id !== caseId),
      activeCase: state.activeCase?.id === caseId ? null : state.activeCase,
    })),

  // ──────────────────────── Evidence (in-memory cache) ────────────────────────
  evidence: [],
  setEvidence: (items) => set({ evidence: items }),
  addEvidenceItem: (item) =>
    set((state) => ({ evidence: [...state.evidence, item] })),
  removeEvidenceItem: (itemId) =>
    set((state) => ({
      evidence: state.evidence.filter((e) => e.id !== itemId),
    })),

  // ──────────────────────── Tracker Entries (in-memory) ────────────────────────
  trackerEntries: [],
  setTrackerEntries: (entries) => set({ trackerEntries: entries }),
  addTrackerEntry: (entry) =>
    set((state) => ({
      trackerEntries: [...state.trackerEntries, entry],
    })),
  removeTrackerEntry: (entryId) =>
    set((state) => ({
      trackerEntries: state.trackerEntries.filter((e) => e.id !== entryId),
    })),

  // ──────────────────────── UI State ────────────────────────
  isLocked: false,
  setIsLocked: (locked) => set({ isLocked: locked }),

  passcodeHash: null, // stored hash of passcode (not the passcode itself)
  setPasscodeHash: (hash) => set({ passcodeHash: hash }),

  showDisclaimer: true,
  setShowDisclaimer: (show) => set({ showDisclaimer: show }),

  // Modal / overlay state
  modalContent: null,
  showModal: (content) => set({ modalContent: content }),
  hideModal: () => set({ modalContent: null }),

  // Toast notifications
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: Date.now(),
          ...toast,
          createdAt: Date.now(),
        },
      ],
    })),
  removeToast: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== toastId),
    })),

  // ──────────────────────── Panic Exit ────────────────────────
  panicExit: () => {
    // Clear all in-memory state
    set({
      activeCase: null,
      cases: [],
      evidence: [],
      trackerEntries: [],
      passcodeHash: null,
      modalContent: null,
      toasts: [],
    });

    // Clear browser storage
    try {
      sessionStorage.clear();
    } catch (e) {
      // Fail silently
    }

    // Navigate away immediately
    window.location.replace('https://www.google.com');
  },
}));

export default useAppStore;
