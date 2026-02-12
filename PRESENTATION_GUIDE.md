# CCMS — Hackspiration'26 Presentation Guide
## Track 2: AI and Automation in Blockchain

> **Positioning:** An AI-Driven, Privacy-Preserving, Automated Campus Governance Protocol on Algorand

---

## Design Specs (Apply to All Slides)

- **Theme:** Dark gradient (`#0a0f1e` → `#111827`) with cyan/teal accents (`#06b6d4`, `#2dd4bf`)
- **Font:** Inter or Outfit (headings), IBM Plex Sans (body)
- **Icons:** Use Lucide or Heroicons-style line icons — AI brain, shield, vote, chain link, star, certificate
- **Layout:** Max 6 bullet points per slide. No paragraphs. Generous whitespace.
- **Accent color for AI elements:** Purple/violet (`#8b5cf6`)
- **Accent color for Blockchain elements:** Cyan/teal (`#06b6d4`)
- **Accent color for Privacy elements:** Emerald (`#10b981`)

---

## SLIDE 1 — Title Slide

### Content

**Title:**
> AI-Powered Automated Campus Governance on Algorand

**Subtitle:**
> Trustless, Transparent, and Privacy-Preserving Campus Coordination

**Bottom bar (small text):**
- Hackspiration'26 · Track 2: AI & Automation in Blockchain
- Team Name: [YOUR TEAM NAME]
- Built on Algorand

### Visual Elements
- Algorand logo (bottom-right)
- Subtle animated node graph or blockchain mesh background
- Hackspiration'26 badge (top-left)
- A single glowing shield icon with an AI brain inside it (center-left)

### Key Phrase to Emphasize
> "We automate trust for campus systems — no admin override, no data tampering, no blind faith."

### Judge-Impact Statement
> *"What if every campus record was cryptographically verifiable and every rule was enforced by code, not people?"*

---

## SLIDE 2 — The Problem

### Content

**Title:** The Trust Problem in Campus Systems

**Bullet Points:**
- ❌ Attendance is manual — easily faked or proxy-marked
- ❌ Elections are centrally controlled — results can be manipulated
- ❌ Certificates are PDFs — trivially forged
- ❌ Feedback is stored in admin databases — can be deleted or altered
- ❌ No cryptographic proof of anything
- ❌ Students must blindly trust administrators

**Bottom callout box:**
> 💡 Core issue: **Zero verifiability.** Students participate but cannot prove or verify outcomes.

### Visual Elements
- Left side: Illustration of a traditional campus admin desk with paper files
- Right side: Red "X" marks on each problem area
- Optional: A broken lock icon representing lost trust

### Key Phrase to Emphasize
> "Today, every campus record exists because someone typed it into a database — not because it's provably true."

### Judge-Impact Statement
> *"In 2026, campus systems still run on trust. We replaced trust with math."*

---

## SLIDE 3 — Why Blockchain? Why Algorand?

### Content

**Title:** Why Blockchain Solves This

**Left Column — What Blockchain Provides:**
- 🔗 Immutable records — once written, never altered
- 🔍 Transparent participation — anyone can verify
- ⚙️ Automated rule enforcement via smart contracts
- 🚫 No admin override — code is law
- ✅ Cryptographic proof of every action

**Right Column — Why Algorand Specifically:**
- ⚡ ~3.3s finality — instant confirmation
- 💰 < $0.001 per transaction — practically free
- 🛡️ Pure Proof-of-Stake — no energy waste
- 🌱 Carbon-negative blockchain
- 🐍 Puya Python — write contracts in Python
- 🧰 AlgoKit — full developer toolkit

### Visual Elements
- Split layout: generic blockchain benefits (left) vs Algorand-specific (right)
- Algorand logo prominently on right half
- Small comparison row: Ethereum gas fees vs Algorand fees

### Key Phrase to Emphasize
> "Algorand gives us finality in 3 seconds, transactions for fractions of a cent, and smart contracts written in Python."

### Judge-Impact Statement
> *"We chose Algorand because campus systems need speed, affordability, and simplicity — not gas fee anxiety."*

---

## SLIDE 4 — Our Solution Overview

### Content

**Title:** CCMS — What We Built

**Tagline:**
> A decentralized automation layer for campus governance

**Six pillars (as icon cards):**

| 🕐 Attendance | 🗳️ Voting | 🏆 Certificates |
|:---:|:---:|:---:|
| On-chain, time-bound check-ins | One-wallet-one-vote elections | Automated NFT issuance |

