import Image from 'next/image'

export default function DonneurOrdresPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">2. Guide Donneurs d&apos;Ordre</h1>
      
      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-orange-900 mb-2">Guide complet pour les donneurs d&apos;ordre</h2>
        <p className="text-orange-800">
          Apprenez à créer des appels d&apos;offres efficaces, gérer les candidatures et sélectionner les meilleurs prestataires.
        </p>
      </div>

      <Image
        src="/PageDashBoardDO.png"
        alt="Dashboard donneur d'ordre avec liste des projets et statistiques"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vue d&apos;ensemble du processus</h2>
      
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Cycle de vie d&apos;un projet
        </h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Création</h4>
            <p className="text-sm text-gray-600">
              Rédigez votre appel d&apos;offres avec tous les détails
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📨</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">2. Candidatures</h4>
            <p className="text-sm text-gray-600">
              Recevez et analysez les offres des sous-traitants
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Sélection</h4>
            <p className="text-sm text-gray-600">
              Choisissez le prestataire optimal
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">4. Finalisation</h4>
            <p className="text-sm text-gray-600">
              Suivi du projet et évaluation finale
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sections détaillées</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <a href="/documentation/2-1-connexion-inscription" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-orange-600 font-mono text-lg mr-3">2.1</span>
            <h3 className="text-lg font-semibold text-gray-900">Connexion / Inscription</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Créez votre compte donneur d&apos;ordre et configurez votre profil d&apos;entreprise.
          </p>
        </a>

        <a href="/documentation/2-2-poster-appel-offres" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-orange-600 font-mono text-lg mr-3">2.2</span>
            <h3 className="text-lg font-semibold text-gray-900">Poster un appel d&apos;offres</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Rédigez des appels d&apos;offres clairs et attractifs pour recevoir les meilleures candidatures.
          </p>
        </a>

        <a href="/documentation/2-3-gerer-offres-recues" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-orange-600 font-mono text-lg mr-3">2.3</span>
            <h3 className="text-lg font-semibold text-gray-900">Gérer les offres reçues</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Analysez, comparez et communiquez avec les candidats pour faire le bon choix.
          </p>
        </a>

        <a href="/documentation/2-4-selection-finalisation" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-orange-600 font-mono text-lg mr-3">2.4</span>
            <h3 className="text-lg font-semibold text-gray-900">Sélection et finalisation</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Sélectionnez votre prestataire, suivez le projet et finalisez avec une évaluation.
          </p>
        </a>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Bonnes pratiques essentielles</h2>

      <div className="bg-green-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Ce qu&apos;il faut faire</h3>
        <ul className="text-green-800 space-y-2">
          <li>• Soyez précis et détaillé dans vos descriptions</li>
          <li>• Fixez un budget réaliste basé sur le marché</li>
          <li>• Définissez des délais raisonnables</li>
          <li>• Incluez photos et plans si possible</li>
          <li>• Répondez rapidement aux questions des candidats</li>
          <li>• Évaluez objectivement les prestations</li>
        </ul>
      </div>

      <div className="bg-red-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-red-900 mb-4">❌ Ce qu&apos;il faut éviter</h3>
        <ul className="text-red-800 space-y-2">
          <li>• Descriptions trop vagues ou incomplètes</li>
          <li>• Budgets irréalistes ou délais impossibles</li>
          <li>• Manque de communication avec les candidats</li>
          <li>• Changements fréquents des spécifications</li>
          <li>• Retards dans les prises de décision</li>
          <li>• Évaluations non objectives</li>
        </ul>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation rapide</h3>
        <p className="text-gray-700 mb-4">
          Explorez les sections détaillées pour maîtriser chaque aspect de la plateforme.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/documentation/2-1-connexion-inscription" className="text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="text-orange-600 font-mono text-sm">2.1</div>
            <div className="text-xs text-gray-600">Inscription</div>
          </a>
          <a href="/documentation/2-2-poster-appel-offres" className="text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="text-orange-600 font-mono text-sm">2.2</div>
            <div className="text-xs text-gray-600">Appels d&apos;offres</div>
          </a>
          <a href="/documentation/2-3-gerer-offres-recues" className="text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="text-orange-600 font-mono text-sm">2.3</div>
            <div className="text-xs text-gray-600">Gestion offres reçues</div>
          </a>
          <a href="/documentation/2-4-selection-finalisation" className="text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="text-orange-600 font-mono text-sm">2.4</div>
            <div className="text-xs text-gray-600">Finalisation</div>
          </a>
        </div>
      </div>
    </article>
  )
}
