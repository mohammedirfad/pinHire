export function StructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pinhire.online';

  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Pinhire',
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
      sameAs: [siteUrl],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Pinhire',
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/jobs?keyword={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
