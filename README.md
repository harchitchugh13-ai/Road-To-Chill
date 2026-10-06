# Road to Chill — daily games website

A free-to-run website where you publish one original browser game a day and earn from Google AdSense.

- **Home page** – "Today's puzzle" on a chalkboard, then every past game numbered by day (No. 001, No. 002…), with search and category filters.
- **Play page** – click-to-play game stage, full screen, restart, copy link, play counter, "more games".
- **Studio** (`admin.html`) – sign in, upload a game file + cover, schedule it for any date, edit or delete. Shows which of the next 7 days still need a game.
- **Ads** – four AdSense positions (top banner, in-feed, sidebar, below game). Ads sit around the game, never over it, which keeps you inside AdSense policy.
- **AdSense requirements included** – Privacy policy, About/contact page, `ads.txt`, `robots.txt`.
- **3 starter games** in `/games` – Capital Quest (Indian state capitals), Times Table Sprint, Slide 15.

Running cost: ₹0 for hosting and database. A domain (usually under ₹1,500 a year) is the only purchase, and you need one for AdSense.

---

## Try it first (2 minutes)

Upload the folder to Netlify as-is (step 2). With no Supabase keys, the site runs in **demo mode** and shows the three starter games, so you can see the design and ad positions immediately.

## 1. Create the database (Supabase, free)

1. Go to **supabase.com** → Start your project → sign in with GitHub or Google → **New project**. Pick region **Mumbai (ap-south-1)**. Save the database password somewhere.
2. Left menu → **SQL Editor** → New query → paste everything from `schema.sql` → **Run**.
3. Create your login:
   - a. **Authentication → Users → Add user → Create new user**. Enter your email + a strong password, tick *Auto confirm*.
   - b. Copy that user's **User UID**. Back in SQL Editor run:
     `insert into public.admins (user_id) values ('PASTE-UID-HERE');`
   - c. **Authentication → Sign In / Providers → Email** → turn **off** "Allow new users to sign up" so nobody else can create an account.
4. **Project Settings → API**: copy the **Project URL** and the **anon public** key into `config.js`.

## 2. Put the site online (Netlify, free)

**Easiest:** on a computer, open **app.netlify.com/drop** and drag the whole `roadtochill` folder onto the page. You get a link like `puzzlepath-123.netlify.app` in seconds.

**Better for daily work:** put the folder in a GitHub repo and connect it in Netlify (Add new site → Import from Git). Any change to `config.js` then redeploys automatically.

Note: daily games do **not** need a redeploy. They go into Supabase through the Studio page.

## 3. Upload games every day

Open `https://yoursite/admin.html` (on phone or laptop) → sign in → fill the form:

| Field | Tip |
|---|---|
| Title | Short and clear: "Fraction Pizza", "Monsoon Word Hunt" |
| Web address | Filled from the title automatically |
| Goes live | Defaults to your next empty day, so you can upload a week in one sitting |
| Description | 1–2 sentences: what the player does and what they learn. Google reads this, so make it original. |
| Cover image | 4:3, under 1 MB (800×600 JPG/WebP is ideal) |
| Game | **.html file** for single-file games, or **link** for bigger builds |

**Game file rules:** one self-contained `.html` file (code, styles, images as data URLs all inside). Games run in a sandbox, so `localStorage` may be blocked; wrap it in `try { } catch { }` like the starter games do. Bigger multi-file builds (Unity WebGL, Godot, Construct exports) → upload to **itch.io** (free, set to "HTML" and embeddable) or a separate Netlify site, then use "Link to hosted build".

**Turning your ideas into games:** describe the concept to Claude and ask for *"a single-file HTML5 game, mobile-friendly, touch controls, no external files"*. You get a file you can upload directly.

## 4. Turn on ads (Google AdSense)

1. Buy a domain (e.g. on Namecheap, GoDaddy or Hostinger) and connect it in Netlify → Domain management. AdSense does not approve `netlify.app` addresses.
2. Edit `privacy.html`: replace the bracketed parts with your name, city and email. Put your email in `config.js` → `contactEmail`.
3. Build up content first. Apply when you have roughly 15–20 games live with real descriptions; thin sites are the most common rejection reason.
4. Apply at **adsense.google.com** with your domain. To verify, use the **ads.txt** or **meta tag** option (there's a marked spot in `index.html` for the meta tag).
5. After approval:
   - Put your `ca-pub-…` ID in `config.js` → `adsenseClient`.
   - Edit `ads.txt`: replace `pub-0000000000000000` with your number (without `ca-`).
   - AdSense → Ads → **By ad unit** → create 4 *Display* units (top, feed, side, below). Paste each `data-ad-slot` number into `config.js` → `adSlots`.
   - Set `showAdPlaceholders: false`.

**Later upgrade:** Google's **H5 Games Ads** (Ad Placement API) adds rewarded and between-level ads inside games, which pays more than banners. It needs a separate application once you have steady traffic.

## Growing revenue

Ad income tracks traffic, so plan for distribution as well as uploads:
- Share each day's game link in WhatsApp groups, Instagram stories and teacher communities; "Game No. 027 is up" makes a habit.
- Education-themed games (class-wise maths, state GK, science) get shared by teachers and parents.
- Also publish games on **CrazyGames**, **Poki** or **GameDistribution**; they have big audiences and share ad revenue, and can link people back to your site.
- Watch the **Plays** column in the Studio and make more of what works.

## Files

```
index.html      home page
play.html       game page (play.html?g=game-slug)
admin.html      upload studio (not indexed by Google)
about.html      about & contact
privacy.html    privacy policy (needed for AdSense)
config.js       ← all your settings
style.css, app.js   shared style and code
capital-quest / times-table-sprint / slide-15   starter games (.html) and covers (.svg)
schema.sql      database setup script
ads.txt, robots.txt
```

To rename the site, change `name` in `config.js` and the `<title>` lines at the top of each HTML file.
