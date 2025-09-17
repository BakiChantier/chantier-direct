import Image from 'next/image'

export default function GererOffresPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">3.5.2 Gérer mes offres</h1>
      
      <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-900 mb-2">Suivi complet de vos candidatures</h2>
        <p className="text-green-800">
          Gérez efficacement toutes vos offres depuis une interface centralisée avec messagerie intégrée.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interface de gestion des offres</h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        La page &quot;Mes Offres&quot; vous donne une vue d&apos;ensemble de toutes vos candidatures avec leur statut en temps réel. 
        Vous pouvez suivre l&apos;évolution, communiquer avec les clients et gérer vos projets actifs.
      </p>

      <Image
        src="/screenshot-offers-management-interface.png"
        alt="Interface de gestion des offres avec liste et détails"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Statuts des offres</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
            <div>
              <h4 className="font-semibold text-yellow-900">EN_ATTENTE</h4>
              <p className="text-sm text-yellow-800">Offre soumise, en attente de réponse</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <h4 className="font-semibold text-green-900">ACCEPTEE</h4>
              <p className="text-sm text-green-800">Félicitations ! Vous êtes sélectionné</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
            <div>
              <h4 className="font-semibold text-red-900">REFUSEE</h4>
              <p className="text-sm text-red-800">Offre non retenue pour ce projet</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
            <div>
              <h4 className="font-semibold text-gray-900">RETIREE</h4>
              <p className="text-sm text-gray-800">Offre retirée par vos soins</p>
            </div>
          </div>
        </div>
      </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Messagerie intégrée</h2>

      <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💬 Communication avec les donneurs d&apos;ordre</h3>
        <p className="text-blue-800 mb-4">
          Chaque offre dispose d&apos;une messagerie dédiée pour échanger avec le donneur d&apos;ordre. 
          Cette communication directe vous permet de clarifier les détails et de vous démarquer.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2">Fonctionnalités</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Messages en temps réel</li>
              <li>• Notifications push et email</li>
              <li>• Historique complet conservé</li>
              <li>• Indicateurs de lecture</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2">Bonnes pratiques</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Répondez dans les 2 heures</li>
              <li>• Soyez professionnel et courtois</li>
              <li>• Apportez des précisions techniques</li>
              <li>• Proposez des alternatives si pertinent</li>
            </ul>
          </div>
        </div>
      </div>

      <Image
        src="/screenshot-messaging-with-client.png"
        alt="Interface de messagerie intégrée avec historique des conversations"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Actions sur les offres</h2>

      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Modifier une offre</h3>
          <p className="text-gray-700 mb-4">
            Tant qu&apos;une offre est en statut &quot;EN_ATTENTE&quot;, vous pouvez la modifier pour ajuster 
            votre prix, délai ou message. Attention : chaque modification notifie le donneur d&apos;ordre.
          </p>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              💡 <strong>Conseil :</strong> Évitez les modifications trop fréquentes qui peuvent nuire à votre crédibilité.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🗑️ Retirer une candidature</h3>
          <p className="text-gray-700 mb-4">
            Si vous n&apos;êtes plus disponible ou intéressé, vous pouvez retirer votre candidature. 
            Le donneur d&apos;ordre sera automatiquement notifié.
          </p>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-red-800 text-sm">
              ⚠️ <strong>Attention :</strong> Trop de retraits peuvent affecter votre réputation sur la plateforme.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Optimisation continue</h2>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Améliorez votre taux de réussite</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📈</div>
            <h4 className="font-semibold text-gray-900 mb-1">Analysez vos échecs</h4>
            <p className="text-xs text-gray-600">Identifiez les points d&apos;amélioration</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-gray-900 mb-1">Ajustez votre stratégie</h4>
            <p className="text-xs text-gray-600">Adaptez prix et approche</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <h4 className="font-semibold text-gray-900 mb-1">Collectez les retours</h4>
            <p className="text-xs text-gray-600">Demandez des évaluations positives</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Félicitations !</h3>
        <p className="text-gray-700 mb-4">
          Vous maîtrisez maintenant tous les aspects du dashboard sous-traitant. 
          Consultez la FAQ pour des questions spécifiques ou contactez notre support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/documentation/4-faq"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            FAQ complète →
          </a>
          <a
            href="/contact"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Contacter le support
          </a>
        </div>
      </div>
    </article>
  )
}
