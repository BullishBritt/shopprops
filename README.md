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
