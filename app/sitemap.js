// Keep FIRM_IDS / BLOG_SLUGS in sync with the FIRMS and BLOG_POSTS arrays
// in app/page.js. These deep-link query params are read on load by the SPA.
const FIRM_IDS = ['tradeify', 'lucid', 'alphaF', 'topstep', 'bulenox'];

const BLOG_SLUGS = [
  'what-is-a-prop-firm', 'how-prop-firm-payouts-work', 'understanding-payout-splits',
  'drawdown-types-explained', 'best-prop-firms-for-beginners', 'prop-firm-activation-fees',
  'tradeify-vs-my-funded-futures', 'fastest-payout-prop-firms', 'prop-firm-mistakes-to-avoid',
  'prop-firm-taxes', 'prop-firm-scaling-plans', 'trading-platforms-for-prop-firms',
  'news-trading-prop-firms', 'consistency-rules-explained', 'account-stacking-strategy',
  'sim-funded-vs-live-funded', 'how-to-choose-account-size', 'prop-firm-vs-personal-account',
];

export default function sitemap() {
  const base = 'https://shopprops.co';
  const now = new Date();

  const core = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/?view=firms`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/?view=compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/?view=deals`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/?view=blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/?view=learn`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/giveaway`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  const firms = FIRM_IDS.map(id => ({
    url: `${base}/?firm=${id}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8,
  }));

  const posts = BLOG_SLUGS.map(slug => ({
    url: `${base}/?post=${slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6,
  }));

  return [...core, ...firms, ...posts];
}
