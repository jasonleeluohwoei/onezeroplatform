# AgencyOS — Social Media Agency Operating System

A complete internal operating system for a social media / content marketing agency: from **lead → client → content → production → delivery → payment → renewal**, plus the internal modules that keep the agency running (staff, equipment, learning, timeline).

Built as a **static single-page app** — no backend required. All data is stored in the browser (localStorage) and can be exported/imported as JSON. UI is **English-first with full Chinese (中文) support**.

---

## 1. Modules

| # | Module | What it does |
|---|--------|--------------|
| 1 | **Dashboard** | Clients / Finance / Content / Team / Equipment / Timeline / Sales pipeline at a glance |
| 2 | **Staff Management** | Profile, role, department, contacts, work status, assigned clients & projects, workload |
| 3 | **Potential Clients (Leads)** | Full sales pipeline kanban, lead source, follow-up reminders, proposal & quotation tracking, **Convert Lead → Client** |
| 4 | **Client Management** | Company profile, contacts, social accounts, industry, cooperation status, account manager & team |
| 5 | **Subscriptions / Packages** | Package, monthly fee, contract value, cycle, content / video / photo / shoot credits, remaining credits, contract dates |
| 6 | **Payments** | Invoice, due date, paid amount, status, outstanding, overdue, method, monthly revenue |
| 7 | **Equipment** | Camera / lens / gimbal / lighting / audio… with serial no., warranty, borrow & return log, maintenance log, status |
| 8 | **Content Proposal** | Idea → Draft → Internal Review → Sent → Client Review → Approved → Production, with client feedback + version history |
| 9 | **Production / Shooting** | Date, time, location, crew, talent, equipment, shot list, status |
| 10 | **Media Library** | RAW / JPG / MOV / MP4 / Audio / B-Roll / Thumbnail / Graphics, grouped by Client → Campaign → Project → Shooting Date |
| 11 | **Video Editing** | Footage → Editing → Draft V1 → Client Review → Revision V2 → Final Approved → Published, with **version control (V1/V2/V3/Final)** |
| 12 | **Timeline** | Daily / Weekly / Monthly views + List / Kanban / Calendar, task, assignee, deadline, priority, status |
| 13 | **Learning / Knowledge Base** | 14 categories, difficulty, progress, personal notes, To Learn → Learning → Completed |
| 14 | **Settings** | Language (EN / 中文), light / dark theme, export / import / reset data |

---

## 2. Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build
npm run smoke        # headless render test of all 14 pages
```

> The `dist/` build uses relative asset paths + hash routing, so you can also **open `dist/index.html` directly** in a browser (double-click) with no server at all.

---

## 3. Deploy free on GitHub Pages

The repo already contains `.github/workflows/deploy.yml` — it builds and publishes automatically on every push to `main`.

**Steps:**

1. Create a new repository on GitHub (e.g. `agency-os`) and push this folder:

```bash
cd agency-os
git init
git add .
git commit -m "feat: AgencyOS initial release"
git branch -M main
git remote add origin https://github.com/<your-username>/agency-os.git
git push -u origin main
```

2. In the repository, go to **Settings → Pages → Build and deployment**, set **Source = GitHub Actions**.

3. Wait for the `Deploy AgencyOS to GitHub Pages` workflow to finish. Your link will be:

```
https://<your-username>.github.io/agency-os/
```

The app works on any sub-path (hash routing + relative assets), so the repo name can be anything.

### Other free hosting options

| Platform | How | Notes |
|----------|-----|-------|
| **Cloudflare Pages** | Connect the repo, build command `npm run build`, output `dist` | Unlimited bandwidth, fastest global CDN |
| **Vercel / Netlify** | Connect repo (auto-detected Vite) or drag & drop `dist` | Zero config, instant preview links |
| **GitHub Pages** | Included workflow (above) | 100% free, 1 GB soft limit |

---

## 4. Data & backup

- Data lives in `localStorage` on the device that uses it (single-user mode, as chosen).
- **Settings → Export Data** downloads a full JSON backup; **Import Data** restores it.
- Keep regular backups — clearing browser data will remove the workspace.
- Want multi-user shared data later? The data layer (`src/data/store.tsx`) is isolated behind a single `useData()` hook, so it can be swapped to Supabase / Cloudflare D1 without touching the UI.

---

## 5. Language

- **English is the primary language**; switch to 中文 anytime via the top-right `EN / 中文` toggle or **Settings → Language**.
- Choice is remembered per device.

---

## 6. Tech stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3 · lucide-react · HashRouter. No backend, no external services — a single static bundle (~360 KB JS / 106 KB gzipped).
