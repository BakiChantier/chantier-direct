import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Informations Légales - Chantier-Direct',
  description: 'Mentions légales, conditions d\'utilisation, politique de confidentialité et gestion des cookies de Chantier-Direct.',
  keywords: 'mentions légales, CGU, RGPD, confidentialité, cookies, Chantier-Direct',
}

const legalPages = [
  {
    title: 'Mentions Légales',
    href: '/legal/legal-mentions',
    description: 'Informations légales sur l\'entreprise et le site'
  },
  {
    title: 'Conditions Générales d\'Utilisation',
    href: '/legal/terms',
    description: 'Règles d\'utilisation de la plateforme'
  },
  {
    title: 'Politique de Confidentialité',
    href: '/legal/privacy',
    description: 'Protection des données personnelles (RGPD)'
  },
  {
    title: 'Politique des Cookies',
    href: '/legal/cookies',
    description: 'Utilisation des cookies et technologies similaires'
  }
]

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour à l&apos;accueil
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">Informations Légales</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Navigation</h2>
              <nav className="space-y-2">
                {legalPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                  >
                    {page.title}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-2">
                  <p>Dernière mise à jour :</p>
                  <p className="font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">
              © {new Date().getFullYear()} Chantier-Direct. Tous droits réservés.
            </p>
            <p>
              En cas de questions sur ces informations légales, contactez-nous à{' '}
              <a href="mailto:legal@chantier-direct.fr" className="text-red-600 hover:text-red-700">
                legal@chantier-direct.fr
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
