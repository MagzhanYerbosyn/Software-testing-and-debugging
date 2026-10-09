# Documentation Pack: Money Transfer Feature

## 1. Test Plan (One-Page)

### 1.1 Scope
* **In-Scope:**
  * Single-transfer transaction amount validation (100 to 500,000 KZT, whole integers only).
  * Accumulation and reset of the cumulative daily transfer limit (1,000,000 KZT max, reset at 00:00:00 Almaty time).
  * Triggering and verification of the 6-digit SMS code for transfers exceeding 100,000 KZT.
  * SMS code lifecycle management: 120-second expiration timer and 3-attempt failure lock.
  * Conflict resolution rules (e.g., amount violation precedence over daily limit violation).
* **Out-of-Scope:**
  * Core banking backend ledger updates, interest rate processing, and external bank clearing house APIs.
  * Performance, stress, and load testing on SMS gateway infrastructure.
  * Multi-currency conversion or international wire transfers.

### 1.2 Approach
* **Test Design Techniques:** Equivalence Partitioning (EP), 2-Value & 3-Value Boundary Value Analysis (BVA), Decision Table Testing, and State Transition Testing.
* **Testing Levels:** API-level validation testing combined with UI component verification for error banner display and OTP inputs.

### 1.3 Entry & Exit Criteria
* **Entry Criteria:**
  * Requirements specification signed off and baseline deployed to the Staging environment.
  * Test accounts provisioned with mock balances (≥ 1,000,000 KZT) and configurable daily cumulative transfer totals.
  * Mock SMS Gateway service active and accessible via test hooks.
* **Exit Criteria:**
  * 100% execution of all 12 planned core test cases.
  * Zero Critical or High-severity defects open; all Medium/Low open defects documented with engineering workarounds.

### 1.4 Top Three Product Risks
1. **Financial Loss / Security Bypass:** Over-limit transfers processing without requiring 2FA due to incorrect boundary evaluation (`> 100,000` vs. `>= 100,000`).
2. **Race Condition / Double-Spend at Midnight Reset:** Transactions initiated around 00:00:00 Almaty time bypassing daily cumulative balance limits due to server/client timezone sync mismatches.
3. **SMS OTP Lockout Deadlock:** Users becoming permanently blocked from transferring due to unhandled expired states or failure of retry counters to reset across resends.

---

## 2. Full Test Cases (12 Format Test Cases)

| ID | Traces To | Preconditions | Inputs | Expected Result | Postconditions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TR-OTP-001** | REQ-1 (Valid Amount) | Logged In; Balance: 1,000,000 KZT; Daily Total: 0 KZT. | Transfer 10,000 KZT to same bank client. | No SMS prompt required. Transfer executes/pending confirmation. | Notification displayed; Balance: 990,000 KZT; Daily Total: 10,000 KZT. |
| **TR-OTP-002** | REQ-2 (Invalid Amount) | Logged In; Balance: 1,000,000 KZT; Daily Total: 0 KZT. | Transfer 90 KZT to own deposit. | Immediate rejection; error "Amount must be between 100 and 500,000 KZT". | Balance unchanged; Daily Total: 0 KZT. |
| **TR-OTP-003** | REQ-2 (Invalid Amount) | Logged In; Balance: 1,000,000 KZT; Daily Total: 0 KZT. | Transfer 500,001 KZT to own deposit. | Immediate rejection; error "Amount exceeds single limit of 500,000 KZT". | Balance unchanged; Daily Total: 0 KZT. |
| **TR-OTP-004** | REQ-3 (SMS Code Threshold) | Logged In; Balance: 1,000,000 KZT; Daily Total: 0 KZT. | Transfer 300,000 KZT to own deposit. | Transfer paused; 6-digit SMS verification screen displayed. | Pending SMS confirmation state; Balance unchanged until OTP entry. |
| **TR-OTP-005** | REQ-4 (Daily Limit Exceeded) | Logged In; Balance: 100,000 KZT; Daily Total: 960,000 KZT. | Transfer 50,000 KZT to same bank client. | No SMS code requested; immediate transfer rejection. | Daily limit exceeded notification shown; Balance & Daily Total unchanged. |
| **TR-OTP-006** | REQ-2 & REQ-4 (Conflict Priority) | Logged In; Balance: 1,000,000 KZT; Daily Total: 300,000 KZT. | Transfer 800,000 KZT to same bank client. | Rejection displaying **Amount Error** specifically (per conflict rule). | Invalid amount error notification shown; Balance & Daily Total unchanged. |
| **TR-OTP-007** | REQ-1 (Boundary Min) | Logged In; Balance: 1,000,000 KZT; Daily Total: 0 KZT. | Transfer 100 KZT to external account. | System accepts request without SMS code. | Balance: 999,900 KZT; Daily Total: 100 KZT. |
| **TR-OTP-008** | REQ-1 (Boundary Max) | Logged In; Balance: 1,000,000 KZT; Daily Total: 0 KZT. | Transfer 500,000 KZT to external account. | System accepts request; displays SMS verification code screen. | Pending OTP state; Daily Total stays 0 KZT until confirmed. |
| **TR-OTP-009** | REQ-1 (Non-Integer Amount) | Logged In; Balance: 1,000,000 KZT; Daily Total: 0 KZT. | Transfer 100.50 KZT. | Rejection; error "Amount must be in whole tenge only". | Balance & Daily Total unchanged. |
| **TR-OTP-010** | REQ-5 (SMS Expiration) | Logged In; Transfer of 200,000 KZT initiated; SMS sent. | Enter valid code at T = 121 seconds. | Code rejected due to timeout; transfer cancelled/expired. | Transfer cancelled notification; Balance unchanged. |
| **TR-OTP-011** | REQ-5 (SMS 3-Attempt Lock) | Logged In; Transfer of 150,000 KZT initiated; SMS sent. | Enter wrong code 3 consecutive times within 120s. | 3rd failed attempt cancels transfer immediately. | Transfer cancelled; OTP session invalidated. |
| **TR-OTP-012** | REQ-4 (Midnight Reset) | Logged In; Daily Total: 950,000 KZT at 23:59:59 Almaty time. | Initiate 100,000 KZT transfer at 00:00:01 Almaty time. | Transfer accepted (daily total reset to 0 at midnight). | Balance reduced by 100,000 KZT; Daily Total set to 100,000 KZT. |

