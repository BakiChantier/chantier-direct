import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Gérer offres -Chantier Direct",
  description: "Gérer offres de Chantier Direct",
  keywords: "Chantier Direct, gérer offres, documentation",
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
            alt: "Gérer offres - Chantier Direct",
        },
    ],
    title: "Gérer offres - Chantier Direct",
    description: "Gérer offres de Chantier Direct",
    url: "https://www.chantier-direct.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gérer offres - Chantier Direct",
    description: "Gérer offres de Chantier Direct",
    images: "/ChantierDirectIcon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.chantier-direct.fr/documentation/3-5-2-gerer-offres",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function Documentation352GererOffresLayout({
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
