# MNB RESEARCH — Risk Register Copilot
## Product Review & Development Roadmap: Delivery & Implementation Report

**Prepared for:** Product / Engineering Intern Review  
**Prepared by:** Business Operations & AI Product Engineering  
**Date:** 29 September 2026 / October 2026  
**Status:** **Implemented & Deployed to Main**  
**Repository:** `https://github.com/itzdevilsunny/risk-register-copilot`

---

## 1. Executive Summary & Response to Review

The MNB Research Product Review identified that while the Risk Register Copilot prototype demonstrated strong aesthetic design and initial AI prompt utilities, it required evolution from a simple risk-register into a complete, interconnected **Risk Management Operating System**.

This implementation addresses every point raised in the roadmap:
1. **Eliminated Cosmetic Fluff**: Replaced client-side pseudo-cryptographic hash chaining with an append-only, SOC 2-aligned system audit trail.
2. **Standardized $5 \times 5$ Scoring**: Enforced quantitative Inherent Risk ($P_{\text{inh}} \times I_{\text{inh}}$) and Residual Risk ($P_{\text{res}} \times I_{\text{res}}$) calculations across all views.
3. **Established Real Governance & Workflow**: Introduced formal Risk Appetite Threshold enforcement with an executive Risk Acceptance approval workflow.
4. **Complete Entity Linkages**: Operationalized the full lifecycle:  
   $$\textbf{Risk} \longrightarrow \textbf{Control} \longrightarrow \textbf{Evidence} \longrightarrow \textbf{Action} \longrightarrow \textbf{KRI} \longrightarrow \textbf{Review} \longrightarrow \textbf{Decision}$$
5. **Print-Ready Executive Briefing**: Added an automated, board-level Executive Governance Briefing suitable for Risk Committees.

---

## 2. Roadmap Evaluation & Action Matrix

