# SafeStep — Legal Guidance & Evidence Vault

SafeStep is a privacy-first web application designed for individuals dealing with harassment, cybercrime, stalking, domestic abuse, or situations requiring a formal legal complaint in India.

---

## Key Features

### 1. Guided Complaint Flows
- **5 Situation Categories**: Cyber Harassment, Stalking, Online Fraud, Domestic Abuse, and Workplace Harassment.
- **Step-by-Step Checklists**: Verified procedural guidance on documentation, filing authorities, required records, and official portal links.
- **Strict Legal Disclaimers**: Every step is explicitly marked *"General information, not legal advice"* — with zero invented statutes.
- **Decoupled Data Architecture**: All guidance data lives in `/src/data/*.json` so non-developers and legal advisors can review and update content without code changes.

### 2. Client-Side Cryptographic Evidence Vault
- **Client-Side SHA-256 Hashing**: Browser-native Web Crypto API generates 64-character SHA-256 checksums before any file ingestion.
- **Tamper-Evident Integrity**: Records upload timestamp (UTC/IST) and device metadata (screen resolution, timezone, user-agent).
- **AES-256-GCM Local Storage**: Vault data is encrypted at rest in local browser IndexedDB (`idb`).
- **Exportable Evidence Packages**:
  - **PDF Evidence Log**: Formatted manifest with file names, byte sizes, hashes, and timestamps via `jsPDF`.
  - **ZIP Bundle**: Compressed archive containing files, `manifest.txt`, and integrity instructions via `JSZip`.
- **Zero Cloud Leakage**: No remote server file storage, no machine learning analysis, and no telemetry tracking.

### 3. Privacy & Safety Safeguards
- **Anonymous-First**: 12-character pseudonymous Case IDs (e.g. `A7K2-M9X3-P1Q4`) generated client-side. No email, phone, or name required.
- **Persistent Disclaimer Banner**: Non-dismissible reminder that SafeStep is not a substitute for legal advice.
- **Panic / Quick-Exit Button**: Fixed FAB on every screen that wipes in-memory state and instantly redirects to Google Search.
- **Passcode Lock Screen**: Optional on-device 6-digit PIN lock using SHA-256 comparison.
- **Permanent Local Wipe**: Complete two-step data destruction option in Settings.

### 4. Complaint Status Tracker
- Manual log for filing dates, police/portal authorities, and official FIR / acknowledgment reference numbers.
- Scheduled follow-up dates with overdue warning badges.
- Browser notification permissions for follow-up reminders.

---

## Tech Stack

- **Framework**: Vite 6 + React 19
- **State Management**: Zustand
- **Local Storage**: IndexedDB via `idb`
- **Cryptography**: Native Web Crypto API (SHA-256, AES-256-GCM, PBKDF2)
- **Exports**: `jsPDF` (PDF log generation) & `JSZip` (ZIP archive packaging)
- **Styling**: Vanilla CSS with custom property tokens & dark mode
- **Routing**: React Router v7
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone <repository-url>
cd SafeBridge
npm install
```

### Running Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Building for Production
```bash
npm run build
```

---

## Legal Disclaimer

SafeStep provides general procedural and educational information only and is not a substitute for qualified legal advice. In an emergency or situation of immediate physical danger, contact local police immediately by dialing **112** (All-India Emergency), **181** (Women's Helpline), or **1930** (Cyber Crime Helpline).
