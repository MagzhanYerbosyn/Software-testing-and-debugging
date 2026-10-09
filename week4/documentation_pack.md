# Documentation Pack: Money Transfer Feature

**Standard:** ISO/IEC/IEEE 29119-3 (formerly IEEE 829)  
**System under Test:** Mobile/Online Banking — Money Transfer & OTP Verification Engine

---

## 1. Test Plan (One-Page)

### 1.1 Scope

- **In-Scope:**
  - Single transfer transaction validation: amounts 100 to 500,000 KZT (whole integers/tenge only).
  - Accumulation and reset of daily cumulative transfer limit (1,000,000 KZT maximum, resetting at 00:00:00 Almaty time).
  - 6-digit SMS OTP verification flow triggered for transfers exceeding 100,000 KZT.
  - SMS code lifecycle management: 120-second validity window, 3-attempt failure lock, and resend limits.
  - System conflict resolution and priority handling rules (e.g., amount boundary error taking precedence over daily total limit error).
- **Out-of-Scope:**
  - External core banking ledger reconciliation, clearing house settlement protocols, and multi-currency exchange rates.
  - Performance, load, and stress testing of telecom SMS gateway carriers.
  - Biometric UI authentication (FaceID/TouchID) prior to initiating transfers.

### 1.2 Approach

- **Testing Levels:** System Testing (API level validation combined with UI component verification).
- **Test Design Techniques:** Equivalence Partitioning (EP), 2-Value & 3-Value Boundary Value Analysis (BVA), Decision Table Testing (collapsed/full), and State Transition Testing.
- **Tooling & Environment:** Staging environment connected to a mock SMS gateway with configurable system time for midnight reset verification.

### 1.3 Entry and Exit Criteria

- **Entry Criteria:**
  - Application build (v4.11.0 or higher) deployed to the staging environment with smoke suite 100% green.
  - Test accounts (e.g., `TC-014`) provisioned with clear initial balances (≥ 1,000,000 KZT) and reset daily accumulators.
  - Requirements specification baseline signed off by Product Owner.
- **Exit Criteria:**
  - 100% execution rate of all 12 planned core test cases (`TR-AMT-001` through `TR-AMT-012`).
  - Zero open Critical or High severity defects.
  - All open Medium/Low defects assigned residual risk classification and explicitly accepted in writing by the Product Owner prior to release.

### 1.4 Top Three Product Risks

1. **Financial Loss / Security Bypass (Severity: High, Risk Level: High):** Transfers > 100,000 KZT processing without triggering 2FA due to incorrect boundary evaluation (`>` vs. `>=`).
2. **Race Condition / Double-Spend at Midnight Reset (Severity: High, Risk Level: Medium):** Transfers initiated around 00:00:00 Almaty time bypassing daily cumulative balance limits due to client/server timezone offset mismatches.
3. **OTP Lockout Deadlock / State Loss (Severity: Medium, Risk Level: Medium):** Unhandled OTP expiration state resulting in user funds being held in temporary pending state or accounts locked indefinitely.

---

## 2. Test Cases (Full Runnable Format)

### TR-AMT-001

- **Traces to:** REQ-1 (Valid Single Transfer Range)
- **Preconditions:** Test customer `TC-014` logged in; Account balance: 1,000,000 KZT; Cumulative daily total: 0 KZT; Time: 14:00 Almaty time.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit account ending in `4417` as recipient.
  3. Enter amount `100 KZT`.
  4. Tap **Continue**.
- **Expected Result:** Transfer executes immediately without SMS prompt. Success notification displayed. Account balance becomes 999,900 KZT; cumulative daily total becomes 100 KZT.
- **Postconditions:** Database state reflects 100 KZT debit and updated daily total.

---

### TR-AMT-002

- **Traces to:** REQ-1 (Valid Single Transfer Upper Boundary)
- **Preconditions:** Test customer `TC-014` logged in; Account balance: 1,000,000 KZT; Cumulative daily total: 0 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit account ending in `4417` as recipient.
  3. Enter amount `500,000 KZT`.
  4. Tap **Continue**.
- **Expected Result:** SMS code verification screen appears within 3 seconds. Account balance remains 1,000,000 KZT (pending SMS authorization).
- **Postconditions:** Transfer transaction created in `Pending_OTP` state.

---

### TR-AMT-003

