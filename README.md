# CCMS – Centralized Campus Management System

A privacy-first, blockchain-backed campus management platform that replaces trust-based campus workflows with cryptographic verification, automation, and transparent execution.

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│    Algorand     │
│  (React/Vite)   │     │  (Node/Express) │     │   Blockchain    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   PostgreSQL    │
                        │      Redis      │
                        └─────────────────┘
```

## ✨ Features

- **Blockchain-Based Attendance**: Tamper-proof, time-bound check-ins
- **Secure Voting**: One-wallet-one-vote with on-chain verification
- **Anonymous Feedback**: Privacy-preserving with AI sentiment analysis
- **Automated Certification**: NFT certificates issued upon completion

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL
- Redis
- Python 3.8+ (for smart contracts)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Smart Contract Compilation

```bash
cd smart-contracts
pip install pyteal
python contracts/attendance.py
python contracts/voting.py
python contracts/certification.py
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login (returns JWT)

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event (Admin)

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/my` - My attendance history
- `GET /api/attendance/verify/:id` - Public verification

### Voting
- `GET /api/voting` - List elections
- `POST /api/voting/create` - Create election (Admin)
- `POST /api/voting/vote` - Cast vote

### Feedback
- `POST /api/feedback/submit` - Submit anonymous feedback
- `GET /api/feedback/analytics/:eventId` - Aggregated analytics

### Certificates
- `GET /api/certificates/eligibility/:eventId` - Check eligibility
- `POST /api/certificates/issue` - Issue certificate
- `GET /api/certificates/verify/:hash` - Public verification

## 🔐 Security Model

1. **Blockchain = Source of Truth**: All critical actions anchored on-chain
2. **Privacy by Design**: Wallet addresses hashed before storage
3. **No Admin Override**: Smart contracts enforce rules immutably
4. **JWT Authentication**: Access + Refresh token rotation
5. **Rate Limiting**: 100 requests per 15 minutes per IP

## 🧪 Testing

```bash
cd backend
npm test
```

## 📋 Environment Variables

See `backend/.env.example` for full list.

Key variables:
- `JWT_SECRET` - JWT signing key
- `DEPLOYER_MNEMONIC` - Algorand wallet for contract deployment
- `HASH_SALT` - Salt for wallet anonymization

## 🔗 Smart Contracts

| Contract | Purpose | State |
|----------|---------|-------|
| Attendance | Time-bound check-ins | Global: event_id, times, total; Local: checked_in |
| Voting | Anonymous elections | Global: election_id, times, options; Local: has_voted, commitment |
| Certification | NFT certificates | Global: course_id, threshold, asset_id; Local: attended, issued |

## 📄 License

MIT

## 🤝 Contributing

PRs welcome. Please follow the architecture guidelines.