| 🤖 AI Feedback | ⭐ Reputation | 💰 Incentives |
|:---:|:---:|:---:|
| Sentiment scoring anchored on-chain | Weighted composite score | Campus Credit Token (CCT) |

**Bottom callout:**
> ⚠️ This is NOT just "data on blockchain." Every rule is enforced by smart contract logic — attendance windows, vote eligibility, certificate thresholds, reputation weights.

### Visual Elements
- 6 cards in a 3×2 grid, each with an icon + short description
- Connecting lines between cards showing data flow
- Subtle glow on "AI Feedback → Reputation → Incentives" path

### Key Phrase to Emphasize
> "We don't just store data on-chain — we enforce rules on-chain. Smart contracts are the administrators."

### Judge-Impact Statement
> *"Six campus workflows, fully automated, zero admin override, all on Algorand."*

---

## SLIDE 5 — Architecture Diagram

### Content

**Title:** System Architecture

**Diagram (top to bottom flow):**

```
┌────────────────────┐
│   👤 Student/User  │
└────────┬───────────┘
         ▼
┌────────────────────┐
│  Frontend (React)  │ ← Wallet connection (Pera/Defly/Lute)
│  Vite + TailwindCSS│
└────────┬───────────┘
         ▼
┌────────────────────┐
│  Backend (Express) │ ← JWT Auth, Rate Limiting
│  AI Sentiment      │ ← NLP Processing
│  Hash Service      │ ← Privacy Layer
└────────┬───────────┘
         ▼
┌─────────────────────────────────────────┐
│         ALGORAND BLOCKCHAIN             │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │Attendance│ │ Voting   │ │ Cert    │ │
│  │Contract  │ │ Contract │ │ (ASA)   │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │Reputation│ │ Staking  │ │  CCT    │ │
│  │Contract  │ │ Contract │ │ (ASA)   │ │
│  └──────────┘ └──────────┘ └─────────┘ │
└─────────────────────────────────────────┘
```

**Three-layer explanation:**
- **Layer 1 — Interface:** React app with wallet integration
- **Layer 2 — Intelligence:** Node.js backend with AI + privacy hashing
- **Layer 3 — Trust:** Smart contracts enforcing all rules immutably

### Visual Elements
- Clean 3-tier architecture diagram (not a messy flowchart)
- Color code each layer: Blue (frontend), Purple (backend/AI), Cyan (blockchain)
- Arrows showing data flow direction
- Small labels on each smart contract box

### Key Phrase to Emphasize
> "The frontend is the face, the backend is the brain, and the blockchain is the source of truth."

### Judge-Impact Statement
> *"Three layers, one principle: critical logic lives on-chain where no one can tamper with it."*

---

## SLIDE 6 — AI + Blockchain Integration (Track 2 Core)

### Content

**Title:** Where AI Meets Blockchain

**Left side — AI provides intelligence:**
- 🧠 NLP sentiment analysis on feedback text
- 📊 Converts subjective text → objective score (0–100)
- 🔄 Automated, consistent, bias-free evaluation
- 🎯 Feeds into on-chain reputation calculation

**Right side — Blockchain provides trust:**
- 🔒 SHA256 hash of feedback anchored immutably
- 📈 Scaled sentiment score stored as on-chain state
- 🚫 Score cannot be edited or deleted after anchoring
- ✅ Anyone can verify the score exists on-chain

**Center connection:**
> AI generates the score → Blockchain makes it permanent

**Bottom callout:**
> 🔐 **Privacy guarantee:** Full feedback text is NEVER stored on-chain. Only the cryptographic hash + numeric score are anchored. AI processes text, blockchain stores proof.

### Visual Elements
- Split layout with a bridge/connection in the middle
- AI brain icon (purple) on left, blockchain lock icon (cyan) on right
- An arrow labeled "SHA256 + Score" connecting them
- Small shield icon at the bottom for privacy

### Key Phrase to Emphasize
> "AI turns subjective feedback into objective scores. Blockchain makes those scores tamper-proof. Neither can do this alone."

### Judge-Impact Statement
> *"This is AI and blockchain working together — not AI on a blockchain, but AI validated BY blockchain."*

---

## SLIDE 7 — Automation via Smart Contracts

### Content

**Title:** Rule Enforcement Without Administrators

**Automated workflows (show as a pipeline):**

