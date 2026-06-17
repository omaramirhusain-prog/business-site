import { siteConfig } from "@/lib/site-config";

const offers = [
  {
    name: "Landing",
    description: "Single-page site with 3D hero, motion, and contact flow.",
  },
  {
    name: "Signature",
    description: "Multi-page site with custom 3D and integrated AI agent.",
  },
  {
    name: "Custom",
    description: "Web apps, advanced AI agents, and integrations.",
  },
];

export function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    email: siteConfig.email,
    description:
      "Premium custom websites with 3D animation and integrated AI voice assistants.",
    areaServed: "Worldwide",
    serviceType: "Web Development",
    makesOffer: offers.map((o) => ({
      "@type": "Offer",
      name: o.name,
      description: o.description,
      seller: { "@type": "Person", name: siteConfig.name },
    })),
    potentialAction: [
      {
        "@type": "ReserveAction",
        target: `${siteConfig.siteUrl}/#contact`,
        name: "Book a discovery call",
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
