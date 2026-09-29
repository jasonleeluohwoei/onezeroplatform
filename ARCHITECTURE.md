# AgencyOS — Internal Design / 内部设计说明

> Social Media Agency Operating System — architecture, data model and extension guide.

---

## 1. Tech stack / 技术栈

| Layer | Choice | Why |
|---|---|---|
| UI | React 18 + TypeScript | Type-safe, huge ecosystem |
| Build | Vite 5 | Instant HMR, tiny static output |
| Styling | Tailwind CSS 3 | Apple-like utility styling, dark mode via `class` strategy |
| Icons | lucide-react | Consistent 1.5px line icons |
| Routing | react-router-dom **HashRouter** | Works on any static host / sub-path with zero server config |
| Data | `localStorage` (client-only) | Zero backend cost; swappable |
| Charts | Hand-rolled SVG/CSS bars | No heavy chart dependency |

No backend, no database server, no API keys. The entire app compiles to static files in `dist/`.

---

## 2. The core idea — schema-driven / 核心思路：配置驱动

Instead of hand-writing 14 different CRUD screens, the system is built around **one declarative
schema** (`src/data/schema.ts`) that describes every entity, and **one generic page component**
(`src/components/EntityPage.tsx`) that renders it.

```
        schema.ts  ─────────────────────────────┐
        (field definitions, EN/ZH labels,       │
         statuses, kanban key, search keys)     │
                                                ▼
   types.ts ──► store.tsx ──► EntityPage.tsx ──► form.tsx / render.tsx ──► ui.tsx
   (TS model)   (state+CRUD)  (list/board)      (auto form & cell render)  (primitives)
```

**Consequence:** adding a field to Clients is 3 lines in `schema.ts`.
Adding a whole new module is ~30 lines in `schema.ts` + a 30-line page file.

### Directory layout / 目录结构

```
agency-os/
├── src/
│   ├── main.tsx                 # React entry
│   ├── App.tsx                  # HashRouter + 14 routes
│   ├── index.css                # Tailwind + design tokens (ink/brand palette)
│   ├── data/
│   │   ├── types.ts             # 13 TS interfaces (Database, Staff, Client, Lead…)
│   │   ├── schema.ts            # ⭐ Entity definitions — the single source of truth
│   │   ├── seed.ts              # Realistic demo dataset (8 clients, 12 staff, 14 leads…)
│   │   └── store.tsx            # DataProvider + useData() — all state & persistence
│   ├── i18n/
│   │   ├── dict.ts              # UI strings EN/ZH
│   │   └── index.tsx            # I18nProvider, useI18n(), useTheme()
│   ├── lib/format.ts            # money, dates, month buckets, avatar colours
│   ├── components/
│   │   ├── ui.tsx               # Button, Card, Badge, Modal, Stat, Progress, Toast…
│   │   ├── form.tsx             # FieldControl — renders ANY field type automatically
│   │   ├── render.tsx           # RenderValue — renders ANY cell value + ID→name resolver
│   │   ├── EntityPage.tsx       # ⭐ Generic list + kanban + search + filter + CRUD
│   │   ├── Layout.tsx           # Sidebar, topbar, lang/theme switch, search
│   │   ├── StatsStrip.tsx       # Dashboard KPI tiles
│   │   └── WorkflowStrip.tsx    # Pipeline visualisation
│   └── pages/                   # 14 pages; 10 are thin wrappers over EntityPage
├── scripts/smoke-test.mjs       # jsdom smoke test over all 14 routes
├── .github/workflows/deploy.yml # GitHub Pages auto-deploy
└── dist/                        # Static build output
```

---

## 3. Data model / 数据模型

13 entities live in one flat `Database` object. Relations are by **ID reference**, not nesting,
so a record can be renamed/moved without rewriting its children.

```
leads ──(convert)──► clients ──► subscriptions ──► payments
                        │
                        ├──► proposals ──► shootings ──► media ──► videos
                        │
                        └──► tasks (Timeline)
staff ◄──(assignedTo / teamIds / accountManagerId)── all of the above
equipment ◄──(borrowed by shootings)
learning ──(assignedTo staff)
```

| Entity | Key relations | Notable fields |
|---|---|---|
| `leads` | → `staff` (owner) | stage (10-step pipeline), probability, nextFollowUp, `activities[]` sublist, `proposals[]` sublist, lostReason |
| `clients` | → `staff` (AM + team) | industry, socialAccounts[], status, startDate |
| `subscriptions` | → `clients` | quotas vs. used (content/videos/photos/shoots), billingCycle, endDate |
| `payments` | → `clients` | invoiceNo, dueDate, paidDate, amount, outstanding, method |
| `equipment` | → `staff` (holder) | serialNo, purchase, warranty, `borrowLog[]`, `repairLog[]` sublists |
| `proposals` | → `clients`, `campaigns` | 8-stage status, `versions[]` sublist, clientFeedback |
| `shootings` | → `clients`, `staff`, `equipment` | crew, talent, shotList, 5-stage status |
| `media` | → `clients`, `shootings` | fileType (RAW/JPG/MOV/MP4/Audio/B-Roll/…), location link, tags |
| `videos` | → `clients`, `staff` (editor) | **versions[] V1/V2/V3/Final**, approval + publish dates |
| `tasks` | → `clients`, `staff` | status, priority, dueDate, completedDate |
| `learning` | → `staff` | category, difficulty, progress %, status, notes |
| `staff` | ← referenced everywhere | role, department, clientIds[], projectIds[], skills[] |
| `campaigns` | → `clients` | (grouping layer for content) |

