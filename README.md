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

### Tuning the giveaway
- **Prizes, bonus amounts, social tasks**: edit the `PRIZES`, `REFERRAL_BONUS`, and `TASKS` constants at the top of `app/api/giveaway/route.js`.
- **Social task links / FAQ / copy**: edit `TASK_META` and `FAQS` in `app/giveaway/page.js`.
