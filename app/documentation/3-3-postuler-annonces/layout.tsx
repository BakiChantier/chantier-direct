import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Postuler annonces -Chantier Direct",
  description: "Postuler annonces de Chantier Direct",
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
            alt: "Postuler annonces - Chantier Direct",
        },
    ],
    title: "Postuler annonces - Chantier Direct",
    description: "Postuler annonces de Chantier Direct",
    url: "https://www.chantier-direct.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Postuler annonces - Chantier Direct",
    description: "Postuler annonces de Chantier Direct",
    images: "/ChantierDirectIcon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.chantier-direct.fr/documentation/3-3-postuler-annonces",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function Documentation33PostulerAnnoncesLayout({
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
