# Calci — Voice CGPA Calculator

Calci is a mobile-first, voice-first CGPA calculator built with **React + Vite + TypeScript + Tailwind CSS**. Speak your subjects and grades, upload a marksheet, or enter them manually — Calci instantly computes your CGPA and percentage.

## Features

- 🎙️ **Voice input** via the Web Speech API (Chrome/Edge recommended)
- 📄 **Upload marksheet** with AI-powered extraction (via Lovable Cloud)
- ✍️ **Manual entry** with a dynamic add/remove table
- 📊 **Instant CGPA + percentage** result card
- 🎨 Clean, modern, mobile-first UI

**Grade scale:** O=10, A+=9, A=8, B+=7, B=6, C=5, U=0
**Percentage:** CGPA × 9.5

---

## Run locally

### Prerequisites
- [Node.js](https://nodejs.org/) **v18+** and npm

### Steps

```bash
# 1. Clone the repo
git clone <YOUR_REPO_URL>
cd calci

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open the URL printed by Vite (default: `http://localhost:8080`).

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Environment variables

The voice input, manual entry, and CGPA calculation work with **zero configuration**.

The **Upload Marksheet** feature uses Lovable Cloud (Supabase) for AI extraction. To enable it locally or in production, create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

> If you skip these, voice + manual entry still work — only the upload feature will be disabled.

---

## Project structure

```
calci/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── pages/
    │   ├── Index.tsx
    │   └── NotFound.tsx
    ├── components/calci/
    │   ├── MicButton.tsx
    │   ├── SubjectsTable.tsx
    │   ├── UploadMarksheet.tsx
    │   └── ResultCard.tsx
    ├── lib/
    │   ├── utils.ts
    │   └── calci/
    │       ├── grades.ts
    │       └── speech.ts
    └── integrations/supabase/
```

---

## Deploy to Vercel

Calci is a standard Vite SPA and deploys to Vercel in minutes.

### Option A — Deploy from the Vercel dashboard (recommended)

1. Push your project to GitHub / GitLab / Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the repository.
3. Vercel auto-detects **Vite**. Confirm the settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Under **Environment Variables**, add (only if you want Upload Marksheet):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
5. Click **Deploy**. Done — your app is live at `https://<project>.vercel.app`.

### Option B — Deploy via the Vercel CLI

```bash
npm install -g vercel
vercel login
vercel          # follow prompts → first deploy (preview)
vercel --prod   # promote to production
```

### SPA routing on Vercel

To make client-side routes (e.g. `/anything`) work on refresh, add a `vercel.json` at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## Browser support

Voice input requires the Web Speech API. Best supported in **Chrome**, **Edge**, and **Safari (latest)**. Firefox does not currently support it — manual entry and upload remain available.

---

## License

MIT