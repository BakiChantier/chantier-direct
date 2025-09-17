import Image from 'next/image'

export default function SousTraitantsPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">3. Guide Sous-Traitants</h1>
      
      <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-900 mb-2">Guide complet pour les sous-traitants</h2>
        <p className="text-green-800">
          Maximisez vos opportunités commerciales et développez votre activité avec Chantier-Direct.
        </p>
      </div>

      <Image
        src="/PageDashBoardST.png"
        alt="Dashboard sous-traitant avec projets recommandés et mes offres"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vue d&apos;ensemble du processus</h2>
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Parcours du sous-traitant sur Chantier-Direct
        </h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Inscription</h4>
            <p className="text-sm text-gray-600">
              Créez votre profil et téléchargez vos documents
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">2. Recherche</h4>
            <p className="text-sm text-gray-600">
              Trouvez les projets qui correspondent à votre expertise
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Candidature</h4>
            <p className="text-sm text-gray-600">
              Rédigez des offres personnalisées et compétitives
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">4. Réalisation</h4>
            <p className="text-sm text-gray-600">
              Exécutez vos projets et construisez votre réputation
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sections détaillées</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <a href="/documentation/3-1-connexion-inscription" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-green-600 font-mono text-lg mr-3">3.1</span>
            <h3 className="text-lg font-semibold text-gray-900">Connexion / Inscription</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Créez votre compte, téléchargez vos documents et attendez la validation administrative.
          </p>
        </a>

        <a href="/documentation/3-2-postuler-annonces" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-green-600 font-mono text-lg mr-3">3.2</span>
            <h3 className="text-lg font-semibold text-gray-900">Postuler à des annonces</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Recherchez les projets adaptés à votre expertise et zone d&apos;intervention.
          </p>
        </a>

        <a href="/documentation/3-3-structurer-offre" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-green-600 font-mono text-lg mr-3">3.3</span>
            <h3 className="text-lg font-semibold text-gray-900">Bien structurer son offre</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Rédigez des propositions gagnantes avec nos conseils et modèles.
          </p>
        </a>

        <a href="/documentation/3-4-dashboard" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-green-600 font-mono text-lg mr-3">3.4</span>
            <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Gérez vos candidatures, suivez vos projets et optimisez votre activité.
          </p>
        </a>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Stratégies de réussite</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Profil optimisé</h3>
          <p className="text-sm text-gray-600">
            Complétez votre profil avec photos, références et certifications pour attirer les clients.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Réactivité</h3>
          <p className="text-sm text-gray-600">
            Répondez rapidement aux appels d&apos;offres et aux messages des donneurs d&apos;ordre.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Excellence</h3>
          <p className="text-sm text-gray-600">
            Livrez des prestations de qualité pour construire votre réputation et fidéliser.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation rapide</h3>
        <p className="text-gray-700 mb-4">
          Explorez les sections détaillées pour maîtriser chaque aspect de votre activité sur Chantier-Direct.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/documentation/3-1-connexion-inscription" className="text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="text-green-600 font-mono text-sm">3.1</div>
            <div className="text-xs text-gray-600">Inscription</div>
          </a>
          <a href="/documentation/3-2-postuler-annonces" className="text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="text-green-600 font-mono text-sm">3.2</div>
            <div className="text-xs text-gray-600">Candidatures</div>
          </a>
          <a href="/documentation/3-3-structurer-offre" className="text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="text-green-600 font-mono text-sm">3.3</div>
            <div className="text-xs text-gray-600">Offres</div>
          </a>
          <a href="/documentation/3-4-dashboard" className="text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="text-green-600 font-mono text-sm">3.4</div>
            <div className="text-xs text-gray-600">Dashboard</div>
          </a>
        </div>
      </div>
    </article>
  )
}
