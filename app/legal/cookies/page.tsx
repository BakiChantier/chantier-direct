export default function CookiesPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Politique des Cookies
          </h1>
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <p className="text-orange-800 text-sm">
              <strong>Conforme à la réglementation européenne</strong> • Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) 
              lors de la visite d&apos;un site web. Il permet de reconnaître votre navigateur et de stocker 
              certaines informations relatives à votre navigation.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>🍪 Bon à savoir :</strong> Les cookies ne peuvent pas endommager votre appareil 
                et ne contiennent aucun virus. Ils améliorent votre expérience de navigation.
              </p>
            </div>
          </section>

          {/* Types de cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types de Cookies Utilisés</h2>
            
            <div className="space-y-6">
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <h3 className="text-xl font-medium text-green-900 mb-3">
                  🔧 Cookies Techniques (Essentiels)
                </h3>
                <p className="text-green-800 text-sm mb-3">
                  <strong>Finalité :</strong> Fonctionnement du site et sécurité
                </p>
                <ul className="text-green-800 text-sm space-y-1 list-disc list-inside">
                  <li>Authentification et session utilisateur</li>
                  <li>Sécurité et prévention des fraudes</li>
                  <li>Préférences de navigation essentielles</li>
                  <li>Équilibrage de charge des serveurs</li>
                </ul>
                <p className="text-green-700 text-xs mt-3 font-medium">
                  ✅ Ces cookies sont indispensables et ne nécessitent pas votre consentement.
                </p>
              </div>

              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <h3 className="text-xl font-medium text-blue-900 mb-3">
                  📊 Cookies Analytiques
                </h3>
                <p className="text-blue-800 text-sm mb-3">
                  <strong>Finalité :</strong> Amélioration de nos services
                </p>
                <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
                  <li>Statistiques de fréquentation anonymes</li>
                  <li>Analyse des parcours utilisateur</li>
                  <li>Optimisation des performances du site</li>
                  <li>Détection des erreurs techniques</li>
                </ul>
                <p className="text-blue-700 text-xs mt-3 font-medium">
                  ⚡ Données anonymisées - Consentement requis
                </p>
              </div>

              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                <h3 className="text-xl font-medium text-purple-900 mb-3">
                  🎯 Cookies de Personnalisation
                </h3>
                <p className="text-purple-800 text-sm mb-3">
                  <strong>Finalité :</strong> Amélioration de votre expérience
                </p>
                <ul className="text-purple-800 text-sm space-y-1 list-disc list-inside">
                  <li>Mémorisation de vos préférences (langue, région)</li>
                  <li>Sauvegarde de vos filtres de recherche</li>
                  <li>Personnalisation de l&apos;interface</li>
                  <li>Recommandations de projets pertinents</li>
                </ul>
                <p className="text-purple-700 text-xs mt-3 font-medium">
                  🎨 Consentement requis - Révocable à tout moment
                </p>
              </div>

              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h3 className="text-xl font-medium text-red-900 mb-3">
                  🚫 Cookies Publicitaires
                </h3>
                <p className="text-red-800 text-sm font-medium">
                  Chantier-Direct n&apos;utilise actuellement aucun cookie publicitaire ou de tracking 
                  à des fins commerciales.
                </p>
              </div>
            </div>
          </section>

          {/* Gestion des cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Gestion de vos Cookies</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">🎛️ Via notre interface</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm mb-3">
                Vous pouvez modifier vos préférences de cookies à tout moment via le panneau de gestion :
              </p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                🍪 Gérer mes cookies
              </button>
            </div>

            <h3 className="text-xl font-medium text-gray-900 mb-3">🌐 Via votre navigateur</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vous pouvez également configurer votre navigateur pour gérer les cookies :
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Chrome</h4>
                <p className="text-gray-600 text-sm">Paramètres → Confidentialité et sécurité → Cookies</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Firefox</h4>
                <p className="text-gray-600 text-sm">Options → Vie privée et sécurité → Cookies</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Safari</h4>
                <p className="text-gray-600 text-sm">Préférences → Confidentialité → Cookies</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Edge</h4>
                <p className="text-gray-600 text-sm">Paramètres → Confidentialité → Cookies</p>
              </div>
            </div>
          </section>

          {/* Conséquences */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Conséquences du Refus des Cookies</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-green-600 text-sm">✅</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Cookies techniques refusés</h4>
                  <p className="text-gray-600 text-sm">Le site ne fonctionnera pas correctement (connexion impossible, perte de session)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-yellow-600 text-sm">⚠️</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Cookies analytiques refusés</h4>
                  <p className="text-gray-600 text-sm">Fonctionnalités normales mais pas d&apos;amélioration basée sur l&apos;usage</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-sm">ℹ️</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Cookies de personnalisation refusés</h4>
                  <p className="text-gray-600 text-sm">Expérience moins personnalisée, recommandations génériques</p>
                </div>
              </div>
            </div>
          </section>

          {/* Durée de conservation */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Durée de Conservation</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type de cookie</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Durée</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Session utilisateur</td>
                    <td className="px-4 py-3 text-sm text-gray-700">24 heures</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Sécurité de connexion</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Préférences</td>
                    <td className="px-4 py-3 text-sm text-gray-700">1 an</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Confort d&apos;utilisation</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Analytiques</td>
                    <td className="px-4 py-3 text-sm text-gray-700">13 mois</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Recommandation CNIL</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Consentement</td>
                    <td className="px-4 py-3 text-sm text-gray-700">13 mois</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Mémorisation de vos choix</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-lg p-6 mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📞 Questions sur les Cookies
            </h2>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant notre utilisation des cookies :
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:dpo@chantier-direct.fr"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contacter le DPO
              </a>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                🍪 Gérer mes préférences
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
