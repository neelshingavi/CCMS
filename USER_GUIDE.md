# USER GUIDE – Step-by-Step Usage Manual
## CCMS: AI-Powered Automated Campus Governance Protocol

Welcome to the **Centralized Campus Management System (CCMS)**. This platform allows you to participate in campus activities (attendance, voting, feedback) using **blockchain technology** to ensure fairness, transparency, and privacy.

This guide assumes **ZERO** prior knowledge of blockchain. We will walk you through every step.

---

## SECTION 1 – Getting Started

### 1. What This System Does
CCMS replaces manual campus records with **smart contracts**. Instead of trusting an administrator to count votes or mark attendance, the system uses code to:
- **Mark Attendance** verifybly (you can prove you were there).
- **Vote** without anyone knowing who you voted for (but proving you voted).
- **Earn Reputation** based on your real participation.
- **Get Certificates** as NFTs that cannot be faked.
- **Submit Feedback** analyzed by AI and anchored on-chain for privacy.

### 2. What You Need Before Starting
To use CCMS, you need a "Digital Wallet". Think of this as your digital ID card and signature.

1.  **A Smartphone** (iOS or Android).
2.  **Pera Algo Wallet App** (Recommended).
3.  **TestNet ALGO** (Free "fake" money for testing).

### 3. How to Install & Create a Wallet
1.  Go to the App Store or Google Play Store.
2.  Search for **"Pera Algo Wallet"** and install it.
3.  Open the app and click **"Create New Account"**.
4.  **IMPORTANT:** It will show you a "Passphrase" (25 words). **Write these down on paper.** Do not lose them. This is the only way to recover your account.
5.  Verify the words as requested by the app.
6.  You now have an Algorand wallet address! (It looks like a long string of random letters/numbers, e.g., `H7X2...`).

### 4. How to Get TestNet ALGO (Free)
Since we are testing, we don't use real money. We use "TestNet ALGO" to pay for transaction fees (which are tiny, fraction of a penny).

1.  Copy your wallet address from the Pera app.
2.  Go to the **Algorand TestNet Dispenser** (search "Algorand Dispenser" online).
3.  Paste your address.
4.  Click **"Dispense"**.
5.  Check your phone. You should see `+5 ALGO` or similar appear instantly.

---

## SECTION 2 – Connecting Wallet

Now that you have the app and some funds, let's log in.

### Step-by-Step
1.  Open the CCMS Campus App in your web browser.
2.  Click the **"Connect Wallet"** button (usually top-right).
3.  A popup will appear listing wallets. Select **"Pera Wallet"**.
4.  A QR code will appear on your screen.
5.  Open your Pera Wallet phone app.
6.  Tap the yellow **"Scan"** button and scan the QR code.
7.  Tap **"Connect"** on your phone to approve.

> *Screenshot placeholder: Dashboard with "Connect Wallet" button highlighted.*

### What Happens Technically?
- **No Password Shared:** You safely logged in without typing a password. Your phone signed a cryptographic message saying "I own this account."
- **Session Started:** The app now knows your public address (your "ID card") but can never access your funds without your permission.

### Troubleshooting
- **Result:** "Connection Failed" or nothing happens?
- **Fix:** Refresh the page. Make sure your phone screen is on. Ensure you are on the "TestNet" network in your Pera Wallet settings (Settings -> Developer Settings -> Node Settings -> TestNet).

---

## SECTION 3 – Marking Attendance

Prove you attended a class or event.

### Step-by-Step
1.  Navigate to the **Attendance** card/section on the dashboard.
2.  You will see a list of active events (e.g., "CS101 Lecture").
3.  Click the **"Mark Attendance"** button.
4.  **Check your phone!** Pera Wallet will ask you to approve the transaction.
5.  Review the request and tap **"Confirm"** or **"Sign"**.
6.  Wait a few seconds. You will see a "Success!" message.

> *Screenshot placeholder: Attendance verification success modal.*

### What Happens in the Background?
1.  **Time Check:** The "Attendance Smart Contract" checks the current time. If you are too late (even by 1 second), it rejects the request.
2.  **Duplicate Check:** It checks if your wallet has already marked attendance for this Event ID.
3.  **On-Chain Record:** It writes a permanent record: `Wallet X attended Event Y`.
4.  **Reward:** The contract automatically sends **1 CCT** (Campus Credit Token) to your wallet as a reward.

### How to Verify?
- Copy your address and paste it into **Lora** (a TestNet explorer).
- Look for an "Application Call". You will see the event ID stored directly in the transaction note or logs.

---

## SECTION 4 – Voting in an Election

Participate in campus governance securely.

### Step-by-Step
1.  Go to the **Voting** section.
2.  Review the active proposals or elections (e.g., "Student Body President").
3.  Select your choice.
4.  Click **"Cast Vote"**.
5.  **Approve on your phone.** This ensures it's really you voting.

> *Screenshot placeholder: Voting interface with candidate options.*

### What Happens Technically?
- **Eligibility:** The smart contract ensures your wallet is allowed to vote (e.g., you hold a student token).
- **One-Person-One-Vote:** The contract records that "Wallet X voted in Election Y". If you try to vote again, the math will fail, and the transaction is rejected.
- **Privacy:** Your specific choice (e.g., "Candidate A") is recorded, but can be masked or hashed depending on the election privacy settings.
- **Reward:** You automatically receive **2 CCT** for participating.

### Warning
- **Double Voting:** If you try to click vote again, the wallet might open, but the transaction will fail with an error like "overspend" or "logic eval error". This is a feature, not a bug!

---

## SECTION 5 – Submitting Feedback (AI + Blockchain)

Submit anonymous feedback that is graded by AI and secured by blockchain.

