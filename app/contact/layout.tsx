import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Nous Contacter -Chantier Direct",
  description: "Contactez-nous pour toute question ou demande de service",
  keywords: "Chantier Direct, contact, question, demande de service",
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
            alt: "Nous Contacter - Chantier Direct",
        },
    ],
    title: "Nous Contacter - Chantier Direct",
    description: "Contactez-nous pour toute question ou demande de service",
    url: "https://www.chantierdirect.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nous Contacter - Chantier Direct",
    description: "Contactez-nous pour toute question ou demande de service",
    images: "/ChantierDirectIcon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function ContactLayout({
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
