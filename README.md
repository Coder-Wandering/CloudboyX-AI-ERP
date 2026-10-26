# CloudboyX Gateway & ERP General Ledger

A full-stack, self-contained ERP translation gateway, double-entry general ledger, and automated audit guardrail system.

Translates multi-channel commerce feeds (Shopify, CSV/Flat-File, EDI ANSI X12, and Optical QR / OCR Ingestion) into a standardized Canonical Schema, then executes double-entry SQL transaction posting with real-time balance sheet verification, PDF/CSV/IIF exports, and automated risk threshold alerts.

---

## 🚀 Running the App Locally (Self-Contained)

You **do not need Google Cloud** to run this application. The entire backend, relational database engine (in-memory SQL), frontend UI, camera barcode scanner, and reporting systems are completely self-contained.

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** (comes with Node.js) or **pnpm** / **yarn** / **bun**

---

### Step 1: Clone or Download from GitHub
```bash
git clone https://github.com/your-username/cloudboyx-gateway.git
cd cloudboyx-gateway
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables (Optional)
Copy the example environment file:
```bash
cp .env.example .env
```

Contents of `.env`:
```env
PORT=3000
# Optional: Required only if using AI-assisted document parsing features
# Get a free API key at https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note:** The core application (ERP gateway, double-entry bookkeeping, Chart of Accounts, QR scanner, exports, threshold rules, SQL workbench) runs 100% locally even without an API key!

### Step 4: Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Deployment

To build a standalone production bundle:

```bash
# 1. Build the Vite frontend and bundle the Express server
npm run build

# 2. Run the production server
npm start
```

The production server starts on port `3000` (or the port defined in `process.env.PORT`).

---

## 🐳 Docker Deployment (Optional)

You can containerize and run the app anywhere (Docker, AWS ECS, DigitalOcean, Render, Fly.io, Railway, etc.):

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t cloudboyx-gateway .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_key" cloudboyx-gateway
```

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Motion (Framer Motion).
- **Backend API**: Node.js, Express, tsx.
- **Database Engine**: In-memory relational SQL powered by `alasql` (simulating transactional double-entry accounting with accounts, transactions, and journal entries).
- **Barcode & Optical Ingestion**: Real-time camera QR decoder via WebRTC MediaDevices and `jsqr`.
- **Export Engines**: Client-side vector PDF generation (`jspdf` + `html2canvas`), QuickBooks IIF export, and CSV downloads.
- **AI Integration**: Optional `@google/genai` TypeScript SDK for automated semi-structured invoice parsing and natural language SQL query assistance.
