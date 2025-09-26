import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Selection et finalisation -Chantier Direct",
  description: "Selection et finalisation de Chantier Direct",
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
            alt: "Selection et finalisation - Chantier Direct",
        },
    ],
    title: "Selection et finalisation - Chantier Direct",
    description: "Selection et finalisation de Chantier Direct",
    url: "https://www.chantier-direct.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Selection et finalisation - Chantier Direct",
    description: "Selection et finalisation de Chantier Direct",
    images: "/ChantierDirectIcon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.chantier-direct.fr/documentation/2-4-selection-finalisation",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function Documentation24SelectionFinalisationLayout({
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
