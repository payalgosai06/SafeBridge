/**
 * SafeStep Storage Service
 * IndexedDB wrapper using the `idb` library for encrypted local storage.
 * Stores: cases, evidence files, complaint tracker entries, app settings.
 */

import { openDB } from 'idb';

const DB_NAME = 'safestep_vault';
const DB_VERSION = 1;

let dbPromise = null;

/**
 * Initialize / open the IndexedDB database.
 * Creates object stores on first run.
 */
function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Cases store
        if (!db.objectStoreNames.contains('cases')) {
          const caseStore = db.createObjectStore('cases', { keyPath: 'id' });
          caseStore.createIndex('createdAt', 'createdAt');
        }

        // Evidence store
        if (!db.objectStoreNames.contains('evidence')) {
          const evidenceStore = db.createObjectStore('evidence', { keyPath: 'id' });
          evidenceStore.createIndex('caseId', 'caseId');
          evidenceStore.createIndex('createdAt', 'createdAt');
        }

        // Complaint tracker entries
        if (!db.objectStoreNames.contains('trackerEntries')) {
          const trackerStore = db.createObjectStore('trackerEntries', { keyPath: 'id' });
          trackerStore.createIndex('caseId', 'caseId');
          trackerStore.createIndex('date', 'date');
        }

        // App settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// ──────────────────────── Cases ────────────────────────

/**
 * Create a new case.
 */
export async function createCase(caseData) {
  const db = await getDb();
  const record = {
    id: caseData.id,
    categoryId: caseData.categoryId,
    title: caseData.title || '',
    notes: caseData.notes || '',
    checklistProgress: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.put('cases', record);
  return record;
}

/**
 * Get a case by ID.
 */
export async function getCase(caseId) {
  const db = await getDb();
  return db.get('cases', caseId);
}

/**
 * Get all cases.
 */
export async function getAllCases() {
  const db = await getDb();
  return db.getAll('cases');
}

/**
 * Update a case.
 */
export async function updateCase(caseId, updates) {
  const db = await getDb();
  const existing = await db.get('cases', caseId);
  if (!existing) throw new Error(`Case ${caseId} not found`);

  const updated = {
    ...existing,
    ...updates,
    id: caseId, // ensure ID can't be overwritten
    updatedAt: new Date().toISOString(),
  };
  await db.put('cases', updated);
  return updated;
}

/**
 * Delete a case and all associated evidence and tracker entries.
 */
export async function deleteCase(caseId) {
  const db = await getDb();

  // Delete evidence
  const evidenceItems = await getEvidenceByCaseId(caseId);
  const tx = db.transaction(['cases', 'evidence', 'trackerEntries'], 'readwrite');
  for (const item of evidenceItems) {
    await tx.objectStore('evidence').delete(item.id);
  }

  // Delete tracker entries
  const trackerEntries = await getTrackerEntriesByCaseId(caseId);
  for (const entry of trackerEntries) {
    await tx.objectStore('trackerEntries').delete(entry.id);
  }

  // Delete case
  await tx.objectStore('cases').delete(caseId);
  await tx.done;
}

// ──────────────────────── Evidence ────────────────────────

/**
 * Store evidence metadata and file data.
 */
export async function addEvidence(evidenceData) {
  const db = await getDb();
  const record = {
    id: evidenceData.id || `ev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    caseId: evidenceData.caseId,
    fileName: evidenceData.fileName,
    fileType: evidenceData.fileType,
    fileSize: evidenceData.fileSize,
    hash: evidenceData.hash,
    description: evidenceData.description || '',
    deviceMetadata: evidenceData.deviceMetadata || {},
    // Encrypted file data (ArrayBuffer)
    encryptedData: evidenceData.encryptedData || null,
    encryptionSalt: evidenceData.encryptionSalt || null,
    encryptionIv: evidenceData.encryptionIv || null,
    // Raw file data (when no passcode/encryption)
    fileData: evidenceData.fileData || null,
    createdAt: new Date().toISOString(),
  };
  await db.put('evidence', record);
  return record;
}

/**
 * Get all evidence for a case.
 */
export async function getEvidenceByCaseId(caseId) {
  const db = await getDb();
  return db.getAllFromIndex('evidence', 'caseId', caseId);
}

/**
 * Get a single evidence item by ID.
 */
export async function getEvidence(evidenceId) {
  const db = await getDb();
  return db.get('evidence', evidenceId);
}

/**
 * Delete a single evidence item.
 */
export async function deleteEvidence(evidenceId) {
  const db = await getDb();
  await db.delete('evidence', evidenceId);
}

// ──────────────────────── Tracker ────────────────────────

/**
 * Add a complaint tracker entry.
 */
export async function addTrackerEntry(entryData) {
  const db = await getDb();
  const record = {
    id: entryData.id || `tr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    caseId: entryData.caseId,
    date: entryData.date,
    type: entryData.type, // 'filed', 'follow_up', 'update', 'resolved'
    authority: entryData.authority || '',
    referenceNumber: entryData.referenceNumber || '',
    notes: entryData.notes || '',
    followUpDate: entryData.followUpDate || null,
    reminderSet: entryData.reminderSet || false,
    createdAt: new Date().toISOString(),
  };
  await db.put('trackerEntries', record);
  return record;
}

/**
 * Get all tracker entries for a case.
 */
export async function getTrackerEntriesByCaseId(caseId) {
  const db = await getDb();
  return db.getAllFromIndex('trackerEntries', 'caseId', caseId);
}

/**
 * Update a tracker entry.
 */
export async function updateTrackerEntry(entryId, updates) {
  const db = await getDb();
  const existing = await db.get('trackerEntries', entryId);
  if (!existing) throw new Error(`Tracker entry ${entryId} not found`);

  const updated = { ...existing, ...updates, id: entryId };
  await db.put('trackerEntries', updated);
  return updated;
}

/**
 * Delete a tracker entry.
 */
export async function deleteTrackerEntry(entryId) {
  const db = await getDb();
  await db.delete('trackerEntries', entryId);
}

// ──────────────────────── Settings ────────────────────────

/**
 * Get a setting value.
 */
export async function getSetting(key) {
  const db = await getDb();
  const record = await db.get('settings', key);
  return record?.value ?? null;
}

/**
 * Set a setting value.
 */
export async function setSetting(key, value) {
  const db = await getDb();
  await db.put('settings', { key, value });
}

// ──────────────────────── Utilities ────────────────────────

/**
 * Wipe all data — used by panic button and manual deletion.
 */
export async function wipeAllData() {
  const db = await getDb();
  const tx = db.transaction(
    ['cases', 'evidence', 'trackerEntries', 'settings'],
    'readwrite'
  );
  await tx.objectStore('cases').clear();
  await tx.objectStore('evidence').clear();
  await tx.objectStore('trackerEntries').clear();
  await tx.objectStore('settings').clear();
  await tx.done;
}

/**
 * Get storage usage estimate.
 */
export async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      usageFormatted: formatBytes(estimate.usage || 0),
      quotaFormatted: formatBytes(estimate.quota || 0),
    };
  }
  return null;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
