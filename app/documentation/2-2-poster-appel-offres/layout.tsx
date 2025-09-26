import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Poster appel d'offres -Chantier Direct",
  description: "Poster appel d'offres de Chantier Direct",
  keywords: "Chantier Direct, présentation, documentation",
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
            alt: "Poster appel d'offres - Chantier Direct",
        },
    ],
    title: "Poster appel d'offres - Chantier Direct",
    description: "Poster appel d'offres de Chantier Direct",
    url: "https://www.chantier-direct.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poster appel d'offres - Chantier Direct",
    description: "Poster appel d'offres de Chantier Direct",
    images: "/ChantierDirectIcon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.chantier-direct.fr/documentation/2-2-poster-appel-offres",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function Documentation22PosterAppelOffresLayout({
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
