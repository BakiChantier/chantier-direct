import Image from 'next/image'

export default function GererOffresRecuesPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">2.3 Gérer les offres reçues</h1>
      
      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-orange-900 mb-2">Analysez et comparez les candidatures</h2>
        <p className="text-orange-800">
          Utilisez nos outils de comparaison pour évaluer objectivement les offres et choisir le meilleur prestataire.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interface de gestion des offres</h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Dès que votre appel d&apos;offres est publié, vous recevez des notifications pour chaque nouvelle candidature. 
        Accédez à la page de détail de votre projet pour voir toutes les offres dans une interface dédiée.
      </p>

      <Image
        src="/RecevezOffres.png"
        alt="Page de détail projet montrant la liste des offres reçues avec sidebar"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analyse des candidatures</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Critères de comparaison</h3>
          <ul className="text-gray-700 space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">💰</span>
              <div>
                <strong>Prix proposé</strong><br/>
                <span className="text-sm text-gray-600">Comparez avec votre budget et la moyenne du marché</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">⏱️</span>
              <div>
                <strong>Délai proposé</strong><br/>
                <span className="text-sm text-gray-600">Vérifiez la cohérence avec vos contraintes</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">⭐</span>
              <div>
                <strong>Évaluations</strong><br/>
                <span className="text-sm text-gray-600">Consultez les avis des clients précédents</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">🏗️</span>
              <div>
                <strong>Expérience</strong><br/>
                <span className="text-sm text-gray-600">Vérifiez les projets similaires réalisés</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Informations détaillées</h3>
          <p className="text-gray-700 mb-4">Chaque offre contient :</p>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>• Message de présentation personnalisé</li>
            <li>• Détail de l&apos;expérience similaire</li>
            <li>• Matériels et équipements disponibles</li>
            <li>• Composition de l&apos;équipe assignée</li>
            <li>• Méthodes de travail proposées</li>
            <li>• Garanties et assurances</li>
          </ul>
        </div>
      </div>

    
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Communication avec les candidats</h2>

      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💬 Messagerie intégrée</h3>
        <p className="text-blue-800 mb-4">
          Chaque candidature dispose d&apos;une messagerie dédiée pour échanger avec le sous-traitant. 
          Profitez-en pour poser des questions précises et clarifier les détails techniques.
        </p>
        
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Questions recommandées :</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• &quot;Pouvez-vous détailler votre planning d&apos;intervention ?&quot;</li>
            <li>• &quot;Quelles garanties offrez-vous sur les travaux ?&quot;</li>
            <li>• &quot;Avez-vous des références sur des projets similaires ?&quot;</li>
            <li>• &quot;Comment gérez-vous les imprévus de chantier ?&quot;</li>
          </ul>
        </div>
      </div>

      <Image
        src="/RecevezOffres.png"
        alt="Interface de messagerie entre donneur d'ordre et sous-traitant candidat"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Outils de comparaison</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tableau de comparaison</h3>
        <p className="text-gray-700 mb-4">
          Notre interface présente toutes les offres dans un format facile à comparer. 
          Vous pouvez trier par prix, délai, note ou date de soumission.
        </p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sous-traitant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Délai</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Jean Dupont</td>
                <td className="px-4 py-3 text-sm font-bold text-green-600">12 500 €</td>
                <td className="px-4 py-3 text-sm text-gray-900">8 jours</td>
                <td className="px-4 py-3 text-sm">⭐ 4.8/5</td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-red-600 hover:text-red-700">Sélectionner</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Actions sur les offres</h2>

      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🗑️ Supprimer une offre</h3>
          <p className="text-gray-700 mb-4">
            Si une offre ne correspond pas à vos attentes, vous pouvez la supprimer. 
            Le sous-traitant recevra une notification automatique l&apos;informant de cette décision.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Sélectionner un prestataire</h3>
          <p className="text-gray-700 mb-4">
            Une fois votre choix fait, cliquez sur &quot;Sélectionner&quot; pour confirmer le sous-traitant. 
            Toutes les autres offres seront automatiquement refusées et les candidats notifiés.
          </p>
        </div>
      </div>

      <Image
        src="/OffreDistinguee.png"
        alt="Processus de sélection d'une offre avec confirmation"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaine étape</h3>
        <p className="text-gray-700 mb-4">
          Vous savez maintenant comment analyser et gérer les candidatures. 
          Découvrez le processus de sélection et de finalisation.
        </p>
        <a
          href="/documentation/2-4-selection-finalisation"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
        >
          Sélection et finalisation →
        </a>
      </div>
    </article>
  )
}