| Step | What the Smart Contract Enforces |
|------|----------------------------------|
| 📋 Attendance | Only valid during configured time window — no late submissions |
| 🗳️ Voting | One wallet can vote exactly once — enforced at protocol level |
| 🏆 Certificate | Automatically issued when attendance threshold is met |
| ⭐ Reputation | Score updated atomically after each verified action |
| ⚖️ Governance | Vote weight calculated from staked balance — 2x at threshold |

**Key distinction:**
> 🔴 Traditional: Admin decides → Admin executes → We hope admin is honest
> 🟢 CCMS: Rules are coded → Contract executes → Outcome is verifiable

### Visual Elements
- Pipeline/flow visualization showing each automated step
- Green checkmarks for smart contract-enforced steps
- Red "manual/trust-based" vs Green "automated/verifiable" comparison
- Small Puya Python code snippet showing one rule (optional)

### Key Phrase to Emphasize
> "No administrator can override a smart contract. The rules execute exactly as written, every time."

### Judge-Impact Statement
> *"Five campus workflows automated. Zero human gatekeepers. One hundred percent verifiable."*

---

## SLIDE 8 — Privacy Preservation

### Content

**Title:** Privacy + Transparency — Not a Tradeoff

**How we protect privacy:**
- 🪪 **Wallet-based identity** — no names, emails, or student IDs on-chain
- 🔑 **Wallet address hashing** — even wallet addresses are hashed before off-chain storage
- 📝 **Feedback hashing** — only SHA256 hash goes on-chain, never the text
- 🔢 **Numeric-only scoring** — sentiment stored as 0–100 integer
- 🛡️ **No personal data anywhere on the blockchain**

**How we maintain transparency:**
- ✅ Attendance records are publicly verifiable
- ✅ Vote counts are transparent (individual votes are anonymous)
- ✅ Certificate validity can be checked by anyone
- ✅ Reputation scores are readable on-chain

**Bottom callout:**
> 💡 You can VERIFY that someone participated without knowing WHO they are.

### Visual Elements
- Two-column layout: Shield icon (privacy) | Eye icon (transparency)
- A data flow showing: "John Smith" → SHA256 → `0x7f3a...` on-chain
- Green lock icons on private elements, open eye icons on transparent elements

### Key Phrase to Emphasize
> "We prove participation without revealing identity. That's privacy and transparency working together."

### Judge-Impact Statement
> *"Every record is verifiable. No record reveals who you are. Privacy and transparency coexist on Algorand."*

---

## SLIDE 9 — Fair Participation & Governance

### Content

**Title:** Automated Fairness

**How fairness is enforced:**
- 🗳️ **One wallet = one vote** — protocol-level enforcement, not policy
- ⭐ **Reputation from real actions** — attendance, voting, feedback, certificates
- 💰 **CCT rewards for participation** — 1 CCT (attendance), 2 CCT (vote), 5 CCT (certificate)
- ⚖️ **Governance weight from staking** — stake CCT → 2x vote influence
- 📊 **Weighted composite scoring** — 30% attendance, 25% voting, 20% feedback, 25% certification

**Bottom callout:**
> 🎯 **Key insight:** You earn influence by participating, not by being appointed. This is meritocratic governance.

### Visual Elements
- A scoring breakdown pie chart or bar graph
- CCT token icon with reward amounts
- Scale/balance icon showing fair governance
- Arrow path: Participate → Earn CCT → Stake → Governance Weight

### Key Phrase to Emphasize
> "Influence is earned through participation — attendance, voting, feedback, certification — not handed out by administrators."

### Judge-Impact Statement
> *"Automated meritocracy: participate more, influence more. No backdoor, no favoritism, no exceptions."*

---

## SLIDE 10 — Beginner-Friendly Design

### Content

**Title:** Built for Real Students, Not Crypto Experts

**Simplicity features:**
- 🔗 One-click wallet connection (Pera, Defly, Lute)
- 📱 Clean, responsive React UI
- ⚡ Backend handles all blockchain complexity
- 🧾 Zero knowledge of smart contracts needed to participate
- 🌐 Works on Algorand TestNet — no real funds needed
- 🧰 Built with AlgoKit — Algorand's official developer framework

**User experience flow:**
> Connect wallet → Click buttons → Everything else is automated

**Bottom callout:**
> 💡 Students interact with a normal web app. Blockchain verification happens silently in the background.

