import React from 'react';

export type BreadcrumbItem = {
  name: string;
  item: string;
};

/**
 * Server Component untuk me-render Schema.org BreadcrumbList JSON-LD.
 * Membantu Google Search memahami hierarki URL dan menampilkan navigasi breadcrumb di SERP.
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.my.id';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: b.name,
      item: b.item.startsWith('http') ? b.item : `${baseUrl}${b.item.startsWith('/') ? b.item : `/${b.item}`}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
