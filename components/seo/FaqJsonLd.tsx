// Server Component: me-render JSON-LD FAQPage untuk SEO.
// Dipakai di halaman-halaman kunci (beranda, tk-paud, kajian) agar berpeluang
// tampil sebagai rich result sekaligus memperkuat relevansi kata kunci target.
export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  if (faqs.length === 0) return null;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
