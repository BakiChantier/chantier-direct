import Image from 'next/image'

export default function StructurerOffrePage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">3.4 Bien structurer son offre</h1>
      
      <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-900 mb-2">Rédigez des offres gagnantes</h2>
        <p className="text-green-800">
          Apprenez à structurer vos propositions pour maximiser vos chances d&apos;être sélectionné.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Anatomie d&apos;une offre parfaite</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Structure recommandée</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Accroche personnalisée</h4>
              <p className="text-blue-800 text-sm">
                Montrez que vous avez lu et compris le projet spécifique
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Proposition technique</h4>
              <p className="text-green-800 text-sm">
                Détaillez votre approche, méthodes et planning d&apos;intervention
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">Proposition commerciale</h4>
              <p className="text-purple-800 text-sm">
                Prix justifié, délais réalistes, conditions et garanties
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
            <div>
              <h4 className="font-semibold text-orange-900 mb-2">Valeur ajoutée</h4>
              <p className="text-orange-800 text-sm">
                Références, certifications, services complémentaires
              </p>
            </div>
          </div>
        </div>
      </div>

      <Image
        src="/screenshot-offer-form-example.png"
        alt="Exemple d'offre bien structurée avec tous les éléments"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Rédaction du message de présentation</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Exemple d&apos;accroche réussie</h3>
          <div className="bg-white rounded-lg p-4 border border-green-300">
            <p className="text-sm text-gray-700 italic">
              &quot;Bonjour M. Martin,<br/><br/>
              Votre projet de rénovation de salle de bain de 15m² m&apos;intéresse particulièrement. 
              Spécialisé en plomberie et carrelage depuis 12 ans, j&apos;ai récemment réalisé 
              3 projets similaires dans le 15ème arrondissement.<br/><br/>
              Je propose une approche en 2 phases : plomberie (3 jours) puis carrelage (4 jours), 
              avec garantie décennale sur tous les travaux...&quot;
            </p>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4">❌ Exemple à éviter</h3>
          <div className="bg-white rounded-lg p-4 border border-red-300">
            <p className="text-sm text-gray-700 italic">
              &quot;Bonjour,<br/><br/>
              Je suis intéressé par votre projet. 
              Je peux le faire pour 8000€ en 5 jours.<br/><br/>
              Cordialement&quot;
            </p>
          </div>
          <div className="mt-3 text-red-800 text-sm">
            ⚠️ Trop générique, manque de personnalisation et de détails.
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tarification compétitive</h2>

      <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💰 Stratégie de prix</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-blue-900 mb-1">Analysez la concurrence</h4>
            <p className="text-xs text-blue-800">Observez les prix pratiqués sur des projets similaires</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🧮</div>
            <h4 className="font-semibold text-blue-900 mb-1">Calculez vos coûts</h4>
            <p className="text-xs text-blue-800">Matériaux + main d&apos;œuvre + charges + marge</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-blue-900 mb-1">Positionnez-vous</h4>
            <p className="text-xs text-blue-800">Ni trop cher, ni bradé : trouvez le juste prix</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mise en valeur de l&apos;expérience</h2>

      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏗️ Expérience similaire</h3>
          <p className="text-gray-700 mb-4">
            Décrivez précisément des projets similaires que vous avez réalisés. 
            C&apos;est l&apos;élément qui rassure le plus les donneurs d&apos;ordre.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Template recommandé :</h4>
            <div className="text-sm text-gray-700 font-mono bg-white p-3 rounded border">
              &quot;Projet similaire réalisé :<br/>
              • Localisation : [Ville, année]<br/>
              • Surface : [m²]<br/>
              • Travaux : [Description]<br/>
              • Délai : [X jours]<br/>
              • Résultat : [Satisfaction client]<br/>
              • Contact référent : [Si autorisé]&quot;
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Matériels et équipe</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Équipements disponibles</h4>
              <p className="text-sm text-gray-600 mb-2">Listez vos outils et matériels :</p>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Outillage spécialisé</li>
                <li>• Véhicules et transport</li>
                <li>• Équipements de sécurité</li>
                <li>• Matériel de mesure</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Composition d&apos;équipe</h4>
              <p className="text-sm text-gray-600 mb-2">Présentez votre équipe :</p>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Nombre d&apos;intervenants</li>
                <li>• Qualifications spécifiques</li>
                <li>• Expérience de l&apos;équipe</li>
                <li>• Organisation du travail</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaine étape</h3>
        <p className="text-gray-700 mb-4">
          Vous maîtrisez maintenant l&apos;art de rédiger des offres convaincantes. 
          Découvrez votre dashboard pour gérer toutes vos candidatures.
        </p>
        <a
          href="/documentation/3-5-dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          3.5 Dashboard sous-traitant →
        </a>
      </div>
    </article>
  )
}
