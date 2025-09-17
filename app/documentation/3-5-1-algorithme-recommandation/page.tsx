export default function AlgorithmeRecommandationPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">3.5.1 Système de sélection des projets</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Sélection intelligente basée sur vos compétences</h2>
        <p className="text-blue-800">
          Découvrez comment Chantier-Direct vous propose les projets les plus adaptés selon vos spécialités et votre réputation.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Comment fonctionnent les recommandations ?</h2>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Processus de sélection des projets
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛠️</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Correspondance métiers</h4>
            <p className="text-sm text-gray-600">
              Projets correspondant à vos spécialités déclarées
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">2. Système de notation</h4>
            <p className="text-sm text-gray-600">
              Projets prioritaires selon votre réputation
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📍</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Proximité géographique</h4>
            <p className="text-sm text-gray-600">
              Projets dans votre zone d&apos;intervention
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Critères de sélection</h2>

      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Critères principaux</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Spécialités métiers</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Plomberie</li>
                <li>• Électricité</li>
                <li>• Maçonnerie</li>
                <li>• Carrelage</li>
                <li>• Peinture</li>
                <li>• Menuiserie</li>
                <li>• Et autres spécialités BTP</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Système de notation</h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Note globale sur 5 étoiles</li>
                <li>• Nombre d&apos;évaluations reçues</li>
                <li>• Avis clients détaillés</li>
                <li>• Historique de performance</li>
                <li>• Taux de projets réalisés</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Impact de votre notation</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-3">
                  <span>⭐⭐⭐⭐⭐</span>
                </div>
                <span className="font-medium text-green-900">4.5 - 5.0 étoiles</span>
              </div>
              <span className="text-green-700 font-medium">Projets premium prioritaires</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-3">
                  <span>⭐⭐⭐⭐☆</span>
                </div>
                <span className="font-medium text-blue-900">3.5 - 4.4 étoiles</span>
              </div>
              <span className="text-blue-700 font-medium">Accès à tous les projets</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-3">
                  <span>⭐⭐⭐☆☆</span>
                </div>
                <span className="font-medium text-yellow-900">2.5 - 3.4 étoiles</span>
              </div>
              <span className="text-yellow-700 font-medium">Projets standards uniquement</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-3">
                  <span>⭐⭐☆☆☆</span>
                </div>
                <span className="font-medium text-red-900">Moins de 2.5 étoiles</span>
              </div>
              <span className="text-red-700 font-medium">Accès limité aux projets</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Comment améliorer son visibilité</h2>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8 border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Conseils pour obtenir plus de projets</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-900 mb-3">Améliorer votre notation</h4>
            <ul className="text-green-800 text-sm space-y-2">
              <li>• Livrez des projets de qualité dans les délais</li>
              <li>• Communiquez régulièrement avec les clients</li>
              <li>• Respectez les budgets convenus</li>
              <li>• Demandez des avis après chaque projet</li>
              <li>• Résolvez rapidement les problèmes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-3">Optimiser votre profil</h4>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Complétez toutes vos spécialités</li>
              <li>• Ajoutez des photos de vos réalisations</li>
              <li>• Rédigez une description professionnelle</li>
              <li>• Mettez à jour vos certifications</li>
              <li>• Indiquez votre zone d&apos;intervention</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Zones d&apos;intervention</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Projets selon votre localisation</h3>
        <p className="text-gray-700 mb-4">
          Les projets vous sont proposés en priorité selon votre proximité géographique et votre zone d&apos;intervention déclarée.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">0-20 km</div>
            <div className="text-sm text-green-800">Zone prioritaire</div>
            <div className="text-xs text-green-600 mt-1">Projets proposés en premier</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">20-50 km</div>
            <div className="text-sm text-blue-800">Zone secondaire</div>
            <div className="text-xs text-blue-600 mt-1">Projets selon disponibilité</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 mb-2">50+ km</div>
            <div className="text-sm text-gray-800">Zone étendue</div>
            <div className="text-xs text-gray-600 mt-1">Sur demande uniquement</div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important à retenir</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Votre réputation est votre meilleur atout ! Plus vous avez d&apos;avis positifs et une note élevée, plus vous aurez accès aux projets les plus intéressants et aux clients les plus sérieux.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaine étape</h3>
        <p className="text-gray-700 mb-4">
          Maintenant que vous comprenez le système de sélection, découvrez comment gérer efficacement toutes vos offres.
        </p>
        <a
          href="/documentation/3-5-2-gerer-offres"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          3.5.2 Gérer mes offres →
        </a>
      </div>
    </article>
  )
}
