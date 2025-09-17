import Link from 'next/link'


export default function TermsPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Conditions Générales d&apos;Utilisation
          </h1>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800 text-sm">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Article 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Objet et Champ d&apos;Application</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les présentes Conditions Générales d&apos;Utilisation (ci-après &quot;CGU&quot;) régissent l&apos;utilisation 
              de la plateforme Chantier-Direct, accessible à l&apos;adresse <strong>www.chantier-direct.fr</strong> 
              (ci-après &quot;la Plateforme&quot;).
            </p>
            <p className="text-gray-700 leading-relaxed">
              La Plateforme est un service de mise en relation entre donneurs d&apos;ordre et sous-traitants 
              dans le secteur du bâtiment et des travaux publics (BTP). L&apos;utilisation de la Plateforme 
              implique l&apos;acceptation pleine et entière des présentes CGU.
            </p>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Définitions</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="font-semibold text-gray-900">Plateforme :</dt>
                  <dd className="text-gray-700">Le site web Chantier-Direct et tous ses services associés.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Utilisateur :</dt>
                  <dd className="text-gray-700">Toute personne physique ou morale utilisant la Plateforme.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Donneur d&apos;Ordre :</dt>
                  <dd className="text-gray-700">Utilisateur recherchant des prestations de services BTP.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Sous-traitant :</dt>
                  <dd className="text-gray-700">Professionnel du BTP proposant ses services via la Plateforme.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Projet :</dt>
                  <dd className="text-gray-700">Demande de prestation publiée par un Donneur d&apos;Ordre.</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Inscription et Compte Utilisateur</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Conditions d&apos;inscription</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              L&apos;inscription sur la Plateforme est gratuite et ouverte aux personnes physiques majeures 
              et aux personnes morales. Les informations fournies lors de l&apos;inscription doivent être 
              exactes, complètes et à jour.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Vérification des sous-traitants</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les sous-traitants doivent fournir les documents suivants pour validation :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Attestation de vigilance URSSAF (moins de 3 mois)</li>
              <li>Extrait Kbis ou justificatif d&apos;immatriculation</li>
              <li>Attestation de régularité fiscale</li>
              <li>Assurance responsabilité civile professionnelle</li>
              <li>Assurance décennale (selon l&apos;activité)</li>
              <li>RIB au nom de l&apos;entreprise</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">3.3 Responsabilité du compte</h3>
            <p className="text-gray-700 leading-relaxed">
              Chaque Utilisateur est responsable de la confidentialité de ses identifiants de connexion 
              et de toutes les activités effectuées sous son compte.
            </p>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Utilisation de la Plateforme</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Services proposés</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              La Plateforme permet aux Donneurs d&apos;Ordre de publier des projets et aux Sous-traitants 
              de soumettre des offres. Elle facilite également la communication et le suivi des projets.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Obligations des Utilisateurs</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Il est strictement interdit :</h4>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li>D&apos;utiliser la Plateforme à des fins illégales</li>
                <li>De publier des contenus diffamatoires, discriminatoires ou inappropriés</li>
                <li>De contourner les mesures de sécurité de la Plateforme</li>
                <li>D&apos;usurper l&apos;identité d&apos;autrui</li>
                <li>De solliciter des paiements en dehors de la Plateforme</li>
              </ul>
            </div>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Tarification et Paiements</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Gratuité d&apos;accès</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              L&apos;inscription et la consultation des projets sont entièrement gratuites.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Frais de service</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Des frais de service peuvent s&apos;appliquer lors de la finalisation d&apos;un projet via la Plateforme. 
              Ces frais sont clairement indiqués avant tout engagement et font l&apos;objet d&apos;une facturation transparente.
            </p>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Responsabilité et Garanties</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Rôle d&apos;intermédiaire</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Chantier-Direct agit uniquement en qualité d&apos;intermédiaire technique. La Plateforme ne se substitue 
              pas aux parties dans leurs relations contractuelles et n&apos;assume aucune responsabilité quant 
              à l&apos;exécution des prestations.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 Vérification des professionnels</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bien que nous procédions à des vérifications documentaires, les Utilisateurs restent responsables 
              de leurs propres vérifications concernant les qualifications, assurances et autorisations 
              des professionnels avec lesquels ils contractent.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Limitation de responsabilité</h4>
              <p className="text-red-800 text-sm">
                Chantier-Direct ne saurait être tenu responsable des dommages directs ou indirects 
                résultant de l&apos;utilisation de la Plateforme ou des relations entre Utilisateurs.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Propriété Intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tous les éléments de la Plateforme (textes, images, logos, design, etc.) sont protégés 
              par les droits de propriété intellectuelle et appartiennent à Chantier-Direct ou à ses partenaires.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Toute reproduction, représentation, modification ou exploitation non autorisée est strictement interdite.
            </p>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Protection des Données Personnelles</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Le traitement des données personnelles est régi par notre{' '}
              <Link href="/legal/privacy" className="text-red-600 hover:text-red-700 font-medium">
                Politique de Confidentialité
              </Link>{' '}
              conforme au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Résiliation</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">9.1 Résiliation par l&apos;Utilisateur</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tout Utilisateur peut résilier son compte à tout moment en nous contactant ou 
              via les paramètres de son compte.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">9.2 Résiliation par Chantier-Direct</h3>
            <p className="text-gray-700 leading-relaxed">
              Nous nous réservons le droit de suspendre ou supprimer tout compte en cas de violation 
              des présentes CGU, sans préavis ni indemnité.
            </p>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Droit Applicable et Juridictions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les présentes CGU sont soumises au droit français. En cas de litige, et après tentative 
              de résolution amiable, les tribunaux français seront seuls compétents.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">🤝 Médiation</h4>
              <p className="text-green-800 text-sm">
                Conformément à l&apos;article L.616-1 du Code de la consommation, nous vous informons 
                qu&apos;en cas de litige, vous pouvez recourir gratuitement au service de médiation 
                de la consommation.
              </p>
            </div>
          </section>

          {/* Article 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modification des CGU</h2>
            <p className="text-gray-700 leading-relaxed">
              Chantier-Direct se réserve le droit de modifier les présentes CGU à tout moment. 
              Les Utilisateurs seront informés des modifications substantielles par email. 
              La poursuite de l&apos;utilisation de la Plateforme après modification vaut acceptation 
              des nouvelles conditions.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-lg p-6 mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant ces Conditions Générales d&apos;Utilisation :
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Email :</strong> legal@chantier-direct.fr</p>
              <p><strong>Courrier :</strong> Service Juridique - Chantier-Direct</p>
              <p><strong>Téléphone :</strong> +33 (0)1 XX XX XX XX</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
