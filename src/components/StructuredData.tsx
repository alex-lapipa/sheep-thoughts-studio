import { Helmet } from "react-helmet-async";

const SITE_URL = "https://bubblesheep.xyz";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Sheep Thoughts Studio",
  alternateName: "Bubbles the Sheep",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/favicon.svg`,
    width: 512,
    height: 512,
  },
  description:
    "Official home of Bubbles the Sheep — a confidently wrong sheep from Wicklow who misinterprets everything with absolute certainty.",
  foundingDate: "2024",
  foundingLocation: {
    "@type": "Place",
    name: "Wicklow, Ireland",
  },
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${SITE_URL}/contact`,
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Sheep Thoughts Studio",
  description:
    "Explore the confidently incorrect wisdom of Bubbles the Sheep. Facts, merchandise, and philosophical musings from Ireland's most misguided sheep.",
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: ["en", "es"],
};

const characterSchema = {
  "@context": "https://schema.org",
  "@type": "Thing",
  "@id": `${SITE_URL}/#bubbles`,
  name: "Bubbles",
  alternateName: "Bubbles the Sheep",
  description:
    "A sheep from Wicklow, Ireland, raised by humans and educated by children from multiple countries. Bubbles understands everything and interprets everything incorrectly — with complete confidence.",
  image: `${SITE_URL}/placeholder.svg`,
  additionalType: "https://schema.org/FictionalCharacter",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${SITE_URL}/about`,
  },
};

export function StructuredData() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webSiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(characterSchema)}
      </script>
    </Helmet>
  );
}
