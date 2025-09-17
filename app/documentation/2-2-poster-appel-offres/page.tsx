import Image from 'next/image'

export default function PosterAppelOffresPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">2.2 Poster un appel d&apos;offres</h1>
      
      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-orange-900 mb-2">Créez des appels d&apos;offres efficaces</h2>
        <p className="text-orange-800">
          Apprenez à rédiger des annonces claires et attractives pour recevoir les meilleures candidatures.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Accès au formulaire de création</h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Depuis votre dashboard, cliquez sur le bouton &quot;Nouvel Appel d&apos;Offre&quot; pour accéder au formulaire de création. 
        Ce formulaire vous guide étape par étape dans la description de votre projet.
      </p>

      <Image
        src="/PageDashboardDOBoutonNouvelAppel.png"
        alt="Dashboard donneur d'ordre avec bouton 'Nouvel Appel d'Offre' mis en évidence"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Structure du formulaire</h2>

      <div className="space-y-8 mb-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📝 Informations générales</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Titre du projet</h4>
              <p className="text-sm text-gray-600 mb-3">
                Soyez concis mais descriptif. Exemple : &quot;Rénovation salle de bain 15m²&quot;
              </p>
              <div className="bg-gray-50 rounded p-3 text-sm font-mono text-gray-700">
                ✅ &quot;Rénovation complète cuisine 20m²&quot;<br/>
                ❌ &quot;Travaux cuisine&quot;
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description détaillée</h4>
              <p className="text-sm text-gray-600 mb-3">
                Décrivez précisément les travaux, contraintes et objectifs
              </p>
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                Incluez : état actuel, travaux souhaités, contraintes techniques, délais et autres informations importantes
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 Budget et délais</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Budget maximum</h4>
              <p className="text-sm text-gray-600 mb-3">
                Fixez un budget réaliste basé sur des devis préliminaires et autres informations importantes
              </p>
              <div className="bg-green-50 rounded p-3 text-sm text-gray-700">
                💡 Conseil : Ajoutez 10-15% de marge pour les imprévus
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Durée estimée</h4>
              <p className="text-sm text-gray-600 mb-3">
                Durée réaliste en jours ouvrés
              </p>
              <div className="bg-blue-50 rounded p-3 text-sm text-gray-700">
                💡 Conseil : Consultez des projets similaires pour estimer
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📍 Localisation</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Adresse complète</h4>
              <p className="text-sm text-gray-600">
                Numéro, rue, ville, code postal
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Accès au chantier</h4>
              <p className="text-sm text-gray-600">
                Contraintes de stationnement, horaires
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Informations pratiques</h4>
              <p className="text-sm text-gray-600">
                Étage, ascenseur, voisinage
              </p>
            </div>
          </div>
        </div>
      </div>

      <Image
        src="/PageAppelOffreAvecPreview.png"
        alt="Formulaire de création d'appel d'offres entièrement rempli avec tous les champs"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Types de chantier</h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Sélectionnez précisément les spécialités requises pour votre projet. 
        Cette information permet aux sous-traitants de filtrer les projets correspondant à leur expertise.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {[
          { name: 'Plomberie', icon: '🔧', color: 'bg-blue-50 text-blue-700' },
          { name: 'Électricité', icon: '⚡', color: 'bg-yellow-50 text-yellow-700' },
          { name: 'Maçonnerie', icon: '🧱', color: 'bg-red-50 text-red-700' },
          { name: 'Carrelage', icon: '🏠', color: 'bg-green-50 text-green-700' },
          { name: 'Peinture', icon: '🎨', color: 'bg-purple-50 text-purple-700' },
          { name: 'Menuiserie', icon: '🪚', color: 'bg-orange-50 text-orange-700' },
          { name: 'Couverture', icon: '🏘️', color: 'bg-gray-50 text-gray-700' },
          { name: 'Climatisation', icon: '❄️', color: 'bg-cyan-50 text-cyan-700' }
        ].map((type) => (
          <div key={type.name} className={`${type.color} rounded-lg p-4 text-center border`}>
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="text-sm font-medium">{type.name}</div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Bonnes pratiques de rédaction</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Recommandations</h3>
          <ul className="text-green-800 space-y-2 text-sm">
            <li>• Utilisez un langage professionnel mais accessible</li>
            <li>• Incluez des photos de l&apos;état actuel si possible</li>
            <li>• Mentionnez les contraintes spécifiques (copropriété, etc.)</li>
            <li>• Précisez si les matériaux sont fournis ou non</li>
            <li>• Indiquez vos disponibilités pour les visites</li>
            <li>• Fixez une date limite de candidature réaliste</li>
          </ul>
        </div>

        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4">❌ À éviter</h3>
          <ul className="text-red-800 space-y-2 text-sm">
            <li>• Descriptions trop vagues ou incomplètes</li>
            <li>• Budgets irréalistes (trop bas ou trop élevés)</li>
            <li>• Délais impossibles à respecter</li>
            <li>• Oublier de mentionner les contraintes importantes</li>
            <li>• Changer les spécifications après publication</li>
            <li>• Ne pas répondre aux questions des candidats</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Publication et visibilité</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Après publication</h3>
        <p className="text-gray-700 mb-4">
          Une fois publié, votre appel d&apos;offres devient visible par tous les sous-traitants correspondant 
          aux critères (spécialité, zone géographique). Vous commencerez à recevoir des candidatures 
          dans les heures suivantes.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Inférieur à 2h</div>
            <div className="text-sm text-blue-800">Premières candidatures</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">5-15</div>
            <div className="text-sm text-green-800">Candidatures moyennes</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">7 jours</div>
            <div className="text-sm text-purple-800">Durée moyenne de sélection</div>
          </div>
        </div>
      </div>

      <Image
        src="/ProjetPublie.png"
        alt="Projet publié visible dans la liste des appels d'offres"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaine étape</h3>
        <p className="text-gray-700 mb-4">
          Votre appel d&apos;offres est publié ! Découvrez maintenant comment gérer les candidatures reçues.
        </p>
        <a
          href="/documentation/2-3-gerer-offres-recues"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
        >
          Gérer les offres reçues →
        </a>
      </div>
    </article>
  )
}
