import { siteConfig } from "@/lib/site-config";

const offers = [
  {
    name: "Exterior Reset",
    description: "Hand wash, decontamination, wheel detail, and paint sealant.",
  },
  {
    name: "Paint Correction",
    description: "Professional swirl, haze, oxidation, and defect removal.",
  },
  {
    name: "Ceramic Coating",
    description: "Professional 3–7 year paint protection and aftercare.",
  },
];

export function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    description:
      "Professional auto detailing, paint correction, ceramic coating, and interior care.",
    areaServed: "Austin, Texas",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4107 Metric Blvd",
      addressLocality: "Austin",
      addressRegion: "TX",
      addressCountry: "US",
    },
    priceRange: "$$",
    makesOffer: offers.map((o) => ({
      "@type": "Offer",
      name: o.name,
      description: o.description,
      seller: { "@type": "Organization", name: siteConfig.name },
    })),
    potentialAction: [
      {
        "@type": "ReserveAction",
        target: `${siteConfig.siteUrl}/#contact`,
        name: "Book an auto detail",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
