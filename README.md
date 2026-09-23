# Risk Register Copilot 🛡️✨

**Risk Register Copilot** is a modern B2B SaaS web application designed for Project Managers, Operations Teams, and Team Leads. It converts project threats written in plain natural language into structured, quantitative risk registers with proactive mitigation and contingency plans.

![Risk Register Copilot](https://raw.githubusercontent.com/itzdevilsunny/risk-register-copilot/main/public/preview.png)

## 🌟 Key Features

- **Modern Enterprise Dashboard**: Minimal, Linear/Vercel-inspired UI with KPI cards, 5×5 Probability × Impact Risk Matrix, and real-time Copilot telemetry insights.
- **Natural Language AI Risk Analyzer**: Describe potential risks in plain English and let Copilot structure fields ($P \times I$ score calculation, severity rating, suggested owners, mitigation strategies, and fallback contingencies).
- **Centralized Risk Register**: Interactive table with multi-filter pills (Severity, Category, Status, Owner), multi-column sorting, row expandability with action items checklist, inline status editing, and one-click CSV export.
- **Deep-Dive Risk Detail View**: 6-section breakdown including score gauge bar ($1 \dots 25$ scale), primary & backup ownership, progress tracking, audit log timeline, and telemetry recommendation triggers.
- **Projects, Analytics & Team Workload**: Overview of active project health, Recharts analytical charts (trend velocity, domain categories, workload by owner), and team directory.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **UI Components**: Modern custom enterprise components

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/itzdevilsunny/risk-register-copilot.git

# Navigate into project directory
cd risk-register-copilot

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Production Build

```bash
npm run build
npm run start
```

## 📄 License

MIT
