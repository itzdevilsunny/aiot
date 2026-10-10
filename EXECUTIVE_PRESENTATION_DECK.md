# MNB RESEARCH — Risk Register Copilot
## Executive Review Presentation Deck
**Audience:** Product & Engineering Leadership, Risk Committee, Senior Stakeholders  
**Presenter:** Business Operations & AI Product Engineering Intern  
**Date:** October 2026  
**Live Application:** [https://risk-register-copilot-git-main-pds39937-1995s-projects.vercel.app](https://risk-register-copilot-git-main-pds39937-1995s-projects.vercel.app)

---

## Slide 1: Strategic Vision & Transformation

### From Static Spreadsheet to Enterprise Risk Operating System (EROS)

```
┌────────────────────────────────────────┐       ┌──────────────────────────────────────────────────┐
│          Legacy Mental Model           │       │             Recommended & Delivered Model        │
│                                        │       │                                                  │
│   "An AI tool to draft risk lists"     │  ───> │  "An AI-Powered Risk Management Operating System │
│   (Isolated database of records)       │       │   connecting Risks to Controls, Actions,         │
│                                        │       │   Evidence, KRIs, & Decisions)"                  │
└────────────────────────────────────────┘       └──────────────────────────────────────────────────┘
```

#### Core Principle:
> **"AI should assist the risk lifecycle, not replace the underlying governance workflow."**  
> The application remains the system of record; AI acts as a reasoning, analysis, and quality-assurance layer.

---

## Slide 2: The Continuous 10-Stage Risk Lifecycle

Rather than treating a risk as a one-time entry, the platform executes a closed-loop governance cycle:

$$\textbf{Identify} \longrightarrow \textbf{Assess} \longrightarrow \textbf{Prioritise} \longrightarrow \textbf{Treat} \longrightarrow \textbf{Assign} \longrightarrow \textbf{Monitor} \longrightarrow \textbf{Review} \longrightarrow \textbf{Approve} \longrightarrow \textbf{Report} \longrightarrow \textbf{Close}$$

1. **Identify**: Manual entry, AI natural language generation, CSV bulk import, or CVE threat scanner.
2. **Assess**: Inherent Likelihood ($1–5$) $\times$ Inherent Impact ($1–5$).
3. **Prioritise**: Automated benchmark against organizational Risk Appetite Threshold ($15/25$).
4. **Treat**: Strategy selection (Mitigate, Accept, Transfer, Avoid).
5. **Assign**: Designated Risk Owner, Action Assignee, Reviewer, and Sign-off Approver.
6. **Monitor**: Real-time Key Risk Indicators (KRIs) with upper/lower control limits.
7. **Review**: Scheduled review cycles (Monthly/Quarterly) with historical drift tracking.
8. **Approve**: Formal Risk Acceptance sign-off with CRO justification and review dates.
9. **Report**: C-Suite Briefings, Board Risk Packs, and Statement of Applicability (SoA).
10. **Close**: Permanent resolution logged with verified evidence and post-mortem.

---

## Slide 3: The 6-Part Interconnected Entity Chain

A risk is never isolated. Every risk is linked to its operational context:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     RISK     │ ──> │   CONTROLS   │ ──> │   EVIDENCE   │
│  (RSK-101)   │     │ (MFA, DLP)   │     │ (SOC 2, Logs)│
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
       │             ┌──────────────┐     ┌──────────────┐
       └───────────> │   ACTIONS    │ ──> │     KRIs     │
                     │ (Fix Config) │     │ (Failed Log) │
                     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  GOVERNANCE  │
                     │  (Sign-off)  │
                     └──────────────┘
```

- **Controls**: Preventative, detective, or corrective controls with live pass/fail test status.
- **Evidence**: Cryptographically signed audit documentation with validity expiration tracking.
- **Actions**: Multi-action task management with SLA tracking, assignees, and progress bars.
- **KRIs**: Quantitative operational metrics signaling early deterioration before breaches occur.
- **Governance**: Formal Risk Acceptance sign-off with audit trail justification.

---

## Slide 4: Quantitative Scoring & Appetite Enforcement

Standardized $5 \times 5$ methodology replacing qualitative tags:

| Metric | Calculation | Enterprise Meaning |
| :--- | :--- | :--- |
| **Inherent Risk** | $P_{\text{inh}} \times I_{\text{inh}}$ | Total exposure before internal controls are applied |
| **Control Effectiveness** | $\sum \text{Control Weight} \times \text{Rating}$ | Empirical reduction factor derived from testing ($0\%–100\%$) |
| **Residual Risk** | $P_{\text{res}} \times I_{\text{res}}$ | Net remaining organizational exposure |
| **Risk Appetite** | Threshold: $\le 15$ | Configurable limit. Breaches trigger automated executive alerts |

---

## Slide 5: Dual-Tier AI Copilot Architecture

To guarantee high availability and enterprise zero-hallucination compliance:

1. **Primary High-Speed Tier**:
   - Engine: **Groq (`qwen/qwen3.8-27b`)**
   - Latency: **$<180\text{ms}$**
   - Use Cases: Real-time risk generation, natural language queries, chat copilot.
2. **Secondary Deep-Reasoning Tier**:
   - Engine: **Google Gemini (`models/gemini-3.8-flash`)**
   - Authentication: Direct `x-goog-api-key` header verification.
   - Use Cases: Complex C-Suite briefing synthesis, Monte Carlo parameter tuning, multi-framework compliance cross-mapping.
3. **Enterprise Grounding Guarantee**:
   - Copilot recommendations are grounded in application records.
   - AI cannot silently modify official risk scores or approval states.

---

## Slide 6: Enterprise Security & Audit Integrity

- **Append-Only SOC 2 Audit Trail**: Replaced cosmetic client-side hashes with an immutable system log tracking `timestamp`, `actor`, `IP`, `event_type`, and `diffs`.
- **Role-Based Access Control (RBAC)**: Configurable roles:
  - `Admin`: Full system configuration and user management.
  - `Risk Manager`: Risk creation, scoring, treatment assignment.
  - `Control Owner`: Evidence upload, control test execution.
  - `Executive / Auditor`: Read-only access, board reports, approval sign-off.
- **Tenant Isolation**: Row-Level Security (RLS) policies enforcing organizational boundaries.

---

## Slide 7: Live Infrastructure Status

| Component | Provider / Platform | Current Health |
| :--- | :--- | :--- |
| **Frontend Application** | Vercel (Edge Network) | 🟢 **Live (68 Routes Compiled)** |
| **Backend API Engine** | Render (`risk-register-copilot-1.onrender.com`) | 🟢 **Active (Health OK)** |
| **Authoritative Database**| Supabase (PostgreSQL 15) | 🟢 **Connected (10 Core Risks)** |
| **AI Processing Engines** | Groq & Google Gemini 3.8 Flash | 🟢 **Authenticated & Operational** |

---

## Slide 8: Summary of Intern Review Deliverables

All 12 requirements outlined in §18 of the MNB Research Report have been delivered:

1. ✅ **Working Application** — Synchronized across GitHub remotes and deployed live.
2. ✅ **Database Documentation** — Relational schema covering all 7 core entities.
3. ✅ **User-Flow Specifications** — 10-stage lifecycle workflow documentation.
4. ✅ **API Documentation** — Complete RESTful endpoint catalog.
5. ✅ **RBAC Matrix** — 4-tier permission model implemented.
6. ✅ **Security Checklist** — SOC 2 compliance, HTTPS, RLS, CSP headers.
7. ✅ **Functional Test Cases** — 11/11 automated tests passing in Vitest.
8. ✅ **AI Evaluation Benchmark** — Grounded prompts with anti-hallucination guardrails.
9. ✅ **Enterprise Dataset** — Real-world risks, controls, and actions populated.
10. ✅ **Setup Guide** — Step-by-step local and production deployment instructions.
11. ✅ **Technical Debt Register** — Documented in delivery report.
12. ✅ **Future Roadmap (P1/P2)** — Jira/ServiceNow bi-directional sync, SOX automated testing.

---

*Prepared by Business Operations & AI Product Engineering Intern for MNB Research Review*