- **Traces to:** REQ-2 (Invalid Single Transfer Below Minimum)
- **Preconditions:** Test customer `TC-014` logged in; Account balance: 1,000,000 KZT; Cumulative daily total: 0 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit account ending in `4417` as recipient.
  3. Enter amount `99 KZT`.
  4. Tap **Continue**.
- **Expected Result:** Transfer is rejected immediately. Validation message displayed: _"Amount must be between 100 and 500,000 KZT"_. Balance remains 1,000,000 KZT; daily total remains 0 KZT.
- **Postconditions:** No ledger entry or transaction log created.

---

### TR-AMT-004

- **Traces to:** REQ-2 (Invalid Single Transfer Above Maximum)
- **Preconditions:** Test customer `TC-014` logged in; Account balance: 1,000,000 KZT; Cumulative daily total: 0 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit account ending in `4417` as recipient.
  3. Enter amount `500,001 KZT`.
  4. Tap **Continue**.
- **Expected Result:** Transfer is rejected immediately. Error message displayed: _"Amount exceeds maximum single transfer limit of 500,000 KZT"_. No SMS screen triggered.
- **Postconditions:** Account balance unchanged.

---

### TR-AMT-005

- **Traces to:** REQ-3 (SMS Threshold Lower Boundary - No OTP)
- **Preconditions:** Test customer `TC-014` logged in; Account balance: 1,000,000 KZT; Cumulative daily total: 0 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit account ending in `4417` as recipient.
  3. Enter amount `100,000 KZT`.
  4. Tap **Continue**.
- **Expected Result:** Transfer executes directly without SMS OTP verification screen. Balance updates to 900,000 KZT; daily total updates to 100,000 KZT.
- **Postconditions:** Transaction marked `Completed`.

---

### TR-AMT-006

- **Traces to:** REQ-3 (SMS Threshold Upper Boundary - Requires OTP)
- **Preconditions:** Test customer `TC-014` logged in; Account balance: 1,000,000 KZT; Cumulative daily total: 0 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit account ending in `4417` as recipient.
  3. Enter amount `100,001 KZT`.
  4. Tap **Continue**.
- **Expected Result:** System pauses transaction and renders 6-digit SMS OTP verification screen within 3 seconds. Balance remains 1,000,000 KZT until code verification.
- **Postconditions:** Active OTP session initialized with 120-second expiration timer.

---

### TR-AMT-007

- **Traces to:** REQ-1 (Non-Integer Amount Validation)
- **Preconditions:** Test customer `TC-014` logged in; Account balance: 1,000,000 KZT; Cumulative daily total: 0 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit account ending in `4417` as recipient.
  3. Input amount `150.50 KZT`.
  4. Tap **Continue**.
- **Expected Result:** System blocks submission at UI/API layer with error message: _"Amount must be in whole tenge only"_. Balance remains 1,000,000 KZT.
- **Postconditions:** Account balance and daily total unaffected.

---

### TR-AMT-008

- **Traces to:** REQ-4 (Daily Cumulative Limit Reached Exemption)
- **Preconditions:** Test customer `TC-014` logged in; Account balance: 1,000,000 KZT; Cumulative daily total: 960,000 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit account ending in `4417` as recipient.
  3. Enter amount `50,000 KZT`.
  4. Tap **Continue**.
- **Expected Result:** Transfer rejected immediately. Error message displayed: _"Daily transfer limit of 1,000,000 KZT exceeded. Remaining daily limit: 40,000 KZT"_.
- **Postconditions:** Daily total remains 960,000 KZT; balance unchanged.

---

### TR-AMT-009

- **Traces to:** REQ-2 & REQ-4 (Conflict Priority Resolution)
- **Preconditions:** Test customer `TC-014` logged in; Account balance: 1,000,000 KZT; Cumulative daily total: 700,000 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit account ending in `4417` as recipient.
  3. Enter amount `600,000 KZT` (violates single limit > 500,000 AND daily limit > 1,000,000).
  4. Tap **Continue**.
- **Expected Result:** Transfer rejected. Error message specifically cites **Amount Error**: _"Amount exceeds maximum single transfer limit of 500,000 KZT"_ (Single Amount Rule takes priority over Daily Limit Rule per specification).
- **Postconditions:** Balance and daily total remain unchanged.

---

### TR-AMT-010