### Sub-records
Nested lists (lead activities, equipment borrow/repair logs, proposal versions, video versions)
use the `sublist` field type — stored inline as arrays, edited with an in-table `SubListEditor`.

---

## 4. State & persistence / 状态与持久化

`src/data/store.tsx` is the **only** place that touches storage.

```tsx
const LS_DB = 'agencyos.db.v1';          // localStorage key
useData() → { db, upsert, remove, removeMany, reset, clearAll, importDb, toast, storageKB }
```

- Load: `localStorage` → if empty, `buildSeed()` (demo data).
- Write: debounced 250 ms after any change.
- `upsert(entity, record)` auto-assigns `id`, stamps `createdAt` / `updatedAt`.
- `reset()` reloads demo data; `importDb()` accepts an exported JSON.

> **To make it multi-user later:** replace the body of `useData()` with Supabase / REST calls.
> The signature (`db`, `upsert`, `remove`) stays identical, so **no page or component changes**.

---

## 5. Rendering pipeline / 渲染管线

### A. Generic entity page
`EntityPage.tsx` reads `ENTITY_MAP[entity]` and automatically produces:
- search box (over `searchKeys`)
- status filter chips (from `statusKey` options)
- **List view** — sortable table, columns from `def.columns`
- **Board view** — kanban grouped by `kanbanKey`
- new / edit modal → auto-generated form
- delete with confirm, CSV export, empty state

### B. Field types (16 supported in `form.tsx` + `render.tsx`)

`text` `textarea` `number` `currency` `percent` `date` `select` `multiselect` `tags`
`email` `phone` `url` `ref` `refmulti` `boolean` `sublist`

`ref` renders a dropdown of another entity and stores its **ID**; `render.tsx` resolves IDs back
to human names on display (`useNameResolver`). Changing a client's name therefore updates every
table and card automatically.

### C. Pages
- **Thin pages** (Clients, Staff, Payments, Subscriptions, Proposals, Shootings, Equipment,
  Learning, Videos) are 30–100 lines: they call `<EntityPage entity="…" />` with a few props.
- **Custom pages**:
  - `Dashboard.tsx` — 7 KPI groups, revenue trend, content pipeline, follow-up reminders
  - `Leads.tsx` — sales pipeline kanban, activity timeline, **Convert Lead → Client**
  - `Media.tsx` — Client → Campaign → Project → Shoot date grouping, file-type gallery
  - `Timeline.tsx` — Day / Week / Month × **List / Kanban / Calendar** views
  - `Settings.tsx` — language, theme, JSON export/import, load demo data

---

## 6. i18n / 双语

Two complementary mechanisms:

1. **UI strings** — `i18n/dict.ts`, nested EN/ZH dictionaries, accessed as `t('nav.clients')`.
   Falls back to English if a key is missing.
2. **Schema labels** — every `FieldDef` carries `{ en, zh }` inline:

```ts
{ key: 'monthlyFee', en: 'Monthly Fee', zh: '月费', type: 'currency' }
```

`tf(field)` returns the right language. Keeping the two languages side by side means they can
never drift apart when a field is added.

Language + theme persist in `localStorage` (`agencyos.lang`, `agencyos.theme`).

---

## 7. Design system / 设计系统

- Palette: neutral `ink` ramp + Apple-blue `brand`, dark mode via `.dark` class.
- Radii 12–16 px, 0.5–1 px hairline borders, no heavy shadows, generous whitespace.
- Status colours come from one map: `STATUS_TONE` (status string → tone) and `TONE_CLASS`
  (tone → pill classes), so every module shows consistent badge colours.
- Components in `ui.tsx`: `Btn`, `Card`, `Badge`, `Avatar`, `AvatarStack`, `Modal`, `SearchBox`,
  `Segmented`, `Stat`, `Progress`, `Credits`, `Empty`, `Toasts`, `Confirm`.

---

## 8. Testing / 测试

`scripts/smoke-test.mjs` bundles the app with esbuild, mounts it in **jsdom**, walks all 14
hash routes and fails on any runtime error or empty render.

```bash
npm run smoke     # esbuild bundle → jsdom → 14 routes
npm run typecheck # tsc --noEmit
npm run build     # production build to dist/
```

---

## 9. Extending / 如何扩展

**Add a field to Clients** — one line in `CLIENTS.fields` (+ one in `columns` to show it):

```ts
{ key: 'tiktokHandle', en: 'TikTok', zh: 'TikTok 账号', type: 'text' }
```

**Add a new module** — 4 steps:
1. `types.ts`: interface + add to `Database` and `EntityName`.
2. `schema.ts`: `export const X: EntityDef = { … }`, add to `ENTITIES`.
3. `pages/X.tsx`: `export default () => <EntityPage entity="x" />`.
4. `App.tsx`: `<Route path="/x" element={<X />} />` + sidebar entry in `Layout.tsx`.

**Add a status value** — append to that field's `options`; add a colour in `STATUS_TONE`.

**Move to a real backend** — swap `store.tsx` internals only.

---

## 10. Limits of the current build / 当前版本边界

| Area | Current state |
|---|---|
| Data | Browser-local (per browser profile). Use Settings → Export for backups. |
| Files | Media/video stored as **links**, not uploads (no file server). |
| Auth | None — no login/roles yet. |
| Notifications | In-app only (dashboard + badges), no email/push. |
| Realtime | Single-user; refresh-based. |