---

## 3. Traceability Matrix

| Requirement ID | Requirement Description | Covered Test Cases | Coverage Status | Uncovered Reason / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | Transfer amount must be between 100 and 500,000 KZT, whole tenge only. | TR-OTP-001, TR-OTP-007, TR-OTP-008, TR-OTP-009 | **Full** | — |
| **REQ-02** | Reject transfers outside single amount boundaries. | TR-OTP-002, TR-OTP-003, TR-OTP-006 | **Full** | — |
| **REQ-03** | Transfers above 100,000 KZT require a 6-digit SMS code. | TR-OTP-004, TR-OTP-008 | **Partial** | Requirement is ambiguous on whether 100,000 KZT exact is inclusive or exclusive (`> 100,000` vs `>= 100,000`). |
| **REQ-04** | Cumulative daily limit is 1,000,000 KZT, reset at midnight Almaty time. | TR-OTP-005, TR-OTP-006, TR-OTP-012 | **Full** | — |
| **REQ-05** | SMS code is valid for 120 seconds; 3 wrong attempts cancel transfer. | TR-OTP-010, TR-OTP-011 | **Full** | — |
| **REQ-06** | Priority rule: Amount error shown if both amount and daily limit are violated. | TR-OTP-006 | **Full** | — |
| **REQ-07 (Uncovered)** | SMS Resend Limit & Cool-down period rules. | None | **Uncovered** | The specification does not define resend behavior, timer reset on resend, or max resend attempts. |
| **REQ-08 (Uncovered)** | Non-numeric / String character input handling on mobile input field. | None | **Uncovered** | Undefined whether input field strips non-numeric characters or fires validation on submission. |

---

## 4. Release Checklist: SMS Code Flow (Max 12 Items)

- [ ] **SMS-01:** SMS Gateway API integration verified active in production environment.
- [ ] **SMS-02:** OTP generator generates strictly 6-digit numeric codes with leading zeros permitted.
- [ ] **SMS-03:** Trigger threshold verified: Transfers ≤ 100,000 KZT bypass SMS step; > 100,000 KZT prompt for SMS code.
- [ ] **SMS-04:** Countdown timer initialized to 120 seconds upon SMS dispatch.
- [ ] **SMS-05:** Entering correct code within 120 seconds approves transfer and halts timer.
- [ ] **SMS-06:** Entering invalid code increments attempt counter; remaining attempt count displayed to user.
- [ ] **SMS-07:** Exceeding 3 incorrect attempts cancels transfer and invalidates active session token.
- [ ] **SMS-08:** Submitting code at T > 120 seconds displays timeout error and blocks execution.
- [ ] **SMS-09:** UI masks OTP entry on-screen while permitting standard screen-reader accessibility.
- [ ] **SMS-10:** Audit logging captures SMS dispatch timestamps, attempt counts, and status transitions without logging raw OTP text.
- [ ] **SMS-11:** "Resend Code" button disabled until initial 60-second cool-down completes.
- [ ] **SMS-12:** Transfer state automatically transitions to "Cancelled" if user navigates away or closes application during OTP step.

