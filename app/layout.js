import './globals.css'

export const metadata = {
  title: 'ShopProps.co | Futures Prop Firm Comparison & Reviews',
  description: 'Independent comparisons of every major futures prop firm. Real data on payouts, rules, pricing, and verified promo codes. Compare Topstep, Apex, Tradeify, Lucid Trading, My Funded Futures, and more.',
  keywords: 'prop firm, futures prop firm, prop firm comparison, prop firm reviews, Topstep, Apex Trader Funding, Tradeify, Lucid Trading, My Funded Futures, Take Profit Trader, funded futures, prop firm payout, prop firm discount, prop firm promo code, BRITT, futures trading, funded trader',
  authors: [{ name: 'ShopProps' }],
  creator: 'ShopProps',
  publisher: 'ShopProps',
  metadataBase: new URL('https://shopprops.co'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ShopProps.co | The Prop Firm Comparison Traders Trust',
    description: 'Independent breakdowns of every major futures prop firm — accounts, platforms, payout rules, and verified promo codes. Built to help you pick fast and avoid getting burned.',
    url: 'https://shopprops.co',
    siteName: 'ShopProps',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopProps.co | Futures Prop Firm Comparison',
    description: 'Compare every major futures prop firm. Real data, no pay-to-rank, verified promo codes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ShopProps",
              url: "https://shopprops.co",
              description: "Independent futures prop firm comparison and reviews platform",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://shopprops.co/?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ShopProps",
              url: "https://shopprops.co",
              description: "Independent futures prop firm comparison platform. No pay-to-rank. Verified promo codes.",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is a prop firm?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "A proprietary trading firm (prop firm) provides traders with capital to trade financial markets. Instead of risking your own money, you trade with the firm's capital and share the profits, typically keeping 80-90% of what you make.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the best futures prop firm?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The best prop firm depends on your needs. Topstep is best for beginners (NFA registered, strong education). Tradeify offers the lowest total cost with $0 activation. Lucid Trading has the fastest payouts (~15 minutes). Apex allows up to 20 simultaneous accounts.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How fast do prop firms pay out?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Payout speed varies: Lucid Trading processes in ~15 minutes, My Funded Futures in ~1 minute, Tradeify same-day, Take Profit Trader same-day, Topstep 1-3 days, and Apex Trader Funding 10-13 business days.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is EOD vs intraday trailing drawdown?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "EOD (End-of-Day) trailing drawdown only updates at market close, giving more room for intraday volatility. Intraday trailing drawdown updates in real-time based on unrealized equity. EOD is generally easier for beginners.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
