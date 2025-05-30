# 🩺 Daily Claims CSV Ingestion – Front-End Take-Home Project

This project is a front-end solution for ingesting and reviewing healthcare claim data from a daily CSV export. The tool allows for CSV upload, validation, and browsing of claims with filters, sorting, and summary insights.

## 🚀 Tech Stack

- **React + Vite** – Fast front-end tooling
- **TypeScript** – Safer, scalable code
- **shadcn/ui** – Beautiful and accessible UI components
- **Tailwind CSS** – Utility-first styling
- **Framer Motion** – Smooth UI animations
- **MSW (Mock Service Worker)** – Local API mocking for realistic UX

---

## 📦 Setup Instructions

```bash
# 1. Clone the repo
git clone (https://github.com/JulioJCLF/Csv-Ingestion.git)
cd Csv-Ingestion

# 2. Install dependencies
yarn install

# 3. Run the app
yarn dev
```

This will start the Vite dev server at `http://localhost:5173` with the mock API (via MSW) enabled.

---

## 📂 Project Structure

```bash
src/
├── components/         # UI Components (UploadForm, ClaimTable)
├── lib/                # Utility code (API, CSV parsing, mock handlers)
├── mocks/              # MSW setup for mocking API endpoints
├── pages/              # Main app/page entry (App.tsx)
└── styles/             # Tailwind config, global styles
```

---

## 📁 Features

### ✅ Upload and Ingest CSV
- Validates file contents (required fields, date format, positive integer amounts)
- Displays success/error summary with row-level feedback

### 🧾 Table of Claims
- View all successfully ingested claims
- Sort by `totalAmount`, `serviceDate`
- Filter by `memberId`, `startDate`, `endDate`
- Displays total value of filtered claims (in dollars)

### 🧪 Mocked Backend
- `POST /claims/upload` handles CSV and returns validation results
- `GET /claims` supports filter parameters

---

## 💡 Architecture Notes

- **CSV Parsing:** Done client-side using `papaparse`
- **Validation Rules:**
  - Required: `claimId`, `memberId`, `totalAmount`, `serviceDate`
  - Optional: `diagnosisCodes`
  - `totalAmount` must be a positive integer
  - `serviceDate` must be a valid date (ISO)
- **State Management:** Local state using React hooks
- **Mock API:** Simulates realistic behavior and error cases with MSW

---