- **Traces to:** REQ-5 (SMS Code Expiration Boundary)
- **Preconditions:** Test customer `TC-014` logged in; Balance: 1,000,000 KZT; Initiated transfer of 200,000 KZT; SMS code generated at T=0s.
- **Steps to Reproduce:**
  1. Wait on SMS verification screen until timer reaches 121 seconds (T=121s).
  2. Enter valid received 6-digit OTP code (`123456`).
  3. Tap **Confirm**.
- **Expected Result:** System rejects OTP with error: _"SMS code has expired. Please request a new code"_. Transfer cancelled. Balance remains 1,000,000 KZT.
- **Postconditions:** OTP session transitions to `Expired` state.

---

### TR-AMT-011

- **Traces to:** REQ-5 (SMS 3-Attempt Lock Threshold)
- **Preconditions:** Test customer `TC-014` logged in; Balance: 1,000,000 KZT; Initiated transfer of 200,000 KZT; Active OTP session.
- **Steps to Reproduce:**
  1. Enter incorrect 6-digit code `000000` and tap **Confirm** (Attempt 1).
  2. Enter incorrect 6-digit code `111111` and tap **Confirm** (Attempt 2).
  3. Enter incorrect 6-digit code `222222` and tap **Confirm** (Attempt 3).
- **Expected Result:** On 3rd failed attempt, system displays: _"Maximum attempts reached. Transfer cancelled."_ OTP screen closes, user returned to home dashboard.
- **Postconditions:** Transaction state set to `Cancelled`; OTP session invalidated.

---

### TR-AMT-012

- **Traces to:** REQ-4 (Midnight Daily Accumulator Reset)
- **Preconditions:** Test customer `TC-014` logged in; Balance: 1,000,000 KZT; Cumulative daily total: 950,000 KZT at 23:59:55 Almaty time.
- **Steps to Reproduce:**
  1. Wait until server clock rolls over to 00:00:01 Almaty time.
  2. Initiate transfer of `200,000 KZT`.
  3. Tap **Continue** and verify with valid SMS OTP.
- **Expected Result:** System permits transfer (daily total reset to 0 KZT at midnight). Balance becomes 800,000 KZT; new cumulative daily total becomes 200,000 KZT.
- **Postconditions:** Daily limit counter successfully reset for the new calendar day.

---

## 3. Traceability Matrix

| Requirement ID | Requirement Description                                                    | Test Case(s)                       | Technique                               | Status / Coverage | Notes / Uncovered Reasons                                                                                         |
| :------------- | :------------------------------------------------------------------------- | :--------------------------------- | :-------------------------------------- | :---------------- | :---------------------------------------------------------------------------------------------------------------- |
| **REQ-1**      | Single transfer amount between 100 and 500,000 KZT, whole tenge only.      | TR-AMT-001, TR-AMT-002, TR-AMT-007 | Equivalence Partitioning + 3-Value BVA  | **Full Coverage** | Tested min (100), max (500k), and fractional decimals.                                                            |
| **REQ-2**      | Reject single transfers outside boundaries (< 100 or > 500,000 KZT).       | TR-AMT-003, TR-AMT-004, TR-AMT-009 | Boundary Value Analysis                 | **Full Coverage** | Tested off-point low (99) and off-point high (500,001).                                                           |
| **REQ-3**      | Single transfer > 100,000 KZT requires 6-digit SMS OTP verification.       | TR-AMT-005, TR-AMT-006             | 2-Value BVA                             | **Full Coverage** | Tested boundary on-point (100,000) and off-point (100,001).                                                       |
| **REQ-4**      | Cumulative daily limit = 1,000,000 KZT, resetting at 00:00:00 Almaty time. | TR-AMT-008, TR-AMT-009, TR-AMT-012 | Decision Table + Time Boundary Analysis | **Full Coverage** | Covers over-limit rejection and midnight timezone reset.                                                          |
| **REQ-5**      | SMS OTP valid for 120s; 3 invalid attempts cancel transaction.             | TR-AMT-010, TR-AMT-011             | State Transition Testing                | **Full Coverage** | Covers timeout transition and lock-out state.                                                                     |
| **REQ-6**      | Conflict Rule: Single amount error takes priority over daily limit error.  | TR-AMT-009                         | Decision Table Priority Rules           | **Full Coverage** | Verified priority error message output.                                                                           |
| **REQ-7**      | **UNCOVERED:** SMS Resend Cool-down and Max Resend Attempts.               | _None_                             | N/A                                     | **NOT COVERED**   | **Reason:** Specification lacks requirements defining resend interval (e.g., 60s timer) or daily SMS resend caps. |
| **REQ-8**      | **UNCOVERED:** Mobile UI Input Masking / Non-Numeric Paste Handling.       | _None_                             | N/A                                     | **NOT COVERED**   | **Reason:** Lack of mobile client specification for paste buffer stripping or soft-keyboard restrictions.         |

