import Image from 'next/image'

export default function PresentationPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">1.1 Présentation de Chantier-Direct</h1>
      
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Notre mission</h2>
      
      <p className="text-gray-700 leading-relaxed mb-6">
        Chantier-Direct a été créé pour répondre aux défis de mise en relation dans le secteur du BTP. 
        Notre plateforme connecte efficacement les donneurs d&apos;ordre avec des sous-traitants qualifiés, 
        en garantissant transparence, sécurité et qualité des échanges.
      </p>

      <Image
        src="/PageDashBoardDO.png"
        alt="Vue d'ensemble du dashboard Chantier-Direct montrant les statistiques et projets actifs"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Fonctionnalités principales</h2>

      <div className="grid md:grid-cols-2 gap-8 my-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🏗️ Gestion de projets</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Création d&apos;appels d&apos;offres détaillés</li>
            <li>• Suivi en temps réel des candidatures</li>
            <li>• Outils de comparaison d&apos;offres</li>
            <li>• Tableau de bord intuitif</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">👥 Réseau professionnel</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Annuaire de professionnels vérifiés</li>
            <li>• Système d&apos;évaluations et recommandations</li>
            <li>• Profils détaillés avec références</li>
            <li>• Géolocalisation des intervenants</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">💬 Communication</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Messagerie intégrée sécurisée</li>
            <li>• Notifications en temps réel</li>
            <li>• Historique des échanges</li>
            <li>• Support multiplateforme</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🔒 Sécurité</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Vérification des documents légaux</li>
            <li>• Validation administrative</li>
            <li>• Chiffrement des données</li>
            <li>• Conformité RGPD</li>
          </ul>
        </div>
      </div>

     

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Avantages concurrentiels</h2>

      <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Pourquoi choisir Chantier-Direct ?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Rapidité</h4>
            <p className="text-sm text-gray-600">
              Trouvez des partenaires en quelques clics grâce à nos filtres intelligents
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Précision</h4>
            <p className="text-sm text-gray-600">
              Algorithme de recommandation basé sur vos critères et historique et compétences
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Confiance</h4>
            <p className="text-sm text-gray-600">
              Tous les professionnels sont vérifiés et évalués par la communauté et les donneurs d&apos;ordre
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Statistiques de la plateforme</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">500+</div>
          <div className="text-sm text-gray-600">Projets actifs</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">1200+</div>
          <div className="text-sm text-gray-600">Professionnels</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">98%</div>
          <div className="text-sm text-gray-600">Satisfaction</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">15</div>
          <div className="text-sm text-gray-600">Spécialités BTP</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaines étapes</h3>
        <p className="text-gray-700 mb-4">
          Maintenant que vous connaissez Chantier-Direct, découvrez comment créer votre compte 
          et commencer à utiliser la plateforme.
        </p>
        <a
          href="/documentation/1-2-guide-demarrage"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          Guide de démarrage →
        </a>
      </div>
    </article>
  )
}
