# CCMS – Technical Documentation
## Centralized Campus Management System
### Version 1.0 | February 2026

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design Philosophy](#2-design-philosophy)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Detailed System Flows](#4-detailed-system-flows)
5. [Smart Contract Architecture](#5-smart-contract-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Data Storage Strategy](#8-data-storage-strategy)
9. [Privacy Model](#9-privacy-model)
10. [AI & Automation Design](#10-ai--automation-design)
11. [Security Model & Threat Analysis](#11-security-model--threat-analysis)
12. [Testing & Validation Strategy](#12-testing--validation-strategy)
13. [Deployment & Environment Setup](#13-deployment--environment-setup)
14. [Demo & Verification Guide](#14-demo--verification-guide)
15. [Limitations & Future Improvements](#15-limitations--future-improvements)
16. [Glossary](#16-glossary)

---

# 1. Project Overview

## 1.1 Purpose

CCMS (Centralized Campus Management System) is a privacy-first, blockchain-backed platform designed to replace trust-based campus administrative workflows with cryptographically verifiable, tamper-proof alternatives.

## 1.2 Core Capabilities

| Capability | Description |
|------------|-------------|
| **Attendance Tracking** | Blockchain-anchored, time-bound check-ins with duplicate prevention |
| **Secure Voting** | One-wallet-one-vote elections with immutable tallying |
| **Anonymous Feedback** | Privacy-preserving sentiment analysis with no identity linkage |
| **Automated Certification** | Threshold-based NFT certificate issuance |

## 1.3 Target Users

- **Students**: Mark attendance, cast votes, submit feedback, receive certificates
- **Faculty/Organizers**: Create events, manage attendance windows, view analytics
- **Administrators**: Configure elections, issue certificates, access aggregated insights
- **Auditors**: Verify any action via public blockchain explorers

## 1.4 Technology Stack

| Layer | Technologies |
|-------|--------------|
| Blockchain | Algorand TestNet, PyTeal v8, Algorand Standard Assets (ASA) |
| Backend | Node.js 18+, Express.js, Sequelize ORM, PostgreSQL, Redis |
| Frontend | React 18, Vite, TailwindCSS, Pera Wallet SDK |
| AI | Sentiment.js (NLP), Custom anomaly detection |

---

# 2. Design Philosophy

## 2.1 Core Principles

### Principle 1: Blockchain as Source of Truth
The database stores operational data; the blockchain stores proofs. In any conflict, blockchain state is authoritative.

### Principle 2: Backend as Orchestrator, Not Authority
The backend coordinates workflows, validates inputs, and submits transactions. It cannot unilaterally modify blockchain state or bypass smart contract rules.

### Principle 3: Privacy by Architecture
User anonymity is enforced through cryptographic hashing, not policy. Wallet addresses are never stored raw where anonymity is required.

### Principle 4: Fail-Safe Security
On any validation failure, the system rejects the action entirely. No partial state writes occur.

### Principle 5: Verifiable Transparency
Every critical action produces a transaction ID that can be independently verified on public block explorers.

## 2.2 What the System Explicitly Does NOT Allow

| Prohibited Action | Enforcement Mechanism |
|-------------------|----------------------|
| Duplicate attendance | Unique constraint (DB) + Local state check (Contract) |
| Multiple votes per wallet | Unique constraint (DB) + Local state check (Contract) |
| Admin vote manipulation | No admin override functions in contracts |
| Feedback de-anonymization | Wallet hashing with salt; no reverse mapping |
| Certificate forgery | ASA ownership verified on-chain |
| Attendance outside time window | Smart contract timestamp assertions |

---

# 3. High-Level Architecture

## 3.1 Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  React + Vite + Pera Wallet SDK                                 │
│  - Pure UI layer                                                │
│  - No direct blockchain calls                                   │
│  - All sensitive logic server-side                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ REST API (HTTPS)
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  Node.js + Express + Sequelize                                  │
│  - Input validation (Zod)                                       │
│  - Authentication (JWT)                                         │
│  - Authorization (RBAC)                                         │
│  - Blockchain transaction submission                            │
│  - Privacy-preserving hashing                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│       POSTGRESQL        │     │    ALGORAND BLOCKCHAIN   │
│  - Users, Events        │     │  - Smart Contracts       │
│  - Attendance records   │     │  - Transaction proofs    │
│  - Feedback (hashed)    │     │  - ASA Certificates      │
│  - Certificates         │     │  - Immutable state       │
└─────────────────────────┘     └─────────────────────────┘
```

## 3.2 Trust Boundaries

| Boundary | Trust Level | Notes |
|----------|-------------|-------|
| Frontend → Backend | Untrusted | All input validated server-side |
| Backend → Database | Trusted | Internal network, authenticated |
| Backend → Blockchain | Verified | Transactions cryptographically signed |
| User → Smart Contract | Trustless | Contract enforces rules immutably |

## 3.3 Data Flow Summary

```
User Action → Frontend → Backend API → Validation → Hashing → 
→ Database Write → Blockchain Submission → Confirmation → Response
```

---

# 4. Detailed System Flows

## 4.1 Attendance Flow

### Sequence Diagram

```
Student          Frontend         Backend          Blockchain
   │                 │                │                 │
   │──[Scan QR]─────▶│                │                 │
   │                 │──[POST /attendance/mark]────────▶│
   │                 │                │──[Validate JWT]─│
   │                 │                │──[Check time window]
   │                 │                │──[Hash wallet]──│
   │                 │                │──[Check duplicate]
   │                 │                │──[Insert PENDING]
   │                 │                │────────────────▶│
   │                 │                │                 │──[App Call: CHECK_IN]
   │                 │                │                 │──[Assert time valid]
   │                 │                │                 │──[Assert not checked in]
   │                 │                │                 │──[Update local state]
   │                 │                │◀────[txnId]─────│
   │                 │                │──[Update CONFIRMED]
   │                 │◀───[200 OK + txnId]──────────────│
   │◀──[Success]─────│                │                 │
```

### State Transitions

| State | Trigger | Next State |
|-------|---------|------------|
| (none) | User initiates | PENDING |
| PENDING | Blockchain confirms | CONFIRMED |
| PENDING | Blockchain fails | FAILED |
| CONFIRMED | (terminal) | — |

### Smart Contract Assertions

```python
Assert(Global.latest_timestamp() >= App.globalGet(START_TIME))
Assert(Global.latest_timestamp() <= App.globalGet(END_TIME))
Assert(App.localGet(sender, CHECKED_IN) == Int(0))
```

---

## 4.2 Voting Flow

### State Machine

```
                    ┌──────────────┐
                    │   ELIGIBLE   │
                    └──────┬───────┘
                           │ [Cast Vote]
                           ▼
                    ┌──────────────┐
                    │    VOTED     │
                    └──────────────┘
                           │
                      (No transitions)
```

### Vote Commitment Scheme

```
commitment = SHA256(choice + wallet_address + nonce)
```

The commitment is stored on-chain. The original choice remains off-chain, providing ballot secrecy while enabling auditability.

### Smart Contract State

**Global State:**
| Key | Type | Description |
|-----|------|-------------|
| election_id | bytes | Unique election identifier |
| start_time | uint64 | Unix timestamp |
| end_time | uint64 | Unix timestamp |
| option_count | uint64 | Number of voting options |

**Local State (per wallet):**
| Key | Type | Description |
|-----|------|-------------|
| has_voted | uint64 | 0 = not voted, 1 = voted |
| vote_commitment | bytes | SHA256 hash of vote |

---

## 4.3 Feedback Flow

### Privacy Implementation

```
┌─────────────────┐
│ Wallet Address  │
│ (58 characters) │
└────────┬────────┘
         │
         ▼ SHA256(wallet + HASH_SALT)
┌─────────────────┐
│   Wallet Hash   │
│ (64 hex chars)  │
└────────┬────────┘
         │
         ▼ Stored in Database
┌─────────────────┐
│ Feedback Record │
│ - wallet_hash   │ ← Cannot reverse to wallet
│ - content       │
│ - sentiment     │
└─────────────────┘
```

### Sentiment Analysis Pipeline

```
Input: "The event was very well organized and helpful"
       │
       ▼ Sentiment.js
Output: { sentiment: "positive", score: 4, comparative: 0.44 }
```

---

## 4.4 Certification Flow

### Eligibility Check

```javascript
isEligible = (attendanceCount >= attendanceThreshold)
```

### Inner Transaction (ASA Transfer)

```python
InnerTxnBuilder.Begin()
InnerTxnBuilder.SetFields({
    TxnField.type_enum: TxnType.AssetTransfer,
    TxnField.xfer_asset: global.cert_asset_id,
    TxnField.asset_amount: Int(1),
    TxnField.asset_receiver: Txn.sender()
})
InnerTxnBuilder.Submit()
```

---

# 5. Smart Contract Architecture

## 5.1 Contract Inventory

| Contract | Purpose | Global State | Local State |
|----------|---------|--------------|-------------|
| Attendance | Time-bound check-ins | 5 keys | 2 keys |
| Voting | Anonymous elections | 5 keys | 2 keys |
| Certification | NFT issuance | 4 keys | 2 keys |

## 5.2 Attendance Contract

### File: `smart-contracts/contracts/attendance.py`

**Global State Schema:**
```
event_id: bytes (32)
start_time: uint64
end_time: uint64
total_attendance: uint64
creator: bytes (32)
```

**Local State Schema:**
```
checked_in: uint64 (0 or 1)
checkin_timestamp: uint64
```

**Application Call Routing:**
```python
Cond(
    [Txn.application_id() == Int(0), on_creation],
    [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
    [Txn.on_completion() == OnComplete.NoOp, 
        Cond([Txn.application_args[0] == Bytes("CHECK_IN"), check_in])
    ]
)
```

## 5.3 Voting Contract

### File: `smart-contracts/contracts/voting.py`

**Security Properties:**
1. Time-bound enforcement via `Global.latest_timestamp()`
2. Duplicate prevention via `local.has_voted` check
3. Vote immutability (no update function exists)
4. No admin override (no privileged functions)

## 5.4 Certification Contract

### File: `smart-contracts/contracts/certification.py`

**Inner Transaction Flow:**
1. User calls `ISSUE` function
2. Contract verifies eligibility (attendance count)
3. Contract executes inner transaction to transfer ASA
4. Local state updated to prevent re-issuance

---

# 6. Backend Architecture

## 6.1 Directory Structure

```
backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # HTTP server bootstrap
│   ├── config/
│   │   ├── database.js        # PostgreSQL + Redis
│   │   ├── logger.js          # Winston structured logging
│   │   └── algorand.js        # Algorand client config
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── attendance.routes.js
│   │   ├── voting.routes.js
│   │   ├── feedback.routes.js
│   │   ├── certificate.routes.js
│   │   └── event.routes.js
│   ├── controllers/           # Request handlers
│   ├── middlewares/
│   │   └── auth.middleware.js # JWT + RBAC
│   ├── models/                # Sequelize models
│   ├── services/
│   │   ├── hash.service.js    # Privacy hashing
│   │   └── ai.service.js      # Sentiment analysis
│   ├── blockchain/
│   │   └── algorand.client.js # Algorand SDK wrapper
│   ├── validators/            # Zod schemas
│   └── tests/                 # Jest test suites
├── .env.example
└── package.json
```

## 6.2 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/login | Public | Get JWT tokens |

### Attendance

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | /api/attendance/mark | JWT | All |
| GET | /api/attendance/my | JWT | All |
| GET | /api/attendance/event/:id | JWT | Admin, Faculty |
| GET | /api/attendance/verify/:id | Public | — |

### Voting

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | /api/voting | JWT | All |
| POST | /api/voting/create | JWT | Admin |
| POST | /api/voting/vote | JWT | Student, Faculty |

### Feedback

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | /api/feedback/submit | JWT | All |
| GET | /api/feedback/analytics/:id | JWT | Admin, Faculty |

### Certificates

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | /api/certificates/eligibility/:id | JWT | All |
| POST | /api/certificates/issue | JWT | All |
| GET | /api/certificates/my | JWT | All |
| GET | /api/certificates/verify/:hash | Public | — |

## 6.3 Middleware Pipeline

```
Request → Helmet → CORS → Rate Limit → JSON Parser → 
→ Request Logger → Route Handler → Error Handler → Response
```

## 6.4 Error Handling

All errors return structured JSON:

```json
{
  "error": "Human-readable message",
  "details": [...] // Only in development
}
```

---

# 7. Frontend Architecture

## 7.1 Directory Structure

```
frontend/
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Router + providers
│   ├── config/
│   │   ├── api.js             # Axios instance
│   │   └── wallet.js          # Algorand config
│   ├── context/
│   │   └── WalletContext.jsx  # Pera Wallet state
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── OrganizerDashboard.jsx
│   │   ├── Attendance.jsx
│   │   ├── Voting.jsx
│   │   ├── Feedback.jsx
│   │   └── Certificates.jsx
│   ├── components/
│   │   └── Navbar.jsx
│   └── styles/
│       └── index.css          # Tailwind imports
├── tailwind.config.js
└── package.json
```

## 7.2 Wallet Integration

**Connection Flow:**
1. User clicks "Connect Wallet"
2. Pera Wallet SDK opens modal
3. User approves connection
4. Wallet address stored in React context
5. Address sent with API requests

**Security Constraints:**
- Frontend NEVER initiates blockchain transactions directly
- Frontend NEVER handles private keys or mnemonics
- All contract interactions go through backend

## 7.3 Route Protection

```javascript
// Routes require wallet connection
{isConnected ? <Dashboard /> : <Redirect to="/" />}
```

---

# 8. Data Storage Strategy

## 8.1 PostgreSQL Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
  wallet_address VARCHAR(58),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Attendance Table
```sql
CREATE TABLE attendances (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  wallet_address VARCHAR(58) NOT NULL,
  wallet_hash VARCHAR(64) NOT NULL,  -- SHA256 for privacy
  txn_id VARCHAR(52) UNIQUE,
  status ENUM('PENDING', 'CONFIRMED', 'FAILED'),
  checked_in_at TIMESTAMP,
  UNIQUE(event_id, user_id)
);
```

### Feedback Table
```sql
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  wallet_hash VARCHAR(64) NOT NULL,  -- NO raw wallet stored
  content_hash VARCHAR(64) NOT NULL,
  feedback_text TEXT NOT NULL,
  sentiment ENUM('positive', 'neutral', 'negative'),
  sentiment_score FLOAT,
  UNIQUE(event_id, wallet_hash)
);
```

## 8.2 What Goes Where

| Data Type | PostgreSQL | Blockchain |
|-----------|------------|------------|
| User accounts | ✅ | ❌ |
| Event metadata | ✅ | ❌ |
| Attendance proof | ✅ (txn_id) | ✅ (state) |
| Vote commitment | ✅ (hash) | ✅ (local state) |
| Feedback text | ✅ | ✅ (hash only) |
| Certificates | ✅ (asset_id) | ✅ (ASA) |

---

# 9. Privacy Model

## 9.1 Wallet Anonymization

```javascript
// HashService.hashWallet()
const hash = crypto
  .createHash('sha256')
  .update(walletAddress + process.env.HASH_SALT)
  .digest('hex');
```

**Properties:**
- Deterministic (same wallet → same hash)
- One-way (cannot reverse to wallet)
- Salted (prevents rainbow table attacks)

## 9.2 Feedback Privacy Guarantees

| Layer | Protection |
|-------|------------|
| Submission | Wallet hashed before storage |
| Storage | Only wallet_hash in DB, never raw |
| Analytics | Returns aggregates only |
| Admin View | Feedback text without identifiers |
| Blockchain | Only content_hash stored |

## 9.3 Data NOT Stored

- Personal names in attendance
- Wallet addresses in feedback
- Vote choices in plaintext
- User IP addresses

---

# 10. AI & Automation Design

## 10.1 Sentiment Analysis

**Input:** Feedback text (string)
**Output:**
```javascript
{
  sentiment: "positive" | "neutral" | "negative",
  score: number,        // -5 to +5
  comparative: number   // normalized score
}
```

**Implementation:** Sentiment.js (AFINN-based lexicon)

## 10.2 Automation Rules

| Trigger | Action | Enforcement |
|---------|--------|-------------|
| Attendance threshold met | Enable certificate issuance | Backend check |
| Election end time reached | Close voting | Contract timestamp |
| Feedback submitted | Run sentiment analysis | Backend async |

## 10.3 AI Limitations

- AI is **advisory only**
- AI failures do not block core functionality
- AI never modifies blockchain state
- AI operates on anonymized data

---

# 11. Security Model & Threat Analysis

## 11.1 Authentication

| Mechanism | Implementation |
|-----------|----------------|
| Password hashing | bcrypt (10 rounds) |
| Access tokens | JWT (15 min expiry) |
| Refresh tokens | JWT (7 day expiry) |

## 11.2 Authorization (RBAC)

```javascript
const roles = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['create_event', 'create_election', 'view_analytics'],
  FACULTY: ['mark_attendance', 'view_analytics'],
  STUDENT: ['vote', 'submit_feedback', 'view_certificates']
};
```

## 11.3 Threat Analysis

| Threat | Mitigation |
|--------|------------|
| SQL Injection | Sequelize parameterized queries |
| XSS | Helmet.js CSP headers |
| CSRF | CORS whitelist |
| Brute Force | Rate limiting (100/15min) |
| Replay Attack | Unique txn_id, timestamp checks |
| Duplicate Vote | Smart contract local state |
| Admin Manipulation | No admin override in contracts |
| De-anonymization | Salted one-way hashing |

## 11.4 Trust Assumptions

1. Algorand network is live and honest
2. PostgreSQL access is secured
3. Environment variables are not leaked
4. HTTPS is enforced in production

---

# 12. Testing & Validation Strategy

## 12.1 Test Categories

| Category | Tool | Coverage |
|----------|------|----------|
| Unit Tests | Jest | HashService, AIService |
| Integration Tests | Supertest | API endpoints |
| Contract Tests | PyTeal sandbox | Smart contracts |
| E2E Tests | Manual | Full flows |

## 12.2 Test Results Summary

```
PASS  src/tests/hash.service.test.js (7 tests)
PASS  src/tests/api.test.js (13 tests passing, 4 pending DB)
```

## 12.3 Invariant Verification

All 10 system invariants verified (see VALIDATION_REPORT.md)

---

# 13. Deployment & Environment Setup

## 13.1 Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis (optional for dev)
- Python 3.8+ (for contracts)

## 13.2 Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

## 13.3 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 13.4 Smart Contract Compilation

```bash
cd smart-contracts
pip install pyteal
python contracts/attendance.py    # → attendance_approval.teal
python contracts/voting.py        # → voting_approval.teal
python contracts/certification.py # → certification_approval.teal
```

## 13.5 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| JWT_SECRET | Yes | Access token signing key |
| DB_HOST | Yes | PostgreSQL host |
| DEPLOYER_MNEMONIC | No | Algorand wallet for deploys |
| HASH_SALT | Yes | Privacy hashing salt |

---

# 14. Demo & Verification Guide

## 14.1 Demo Flow

1. **Create Event** (Admin)
   - Login as admin
   - Create new event with time window

2. **Mark Attendance** (Student)
   - Login as student
   - Navigate to event
   - Mark attendance
   - Receive transaction ID

3. **Verify Attendance**
   - Visit: `https://testnet.algoexplorer.io/tx/{txnId}`
   - Confirm transaction details

4. **Issue Certificate**
   - Check eligibility
   - Issue certificate
   - Verify ASA on AlgoExplorer

## 14.2 Verification Endpoints

| What | Endpoint |
|------|----------|
| Attendance | GET /api/attendance/verify/:id |
| Certificate | GET /api/certificates/verify/:hash |
| Blockchain | https://testnet.algoexplorer.io |

---

# 15. Limitations & Future Improvements

## 15.1 Current Limitations

| Limitation | Reason | Mitigation |
|------------|--------|------------|
| TestNet only | Development phase | MainNet config ready |
| Mock blockchain in tests | No test node | Manual verification |
| Basic UI | Hackathon timeline | Functional over fancy |
| Single-tenant | Scope limitation | Architecture supports multi |

## 15.2 Future Roadmap

1. **Phase 2**: Zero-knowledge proofs for enhanced privacy
2. **Phase 3**: DAO governance for election parameters
3. **Phase 4**: Mobile app with biometric auth
4. **Phase 5**: Cross-campus federation

---

# 16. Glossary

| Term | Definition |
|------|------------|
| **ASA** | Algorand Standard Asset - NFT-like tokens on Algorand |
| **Commitment** | Cryptographic hash hiding the actual value |
| **Inner Transaction** | Transaction initiated by a smart contract |
| **Local State** | Per-user storage within a smart contract |
| **Global State** | Shared storage within a smart contract |
| **Opt-In** | User action to enable local state for an app |
| **RBAC** | Role-Based Access Control |
| **Salt** | Random data added to hash input for security |
| **TEAL** | Transaction Execution Approval Language (Algorand) |
| **PyTeal** | Python library for writing TEAL |

---

*Document Version: 1.0*
*Last Updated: February 2026*
*Author: CCMS Development Team*