---

## 5. Defect Reports

### Defect 1: State Inconsistency - Confirmed Status Allowed on Expired Timer
* **Defect ID:** DEF-SMS-001
* **Severity:** High
* **Component:** OTP Validation Service / State Machine
* **Summary:** Submitting a correct SMS code at T=121s approves the transfer instead of transitioning to Expired.
* **Steps to Reproduce:**
  1. Initiate a transfer of 200,000 KZT.
  2. Wait 121 seconds on the SMS verification screen.
  3. Enter the correct 6-digit SMS code and click "Confirm".
* **Expected Result:** System rejects the submission, displays "SMS code expired", and sets transfer state to `Cancelled` / `Expired`.
* **Actual Result:** Transfer is processed successfully and funds are deducted despite timer expiry.

---

### Defect 2: Missing Spec Handling - Fractional Amounts Cause Unhandled Server Error
* **Defect ID:** DEF-AMT-002
* **Severity:** Medium
* **Component:** Input Validation Engine
* **Summary:** Entering a decimal value (e.g., `100.50`) causes HTTP 500 internal server error instead of user-friendly validation message.
* **Steps to Reproduce:**
  1. Navigate to Transfer screen.
  2. Input `100.50` into the Amount field.
  3. Click "Submit".
* **Expected Result:** Client-side or clean backend validation error stating "Amount must be in whole tenge only".
* **Actual Result:** Application crashes with `Unhandled Exception: System.FormatException` on backend.

---

### Defect 3: Priority Error Failure - Incorrect Priority Message Displayed
* **Defect ID:** DEF-PRIO-003
* **Severity:** Medium
* **Component:** Validation Logic
* **Summary:** When both transfer amount (> 500,000) and daily limit (> 1,000,000) are exceeded, Daily Limit error is displayed instead of Amount error.
* **Steps to Reproduce:**
  1. Set account daily total to 900,000 KZT.
  2. Attempt a transfer of 600,000 KZT (violates both 500k max single limit and 1M daily limit).
  3. Submit transfer.
* **Expected Result:** Error message "Amount exceeds maximum limit of 500,000 KZT" (Amount error takes precedence per brief).
* **Actual Result:** Error message "Daily limit of 1,000,000 KZT exceeded" is displayed.

---

## 6. AI Appendix (Level 1)

### 6.1 Prompts Used
* **Prompt 1 (System / Context Brief):**
  > "List every ambiguity and missing piece of information. Do not invent behavior the brief does not state. Apply equivalence partitioning and 3-value boundary value analysis to the amount. Build the full decision table for approval, then the collapsed one. Write the state table for the SMS code."
* **Prompt 2 (Refinement):**
  > "Compare generated tables with manual sheets. Highlight missed partitions, missing state diagram nodes, and inventiveness in rules."

### 6.2 Raw AI Output Summary
* **Model Used:** Gemini Flash 3.6
* **Key Generation Highlights:**
  * Successfully identified 8 major ambiguities (e.g., fractional UI handling, SMS retry scope, exact 100k boundary inclusion).
  * Produced a 16-rule full decision table collapsing down to 5 rules.
  * Constructed a state table covering states `S1: Idle` through `S5: Cancelled`.

### 6.3 Changes Made & Justification

| AI Output Element | What Was Changed | Justification / Reason |
| :--- | :--- | :--- |
| **Equivalence Partitioning** | Re-added `Not a number (e.g., 'abc')` partition. | AI completely omitted non-numeric input validation from its EP table. |
| **Decision Table Rules** | Removed redundant `Whole Tenge` condition column expansion (reduced rules from 16 to 8). | AI invented extra combinations for decimal values that bloated the base decision table unnecessarily. |
| **State Transitions** | Added explicit `Expired` state node separate from `Cancelled`. | AI lumped timer expiration directly into `Cancelled`, ignoring post-expiry retry edge cases. |
| **Traceability Mapping** | Re-mapped AI test cases back to original homework requirement IDs (`REQ-1` to `REQ-5`). | AI generated its own arbitrary tracking IDs (`FLAG-TC-01`) which broke original requirement traceability. |