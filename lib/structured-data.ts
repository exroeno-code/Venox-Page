/** JSON-LD structured data generators for SEO and AI visibility.
 * Pure functions, SSR-safe. */

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  foundingDate?: string;
  founders?: Array<{ "@type": "Person"; name: string }>;
}

export interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: { "@type": "EntryPoint"; urlTemplate: string };
    "query-input": "required name=search_term_string";
  };
}

export interface FAQSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }>;
}

export interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  brand: { "@type": "Brand"; name: string };
  offers?: {
    "@type": "Offer";
    availability: "https://schema.org/PreOrder" | "https://schema.org/InStock";
    price?: string;
    priceCurrency?: string;
  };
}

/** Base organization info for VEXON TECH */
export function getOrganizationSchema(siteUrl: string): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VEXON TECH",
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    description:
      "VEXON TECH — useful ideas, real-world progress. A builder-led venture exploring practical software, responsible AI-enabled workflows, and an early online forex trading concept.",
    sameAs: [
      "https://github.com/exroeno-code/Venox-Page",
      "https://x.com/vexontech",
      "https://linkedin.com/company/vexontech",
    ],
    foundingDate: "2026",
    founders: [
      { "@type": "Person", name: "Enosh Yeswa" },
      { "@type": "Person", name: "Vince" },
    ],
  };
}

/** Website schema with search action (if search is added later) */
export function getWebSiteSchema(siteUrl: string): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VEXON TECH",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** FAQ schema for the assistant waitlist page */
export function getAssistantFAQSchema(): FAQSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the VEXON AI assistant?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An AI assistant that helps developers and everyday users move from a question or task toward a usable draft, solution, or next step. It is currently an idea under discussion — not yet built or validated.",
        },
      },
      {
        "@type": "Question",
        name: "What stage is the AI assistant at?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The AI assistant is at the 'Idea' stage — the first of four stages: Idea → Prototype → Pilot → Live. We label every initiative by its true status.",
        },
      },
      {
        "@type": "Question",
        name: "How do I join the waitlist?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Visit the assistant page and submit your email (and optionally your name) at the waitlist form. You'll receive occasional email updates about the project's progress.",
        },
      },
      {
        "@type": "Question",
        name: "Is the AI assistant available to use now?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The assistant is not yet built or validated. Joining the waitlist expresses interest and signs you up for updates.",
        },
      },
    ],
  };
}

/** FAQ schema for trading education page */
export function getTradingFAQSchema(): FAQSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this investment advice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. This is education only. VEXON TECH does not give investment advice, sell trade signals, manage anyone's money, take deposits, or recommend or endorse any broker.",
        },
      },
      {
        "@type": "Question",
        name: "What modules are planned?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Two modules are planned: Module 01 — Market mechanics (currency pairs, leverage, MT4/MT5); Module 02 — Technical & fundamental analysis (chart patterns, economic calendars, central bank policies).",
        },
      },
      {
        "@type": "Question",
        name: "When do classes start?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The full syllabus, fees, and start dates are not yet confirmed. Join the WhatsApp group or inquire about classes for updates.",
        },
      },
    ],
  };
}

/** FAQ schema for learning applications page */
export function getLearningFAQSchema(): FAQSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Are classes accredited?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Classes, fees, accreditation and start dates are not yet confirmed. An application is an expression of interest only.",
        },
      },
      {
        "@type": "Question",
        name: "How do I apply?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Choose a level, select from 14 programmes, then submit an application with your name, email, phone, and optional note. Applications route via form or WhatsApp.",
        },
      },
    ],
  };
}

/** Product schema for a concept-stage offering (pre-order / waitlist) */
export function getConceptProductSchema(
  siteUrl: string,
  name: string,
  description: string,
): ProductSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: { "@type": "Brand", name: "VEXON TECH" },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
    },
  };
}

/** Render JSON-LD script tag content */
export function renderJsonLd(data: object): string {
  return JSON.stringify(data, null, 2);
}
