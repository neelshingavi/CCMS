# 🎓 Centralized Campus Management System (CCMS)
# AI-Driven • Automated • Trust-Minimized Campus Governance on Algorand
# Hackspiration’26 Submission
# Track 2: AI & Automation in Blockchain

---------------------------------------------------------------------

SECTION 1: EXECUTIVE SUMMARY

The Centralized Campus Management System (CCMS) is a decentralized
application (dApp) built on the Algorand blockchain to modernize
campus governance systems through automation, transparency, and
cryptographic trust guarantees.

Traditional campus management systems rely on centralized databases
and manual verification processes. These systems introduce multiple
points of failure including manipulation, bias, lack of transparency,
privacy violations, and inefficiency.

CCMS replaces trust-based administrative processes with rule-based
smart contract enforcement.

By integrating blockchain automation with AI-powered processing,
CCMS provides a scalable governance infrastructure for campuses.

This project demonstrates how blockchain and AI together can solve
real-world institutional problems while remaining beginner-friendly
and practical.

---------------------------------------------------------------------

SECTION 2: CORE PROBLEMS IN TRADITIONAL CAMPUS SYSTEMS

1. Proxy attendance and manual marking.
2. Data manipulation in centralized databases.
3. Opaque student elections.
4. Fear of retaliation for honest feedback.
5. Fake or unverifiable academic certificates.
6. Low student engagement in governance.
7. No transparent audit trail.
8. No cryptographic proof of participation.
9. Lack of automation in rule enforcement.
10. Over-reliance on administrators for validation.

These problems exist because current systems require users to trust
central authorities without cryptographic verification.

---------------------------------------------------------------------

SECTION 3: PROJECT VISION

The vision of CCMS is to create a trust-minimized campus governance
ecosystem where:

- Attendance is cryptographically verified.
- Voting is tamper-proof and transparent.
- Feedback is anonymous yet verifiable.
- Certificates are globally verifiable NFTs.
- Participation is rewarded automatically.
- Reputation is calculated on-chain.
- Rules are enforced by code, not humans.

CCMS acts as a blueprint for decentralized institutional governance.

---------------------------------------------------------------------

SECTION 4: ALIGNMENT WITH TRACK 2
AI & AUTOMATION IN BLOCKCHAIN

CCMS demonstrates:

- Automated smart contract enforcement.
- Time-bound participation logic.
- AI sentiment analysis anchored on-chain.
- Privacy-preserving cryptographic hashing.
- Decentralized wallet-based identity.
- Transparent and verifiable governance.
- Incentive-driven participation models.

AI provides intelligence.
Blockchain guarantees integrity.
Smart contracts enforce rules automatically.

---------------------------------------------------------------------

SECTION 5: SYSTEM ARCHITECTURE OVERVIEW

User Wallet (Pera / Defly)
        ↓
Frontend (React + Tailwind CSS)
        ↓
Backend (Node.js + AI Engine)
        ↓
Algorand Smart Contracts
        ↓
Immutable Blockchain State

The backend never controls user private keys.
Users sign all transactions directly.

---------------------------------------------------------------------

SECTION 6: MODULE 1 – TRUSTLESS ATTENDANCE SYSTEM

Problem:
Manual attendance allows proxy marking and data tampering.

Solution:
Time-bound smart contract-based check-in.

Workflow:

1. Admin creates attendance session.
2. Start and end timestamps are stored.
3. Student connects wallet.
4. Student submits attendance transaction.
5. Smart contract verifies:
   - Current blockchain time
   - Valid attendance window
   - No duplicate check-in
6. Attendance recorded in local state.
7. Reputation updated.
8. Optional CCT tokens distributed.

Security Features:

- Immutable attendance records.
- No duplicate marking.
- No backdated entries.
- No admin override.
- Blockchain timestamp prevents manipulation.

Benefits:

- 100% verifiable proof-of-presence.
- Transparent participation logs.
- Automated validation.

---------------------------------------------------------------------

SECTION 7: MODULE 2 – SECURE VOTING SYSTEM

Problem:
Elections lack transparency and trust.

Solution:
Wallet-based smart contract-governed voting.

Voting Rules:

- One wallet = one vote.
- Enforced start and end timestamps.
- Invalid options rejected.
- Double voting prevented.
- On-chain vote tallying.

Optional Privacy Layer:

- Vote stored as SHA256(option + salt).
- Commitment scheme protects identity.

Security Guarantees:

- No admin can modify results.
- Votes permanently stored.
- Fully auditable.
- Transparent counting logic.

Benefits:

- Trustless elections.
- Fair participation.
- Cryptographic verification.

---------------------------------------------------------------------

SECTION 8: MODULE 3 – AI-POWERED FEEDBACK SYSTEM

Problem:
Students fear retaliation.

Solution:
AI sentiment analysis + blockchain anchoring.

Process:

1. Student submits feedback.
2. Backend runs AI sentiment model.
3. Sentiment score generated.
4. SHA-256 hash of feedback created.
5. Only hash + score stored on-chain.
6. Reputation updated accordingly.