### Visual Elements
- Screenshots of the actual UI (Home page with cards)
- Highlight the "Connect Wallet" button
- Show the Reputation Dashboard modal
- Before/After: "Complex blockchain UI" vs "Our clean interface"

### Key Phrase to Emphasize
> "Students don't need to understand blockchain. They connect a wallet and click buttons — the smart contracts handle the rest."

### Judge-Impact Statement
> *"Blockchain adoption fails when it's complex. We made it invisible."*

---

## SLIDE 11 — Live Demo Flow

### Content

**Title:** Live Demonstration

**Step-by-step flow (numbered):**

1. **🔗 Connect Wallet** — Link Pera/Defly wallet
2. **📋 Mark Attendance** — Checked-in on-chain → +1 CCT earned → +1 reputation
3. **🗳️ Cast Vote** — One-wallet-one-vote → +2 CCT → +1 reputation
4. **💬 Submit Feedback** — AI analyzes → SHA256 hash + score anchored on-chain
5. **⭐ View Reputation Dashboard** — Composite score + CCT balance + governance weight
6. **🏆 Receive NFT Certificate** — Automated issuance → +5 CCT → +1 reputation
7. **🔍 Verify On-Chain** — Show transaction on Algorand explorer

### Visual Elements
- Numbered circular steps connected by arrows
- Each step has an icon on the left
- Highlight the "verify on-chain" step with a blockchain explorer screenshot
- Show the flow as a horizontal timeline

### Presenter Notes
> Demo should take ~2 minutes. Have wallet pre-funded on TestNet. Pre-create an event so attendance marking works immediately. Show the Algorand explorer at the end to prove on-chain verification.

### Key Phrase to Emphasize
> "Let me show you — every action you just saw is now permanently recorded on the Algorand blockchain."

### Judge-Impact Statement
> *"Seven actions, all automated, all verifiable, all in under two minutes."*

---

## SLIDE 12 — Why This Matters

### Content

**Title:** Beyond a Campus Tool — A Governance Blueprint

**This is a blueprint for:**
- 🏛️ **DAO-style governance** — community-driven decisions
- 🏢 **Transparent institutions** — government, corporate, NGO
- 🤝 **Trustless coordination** — participants don't need to trust each other
- 🤖 **AI-governed systems** — objective evaluation at scale

**Scale potential:**
> Start with one campus → Scale to a university system → Extend to multi-institution credentialing

**Bottom callout:**
> 💡 The same architecture that automates campus governance can automate ANY governance system that needs fairness, transparency, and privacy.

### Visual Elements
- Expanding circles: Campus → University → Multi-Institution → DAO
- Each circle has icons representing the governance type
- Subtle connecting lines showing scalability

### Key Phrase to Emphasize
> "We built this for a campus — but the architecture is a blueprint for any system where trust, fairness, and privacy matter."

### Judge-Impact Statement
> *"Today it's campus governance. Tomorrow it's how transparent institutions operate."*

---

## SLIDE 13 — Track 2 Alignment Map

### Content

**Title:** Perfect Alignment with Track 2: AI & Automation in Blockchain

**Explicit mapping table:**

| Track 2 Requirement | CCMS Implementation |
|---------------------|---------------------|
| **AI** | NLP sentiment analysis on feedback → automated 0–100 scoring |
| **Automation** | Smart contracts enforce attendance, voting, certification, reputation rules |
| **Blockchain** | All critical state anchored on Algorand — single source of truth |
| **Privacy** | SHA256 hashing, wallet-based identity, no personal data on-chain |
| **Transparency** | Every record verifiable via Algorand explorer |
| **Trust Minimization** | No admin override — code enforces all rules |

**Bottom callout:**
> ✅ Every core requirement of Track 2 is directly implemented — not adapted, not stretched. Built for this track.

### Visual Elements
- Clean two-column table with checkmarks
- Color coding: Purple for AI, Cyan for Blockchain, Green for Privacy
- A "Track 2" badge prominently displayed
- Connecting lines from each requirement to the CCMS module that fulfills it

### Key Phrase to Emphasize
> "AI provides intelligence. Smart contracts provide automation. Algorand provides trust. Privacy is built into every layer."

### Judge-Impact Statement
> *"This project was engineered end-to-end for Track 2 — AI, automation, blockchain, privacy, transparency. All six."*

---

## SLIDE 14 — Future Scope

### Content

**Title:** What Comes Next

