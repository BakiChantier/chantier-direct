import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Mentions légales -Chantier Direct",
  description: "Mentions légales de Chantier Direct",
  keywords: "Chantier Direct, mentions légales, documentation",
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
            alt: "Mentions légales - Chantier Direct",
        },
    ],
    title: "Mentions légales - Chantier Direct",
    description: "Mentions légales de Chantier Direct",
    url: "https://www.chantier-direct.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentions légales - Chantier Direct",
    description: "Mentions légales de Chantier Direct",
    images: "/ChantierDirectIcon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.chantier-direct.fr/legal/legal-mentions",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function LegalMentionsLayout({
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
