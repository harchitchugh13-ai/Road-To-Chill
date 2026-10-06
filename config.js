// ─────────────────────────────────────────────────────────────
//  SITE SETTINGS — the only file you need to edit.
//  Leave the Supabase fields empty to run in demo mode
//  (the three starter games in /games are shown instead).
// ─────────────────────────────────────────────────────────────
window.SITE = {
  name: "Road to Chill",
  tagline: "One new puzzle game every day. Take a short break that makes you sharper.",
  company: "",            // optional, e.g. "Solnexgen" shows "by Solnexgen" in the footer

  // Supabase → Project Settings → API
  supabaseUrl: "",       // e.g. "https://abcdxyz.supabase.co"
  supabaseAnonKey: "",   // the "anon public" key (safe to publish)

  // Google AdSense → Account → Account information
  adsenseClient: "",     // e.g. "ca-pub-1234567890123456"

  // AdSense → Ads → By ad unit → Display ads. Paste each unit's data-ad-slot number.
  adSlots: {
    top: "",      // banner under the header (every page)
    feed: "",     // inside the game grid on the home page
    side: "",     // sidebar next to the game (desktop)
    below: ""     // under the game while playing
  },

  // Show dashed "Ad space" boxes while AdSense isn't set up yet.
  // Set to false before you go public if you don't want visitors to see them.
  showAdPlaceholders: true,

  contactEmail: "",   // shown on the About page
  categories: ["Puzzle", "Math", "Words", "Geography", "Science", "Logic", "Arcade"]
};
