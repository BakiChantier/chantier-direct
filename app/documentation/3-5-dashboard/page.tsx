import Image from 'next/image'

export default function DashboardPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">3.5 Dashboard Sous-Traitant</h1>
      
      <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-900 mb-2">Pilotez votre activité commerciale</h2>
        <p className="text-green-800">
          Découvrez toutes les fonctionnalités de votre tableau de bord pour optimiser votre développement commercial.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vue d&apos;ensemble du dashboard</h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Votre dashboard est le centre de contrôle de votre activité sur Chantier-Direct. 
        Il vous donne accès à toutes les informations et outils nécessaires pour gérer efficacement vos candidatures et projets.
      </p>

      <Image
        src="/screenshot-dashboard-complete-overview.png"
        alt="Vue complète du dashboard sous-traitant avec toutes les sections"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sections principales</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Statistiques d&apos;activité</h3>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>• Nombre de candidatures soumises</li>
            <li>• Taux de sélection</li>
            <li>• Projets en cours</li>
            <li>• Projets terminés</li>
            <li>• Chiffre d&apos;affaires généré</li>
            <li>• Note moyenne reçue</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Projets recommandés</h3>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>• Suggestions personnalisées</li>
            <li>• Filtrage par expertise</li>
            <li>• Proximité géographique</li>
            <li>• Compatibilité budget/délais</li>
            <li>• Historique de collaboration</li>
            <li>• Alertes nouveaux projets</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sous-sections détaillées</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <a href="/documentation/3-4-1-algorithme-recommandation" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-green-600 font-mono text-lg mr-3">3.4.1</span>
            <h3 className="text-lg font-semibold text-gray-900">Algorithme de recommandation</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Comprenez comment notre IA sélectionne les projets les plus pertinents pour vous.
          </p>
          <div className="mt-3 flex items-center text-xs text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Intelligence artificielle
          </div>
        </a>

        <a href="/documentation/3-4-2-gerer-offres" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-green-600 font-mono text-lg mr-3">3.4.2</span>
            <h3 className="text-lg font-semibold text-gray-900">Gérer mes offres</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Suivez le statut de vos candidatures et gérez la communication avec vos clients.
          </p>
          <div className="mt-3 flex items-center text-xs text-blue-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Gestion avancée
          </div>
        </a>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Optimisation de votre profil</h2>

      <div className="bg-purple-50 rounded-lg p-6 mb-8 border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">⭐ Construisez votre réputation</h3>
        <p className="text-purple-800 mb-4">
          Votre profil public est votre vitrine commerciale. Plus il est complet et attractif, 
          plus vous recevrez d&apos;opportunités qualifiées.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-300">
            <h4 className="font-semibold text-purple-900 mb-2">Éléments essentiels</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Photo professionnelle</li>
              <li>• Description d&apos;activité claire</li>
              <li>• Spécialités détaillées</li>
              <li>• Zone d&apos;intervention précise</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-300">
            <h4 className="font-semibold text-purple-900 mb-2">Éléments différenciants</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Portfolio de réalisations</li>
              <li>• Certifications et labels</li>
              <li>• Témoignages clients</li>
              <li>• Services complémentaires</li>
            </ul>
          </div>
        </div>
      </div>

      <Image
        src="/ScreenProfilPublicEdit.png"
        alt="Interface d'optimisation du profil sous-traitant avec conseils"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Métriques de performance</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Indicateurs clés à suivre</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">85%</div>
            <div className="text-sm text-blue-800">Taux de réponse optimal</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">2h</div>
            <div className="text-sm text-green-800">Délai de réponse recommandé</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">4.5+</div>
            <div className="text-sm text-yellow-800">Note minimum pour visibilité</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">15%</div>
            <div className="text-sm text-purple-800">Taux de sélection moyen</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections avancées</h3>
        <p className="text-gray-700 mb-4">
          Découvrez les fonctionnalités avancées de votre dashboard pour optimiser votre activité.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/documentation/3-5-1-algorithme-recommandation"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            3.5.1 Algorithme IA →
          </a>
          <a
            href="/documentation/3-5-2-gerer-offres"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            3.5.2 Gestion des offres →
          </a>
        </div>
      </div>
    </article>
  )
}
