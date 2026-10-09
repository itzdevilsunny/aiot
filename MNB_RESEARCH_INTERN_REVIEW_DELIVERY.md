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
- **Build Status**: `npm run build` compiled **51/51 routes** successfully in **2.4 seconds** with **0 errors**
- **Git Repository**: Pushed to `origin/main` (`github.com/itzdevilsunny/aiot`) and `vercel-repo/main` (`github.com/itzdevilsunny/risk-register-copilot`)
- **Local Server**: Running and healthy on `http://localhost:3000` (`HTTP 200 OK`)