---

## 4. Release Checklist: SMS Code Flow (Max 12 Items)

- [ ] **SMS-01:** SMS Gateway API integration health-check endpoint returns HTTP 200 status in production environment.
- [ ] **SMS-02:** OTP generation service generates strictly 6-digit numeric codes with leading zeros permitted (e.g., `004819`).
- [ ] **SMS-03:** Trigger threshold check: Transfers ≤ 100,000 KZT bypass OTP; transfers > 100,000 KZT prompt OTP modal.
- [ ] **SMS-04:** UI countdown timer initializes to exactly 120 seconds upon SMS dispatch notification.
- [ ] **SMS-05:** Entering correct code within 120 seconds authorizes transaction, halts timer, and processes debit.
- [ ] **SMS-06:** Entering invalid code displays remaining attempt counter (e.g., _"Invalid code. 2 attempts remaining"_).
- [ ] **SMS-07:** Submitting 3rd consecutive wrong code invalidates OTP session and transitions transfer to `Cancelled`.
- [ ] **SMS-08:** Submitting valid code at T > 120 seconds displays _"Code expired"_ error and prevents funds transfer.
- [ ] **SMS-09:** UI masks input digits on-screen while maintaining accessibility labels for screen readers.
- [ ] **SMS-10:** Double-tapping **Confirm** button triggers exactly one API submission (idempotency token verified).
- [ ] **SMS-11:** Audit logs record SMS delivery timestamp, attempt count, and outcome without logging raw OTP text.
- [ ] **SMS-12:** Navigating away from or backgrounding app during active OTP modal safely cancels pending transaction after expiry.

---

## 5. Defect Reports

### Defect Report 1

- **Title:** `[Transfers]: Balance updated and transfer processed after entering valid SMS code on expired timer (T=121s)`
- **Environment:** iOS 18.2, Banking App v4.11.0 (Build 2291), Staging Env 2
- **Preconditions:** Test customer `TC-014`, balance: 1,000,000 KZT, daily total: 0 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit ending in `4417`, enter `200,000 KZT`, tap **Continue**.
  3. Observe SMS verification screen appear and note receipt of OTP `583920`.
  4. Wait on screen until countdown timer reaches `00:00` and wait an additional 1 second (T=121s total).
  5. Enter code `583920` and tap **Confirm**.
- **Expected Result:** System rejects code with message _"SMS code expired"_. Transaction state set to `Cancelled`; account balance remains 1,000,000 KZT.
- **Actual Result:** System accepts code, displays transfer success screen, and debits 200,000 KZT from account balance.
- **Reproducibility:** 5 of 5 attempts.
- **Severity (Proposed):** **High** (Security/Business logic flaw — allows processing on stale credentials).
- **Priority (Proposed):** **High** (Must be fixed before release).
- **Evidence:** Screen recording `DEF_001_timer_bypass.mp4`, Backend request ID `req-88392-a4`.
- **Traces to:** REQ-5 / TR-AMT-010

---

### Defect Report 2

- **Title:** `[Transfers]: Submitting decimal/fractional amount causes unhandled HTTP 500 crash instead of validation error`
- **Environment:** Android 14, Banking App v4.11.0 (Build 2291), Staging Env 2
- **Preconditions:** Test customer `TC-014`, balance: 1,000,000 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit ending in `4417`.
  3. Paste `100.50` into the amount input field.
  4. Tap **Continue**.
- **Expected Result:** Inline UI error message displayed: _"Amount must be in whole tenge only"_. Submission blocked cleanly.
- **Actual Result:** App hangs for 5 seconds, displays generic error dialog _"Something went wrong"_, and backend logs `Unhandled Exception: System.FormatException` (HTTP 500).
- **Reproducibility:** 5 of 5 attempts.
- **Severity (Proposed):** **Medium** (Application crash / improper exception handling).
- **Priority (Proposed):** **Medium** (Standard fix cycle).
- **Evidence:** Server log output `backend_crash_stacktrace.log`, Screenshot `DEF_002_500_error.png`.
- **Traces to:** REQ-1 / TR-AMT-007

