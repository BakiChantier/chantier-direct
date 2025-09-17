export default function PrivacyPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité
          </h1>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800 text-sm">
              <strong>Conforme au RGPD</strong> • Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Chantier-Direct s&apos;engage à protéger la confidentialité et la sécurité de vos données personnelles 
              conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi française.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>📍 Responsable de traitement :</strong> Chantier-Direct, société par actions simplifiée
              </p>
            </div>
          </section>

          {/* Article 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Données Collectées</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">1.1 Données d&apos;identification</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>Nom, prénom, raison sociale</li>
              <li>Adresse email et numéro de téléphone</li>
              <li>Adresse postale complète</li>
              <li>Informations de connexion (mot de passe chiffré)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">1.2 Données professionnelles</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>Spécialités et expertises BTP</li>
              <li>Documents de vérification (Kbis, assurances, etc.)</li>
              <li>Références et réalisations</li>
              <li>Évaluations et avis clients</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">1.3 Données de navigation</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Adresse IP et données de géolocalisation</li>
              <li>Cookies et traceurs (voir notre <a href="/legal/cookies" className="text-red-600 hover:text-red-700">Politique des Cookies</a>)</li>
              <li>Historique de navigation sur la Plateforme</li>
            </ul>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Finalités du Traitement</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 Finalités principales</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Création et gestion des comptes utilisateur</li>
                  <li>• Mise en relation professionnelle</li>
                  <li>• Vérification de l&apos;identité et des qualifications</li>
                  <li>• Communication entre utilisateurs</li>
                  <li>• Facturation et paiements</li>
                </ul>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">📊 Finalités secondaires</h4>
                <ul className="text-purple-800 text-sm space-y-1">
                  <li>• Amélioration des services</li>
                  <li>• Statistiques d&apos;utilisation</li>
                  <li>• Prévention de la fraude</li>
                  <li>• Support client</li>
                  <li>• Conformité légale</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Base Légale du Traitement</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900">Exécution du contrat</h4>
                <p className="text-gray-700 text-sm">Gestion des comptes, mise en relation, communication</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">Intérêt légitime</h4>
                <p className="text-gray-700 text-sm">Amélioration des services, prévention de la fraude</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900">Obligation légale</h4>
                <p className="text-gray-700 text-sm">Conservation des factures, vérifications réglementaires</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-gray-900">Consentement</h4>
                <p className="text-gray-700 text-sm">Cookies non essentiels, communications marketing</p>
              </div>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Destinataires des Données</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vos données personnelles peuvent être communiquées aux destinataires suivants :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Autres utilisateurs :</strong> Informations de profil public selon vos paramètres</li>
              <li><strong>Prestataires techniques :</strong> Hébergement (OVH), stockage (Cloudinary)</li>
              <li><strong>Autorités :</strong> Sur demande légale ou judiciaire</li>
              <li><strong>Partenaires :</strong> Uniquement avec votre consentement explicite</li>
            </ul>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Durée de Conservation</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type de données</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Données de compte actif</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Pendant la durée d&apos;utilisation</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Données de compte fermé</td>
                    <td className="px-4 py-3 text-sm text-gray-700">1 an après fermeture</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Documents comptables</td>
                    <td className="px-4 py-3 text-sm text-gray-700">10 ans (obligation légale)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Données de connexion</td>
                    <td className="px-4 py-3 text-sm text-gray-700">1 an (obligation légale)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Vos Droits RGPD</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🔍 Droit d&apos;accès</h4>
                <p className="text-blue-800 text-sm">Obtenir une copie de vos données personnelles</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✏️ Droit de rectification</h4>
                <p className="text-green-800 text-sm">Corriger des données inexactes ou incomplètes</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🗑️ Droit d&apos;effacement</h4>
                <p className="text-red-800 text-sm">Demander la suppression de vos données</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⏸️ Droit à la limitation</h4>
                <p className="text-yellow-800 text-sm">Limiter le traitement de vos données</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">📦 Droit à la portabilité</h4>
                <p className="text-purple-800 text-sm">Récupérer vos données dans un format lisible</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">🚫 Droit d&apos;opposition</h4>
                <p className="text-gray-800 text-sm">Vous opposer au traitement de vos données</p>
              </div>
            </div>

            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">📧 Exercer vos droits</h4>
              <p className="text-red-800 text-sm mb-2">
                Pour exercer vos droits, contactez-nous à <strong>dpo@chantier-direct.fr </strong>  
                 en précisant votre demande et en joignant une copie de votre pièce d&apos;identité.
              </p>
              <p className="text-red-800 text-sm">
                <strong>Délai de réponse :</strong> 1 mois maximum à compter de la réception de votre demande.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Sécurité des Données</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger 
              vos données personnelles contre la destruction, la perte, l&apos;altération, la divulgation 
              ou l&apos;accès non autorisés.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-medium text-blue-900">Chiffrement</h4>
                <p className="text-blue-800 text-sm">SSL/TLS pour toutes les communications</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-medium text-green-900">Hébergement</h4>
                <p className="text-green-800 text-sm">Serveurs sécurisés en France (OVH)</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h4 className="font-medium text-purple-900">Accès restreint</h4>
                <p className="text-purple-800 text-sm">Accès limité aux seules personnes autorisées</p>
              </div>
            </div>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Transferts Internationaux</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vos données sont principalement traitées en France. Certains prestataires techniques 
              peuvent être situés dans l&apos;Union Européenne ou dans des pays disposant d&apos;une décision 
              d&apos;adéquation de la Commission européenne.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>🌍 Cloudinary :</strong> Stockage d&apos;images avec garanties contractuelles appropriées 
                (clauses contractuelles types de la Commission européenne).
              </p>
            </div>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Réclamations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si vous estimez que le traitement de vos données personnelles constitue une violation 
              du RGPD, vous avez le droit d&apos;introduire une réclamation auprès de la CNIL :
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 text-sm space-y-1">
                <strong>CNIL</strong><br/>
                3 Place de Fontenoy - TSA 80715<br/>
                75334 PARIS CEDEX 07<br/>
                <strong>Téléphone :</strong> +33 1 53 73 22 22<br/>
                <strong>Site web :</strong> <a href="https://www.cnil.fr" className="text-red-600 hover:text-red-700">www.cnil.fr</a>
              </p>
            </div>
          </section>

          {/* Contact DPO */}
          <section className="bg-gray-50 rounded-lg p-6 mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🛡️ Délégué à la Protection des Données (DPO)
            </h2>
            <p className="text-gray-700 mb-4">
              Pour toute question relative à la protection de vos données personnelles :
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Email :</strong> dpo@chantier-direct.fr</p>
              <p><strong>Courrier :</strong> DPO - Chantier-Direct</p>
              <p><strong>Réponse :</strong> Sous 1 mois maximum</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
