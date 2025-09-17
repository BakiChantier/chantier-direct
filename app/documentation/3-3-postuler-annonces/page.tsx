import Image from 'next/image'

export default function PostulerAnnoncesPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">3.3 Postuler à des annonces</h1>
      
      <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-900 mb-2">Trouvez les projets adaptés à votre expertise</h2>
        <p className="text-green-800">
          Utilisez nos outils de recherche et filtres pour cibler les opportunités les plus pertinentes.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interface de recherche</h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        La page &quot;Projets&quot; vous donne accès à tous les appels d&apos;offres ouverts. 
        Utilisez les filtres pour affiner votre recherche selon vos critères.
      </p>

      <Image
        src="/screenshot-projects-list-with-filters.png"
        alt="Page des projets avec filtres de recherche activés"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Utilisation des filtres</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Filtres de ciblage</h3>
          <ul className="text-gray-700 space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">📍</span>
              <div>
                <strong>Localisation</strong><br/>
                <span className="text-sm text-gray-600">Ville, département, rayon d&apos;intervention</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">💰</span>
              <div>
                <strong>Budget</strong><br/>
                <span className="text-sm text-gray-600">Fourchette de prix compatible</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">🔧</span>
              <div>
                <strong>Spécialité</strong><br/>
                <span className="text-sm text-gray-600">Types de chantier maîtrisés</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">⏱️</span>
              <div>
                <strong>Délais</strong><br/>
                <span className="text-sm text-gray-600">Durée compatible avec vos disponibilités</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Tri et organisation</h3>
          <p className="text-gray-700 mb-4">Options de tri disponibles :</p>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>• <strong>Plus récents</strong> : Nouveaux projets en premier</li>
            <li>• <strong>Budget croissant</strong> : Du moins cher au plus cher</li>
            <li>• <strong>Budget décroissant</strong> : Du plus cher au moins cher</li>
            <li>• <strong>Délai court</strong> : Projets urgents en premier</li>
            <li>• <strong>Proximité</strong> : Les plus proches de votre base</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analyse d&apos;un projet</h2>

      <div className="bg-yellow-50 rounded-lg p-6 mb-8 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">🔍 Avant de candidater, vérifiez :</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">Faisabilité technique</h4>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Correspond à votre expertise</li>
              <li>• Matériels et équipements disponibles</li>
              <li>• Contraintes techniques maîtrisées</li>
              <li>• Accès au chantier possible</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">Rentabilité commerciale</h4>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Budget cohérent avec vos tarifs</li>
              <li>• Délais réalisables</li>
              <li>• Coûts de déplacement acceptables</li>
              <li>• Marge bénéficiaire suffisante</li>
            </ul>
          </div>
        </div>
      </div>

      <Image
        src="/screenshot-project-detail-analysis.png"
        alt="Page de détail d'un projet avec toutes les informations pour analyse"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Processus de candidature</h2>

      <div className="space-y-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Formulaire de candidature</h3>
          <p className="text-gray-700 mb-4">
            Cliquez sur &quot;Postuler&quot; pour accéder au formulaire de candidature. 
            Ce formulaire vous permet de personnaliser votre offre pour chaque projet.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Champs à remplir :</h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Prix proposé (hors taxes)</li>
              <li>• Délai de réalisation en jours</li>
              <li>• Message de présentation personnalisé</li>
              <li>• Expérience similaire détaillée</li>
              <li>• Matériels et équipements disponibles</li>
              <li>• Composition de l&apos;équipe assignée</li>
            </ul>
          </div>
        </div>
      </div>

      <Image
        src="/screenshot-candidature-form.png"
        alt="Formulaire de candidature avec tous les champs à remplir"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Conseils pour se démarquer</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Bonnes pratiques</h3>
          <ul className="text-green-800 space-y-2 text-sm">
            <li>• Personnalisez chaque candidature</li>
            <li>• Référencez le projet spécifiquement</li>
            <li>• Mettez en avant votre expérience similaire</li>
            <li>• Proposez des garanties étendues</li>
            <li>• Soyez transparent sur vos méthodes</li>
            <li>• Incluez des références vérifiables</li>
          </ul>
        </div>

        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4">❌ Erreurs à éviter</h3>
          <ul className="text-red-800 space-y-2 text-sm">
            <li>• Messages génériques copiés-collés</li>
            <li>• Prix trop bas ou irréalistes</li>
            <li>• Délais impossibles à tenir</li>
            <li>• Manque de détails techniques</li>
            <li>• Absence de références</li>
            <li>• Candidatures multiples non ciblées</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaine étape</h3>
        <p className="text-gray-700 mb-4">
          Vous savez maintenant comment rechercher et postuler aux projets. 
          Découvrez comment structurer des offres gagnantes.
        </p>
        <a
          href="/documentation/3-4-structurer-offre"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          3.4 Structurer son offre →
        </a>
      </div>
    </article>
  )
}