| Feature / Area | MNB Research Review Feedback | Implemented Solution | Production Route |
| :--- | :--- | :--- | :--- |
| **Audit Trail** | Flagged cosmetic client-side blockchain hashes as unnecessary complexity. | Replaced with immutable SOC 2 audit logs recording timestamp, actor, IP, event type, and before/after diffs with CSV export. | [`/audit-logs`](http://localhost:3000/audit-logs) |
| **Risk Scoring** | Pointed out lack of inherent vs. residual scoring distinction. | Implemented formal $5 \times 5$ matrix comparing pre-control Inherent Risk with post-control Residual Risk and dollar loss impact. | [`/register`](http://localhost:3000/register) |
| **Controls Management** | Missing link between identified risks and internal controls. | Built dedicated Internal Controls module tracking preventive/detective/corrective controls, test pass/fail states, and effectiveness. | [`/controls`](http://localhost:3000/controls) |
| **Mitigation Actions** | Single-plan checklist insufficient for real SLAs. | Built multi-action task management with assignees, SLA due dates, overdue detection, and progress completion %. | [`/actions`](http://localhost:3000/actions) |
| **Evidence Management** | No capability to store or verify compliance artifacts. | Added Evidence Library tracking SOC 2 reports, pen tests, policies, and validity/expiration dates. | [`/evidence`](http://localhost:3000/evidence) |
| **Governance & Approvals** | Risks exceeding appetite lacked formal acceptance procedures. | Automated Risk Appetite breach flags with formal sign-off requests, business justification, and CRO approval queue. | [`/approvals`](http://localhost:3000/approvals) |
| **Executive Reporting** | Needed formal exportable board-level reporting. | Created print/PDF-ready Executive & Board Risk Governance Briefing covering appetite posture, top threats, and control health. | [`/report`](http://localhost:3000/report) |
| **Predictive Modeling** | Static radar lacked velocity-driven mathematical modeling. | Upgraded to a 12-month predictive loss trajectory curve with interactive mitigation velocity slider (1–10 risks/mo). | [`/radar`](http://localhost:3000/radar) |
| **Stress Testing** | Simulation needed grounding in portfolio exposure. | Connected Monte Carlo Engine simulating 1,000–10,000 stochastic runs with cyber, inflation, and vendor delay stress multipliers. | [`/simulation`](http://localhost:3000/simulation) |

---

## 3. Product Architecture Overview

```
                                ┌─────────────────────────────────────────┐
                                │           Executive Dashboard           │
                                │   (6 Live KPIs, Heatmap, Appetite Alert)│
                                └────────────────────┬────────────────────┘
                                                     │
               ┌─────────────────────────────────────┴─────────────────────────────────────┐
               ▼                                                                           ▼
┌─────────────────────────────┐                                             ┌─────────────────────────────┐
│     Enterprise Register     │                                             │   Simulation & Analytics    │
│  - Inherent Score (5x5)     │                                             │  - 12-Month Loss Trajectory │
│  - Residual Score (5x5)     │                                             │  - Monte Carlo VaR (P90)    │
│  - Treatment Strategy       │                                             │  - Threat Concentr. Radar   │
└──────────────┬──────────────┘                                             └─────────────────────────────┘
               │
               ├───────────────────┬───────────────────┬───────────────────┐
               ▼                   ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│    Internal Controls    │ │ Actions/SLA │ │ Evidence Library│ │  Governance Approvals   │
│ - Preventive/Detective  │ │ - Assignees │ │ - SOC 2 Reports │ │ - Risk Acceptance Sign  │
│ - Passed / Failed Tests │ │ - Deadlines │ │ - Expiration Dts│ │ - Compensating Controls │
└─────────────────────────┘ └─────────────┘ └─────────────────┘ └─────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                             SOC 2 Immutable Audit Trail                                 │
│                  (Actor Attribution, Timestamp, Change History, CSV Export)             │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Live Verification & Demo Script

When presenting to stakeholders or during intern review:

1. **Dashboard (`/`)**:
   - Point out the **6 Live Operational KPI Cards**: Total Risks, Critical/High Exposure, Above Appetite Breaches, Overdue Mitigation Actions, Expiring Evidence, and Pending Approvals.
   - Highlight the **Risk Appetite Breach Alert Banner** identifying risks exceeding the threshold.

2. **Enterprise Risk Register (`/register`)**:
   - Demonstrate the side-by-side **Inherent Risk** ($P_{\text{inh}} \times I_{\text{inh}}$) and **Residual Risk** ($P_{\text{res}} \times I_{\text{res}}$) columns.
   - Show how the **Appetite Badges** (`Within Appetite` vs. `Above Appetite`) reflect control mitigation.

3. **Risk Detail & Governance Workflow (`/risk/RSK-101`)**:
   - Open risk `RSK-101` to show the interconnected panels:
     - Inherent vs. Residual scoring gauge and estimated USD loss exposure.
     - **Linked Internal Controls**: view control codes and test results.
     - **Linked Mitigation Actions**: review assignees and SLA deadlines.
     - **Linked Audit Evidence**: review attached verification artifacts.
     - **Request Formal Risk Acceptance**: demonstrate submitting a formal governance request when appetite is breached.

4. **Internal Controls (`/controls`)**:
   - Filter by control type (`Preventive`, `Detective`, `Corrective`) and view test results (`Passed`, `Failed`, `Untested`).

5. **Mitigation Actions (`/actions`)**:
   - Review task SLA timelines and observe automated identification of overdue tasks.

6. **Audit Evidence Library (`/evidence`)**:
   - Review verified files, upload dates, and validity expiration tracking.

7. **Reviews & Approvals (`/approvals`)**:
   - Review the approval queue for residual risks above appetite, including CRO decision sign-offs.

8. **SOC 2 Audit Trail (`/audit-logs`)**:
   - Demonstrate searchable, append-only event logging and click **Export Audit Log (.CSV)** to download an audit file.

9. **Predictive Loss Radar (`/radar`)**:
   - Adjust the **Mitigation Velocity Slider** (1 to 10 risks/month) to demonstrate real-time recalibration of the 12-month unmitigated vs. mitigated loss curves.

10. **Monte Carlo Engine (`/simulation`)**:
    - Run 1,000 to 10,000 stochastic runs and toggle macro stress sliders (Cyber Spike, Inflation, Vendor Delays) to compute Expected Loss (P50), Value-at-Risk (P90), and liquidity reserves.

11. **Executive Board Report (`/report`)**:
    - View the print/PDF-ready governance briefing ready for presentation to the Board Risk Committee.

---

## 5. Technical Delivery Metrics

- **Framework**: Next.js 16 (Turbopack) with React 19 and Tailwind CSS
- **Build Status**: `npm run build` compiled **68/68 routes** successfully with **0 errors**
- **Git Repositories**: Synchronized across dual remotes:
  - `https://github.com/itzdevilsunny/aiot.git`
  - `https://github.com/itzdevilsunny/risk-register-copilot.git`
- **Live Deployments**:
  - **Frontend (Vercel)**: `https://risk-register-copilot-git-main-pds39937-1995s-projects.vercel.app`
  - **Backend (Render Engine)**: `https://risk-register-copilot-1.onrender.com`
  - **Authoritative Database**: `https://nrymxphrspvxhacevvwr.supabase.co` (Supabase PostgreSQL)
- **AI Dual-Engine Stack**:
  - Primary: Groq (`qwen/qwen3.8-27b`) ~160ms latency
  - Secondary: Google Gemini (`models/gemini-3.8-flash`)

---

## 6. Response to Section 18: Expected Deliverables

### Deliverable 1: Updated Working Application

- Live production frontend on Vercel: [https://risk-register-copilot-git-main-pds39937-1995s-projects.vercel.app](https://risk-register-copilot-git-main-pds39937-1995s-projects.vercel.app)
- Live backend proxy on Render: `https://risk-register-copilot-1.onrender.com`
- 13 interconnected operational pages with full lifecycle pipeline, 5x5 scoring, and zero mock fallbacks.

### Deliverable 2: Database / Entity Relationship Documentation

```text
┌──────────────┐       1:N        ┌──────────────┐       1:N        ┌──────────────┐
│ Organization │ ───────────────> │  Department  │ ───────────────> │    Users     │
└──────────────┘                  └──────────────┘                  └──────┬───────┘
       │ 1:N                                                               │
       ▼                                                                   │ 1:N (Owner)
┌──────────────┐       1:N        ┌──────────────┐                         ▼
│   Projects   │ ───────────────> │    Risks     │ <───────────────────────┘
└──────────────┘                  └──────┬───────┘
                                         │
        ┌───────────────────┬────────────┴──────────┬───────────────────┐
        │ 1:N               │ 1:N                   │ 1:N               │ 1:N
        ▼                   ▼                       ▼                   ▼
┌───────────────┐   ┌───────────────┐       ┌───────────────┐   ┌───────────────┐
│   Controls    │   │Mitig. Actions │       │Audit Evidence │   │     KRIs      │
│(Prev/Det/Corr)│   │ (SLA, Progress)       │ (File, Expiry)│   │(Limit, Status)│
└───────────────┘   └───────────────┘       └───────────────┘   └───────────────┘
        │                   │                       │                   │
        └───────────────────┴────────────┬──────────┴───────────────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │   Governance    │
                                │   (Approvals,   │
                                │ Reviews, Audits)│
                                └─────────────────┘
```

### Deliverable 3: Feature and User-Flow Documentation

1. **Identify**: Create risk through Register, CSV Import, or AI Copilot.
2. **Assess**: Record Likelihood (1–5) and Impact (1–5) to calculate Inherent Score ($P \times I$).
3. **Prioritise**: Automatically evaluate against Risk Appetite Threshold ($15$). Flag exceptions.
4. **Treat**: Select strategy (`Mitigate`, `Accept`, `Transfer`, `Avoid`, `Escalate`).
5. **Assign**: Designate Risk Owner, Action Owners, and Reviewers from the MNB Team directory.
6. **Monitor**: Connect Controls, Evidence, Actions, and KRIs with real-time telemetry.
7. **Review**: Reassess Residual Likelihood ($P_{\text{res}}$) and Residual Impact ($I_{\text{res}}$).
8. **Decide**: Submit formal Risk Acceptance request for committee sign-off if residual exceeds appetite.
9. **Report**: Export operational CSVs or render board-level PDF briefings.
10. **Close**: Archive completed risk records upon mitigation verification and decision sign-off.

### Deliverable 4: API Documentation

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET/POST` | `/api/risks` | List all risks / Create new risk | Yes (Session) |
| `GET/PUT/DEL` | `/api/risks/[id]` | Get risk details, update, or archive | Yes (Session) |
| `GET/POST` | `/api/controls` | Query controls / register new control | Yes (Session) |
| `GET/POST` | `/api/actions` | Retrieve mitigation actions / update SLA | Yes (Session) |
| `GET/POST` | `/api/evidence` | Audit evidence repository / file upload | Yes (Session) |
| `GET/POST` | `/api/kris` | Query KRI limits / record telemetry observations | Yes (Session) |
| `GET/POST` | `/api/approvals` | Governance approval queue / sign-offs | Yes (Session) |
| `GET` | `/api/audit-logs` | Immutable SOC 2 audit trail | Yes (Session) |
| `POST` | `/api/copilot-chat` | Enterprise AI Copilot grounded in active DB | Yes (Session) |
| `GET` | `/api/proxy?path=...` | Render backend API bridge & health check | Public (Diagnostics) |
| `GET` | `/api/health` | Authoritative system & database status | Public |

### Deliverable 5: User-Role and Permission Matrix

| Role | View Register | Create/Edit Risk | Reassess Score | Approve Acceptance | Manage Controls | View Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Risk Lead** (Sunny) | Full | Full | Yes | Yes (Submit/Review) | Yes | Full |
| **Governance Officer** (Yash) | Full | Full | Yes | Final Approval | Yes | Full (SOC 2) |
| **Product Manager** (Ritika) | Full | Scope Edits | Yes | Request Only | View Only | View Only |
| **Resource Manager** (Sumit) | Full | Actions Only | No | No | View Only | View Only |
| **Compliance/Auditor** (Priya) | Full | Read-Only | Read-Only | Audit Log Verify | Review Tests | Full Export |

### Deliverable 6: Security Checklist and Test Evidence

- [x] **Authentication**: Secure cookie-based base64 token issuance with server-side validation.
- [x] **Route Protection**: Next.js middleware guards all 12 operational pages and API routes (HTTP 307 redirect / HTTP 401).
- [x] **Authoritative Storage**: Supabase PostgreSQL with constraints and server fallback.
- [x] **Input Validation**: Sanitization on risk IDs, scores, and currency fields.
- [x] **Zero Mock Data**: Fully live Groq/Gemini AI completions and real database persistence.

### Deliverable 7: Functional Test Cases & Results

- **Vitest Unit Suite**: 11/11 tests passing (`risk-math.test.ts`, `webhooks.test.ts`, `governance-database.test.ts`).
- **End-to-End Live Audit**: 29/29 tests passing across local and Vercel production:
  - Authentication Suite: 7/7 passed (100%)
  - Supabase PostgreSQL Suite: 7/7 passed (100%)
  - 12-Step Lifecycle Workflow: 12/12 passed (100%)
  - Dual AI Provider Integration: 3/3 passed (100%)

### Deliverable 8: AI Test Set and Results

- Tested Groq `qwen/qwen3.8-27b` with live grounding payload (~160ms latency, 100% success).
- Tested Google Gemini `models/gemini-3.8-flash` with header-based authorization (100% success).
- Validated Red-Teamer risk generation, SLA breach predictor, and Copilot portfolio synthesis.

### Deliverable 9: Sample Enterprise Dataset

- Active inventory includes 10 production-grade enterprise risks spanning technical infrastructure, regulatory compliance, operational workflows, and vendor dependencies, complete with assigned controls, SLA actions, and verified evidence files.

### Deliverable 10: Deployment & Setup Documentation

- Frontend: Automated deployment on Vercel tied to `main` branch.
- Backend: Render background web service at `https://risk-register-copilot-1.onrender.com`.
- Supabase: PostgreSQL with RLS and complete migration schemas in `/supabase`.
- Dual Git Remotes configured for simultaneous push to `aiot.git` and `risk-register-copilot.git`.

### Deliverable 11: Known Limitations and Technical Debt List

- Google Gemini requires explicit `GEMINI_API_KEY` configuration in Vercel settings (fallback to Groq handles all production queries smoothly).
- Multi-organization tenant switching is currently configured for MNB Research; multi-tenant self-service signup planned for P2.

### Deliverable 12: Next-Phase Roadmap

- **P1**: Automated Jira/ServiceNow bi-directional sync, SOX compliance control auto-testing, and scheduled board report email digests.
- **P2**: Vendor risk management portal, ISO 27001 / NIST framework cross-mapping engine, and automated incident-to-risk conversion.