**Realistic roadmap (short-term):**
- 📜 **On-chain academic transcripts** — verifiable degree records as NFTs
- 🌐 **Cross-campus identity** — portable reputation across institutions
- 🏛️ **Full DAO governance** — student-run campus decisions
- 💳 **Decentralized student credit** — CCT as micro-economy token

**Longer-term vision:**
- 🔗 Multi-chain bridge for cross-ecosystem credentials
- 🤖 AI-generated governance proposals from sentiment trends
- 📊 Predictive analytics for student engagement

**Bottom callout:**
> 💡 Built modular — every future feature extends, nothing replaces.

### Visual Elements
- Timeline/roadmap visual (Q1/Q2/Q3 style)
- Each milestone has an icon
- Dotted lines for longer-term items
- "MVP" label on current state, "V2" on near-term, "Vision" on far-term

### Key Phrase to Emphasize
> "Everything we showed today is deployed and working. Everything here is architecturally possible because we built it modular from day one."

### Judge-Impact Statement
> *"The foundation is built. The roadmap is realistic. Every extension uses the same pattern — new contracts, same architecture."*

---

## SLIDE 15 — Conclusion

### Content

**Title:** What We've Built

**Summary (large text, one line each):**

> ✅ **Trustless** — Smart contracts replace administrators
> ✅ **Automated** — Rules execute without human intervention
> ✅ **Transparent** — Every record verifiable on-chain
> ✅ **Private** — No personal data exposed
> ✅ **AI-Enhanced** — Objective, bias-free evaluation
> ✅ **Built on Algorand** — Fast, cheap, sustainable

**Final statement (centered, large):**

> We didn't just put campus data on a blockchain.
> We built a governance protocol that runs itself.

**Bottom:**
- GitHub: [repo link]
- Demo: [TestNet URL]
- Team: [Team Name]
- Hackspiration'26 · Track 2

### Visual Elements
- Clean, impactful layout with generous spacing
- Each line has a colored checkmark
- Algorand logo at bottom
- Team photo or avatars (optional)
- QR code linking to demo/repo

### Key Phrase to Emphasize
> "We transformed campus workflows from trust-based to trustless, from manual to automated, from opaque to transparent — all powered by AI and Algorand."

### Judge-Impact Statement
> *"Campus governance, fully automated, privacy-preserving, AI-powered, and running on Algorand right now."*

---

---

## 🎤 3-MINUTE PITCH SCRIPT

*(Exactly what to say — practice this)*

---

**[00:00 – 00:20] — Hook**

"Raise your hand if you've ever had attendance marked by a friend. Or wondered if a campus election was actually fair. Or received a certificate that anyone could have printed.

Campus systems today run on trust. There's no cryptographic proof, no verification, no transparency. We fixed that."

**[00:20 – 00:50] — What We Built**

"CCMS is an AI-powered, automated campus governance protocol built on Algorand. We take six core campus workflows — attendance, voting, feedback, certificates, reputation, and governance credit — and we enforce every rule through smart contracts.

Attendance is time-bound and anchored on-chain. Voting is one-wallet-one-vote at the protocol level. Certificates are NFTs issued automatically when you meet the threshold. And feedback goes through AI sentiment analysis — the hash and score are anchored immutably on Algorand."

**[00:50 – 01:30] — How AI + Blockchain Work Together**

"Here's where it gets interesting for Track 2. Our AI layer analyzes feedback text using NLP sentiment scoring, converting subjective opinions into an objective 0-to-100 score. That score, along with a SHA256 hash of the original text, is permanently anchored on the Algorand blockchain.

The AI provides intelligence. The blockchain provides trust. Neither can do this alone — AI without blockchain is manipulable, and blockchain without AI is just storage.

And privacy is built in. The full text never touches the blockchain. Only the hash and the numeric score are stored. You can verify that a score exists without ever seeing the original feedback."

**[01:30 – 02:10] — Automation & Fairness**

"Every rule in our system is enforced by smart contracts. No administrator can override the attendance window. No one can vote twice. No one can fake a certificate. And reputation scores are calculated on-chain from four pillars — attendance, voting, feedback sentiment, and certification — with configurable weights.

We also created a Campus Credit Token — a fungible ASA on Algorand. You earn CCT by participating: 1 for attendance, 2 for voting, 5 for earning a certificate. Stake your CCT and your governance vote counts double. This is meritocratic participation — your influence is proportional to your engagement."

**[02:10 – 02:45] — Why It Matters**

