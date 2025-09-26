import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotificationWrapper from "@/components/NotificationWrapper";
import { UserProvider } from "@/lib/user-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chantier Direct - Plateforme BTP",
  description: "La plateforme de mise en relation entre donneurs d'ordre et sous-traitants dans le secteur du BTP",
  keywords: "BTP, chantier, sous-traitant, donneur d'ordre, construction, travaux",
  authors: [{ name: "Chantier Direct" }],
  icons: {
    icon: "/ChantierDirectIcon.png",
  },
  openGraph: {
    images: "/ChantierDirectIcon.png",
    title: "Chantier Direct - Plateforme BTP",
    description: "La plateforme de mise en relation entre donneurs d'ordre et sous-traitants dans le secteur du BTP",
    url: "https://chantierdirect.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chantier Direct - Plateforme BTP",
    description: "La plateforme de mise en relation entre donneurs d'ordre et sous-traitants dans le secteur du BTP",
    images: "/ChantierDirectIcon.png",
  },
  alternates: {
    canonical: "https://www.chantier-direct.fr",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Chantier Direct",
              "url": "https://www.chantier-direct.fr",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.chantier-direct.fr/Logo3.png",
                "width": 512,
                "height": 512
              },
              "image": "https://www.chantier-direct.fr/Logo3.png",
              "description": "Chantier Direct est une plateforme de mise en relation entre donneurs d'ordre et sous-traitants dans le secteur du BTP",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Senlis",
                "addressRegion": "Oise",
                "addressCountry": "FR"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+33-6-85-31-12-08",
                "contactType": "customer service",
                "availableLanguage": "French"
              },
              "sameAs": [
                "https://www.chantier-direct.fr"
              ],
              "areaServed": {
                "@type": "Place",
                "name": "Senlis, Oise, France"
              },
              "foundingDate": "2024",
              "founder": {
                "@type": "Person",
                "name": "Chantier Direct Team"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Services Chantier Direct",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Inscription des donneurs d'ordre",
                      "description": "Inscription des donneurs d'ordre",
                      "url": "https://www.chantier-direct.fr/documentation/2-donneur-ordres",
                      "category": "Mise en relation entre donneurs d'ordre et sous-traitants"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Inscription des sous-traitants",
                      "description": "Inscription des sous-traitants",
                      "url": "https://www.chantier-direct.fr/documentation/3-sous-traitants",
                      "category": "Mise en relation entre donneurs d'ordre et sous-traitants"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Appels d'offre",
                      "description": "Appels d'offre",
                      "url": "https://www.chantier-direct.fr/projets",
                      "category": "Mise en relation entre donneurs d'ordre et sous-traitants"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Annuaire",
                      "description": "Annuaire",
                      "url": "https://www.chantier-direct.fr/annuaire",
                      "category": "Mise en relation entre donneurs d'ordre et sous-traitants"
                    }
                  },
                ]
              }
            })
          }}
        />

        {/* JSON-LD pour le site web */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Chantier Direct",
              "url": "https://www.chantier-direct.fr",
              "description": "La plateforme de mise en relation entre donneurs d'ordre et sous-traitants dans le secteur du BTP",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.chantier-direct.fr/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Chantier Direct"
              }
            })
          }}
        />

        {/* JSON-LD pour les liens de navigation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Services Chantier Direct",
              "description": "Liste des services proposés par Chantier Direct",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "WebPage",
                    "name": "Nous Contacter",
                    "url": "https://www.chantier-direct.fr/contact",
                    "description": "Sites web sur-mesure et applications web"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "WebPage",
                    "name": "Documentation",
                    "url": "https://www.chantier-direct.fr/documentation",
                    "description": "Support IT et solutions informatiques"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "item": {
                    "@type": "WebPage",
                    "name": "Appels d'offre",
                    "url": "https://www.chantier-direct.fr/projets",
                    "description": "Optimisation pour les moteurs de recherche"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "item": {
                    "@type": "WebPage",
                    "name": "Sous Traitants",
                    "url": "https://www.chantier-direct.fr/annuaire",
                    "description": "Audit de sécurité et tests d'intrusion"
                  }
                },
              ]
            })
          }}
        />

      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <UserProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <NotificationWrapper />
        </UserProvider>
      </body>
    </html>
  );
}
