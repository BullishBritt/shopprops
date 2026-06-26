export const metadata = {
  title: 'ShopProps Giveaway | Win a Fully Funded Prop Firm Account',
  description: 'Enter the free ShopProps giveaway for a chance to win a fully funded prop firm account. Share your link and upload proof you used code BRITT to earn bonus entries. Weekly winners.',
  keywords: 'prop firm giveaway, funded account giveaway, free funded account, trading giveaway, prop firm free, ShopProps giveaway, BRITT code',
  alternates: { canonical: '/giveaway' },
  openGraph: {
    title: 'ShopProps Giveaway — Win a Fully Funded Prop Firm Account',
    description: 'Free to enter. Share your link and upload proof you used code BRITT for bonus entries. Weekly winners.',
    url: 'https://shopprops.co/giveaway',
    siteName: 'ShopProps',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopProps Giveaway — Win a Funded Prop Account',
    description: 'Free to enter. Refer friends and upload proof of code BRITT for bonus entries.',
  },
};

export default function GiveawayLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shopprops.co' },
              { '@type': 'ListItem', position: 2, name: 'Giveaway', item: 'https://shopprops.co/giveaway' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