Privacy:

- No plaintext stored publicly.
- Anonymous participation.
- Verifiable integrity via hashing.

Benefits:

- Honest input.
- Actionable insights.
- Privacy preservation.

---------------------------------------------------------------------

SECTION 9: MODULE 4 – NFT CERTIFICATION SYSTEM

Problem:
Certificates can be forged.

Solution:
Mint academic credentials as NFTs.

Process:

1. Eligibility verified.
2. ARC-3 NFT minted.
3. Metadata stored on IPFS.
4. NFT sent to student wallet.

Verification:

- Public blockchain search.
- Asset ID verification.
- Instant authenticity proof.

Benefits:

- Tamper-proof credentials.
- Global verification.
- No manual validation required.

---------------------------------------------------------------------

SECTION 10: MODULE 5 – REPUTATION & CAMPUS CREDIT TOKEN (CCT)

Problem:
Low student engagement.

Solution:
On-chain reputation + token rewards.

Reputation Factors:

- Attendance participation.
- Voting participation.
- Feedback submission.
- Certification achievements.

Campus Credit Token:

- Custom Algorand Standard Asset.
- Earned through participation.
- Can influence governance weight.
- Encourages civic engagement.

Benefits:

- Gamified governance.
- Merit-based recognition.
- Transparent scoring.

---------------------------------------------------------------------

SECTION 11: FRONTEND ARCHITECTURE

Framework:
React 18 + Vite

Language:
TypeScript

Styling:
Tailwind CSS (Dark Mode UI)

Wallet Integration:
@txnlab/use-wallet-react

Key Components:

- Attendance.tsx
- Voting.tsx
- Feedback.tsx
- ReputationDashboard.tsx
- Certification.tsx

Features:

- Modular structure.
- Clean UI.
- Real-time blockchain updates.
- Atomic transaction grouping.

---------------------------------------------------------------------

SECTION 12: BACKEND ARCHITECTURE

Runtime:
Node.js + Express

Database:
SQLite (Development)
PostgreSQL (Production)

Responsibilities:

- AI sentiment processing.
- Indexing blockchain state.
- Orchestrating workflows.
- No custody of private keys.

Security:

- No seed phrase storage.
- No transaction signing server-side.

---------------------------------------------------------------------

SECTION 13: SMART CONTRACT ARCHITECTURE

Language:
PyTeal compiled to TEAL.

Contracts:

- attendance_approval.teal
- voting_approval.teal
- reputation_approval.teal

Key Features:

- Time-window enforcement.
- Local & global state management.
- One-wallet-one-action logic.
- Immutable rule enforcement.

---------------------------------------------------------------------

SECTION 14: TECHNOLOGY STACK

Blockchain: Algorand TestNet
Smart Contracts: PyTeal / TEAL
Frontend: React + TypeScript
Styling: Tailwind CSS
Backend: Node.js + Express
Database: PostgreSQL
Wallet: Pera Wallet / Defly
Indexer: AlgoExplorer / Pera Indexer

---------------------------------------------------------------------

SECTION 15: SECURITY PRINCIPLES

1. Non-custodial authentication.
2. Immutable on-chain records.
3. Hash-based privacy protection.
4. Time-bound automation.
5. No centralized override.
6. Transparent smart contract logic.
7. Cryptographic participation proof.

---------------------------------------------------------------------

SECTION 16: QUICK START GUIDE

Backend Setup:

cd backend
npm install
cp .env.example .env
npm run dev

Frontend Setup:

cd frontend
npm install
cp .env.example .env
npm run dev

Wallet Setup:

- Install Pera Wallet.
- Switch to TestNet.
- Obtain TestNet ALGO from faucet.
- Connect wallet in application.

---------------------------------------------------------------------

SECTION 17: REAL-WORLD APPLICATIONS

CCMS model can be extended to:

- Universities
- DAOs
- Corporate governance
- Community voting
- Public consultation systems
- Digital certification platforms

---------------------------------------------------------------------

SECTION 18: ROADMAP

Phase 1: Hackathon MVP.
Phase 2: MainNet deployment.
Phase 3: DAO governance layer.
Phase 4: NFC-based attendance.
Phase 5: Cross-campus identity system.

---------------------------------------------------------------------

SECTION 19: IMPACT

CCMS proves that institutional governance can be:

- Automated.
- Transparent.
- Verifiable.
- Privacy-preserving.
- Incentivized.
- AI-enhanced.
- Decentralized.

---------------------------------------------------------------------

SECTION 20: CONCLUSION

The Centralized Campus Management System (CCMS) represents a
future-ready governance model powered by blockchain automation
and AI intelligence.

By removing blind trust and replacing it with verifiable code,
CCMS transforms campus systems into secure, transparent, and
participatory ecosystems.

Built for Hackspiration’26.
Track 2: AI & Automation in Blockchain.

© 2026 CCMS Team