"This isn't just a campus tool. It's a blueprint for any system that needs trust, fairness, and privacy. The same architecture that automates campus governance could power DAO voting, corporate compliance, or institutional credentialing.

We built it with AlgoKit, it runs on TestNet, and it's fully functional right now. Students connect a wallet and click buttons — they don't need to understand blockchain. The smart contracts handle everything silently."

**[02:45 – 03:00] — Close**

"We didn't just put campus data on a blockchain. We built a governance protocol that runs itself — trustless, automated, transparent, private, and AI-enhanced. All on Algorand. Thank you."

---

---

## 🎤 5-MINUTE DETAILED PITCH SCRIPT

*(For longer presentation slot or Q&A prep)*

---

**[00:00 – 00:30] — Hook & Problem**

"Every campus system today has the same fundamental flaw: trust. Attendance is marked manually — proxy attendance is trivial. Elections are controlled by whoever counts the votes. Certificates are PDFs that anyone with Photoshop can forge. And feedback? It sits in an admin database that can be edited, deleted, or ignored.

Students participate in these systems but have zero ability to verify outcomes. They trust, because they have no alternative. We built the alternative."

**[00:30 – 01:15] — Solution Overview**

"CCMS is a fully automated campus governance protocol running on the Algorand blockchain. We handle six campus workflows end-to-end:

First, attendance. Check-ins are anchored on-chain within configured time windows. You can't mark attendance after the window closes — the smart contract rejects it.

Second, voting. One wallet gets exactly one vote. This is enforced at the contract level — not by policy, not by an admin checking a spreadsheet, but by code that literally cannot be overridden.

Third, certificates. When your attendance count meets the threshold, an NFT certificate is issued automatically — an ARC-standard asset on Algorand that is verifiable by anyone.

Fourth, feedback. This is where AI enters the picture.

Fifth, reputation. An on-chain composite score calculated from four pillars.

And sixth, incentives. A Campus Credit Token with staking-based governance."

**[01:15 – 02:15] — AI + Blockchain Deep Dive (Track 2 Core)**

"Let me zoom into the AI integration, because this is the heart of our Track 2 alignment.

When a student submits feedback, our backend runs NLP sentiment analysis on the text. We use a natural language processing library to generate a sentiment score, which we then normalize to a 0-to-100 integer scale.

Here's what happens next — and this is the key innovation:

We take the SHA256 hash of the original feedback text and the normalized sentiment score, and we anchor BOTH on the Algorand blockchain through our reputation smart contract. The hash proves that specific feedback existed. The score proves what the AI evaluated it as. And because it's on Algorand, neither can ever be changed.

But here's the privacy guarantee: the full text of the feedback is NEVER stored on-chain. Only the hash and the number. So you can verify that a score exists and that it hasn't been tampered with — without ever seeing the original feedback. That's privacy and transparency working together, powered by AI and blockchain.

The sentiment score then feeds into the student's on-chain reputation. So feedback quality directly affects your composite score — all automated, all verifiable."

**[02:15 – 03:15] — Smart Contract Automation**

"Let me talk about automation, because this is what separates CCMS from just putting data on a blockchain.

We have six smart contracts, all written in Puya Python — Algorand's native Python smart contract language.

The attendance contract enforces time windows. If the event window hasn't started, the transaction fails. If it's expired, it fails. No exceptions, no admin override.

The voting contract tracks elected participation in local state. Try to vote twice? The contract rejects the transaction. One wallet, one vote — mathematically enforced.

The reputation contract maintains four pillar scores per user — attendance, voting, feedback, and certification — as local state. The composite score is calculated as a weighted sum: 30% attendance, 25% voting, 20% feedback, 25% certification. These weights are set once during initialization and cannot be changed.

The staking contract handles our DeFi layer. Deposit CCT tokens, and if your staked balance meets the threshold, your governance vote weight doubles. Withdraw anytime — no lock period.

Every one of these rules executes autonomously. No human approves attendance. No human counts votes. No human issues certificates. The smart contracts are the administrators."

**[03:15 – 04:00] — Privacy & Fairness**

"Privacy is not an afterthought — it's a design principle.

On-chain, we use wallet-based identity only. No names, no student IDs, no emails. Off-chain, we hash wallet addresses before storing them in PostgreSQL using SHA256 with a configurable salt. Feedback text is processed by AI and then only its hash goes on-chain.

