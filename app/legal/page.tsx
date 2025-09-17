import Link from 'next/link'

export default function LegalPage() {
  const legalPages = [
    {
      title: 'Mentions Légales',
      href: '/legal/legal-mentions',
      description: 'Informations légales sur l\'entreprise, l\'éditeur du site et l\'hébergement.',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0h3m2 0h5M9 7h6m-6 4h6m-2 4h2" />
        </svg>
      )
    },
    {
      title: 'Conditions Générales d\'Utilisation',
      href: '/legal/terms',
      description: 'Règles et conditions d\'utilisation de la plateforme Chantier-Direct.',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Politique de Confidentialité',
      href: '/legal/privacy',
      description: 'Protection des données personnelles conforme au RGPD.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: 'Politique des Cookies',
      href: '/legal/cookies',
      description: 'Utilisation des cookies et technologies de suivi sur notre site.',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Informations Légales
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Retrouvez toutes les informations légales concernant l&apos;utilisation de Chantier-Direct, 
          la protection de vos données personnelles et nos conditions d&apos;utilisation.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {legalPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                {page.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {page.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {page.description}
                </p>
                <div className="mt-4 flex items-center text-red-600 text-sm font-medium">
                  Consulter
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Information importante
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Ces documents juridiques sont régulièrement mis à jour pour rester conformes à la législation française 
              et européenne en vigueur. Nous vous recommandons de les consulter périodiquement. 
              En cas de modification substantielle, vous serez informé par email.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Legal */}
      <div className="mt-8 text-center">
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Questions juridiques ?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Pour toute question concernant ces documents légaux ou vos droits
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:legal@chantier-direct.fr"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Juridique
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Contact Général
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