### Step-by-Step
1.  Navigate to the **Feedback** section.
2.  Type your feedback (e.g., "The library hours are too short!").
3.  Click **"Submit"**.
4.  Approve the transaction on your phone.

### What Happens in the Background?
This is where **AI meets Blockchain**:
1.  **AI Analysis:** Your text is sent to our backend. An AI model analyzes the sentiment (Positive, Negative, Neutral) and gives it a score (0-100).
2.  **Privacy Hashing:** We create a "Hash" (SHA256) of your text. This is a unique digital fingerprint. We **do not** write your actual text to the blockchain.
3.  **Anchoring:** We send a transaction to the blockchain containing:
    - The **Hash** (Proof of what you said).
    - The **Sentiment Score** (Proof of how constructive it was).
4.  **Reputation Update:** Your on-chain reputation score updates automatically based on the quality of your feedback.

> *Screenshot placeholder: Feedback submission form.*

---

## SECTION 6 – Viewing Reputation Score

Your "Campus Credit Score" based on real participation.

### Step-by-Step
1.  Click your profile or the **"Reputation Dashboard"** card.
2.  A dashboard appears showing a composite score (0-1000).
3.  Breakdown:
    - **Attendance:** Points for showing up.
    - **Voting:** Points for governance participation.
    - **Feedback:** Points for constructive input.
    - **Certificates:** Points for verifying skills.

### Technical Explanation
- This score is **NOT** just in a database. It is calculated from data stored in the **Smart Contract's Local State**.
- This means you can take this reputation score to other apps! It is "portable reputation".

---

## SECTION 7 – Receiving NFT Certificate

Get a permanent, un-fakeable diploma or certificate.

### Step-by-Step
1.  Complete the requirements (e.g., attend 100% of classes).
2.  Go to the **Certificates** section.
3.  If eligible, the **"Issue Certificate"** button will be enabled.
4.  Click it and **Sign** the transaction.
5.  You will receive a notification: "Asset ID #12345 received".

### What Happened?
- The system minted an **Algorand Standard Asset (ASA)**.
- This is an **NFT** (Non-Fungible Token).
- It is sent specifically to your wallet. You now "own" this certificate.
- The metadata (image, description) is pinned to **IPFS** (Decentralized storage), so it can never go offline.

### Verification
- Open your Pera Wallet app.
- Go to the "NFTs" or "Collectibles" tab.
- You will see your certificate image right there!

---

## SECTION 8 – Campus Credit Token (CCT)

**CCT** is the currency of participation.

- **How to Earn:**
    - Mark Attendance: +1 CCT
    - Cast Vote: +2 CCT
    - Earn Certificate: +5 CCT
- **Where is it?** Look at your wallet balance. You will see "CCT" alongside your "ALGO".
- **Transfers:** You can send CCT to friends just like money. Click "Send", enter their address, and send.

---

## SECTION 9 – Staking (Governance)

Increase your voting power by locking tokens.

### Step-by-Step
1.  Go to the **DeFi / Staking** page.
2.  You will see your CCT balance.
3.  Enter an amount to stake (e.g., 50 CCT).
4.  Click **"Stake"** and approve.

### What Happens?
- Your CCT is moved from your wallet to the **Staking Smart Contract**.
- The contract updates your **Governance Weight**.
- If you stake enough, your votes in elections might count for **2x**.
- You can **"Withdraw"** your tokens at any time (unless a lock period is active).

---

## SECTION 10 – Verifying Everything On-Chain

Don't trust us? Verify it yourself.

1.  Go to **[Lora (TestNet Explorer)](https://lora.algokit.io/testnet)**.
2.  Search for **Your Wallet Address**.
3.  **Transactions tab:** See every attendance marking (App Call).
4.  **Assets tab:** See your CCT balance and NFT Certificates.
5.  **Local State tab:** See your raw Reputation points stored in the contract.

> *Screenshot placeholder: AlgoExplorer view showing transaction history.*

---

## SECTION 11 – Common Errors & Troubleshooting

| Error | Cause | Solution |
| :--- | :--- | :--- |
| **"User rejected transaction"** | You clicked "Cancel" on your phone or took too long. | Try again and click "Confirm" quickly. |
| **"Overspread / logic eval error"** | You are violating a rule (e.g., trying to vote twice, or attendance window closed). | Check if the event is still active. |
| **"Balance too low"** | You ran out of TestNet ALGO for gas fees. | Go back to the Dispenser and get more ALGO. |
| **"Asset not opted in"** | You cannot receive CCT or NFTs without "Opting In" (spam protection). | Click the "Opt-In" button in the app settings first. |
| **"Network Mismatch"** | Your wallet is on MainNet (Real money) but app is on TestNet. | Switch Pera Wallet settings to **TestNet**. |

---

## SECTION 12 – Developer Test Flow

If you are a developer or judge testing the system, follow this path:

1.  **Start Clean:** Use a fresh wallet address from Pera.
2.  **Fund:** Get ALGO from dispenser.
3.  **Connect:** Connect to localhost:5173.
4.  **Action 1 (Attendance):** Click "Mark Attendance". Verify +1 CCT received.
5.  **Action 2 (Vote):** Go to Vote, select option, submit. Verify +2 CCT received.
6.  **Action 3 (Feedback):** Submit text. Wait for AI analysis. Confirm transaction.
7.  **Action 4 (Reputation):** Open Dashboard. Check if score increased based on inputs.
8.  **Action 5 (Staking):** Stake the 3 CCT you just earned.
9.  **Verification:** Copy address to Explore and confirm all "Application Calls" were successful.

---

**Built for Hackspiration'26 | Track 2: AI & Automation in Blockchain**