This gives us a unique property: you can PROVE someone participated without knowing WHO they are. Attendance is verifiable but anonymous. Votes count but can't be traced back. Reputation is transparent but pseudonymous.

And fairness is automated. CCT rewards are distributed algorithmically — 1 for attendance, 2 for voting, 5 for certification. Governance weight comes from staking, not from appointment. This is meritocratic participation encoded in smart contract logic."

**[04:00 – 04:30] — Demo & Technical Stack**

"The entire system is functional and deployed on Algorand TestNet. Students connect with Pera or Defly wallet, interact with a clean React UI, and every critical action is verified on-chain.

Our stack: React with Vite and TailwindCSS on the frontend. Node.js and Express on the backend with PostgreSQL and Redis. Smart contracts in Puya Python managed by AlgoKit. All standard, all production-quality.

The demo flow is: connect wallet, mark attendance, cast a vote, submit feedback, view your reputation dashboard, and receive an NFT certificate. Every step is two clicks or less."

**[04:30 – 05:00] — Closing**

"Let me leave you with this.

CCMS isn't a proof of concept with mock data. It's six smart contracts, a complete backend, and a responsive frontend — all working together on Algorand TestNet right now.

More importantly, it's a blueprint. The same architecture that automates campus governance can scale to DAO voting, institutional transparency, and decentralized credentialing.

We aligned with Track 2 across every dimension: AI for intelligence, smart contracts for automation, Algorand for trust, hashing for privacy, and on-chain records for transparency.

We didn't build a tool. We built a protocol. Thank you."

---

---

## 📋 QUICK REFERENCE: JUDGE Q&A PREPARATION

| Likely Question | Prepared Answer |
|-----------------|-----------------|
| "How is this different from just storing data on blockchain?" | "We don't just store data — we enforce rules. Smart contracts reject invalid attendance, prevent double voting, and auto-issue certificates. The blockchain is the administrator, not just the database." |
| "What if the AI gives a wrong sentiment score?" | "The AI score is one input to a weighted reputation. Even if sentiment is imperfect, it's consistent, bias-free, and the hash provides an audit trail. No human judgment is more consistent." |
| "Can't students game the system?" | "Each wallet can only act once per event/election — enforced by the smart contract. You'd need separate funded wallets, which costs real ALGO. The economic barrier makes Sybil attacks impractical." |
| "Why not use Ethereum or Solana?" | "Algorand: 3.3s finality, sub-cent fees, Python contracts, carbon-negative. Campus systems need low cost, fast confirmation, and accessible dev tools. Algorand is the optimal fit." |
| "Is this actually deployed?" | "Yes — fully functional on Algorand TestNet. We can demo live right now. Six smart contracts, 12+ API endpoints, wallet integration, all working." |
| "What about scalability?" | "Algorand handles 10,000+ TPS. Campus use is orders of magnitude below that. The architecture is also modular — new contracts extend, nothing replaces." |
| "How do you handle the cold start problem?" | "AlgoKit bootstraps everything. Students just connect a wallet — no blockchain knowledge needed. The backend abstracts all complexity." |
| "What's the business model?" | "This is a protocol, not a product with a subscription. Potential: SaaS for universities, white-label governance, or DAO tooling. Transaction fees on Algorand are negligible." |

---

## 📊 SLIDE-BY-SLIDE SUMMARY CARD

| # | Slide | Core Message | Duration (3min) | Duration (5min) |
|---|-------|-------------|-----------------|-----------------|
| 1 | Title | Set the tone | 5s | 10s |
| 2 | Problem | Why this matters | 15s | 25s |
| 3 | Why Blockchain | Why Algorand | 15s | 20s |
| 4 | Solution | What we built | 20s | 30s |
| 5 | Architecture | How it works | 15s | 25s |
| 6 | AI + Blockchain | Track 2 core | 25s | 45s |
| 7 | Automation | Smart contracts | 20s | 40s |
| 8 | Privacy | Hash-based | 15s | 25s |
| 9 | Fairness | Meritocratic governance | 10s | 20s |
| 10 | Beginner-Friendly | UX simplicity | 10s | 15s |
| 11 | Demo | Live walkthrough | 15s | 25s |
| 12 | Why It Matters | Blueprint potential | 10s | 15s |
| 13 | Track 2 Map | Explicit alignment | 10s | 15s |
| 14 | Future Scope | Realistic roadmap | 10s | 15s |
| 15 | Conclusion | Final impact | 15s | 25s |
