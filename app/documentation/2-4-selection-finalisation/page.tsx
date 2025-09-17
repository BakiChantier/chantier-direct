import Image from 'next/image'

export default function SelectionFinalisationPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">2.4 Sélection du prestataire et finalisation</h1>
      
      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-orange-900 mb-2">Finalisez votre projet avec succès</h2>
        <p className="text-orange-800">
          Apprenez à sélectionner le bon prestataire, suivre l&apos;avancement et finaliser votre projet.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Processus de sélection</h2>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 font-bold">1</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Analyse finale</h3>
          <p className="text-sm text-gray-600">Comparez une dernière fois toutes les offres</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 font-bold">2</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Sélection</h3>
          <p className="text-sm text-gray-600">Cliquez sur &quot;Sélectionner&quot; pour confirmer</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-600 font-bold">3</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Notification</h3>
          <p className="text-sm text-gray-600">Tous les candidats sont automatiquement notifiés</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-orange-600 font-bold">4</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Démarrage</h3>
          <p className="text-sm text-gray-600">Le projet passe en statut &quot;EN_COURS&quot;</p>
        </div>
      </div>

      <Image
        src="/OffreDistinguee.png"
        alt="Interface de sélection d'un sous-traitant avec bouton de confirmation"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

   
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Finalisation et évaluation</h2>

      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏁 Finaliser le projet</h3>
          <p className="text-gray-700 mb-4">
            Lorsque les travaux sont terminés à votre satisfaction, cliquez sur &quot;Finaliser le projet&quot; 
            pour déclencher le processus d&apos;évaluation. Cette étape est cruciale pour maintenir 
            la qualité du réseau Chantier-Direct.
          </p>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">✅ Avant de finaliser, vérifiez :</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Tous les travaux sont terminés</li>
              <li>• La qualité correspond à vos attentes</li>
              <li>• Le nettoyage du chantier est effectué</li>
              <li>• Les documents de garantie sont fournis</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Système d&apos;évaluation</h3>
          <p className="text-gray-700 mb-4">
            L&apos;évaluation se fait sur 3 critères principaux, chacun noté de 1 à 5 étoiles :
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-yellow-900 mb-1">Qualité du travail</h4>
              <p className="text-xs text-yellow-800">Finition, conformité, propreté</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-semibold text-blue-900 mb-1">Respect des délais</h4>
              <p className="text-xs text-blue-800">Planning, ponctualité, organisation</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">💬</div>
              <h4 className="font-semibold text-purple-900 mb-1">Communication</h4>
              <p className="text-xs text-purple-800">Réactivité, clarté, professionnalisme</p>
            </div>
          </div>
        </div>
      </div>

      <Image
        src="/LaisserAvis.png"
        alt="Formulaire d'évaluation détaillé avec notes par critères et commentaires"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Impact des évaluations</h2>

      <div className="bg-yellow-50 rounded-lg p-6 mb-8 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">🌟 Importance des évaluations</h3>
        <p className="text-yellow-800 mb-4">
          Vos évaluations contribuent à la qualité globale du réseau Chantier-Direct. 
          Elles aident les futurs clients à faire les bons choix et encouragent l&apos;excellence.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-yellow-300">
            <h4 className="font-semibold text-yellow-900 mb-2">Pour la communauté</h4>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Amélioration continue de la qualité</li>
              <li>• Transparence sur les prestations</li>
              <li>• Confiance renforcée dans le réseau</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-300">
            <h4 className="font-semibold text-yellow-900 mb-2">Pour les sous-traitants</h4>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Reconnaissance du travail de qualité</li>
              <li>• Amélioration du référencement</li>
              <li>• Développement commercial</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Après la finalisation</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Historique et statistiques</h3>
        <p className="text-gray-700 mb-4">
          Tous vos projets finalisés sont archivés dans votre historique. Vous pouvez consulter :
        </p>
        
        <ul className="text-gray-700 space-y-2">
          <li>• Historique complet des projets réalisés</li>
          <li>• Statistiques de vos collaborations</li>
          <li>• Carnet d&apos;adresses des prestataires de confiance</li>
          <li>• Recommandations pour de futurs projets</li>
        </ul>
      </div>

      <Image
        src="/TriProjets.png"
        alt="Historique des projets terminés avec statistiques et évaluations"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Félicitations !</h3>
        <p className="text-gray-700 mb-4">
          Vous maîtrisez maintenant tout le processus donneur d&apos;ordre sur Chantier-Direct. 
          Explorez d&apos;autres sections ou contactez notre support pour des questions spécifiques.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/documentation/3-sous-traitants"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Guide Sous-traitants →
          </a>
          <a
            href="/documentation/4-faq"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            FAQ et support
          </a>
        </div>
      </div>
    </article>
  )
}
