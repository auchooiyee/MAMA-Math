# Math Mama: Warung Matematik

> **MASAK. KIRA. UNTUNG. MENANG.**  
> **COOK. CALCULATE. PROFIT. MASTER.**

An educational cooking simulation and restaurant management game aligned with the Malaysian **Form 4 KSSM Mathematics** curriculum, built with **Phaser 3** and **Vite**.

---

## 🌐 Localization

- **Default Language**: **English (`en`)**
- **Supported Language**: **Bahasa Melayu (`ms`)**
- Seamless language switching toggle directly accessible from the **Main Menu** and top right **HUD** during gameplay.
- All game text, customer dialogue, cooking instructions, mathematics questions, and solutions are fully dual-language localized in `/src/locales/en.json` and `/src/locales/ms.json`.

---

## 🎮 Playable Vertical Slice (Phase 1)

1. **Main Menu**: Interactive title screen with profile stats (Level, RM Coins, Stars) and instant language / audio toggles.
2. **Gerai Tepi Jalan (Warung)**: Customers order **Nasi Lemak Sambal Sotong** at Mak Cik Salmah's stall.
3. **Form 4 Bab 1 Quadratic Challenge**:
   - Practical real-world problem: Calculating rectangular banana leaf tray dimensions ($x(x + 4) = 48 \Rightarrow x = 6\text{ cm}$).
   - Steaming curve vertex calculation ($P(t) = -t^2 + 10t \Rightarrow t = 5\text{ min}$).
   - Multi-tier hint system and full step-by-step mathematical reasoning.
4. **Interactive Cooking Mini-Games**:
   - **ChopGame**: Slicing fresh cucumbers with knife timing & precision.
   - **MeasureGame**: Measuring coconut milk (santan) with interactive hold-to-pour physics.
5. **Economic Ledger & Progression**:
   - Real Malaysian Ringgit (RM) calculations: Gross Revenue, Ingredient Costs (affected by waste/math errors), and Net Profit.
   - Star ratings (1–3 Stars + Perfect Bonus), XP, and Level Ups.
   - Equipment Upgrade Shop: Spend earned profits on *Santoku Chef Knife* and *Cast-Iron Kuali*.
   - Offline `localStorage` save system.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
Production output is created in the `dist/` directory.

---

## Deploy to Render with Classroom Realtime

The game is configured as a Render Static Site in `render.yaml`. Realtime is intentionally used only for classroom and cross-device multiplayer rooms. Solo play and local shared-screen play do not connect to Supabase, and there is no public or persistent leaderboard.

### 1. Create the Supabase Realtime project

1. Create a Supabase project.
2. In the Supabase dashboard, copy the **Project URL** and **Publishable key**.
3. Copy `.env.example` to `.env.local` for local testing and fill in:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Only use the browser-safe publishable key. Never add a Supabase secret/service-role key to a Vite environment variable.

### 2. Deploy on Render

1. Push the project to a Git provider supported by Render.
2. In Render, choose **New > Blueprint** and select the repository. Render will read `render.yaml`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` when prompted.
4. Deploy. The build command is `npm ci && npm run build`; the published folder is `dist`.

After deployment, create a multiplayer or classroom room on one device and join the displayed room code on another. The room screen shows **LIVE REALTIME** when Supabase is connected. Without Supabase variables, it shows the local-development fallback instead.

### Realtime data policy

- Broadcast and Presence carry temporary room actions and connected-player state.
- Scores are not written to a leaderboard database.
- Room messages are ephemeral; refreshing after everyone leaves does not restore a room.
- The current public-channel setup is suitable for a prototype or supervised trial. Before a school-wide launch, add Supabase Auth and private-channel authorization so room access can be restricted to authenticated classes.
