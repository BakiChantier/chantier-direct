import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Politique de confidentialité -Chantier Direct",
  description: "Politique de confidentialité de Chantier Direct",
  keywords: "Chantier Direct, politique de confidentialité, documentation",
  authors: [{ name: "Chantier Direct" }],
  publisher: "Chantier Direct",
  icons: {
    icon: "/ChantierDirectIcon.png",
  },
  openGraph: {
    images: [
        {
            url : "/ChantierDirectIcon.png",
            width: 1200,
            height: 630,
            alt: "Politique de confidentialité - Chantier Direct",
        },
    ],
    title: "Politique de confidentialité - Chantier Direct",
    description: "Politique de confidentialité de Chantier Direct",
    url: "https://www.chantier-direct.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Politique de confidentialité - Chantier Direct",
    description: "Politique de confidentialité de Chantier Direct",
    images: "/ChantierDirectIcon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.chantier-direct.fr/legal/privacy",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function LegalPrivacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="">
        {children}
    </main>
  );
}
