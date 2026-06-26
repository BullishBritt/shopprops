# ShopProps.co — Futures Prop Firm Comparison Platform

## Quick Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub
1. Go to [github.com/new](https://github.com/new) and create a new repository called `shopprops`
2. Open a terminal on your PC and run:

```bash
cd shopprops
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shopprops.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up / log in with GitHub
2. Click **"Add New Project"**
3. Import your `shopprops` repository
4. Click **"Deploy"** — Vercel auto-detects Next.js
5. Wait ~60 seconds for the build to complete
6. Your site is live at `shopprops.vercel.app`

### Step 3: Connect shopprops.co Domain
1. In Vercel, go to your project → **Settings** → **Domains**
2. Add `shopprops.co`
3. Vercel will show you DNS records to add
4. Go to your domain registrar and add the records:
   - Type: `A` → Value: `76.76.21.21`
   - Type: `CNAME` for `www` → Value: `cname.vercel-dns.com`
5. Wait 5-10 minutes for DNS to propagate
6. Vercel auto-provisions SSL (https)

## Affiliate Links
Currently configured:
- Lucid Trading: `lucidtrading.com/ref/BullishBritt`
- Tradeify: `tradeify.co/?ref=britt`
- Top One Futures: `toponefutures.com/...sourceId=britt`
- Alpha Futures: `app.alpha-futures.com/signup/Brittain001578/`
- Bulenox: `bulenox.com/member/aff/go/bullishbritt`

To add more: Edit `app/page.js`, find the firm in the `FIRMS` array, and change `affiliate:"#"` to `affiliate:"YOUR_LINK_HERE"`

## Promo Code
Code **BRITT** is displayed on every page. To change it, edit the `PROMO` constant at the top of `app/page.js`.

## 🎁 Viral Giveaway (`/giveaway`)
A TC-Trades-style referral giveaway lives at `/giveaway`. Entrants get a unique
referral link — each friend who joins earns them bonus entries, and social tasks
award more. The winner is drawn at random, weighted by entry count.

### Environment variables (set in Vercel → Settings → Environment Variables)
| Variable | Required | Purpose |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | yes | Upstash Redis REST URL (stores entries) |
| `UPSTASH_REDIS_REST_TOKEN` | yes | Upstash Redis REST token |
| `GIVEAWAY_ADMIN_SECRET` | yes (for admin) | Secret guarding the admin endpoint |
| `NEXT_PUBLIC_SITE_URL` | recommended | Public base URL used in referral links (e.g. `https://shopprops.co`) |
| `BLOB_READ_WRITE_TOKEN` | for receipt uploads | Auto-provisioned when you enable Vercel Blob (Storage tab). Stores uploaded receipts. Without it, proof submissions are still recorded (text only). |

Without Redis configured the page still renders and shows a "coming soon" state —
nothing breaks. Create a free database at [upstash.com](https://upstash.com) and
paste the two REST values into Vercel.

### Running / operating the giveaway (admin API)
All admin calls are `POST /api/giveaway/admin` with header `x-admin-secret: <GIVEAWAY_ADMIN_SECRET>`.

```bash
# Open entries with a 14-day countdown
curl -X POST https://shopprops.co/api/giveaway/admin \
  -H 'x-admin-secret: YOUR_SECRET' -H 'Content-Type: application/json' \
  -d '{"action":"start","endDate":"2026-07-15T23:59:59Z"}'

curl ... -d '{"action":"stats"}'          # totals + top entrants
curl ... -d '{"action":"draw","count":3}' # pick 3 winners, weighted by entries
curl ... -d '{"action":"stop"}'           # close entries
curl ... -d '{"action":"reset","confirm":"RESET"}'  # wipe all giveaway data
```

### Admin dashboard (`/admin`)
A no-code console lives at **`/admin`**. Sign in with your `GIVEAWAY_ADMIN_SECRET`
(stored in your browser only, sent as the `x-admin-secret` header). From there you can:
- **Overview** — live entrants, total entries, pending-proof count, leaderboard
- **Proofs** — see every uploaded receipt with image preview, approve (grants bonus entries) or reject
- **Winners** — draw weekly winner(s) weighted by entries, exclude past winners, view history
- **Controls** — start/stop entries, set the end date, advance the weekly round, reset all data

`/admin` is `noindex` and blocked in `robots.txt`. Everything it does is also available
as raw API calls (below) if you'd rather script it.

### Proof-of-code receipts → bonus entries
Traders who used your promo code can upload a receipt/screenshot at `/giveaway`
(the "Used code BRITT?" card). Each submission lands in a review queue; approving
it grants the entrant bonus entries (default **+25**) and ties their email to the
firm + code they used — so you can see exactly who is using your code.

```bash
# List pending receipts
curl ... -d '{"action":"proofs","status":"pending"}'
# Approve one (grants the bonus, default 25; override with "bonus")
curl ... -d '{"action":"approveProof","id":"p_xxx","bonus":25}'
# Reject one
curl ... -d '{"action":"rejectProof","id":"p_xxx","reason":"unreadable"}'
```

### Weekly winners
The giveaway tracks a `round` counter and logs every winner.

```bash
curl ... -d '{"action":"draw","count":1,"excludePastWinners":true}'  # draw this week's winner
curl ... -d '{"action":"winners"}'                                    # full winner history
curl ... -d '{"action":"newRound"}'                                   # advance to next week
```

A simple weekly cadence: each week run `draw` (logs the winner) → contact them at the
email they entered with → run `newRound`. Entries are cumulative across rounds; use
`excludePastWinners` so the same person can't win twice, or `reset` to start totals fresh.

### Tuning the giveaway
- **Prizes, bonus amounts, social tasks**: edit the `PRIZES`, `REFERRAL_BONUS`, and `TASKS` constants at the top of `app/api/giveaway/route.js`.
- **Proof bonus amount**: `PROOF_BONUS` in `app/api/giveaway/admin/route.js` (and the display value `PROOF_BONUS` in `app/giveaway/page.js`).
- **Social task links / FAQ / copy**: edit `TASK_META` and `FAQS` in `app/giveaway/page.js`.
- **Prop firm data / logos**: the `FIRMS` array and `FirmLogo` SVGs at the top of `app/page.js`. Drop official brand PNGs into `/public` and reference them to replace the placeholder SVGs.

## SEO / indexing
- **Structured data (JSON-LD)** in `app/layout.js`: `WebSite`, `Organization`, `FAQPage`, and an `ItemList` of firms with ratings. `app/giveaway/layout.js` adds giveaway metadata + a `BreadcrumbList`.
- **Breadcrumbs**: visible trail + `BreadcrumbList` JSON-LD on every sub-view (`renderBreadcrumb` in `app/page.js`).
- **Deep links**: the SPA reads `?view=`, `?firm=<id>`, and `?post=<slug>` on load, updating `<title>` and the canonical link so shared/indexed URLs open the right view. These URLs are listed in `app/sitemap.js`.
- **sitemap.xml / robots.txt**: every firm + blog post + the giveaway are in the sitemap; `/admin` and `/api/` are disallowed.
- **Note for max indexability**: the site is a single-page app, so all sub-views share one server-rendered URL. The deep links + sitemap get you indexed, but converting firm/blog views to real Next.js routes (`app/firms/[id]`, `app/blog/[slug]`) is the next step for the strongest per-page SEO — the data is ready to be split out.

## Infrastructure — all MCP-manageable
Everything this project runs on can be driven through MCP servers from Claude:
- **Vercel MCP** — deploy, inspect builds, read runtime logs/errors, manage the project and domains.
- **Upstash Redis** — the only datastore (entries, proofs, winners). REST-based; manageable via the Upstash console/API.
- **Vercel Blob** — receipt image storage, toggled on in the Vercel dashboard.
No bespoke servers, cron jobs, or databases to babysit — it's serverless routes + Redis + Blob, all behind Vercel.