---

### Defect Report 3

- **Title:** `[Transfers]: Daily limit error displayed instead of single transfer amount error when both boundaries are exceeded`
- **Environment:** iOS 18.2, Banking App v4.11.0 (Build 2291), Staging Env 2
- **Preconditions:** Test customer `TC-014`, account balance: 1,000,000 KZT, cumulative daily total: 700,000 KZT.
- **Steps to Reproduce:**
  1. Open **Transfers** -> **Between accounts**.
  2. Select deposit ending in `4417`.
  3. Enter amount `600,000 KZT` (violates both max single limit 500k and max daily limit 1M).
  4. Tap **Continue**.
- **Expected Result:** System displays single amount error: _"Amount exceeds maximum single transfer limit of 500,000 KZT"_ (per Priority Rule REQ-6).
- **Actual Result:** System displays daily limit error: _"Daily transfer limit of 1,000,000 KZT exceeded"_.
- **Reproducibility:** 5 of 5 attempts.
- **Severity (Proposed):** **Low** (UI text accuracy issue; transaction is still blocked correctly).
- **Priority (Proposed):** **Low** (Backlog / non-critical UI alignment).
- **Evidence:** Screenshot `DEF_003_wrong_error_priority.png`.
- **Traces to:** REQ-6 / TR-AMT-009

---

## 6. AI Appendix (Level 1)

### 6.1 Prompts Used

- **Prompt 1 (Drafting Defect Reports & Test Plan):**

  > "Here are my raw test findings and scope details: [inserted raw test session notes]. Turn them into a structured defect report and test plan using ISO/IEC/IEEE 29119-3 standard format.
  > Rules: Use only facts present in my notes. If a field is not in the notes, write MISSING and do not guess. Steps: numbered, one action each, starting from a known state. Title format: [screen]: [what happens] [under what condition]. Propose severity and priority, and mark them as proposals."

- **Prompt 2 (Refinement & Compliance Check):**
  > "Check the generated test cases against Week 4 lecture guidelines: verify that preconditions have concrete balances/daily totals, test data uses real numbers (e.g. 100,001 KZT), expected results are checkable, and all 12 test cases trace to a requirement."

### 6.2 Raw AI Output Summary

- **Model Used:** Gemini Flash 3.6
- **Raw Output Generation Excerpt:**
  ```text
  TITLE: [Transfers]: balance not updating on timer
  ENVIRONMENT: iOS 18.2
  PRECONDITIONS: MISSING
  STEPS:
  1. Open app and make a transfer of 200,000
  2. Wait until 121 seconds pass
  3. Type code 583920
  EXPECTED: Error message shown
  ACTUAL: Money transferred
  REPRODUCIBILITY: MISSING
  SEVERITY: High (Proposed)
  PRIORITY: High (Proposed)
  ```

### 6.3 Changes Made and Justification

| Output Element                 | Raw AI Output            | Modified / Final Version                                                                                        | Justification / Reason                                                                                  |
| :----------------------------- | :----------------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| **Preconditions (Defect 1)**   | `MISSING`                | `Test customer TC-014, balance: 1,000,000 KZT, daily total: 0 KZT.`                                             | Added explicit starting state from test environment per Week 4 lecture rules (runnable standard).       |
| **Reproducibility (Defect 1)** | `MISSING`                | `5 of 5 attempts.`                                                                                              | Verified determinism during execution and recorded exact count.                                         |
| **Title Format (Defect 2)**    | `Crash on decimal input` | `[Transfers]: Submitting decimal/fractional amount causes unhandled HTTP 500 crash instead of validation error` | Standardized to strict course title formula: `[Where] + [what happens] + [under what condition]`.       |
| **Test Case IDs**              | `TC-01` through `TC-12`  | `TR-AMT-001` through `TR-AMT-012`                                                                               | Aligned naming convention with requirement trace codes in Matrix.                                       |
| **Uncovered Requirements**     | Omitted                  | Added `REQ-7` and `REQ-8` explicit rows                                                                         | Week 4 Traceability standard requires explicitly documenting uncovered requirements and explaining why. |
