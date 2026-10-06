/* Shared code for every page: data access, ads, header/footer, helpers. */
(function () {
  const S = window.SITE || {};
  const LIVE = !!(S.supabaseUrl && S.supabaseAnonKey && window.supabase);
  const db = LIVE ? window.supabase.createClient(S.supabaseUrl, S.supabaseAnonKey) : null;

  // ── demo games (used until Supabase is configured) ───────────────
  const day = 864e5;
  const ago = (n) => new Date(Date.now() - n * day).toISOString();
  const DEMO = [
    { slug: "slide-15", title: "Slide 15", category: "Logic",
      description: "The classic sliding-tile puzzle. Put tiles 1 to 15 back in order in as few moves as you can.",
      tags: ["logic", "classic", "tiles"], thumbnail_url: "slide-15.svg",
      src: "slide-15.html", publish_at: ago(2), plays: 0 },
    { slug: "times-table-sprint", title: "Times Table Sprint", category: "Math",
      description: "Sixty seconds, as many multiplication answers as you can. Wrong answers cost you three seconds.",
      tags: ["math", "tables", "speed"], thumbnail_url: "times-table-sprint.svg",
      src: "times-table-sprint.html", publish_at: ago(1), plays: 0 },
    { slug: "capital-quest", title: "Capital Quest", category: "Geography",
      description: "Ten rounds: pick the capital of each Indian state. Learn the map one answer at a time.",
      tags: ["india", "states", "quiz"], thumbnail_url: "capital-quest.svg",
      src: "capital-quest.html", publish_at: ago(0), plays: 0 },
  ];

  const LIST_COLS = "id,slug,title,description,category,tags,thumbnail_url,external_url,publish_at,plays";

  function number(list) {
    const asc = [...list].sort((a, b) => new Date(a.publish_at) - new Date(b.publish_at));
    asc.forEach((g, i) => (g.no = i + 1));
    return asc.reverse(); // newest first
  }

  async function listGames() {
    if (!LIVE) return number(DEMO.map((g) => ({ ...g })));
    const { data, error } = await db.from("games").select(LIST_COLS).order("publish_at", { ascending: false });
    if (error) throw error;
    return number(data || []);
  }

  async function getGame(slug) {
    if (!LIVE) {
      const all = await listGames();
      return all.find((g) => g.slug === slug) || null;
    }
    const { data, error } = await db.from("games").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const { count } = await db.from("games").select("id", { count: "exact", head: true }).lte("publish_at", data.publish_at);
    data.no = count || null;
    return data;
  }

  async function countPlay(slug) {
    if (!LIVE) return;
    try { await db.rpc("increment_plays", { game_slug: slug }); } catch (e) { /* not critical */ }
  }

  // ── ads ──────────────────────────────────────────────────────────
  let adsScript = false;
  function fillAds(root = document) {
    const client = (S.adsenseClient || "").trim();
    root.querySelectorAll(".ad[data-slot]:not([data-ready])").forEach((el) => {
      el.dataset.ready = "1";
      const slotId = (S.adSlots || {})[el.dataset.slot];
      if (client && slotId) {
        if (!adsScript) {
          const s = document.createElement("script");
          s.async = true; s.crossOrigin = "anonymous";
          s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(client);
          document.head.appendChild(s);
          adsScript = true;
        }
        const ins = document.createElement("ins");
        ins.className = "adsbygoogle";
        ins.style.display = "block";
        ins.dataset.adClient = client;
        ins.dataset.adSlot = slotId;
        ins.dataset.adFormat = el.dataset.format || "auto";
        ins.dataset.fullWidthResponsive = "true";
        el.appendChild(ins);
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
      } else if (S.showAdPlaceholders) {
        el.classList.add("placeholder");
        el.textContent = "Ad space · " + el.dataset.slot;
      } else {
        el.hidden = true;
      }
    });
  }

  // ── chrome ───────────────────────────────────────────────────────
  function chrome(active) {
    const name = esc(S.name || "Games");
    const h = document.getElementById("site-header");
    if (h) {
      h.className = "site-header";
      h.innerHTML = `<div class="wrap">
        <a class="brand" href="index.html" aria-label="${name} home"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 30 30"><path d="M6 27c0-6 18-5 18-11S10 10 10 4" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M6 27c0-6 18-5 18-11S10 10 10 4" fill="none" stroke="var(--accent)" stroke-width="1.4" stroke-dasharray="2.4 2.6" stroke-linecap="round"/></svg></span>${name}</a>
        <nav class="nav">
          <a href="index.html#all" ${active === "home" ? 'aria-current="page"' : ""}>Games</a>
          <a href="about.html" ${active === "about" ? 'aria-current="page"' : ""}>About</a>
        </nav></div>`;
    }
    const f = document.getElementById("site-footer");
    if (f) {
      f.className = "site-footer";
      f.innerHTML = `<div class="wrap">
        <span>© ${new Date().getFullYear()} ${name}${S.company ? " by " + esc(S.company) : ""}. Original games, one a day.</span>
        <nav><a href="about.html">About &amp; contact</a><a href="privacy.html">Privacy policy</a></nav></div>`;
    }
    document.querySelectorAll("[data-site-name]").forEach((el) => (el.textContent = S.name || ""));
    fillAds();
  }

  // ── helpers ──────────────────────────────────────────────────────
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
    catch (e) { return ""; }
  }
  function issue(no) { return no ? "No. " + String(no).padStart(3, "0") : ""; }
  function hue(str) { let h = 0; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
  function thumbHTML(g) {
    if (g.thumbnail_url) return `<img src="${esc(g.thumbnail_url)}" alt="" loading="lazy">`;
    const initials = esc((g.title || "?").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase());
    return `<div class="fallback-thumb" style="background:hsl(${hue(g.slug)} 35% 28%)">${initials}</div>`;
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }
  function slugify(s) {
    return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  }

  window.App = { S, LIVE, db, listGames, getGame, countPlay, fillAds, chrome, esc, fmtDate, issue, thumbHTML, toast, slugify };
})();
