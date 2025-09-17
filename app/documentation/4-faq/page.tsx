export default function FAQPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">4. FAQ - Questions Fréquentes</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Centre d&apos;aide Chantier-Direct</h2>
        <p className="text-blue-800">
          Trouvez rapidement les réponses aux questions les plus courantes sur l&apos;utilisation de notre plateforme BTP.
        </p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Rechercher dans la FAQ..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">🚀 Démarrage et inscription</h2>

      <div className="space-y-6 mb-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Comment puis-je m&apos;inscrire sur Chantier-Direct ?
          </h3>
          <p className="text-gray-700 mb-4">
            L&apos;inscription est gratuite et simple. Rendez-vous sur notre page d&apos;accueil, cliquez sur &quot;S&apos;inscrire&quot; 
            et choisissez votre profil (donneur d&apos;ordre ou sous-traitant). Vous devrez fournir quelques informations 
            de base et valider votre adresse email.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Quels documents sont requis pour les sous-traitants ?
          </h3>
          <p className="text-gray-700 mb-4">
            Les sous-traitants doivent fournir plusieurs documents obligatoires pour garantir leur conformité légale :
          </p>
          <ul className="text-gray-700 space-y-1 mb-4">
            <li>• Attestation de vigilance URSSAF (moins de 3 mois)</li>
            <li>• Extrait Kbis ou justificatif d&apos;immatriculation</li>
            <li>• Attestation de régularité fiscale</li>
            <li>• Assurance responsabilité civile professionnelle</li>
            <li>• Assurance décennale (selon l&apos;activité)</li>
            <li>• RIB au nom de l&apos;entreprise</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Combien de temps prend la validation administrative ?
          </h3>
          <p className="text-gray-700 mb-4">
            La validation des documents prend généralement entre 24 et 48 heures ouvrées. 
            Notre équipe vérifie manuellement chaque document pour garantir leur authenticité et validité. 
            Vous recevrez une notification par email dès que votre compte sera activé.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">💼 Gestion des projets</h2>

      <div className="space-y-6 mb-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Comment rédiger un appel d&apos;offres efficace ?
          </h3>
          <p className="text-gray-700 mb-4">
            Un bon appel d&apos;offres doit être précis, complet et attractif. Incluez une description détaillée 
            des travaux, le budget disponible, les délais souhaités, et toutes les contraintes particulières. 
            Plus votre annonce est claire, meilleures seront les candidatures reçues.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Comment comparer les offres reçues ?
          </h3>
          <p className="text-gray-700 mb-4">
            Utilisez notre interface de comparaison qui présente toutes les offres dans un tableau synthétique. 
            Vous pouvez comparer les prix, délais, expériences et consulter les profils détaillés des candidats. 
            N&apos;hésitez pas à poser des questions via la messagerie intégrée.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Que se passe-t-il après la sélection d&apos;un sous-traitant ?
          </h3>
          <p className="text-gray-700 mb-4">
            Une fois le sous-traitant sélectionné, le projet passe en statut &quot;EN_COURS&quot;. Vous pouvez 
            communiquer directement avec votre prestataire via la messagerie, suivre l&apos;avancement 
            et finaliser le projet avec une évaluation détaillée.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">💬 Communication et suivi</h2>

      <div className="space-y-6 mb-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Comment fonctionne la messagerie intégrée ?
          </h3>
          <p className="text-gray-700 mb-4">
            Chaque projet dispose d&apos;une messagerie dédiée pour communiquer avec les candidats puis 
            le prestataire sélectionné. Tous les échanges sont conservés et vous recevez des notifications 
            pour les nouveaux messages.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Comment évaluer un sous-traitant ?
          </h3>
          <p className="text-gray-700 mb-4">
            À la fin du projet, vous pouvez évaluer votre sous-traitant sur 3 critères : qualité du travail, 
            respect des délais, et communication. Votre évaluation aide la communauté et améliore la 
            qualité globale du réseau.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">💰 Tarification et paiements</h2>

      <div className="space-y-6 mb-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Y a-t-il des frais pour utiliser Chantier-Direct ?
          </h3>
          <p className="text-gray-700 mb-4">
            L&apos;inscription et la consultation sont entièrement gratuites. Des frais de service 
            s&apos;appliquent uniquement lors de la finalisation réussie d&apos;un projet via notre plateforme. 
            Ces frais sont transparents et communiqués avant la sélection du prestataire.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Comment sont sécurisés les paiements ?
          </h3>
          <p className="text-gray-700 mb-4">
            Chantier-Direct utilise des partenaires de paiement certifiés PCI-DSS. 
            Toutes les transactions sont chiffrées et nous ne stockons aucune donnée bancaire. 
            Les paiements sont effectués directement entre les parties selon leurs accords.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Besoin d&apos;aide supplémentaire ?</h3>
        <p className="text-gray-700 mb-4">
          Si vous ne trouvez pas la réponse à votre question, notre équipe support est disponible.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/contact"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Contacter le support →
          </a>
          <a
            href="/documentation/2-1-connexion-inscription"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Commencer le guide détaillé
          </a>
        </div>
      </div>
    </article>
  )
}
