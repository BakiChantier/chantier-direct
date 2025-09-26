'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Metadata, Viewport } from "next";


export const metadata: Metadata = {
  title: "Documentation -Chantier Direct",
  description: "Documentation pour les donneurs d'ordre et les sous-traitants",
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
            alt: "Documentation - Chantier Direct",
        },
    ],
    title: "Documentation - Chantier Direct",
    description: "Documentation pour les donneurs d'ordre et les sous-traitants",
    url: "https://www.chantier-direct.fr",
    siteName: "Chantier Direct",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentation - Chantier Direct",
    description: "Documentation pour les donneurs d'ordre et les sous-traitants",
    images: "/ChantierDirectIcon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.chantier-direct.fr/documentation",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

interface DocSection {
  id: string
  title: string
  path: string
  number: string
  subsections?: DocSection[]
}

const navigationItems: DocSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    path: '/documentation/1-introduction',
    number: '1',
    subsections: [
      {
        id: 'presentation',
        title: 'Présentation',
        path: '/documentation/1-1-presentation',
        number: '1.1'
      },
      {
        id: 'guide-demarrage',
        title: 'Guide de démarrage',
        path: '/documentation/1-2-guide-demarrage',
        number: '1.2'
      }
    ]
  },
  {
    id: 'donneur-ordres',
    title: 'Donneurs d\'Ordre',
    path: '/documentation/2-donneur-ordres',
    number: '2',
    subsections: [
      {
        id: 'connexion-inscription-do',
        title: 'Connexion / Inscription',
        path: '/documentation/2-1-connexion-inscription',
        number: '2.1'
      },
      {
        id: 'poster-appel-offres',
        title: 'Poster un appel d\'offres',
        path: '/documentation/2-2-poster-appel-offres',
        number: '2.2'
      },
      {
        id: 'gerer-offres-recues',
        title: 'Gérer les offres reçues',
        path: '/documentation/2-3-gerer-offres-recues',
        number: '2.3'
      },
      {
        id: 'selection-finalisation',
        title: 'Sélection du prestataire et finalisation',
        path: '/documentation/2-4-selection-finalisation',
        number: '2.4'
      }
    ]
  },
  {
    id: 'sous-traitants',
    title: 'Sous-traitants',
    path: '/documentation/3-sous-traitants',
    number: '3',
    subsections: [
      {
        id: 'connexion-inscription-st',
        title: 'Connexion / Inscription',
        path: '/documentation/3-1-connexion-inscription',
        number: '3.1'
      },
      {
        id: 'configurer-profil-public',
        title: 'Configurer son profil public',
        path: '/documentation/3-2-configurer-profil-public',
        number: '3.2'
      },
      {
        id: 'postuler-annonces',
        title: 'Postuler à des annonces',
        path: '/documentation/3-3-postuler-annonces',
        number: '3.3'
      },
      {
        id: 'structurer-offre',
        title: 'Bien structurer son offre',
        path: '/documentation/3-4-structurer-offre',
        number: '3.4'
      },
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/documentation/3-5-dashboard',
        number: '3.5',
        subsections: [
          {
            id: 'algorithme-recommandation',
            title: 'Algorithme de recommandation',
            path: '/documentation/3-5-1-algorithme-recommandation',
            number: '3.5.1'
          },
          {
            id: 'gerer-offres',
            title: 'Gérer mes offres',
            path: '/documentation/3-5-2-gerer-offres',
            number: '3.5.2'
          }
        ]
      }
    ]
  },
  {
    id: 'faq',
    title: 'FAQ',
    path: '/documentation/4-faq',
    number: '4'
  }
]

// Fonction de recherche dans le contenu
const searchInContent = (sections: DocSection[], term: string): DocSection[] => {
  if (!term.trim()) return sections

  const searchTerm = term.toLowerCase()
  const results: DocSection[] = []

  const searchRecursive = (items: DocSection[]) => {
    items.forEach(item => {
      const matchesTitle = item.title.toLowerCase().includes(searchTerm)
      const matchesPath = item.path.toLowerCase().includes(searchTerm)
      
      if (matchesTitle || matchesPath) {
        results.push(item)
      }
      
      if (item.subsections) {
        searchRecursive(item.subsections)
      }
    })
  }

  searchRecursive(sections)
  return results
}

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  // Fonction récursive pour aplatir la navigation
/*   const flattenNavigation = (items: DocSection[]): DocSection[] => {
    let flattened: DocSection[] = []
    items.forEach(item => {
      flattened.push(item)
      if (item.subsections) {
        flattened = flattened.concat(flattenNavigation(item.subsections))
      }
    })
    return flattened
  } */

  
  const filteredItems = searchTerm ? searchInContent(navigationItems, searchTerm) : navigationItems

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-gray-200">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent 
              items={filteredItems}
              pathname={pathname}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-80 border-r border-gray-200 bg-gray-50">
          <SidebarContent 
            items={filteredItems}
            pathname={pathname}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Documentation</h1>
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ 
  items, 
  pathname, 
  searchTerm, 
  setSearchTerm,
  setSidebarOpen 
}: {
  items: DocSection[]
  pathname: string
  searchTerm: string
  setSearchTerm: (term: string) => void
  setSidebarOpen?: (open: boolean) => void
}) {
  const renderNavItem = (item: DocSection, level: number = 0) => {
    const isActive = pathname === item.path
    const hasActiveChild = item.subsections?.some(sub => 
      pathname === sub.path || sub.subsections?.some(subsub => pathname === subsub.path)
    )

    return (
      <div key={item.id}>
        <Link
          href={item.path}
          onClick={() => setSidebarOpen?.(false)}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive
              ? 'bg-red-100 text-red-900 border-l-4 border-red-500'
              : hasActiveChild
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          } ${level > 0 ? 'ml-4' : ''}`}
        >
          <span className="text-xs text-gray-500 mr-3 font-mono w-8">
            {item.number}
          </span>
          {item.title}
        </Link>
        
        {item.subsections && (hasActiveChild || isActive) && (
          <div className="mt-1 space-y-1">
            {item.subsections.map(subItem => renderNavItem(subItem, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Documentation</h2>
            <p className="text-sm text-gray-600">Chantier-Direct</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
            placeholder="Rechercher dans la documentation..."
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        <ul className="space-y-1">
          {items.map((item) => renderNavItem(item))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="font-medium">Chantier-Direct v1.0.0</p>
          <p className="mt-1">Mis à jour le {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="mt-3">
          <Link
            href="/contact"
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Besoin d&apos;aide ? Contactez-nous →
          </Link>
        </div>
      </div>
    </div>
  )
}
