import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Projets -Chantier Direct",
  description: "Projets de Chantier Direct, connectez sous traitants et donneurs d'ordre",
  keywords: "Chantier Direct, projets, documentation",
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
                alt: "Projets - Chantier Direct",
        },
    ],
    title: "Projets - Chantier Direct",
    description: "Projets de Chantier Direct, connectez sous traitants et donneurs d'ordre",
    url: "https://www.chantier-direct.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projets - Chantier Direct",
    description: "Projets de Chantier Direct, connectez sous traitants et donneurs d'ordre",
    images: "/ChantierDirectIcon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.chantier-direct.fr/projets",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function ProjetsLayout({
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
