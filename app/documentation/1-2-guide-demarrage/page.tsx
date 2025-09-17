import Image from 'next/image'

export default function GuideDemarragePage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">1.2 Guide de démarrage</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Démarrage rapide</h2>
        <p className="text-blue-800">
          Suivez ce guide étape par étape pour créer votre compte et commencer à utiliser Chantier-Direct.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Étape 1 : Création de compte</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <h3 className="text-xl font-semibold text-orange-900 mb-4">👔 Pour les Donneurs d&apos;Ordre</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">1</div>
              <div>
                <p className="font-medium text-orange-900">Accédez à la page d&apos;inscription</p>
                <p className="text-sm text-orange-800">Cliquez sur &quot;S&apos;inscrire&quot; puis &quot;Donneur d&apos;ordre&quot;</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">2</div>
              <div>
                <p className="font-medium text-orange-900">Remplissez vos informations</p>
                <p className="text-sm text-orange-800">Nom, prénom, entreprise, coordonnées</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">3</div>
              <div>
                <p className="font-medium text-orange-900">Validez votre email</p>
                <p className="text-sm text-orange-800">Cliquez sur le lien reçu par email</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">4</div>
              <div>
                <p className="font-medium text-orange-900">Accédez à votre dashboard</p>
                <p className="text-sm text-orange-800">Commencez à créer vos appels d&apos;offres</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-xl font-semibold text-green-900 mb-4">🔧 Pour les Sous-Traitants</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">1</div>
              <div>
                <p className="font-medium text-green-900">Accédez à la page d&apos;inscription</p>
                <p className="text-sm text-green-800">Cliquez sur &quot;S&apos;inscrire&quot; puis &quot;Sous-traitant&quot;</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">2</div>
              <div>
                <p className="font-medium text-green-900">Complétez votre profil</p>
                <p className="text-sm text-green-800">Spécialités, zone d&apos;intervention, équipe</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">3</div>
              <div>
                <p className="font-medium text-green-900">Téléchargez vos documents</p>
                <p className="text-sm text-green-800">Attestations, assurances, certifications</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1">4</div>
              <div>
                <p className="font-medium text-green-900">Attendez la validation</p>
                <p className="text-sm text-green-800">Vérification administrative sous 48h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Image
        src="/PageFormulaireInscriptionDO.png"
        alt="Formulaire d'inscription Chantier-Direct avec choix du type de profil"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Étape 2 : Documents obligatoires (sous-traitants)</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">⚠️ Important</h3>
        <p className="text-yellow-800">
            Les sous-traitants doivent fournir tous les documents obligatoires pour pouvoir candidater aux projets. 
          Cette vérification garantit la conformité légale et la qualité du réseau.
        </p>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obligatoire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validité</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Attestation de vigilance</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-green-600">✅ Oui</span></td>
              <td className="px-6 py-4 text-sm text-gray-500">Document URSSAF à jour</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 mois</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Extrait Kbis</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-green-600">✅ Oui</span></td>
              <td className="px-6 py-4 text-sm text-gray-500">Immatriculation entreprise</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 mois</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Attestation fiscale</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-green-600">✅ Oui</span></td>
              <td className="px-6 py-4 text-sm text-gray-500">Régularité fiscale</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 an</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Assurance RC Pro</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-green-600">✅ Oui</span></td>
              <td className="px-6 py-4 text-sm text-gray-500">Responsabilité civile</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 an</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Assurance décennale</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-green-600">✅ Oui</span></td>
              <td className="px-6 py-4 text-sm text-gray-500">Selon activité</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 an</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">RIB</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-green-600">✅ Oui</span></td>
              <td className="px-6 py-4 text-sm text-gray-500">Relevé d&apos;identité bancaire</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Liste salariés étrangers</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-orange-600">⚠️ Si applicable</span></td>
              <td className="px-6 py-4 text-sm text-gray-500">Déclaration préalable</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">6 mois</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Image
        src="/PageUploadDocuments.png"
        alt="Interface de téléchargement de documents avec statuts de validation"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Étape 3 : Premier projet</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📝 Créer un appel d&apos;offres</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-mono text-red-600 mr-3">1.</span>
              Accédez à votre dashboard donneur d&apos;ordre
            </li>
            <li className="flex items-start">
              <span className="font-mono text-red-600 mr-3">2.</span>
              Cliquez sur &quot;Nouvel appel d&apos;offre&quot;
            </li>
            <li className="flex items-start">
              <span className="font-mono text-red-600 mr-3">3.</span>
              Décrivez votre projet en détail
            </li>
            <li className="flex items-start">
              <span className="font-mono text-red-600 mr-3">4.</span>
              Définissez budget et délais
            </li>
            <li className="flex items-start">
              <span className="font-mono text-red-600 mr-3">5.</span>
              Publiez votre annonce
            </li>
          </ol>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Répondre à un appel d&apos;offres</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-mono text-green-600 mr-3">1.</span>
              Parcourez les projets disponibles
            </li>
            <li className="flex items-start">
              <span className="font-mono text-green-600 mr-3">2.</span>
              Utilisez les filtres pour cibler
            </li>
            <li className="flex items-start">
              <span className="font-mono text-green-600 mr-3">3.</span>
              Cliquez sur un projet qui vous intéresse
            </li>
            <li className="flex items-start">
              <span className="font-mono text-green-600 mr-3">4.</span>
              Rédigez votre offre personnalisée
            </li>
            <li className="flex items-start">
              <span className="font-mono text-green-600 mr-3">5.</span>
              Soumettez votre candidature
            </li>
          </ol>
        </div>
      </div>

      <Image
        src="/PageAppelOffreAvecPreview.png"
        alt="Formulaire de création d'appel d'offres avec tous les champs requis"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Conseils pour bien commencer</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Lisez la documentation</h3>
          <p className="text-sm text-gray-600">
            Prenez le temps de parcourir les guides spécifiques à votre profil
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Complétez votre profil</h3>
          <p className="text-sm text-gray-600">
            Un profil complet augmente vos chances de succès
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Contactez le support</h3>
          <p className="text-sm text-gray-600">
            Notre équipe est là pour vous accompagner dans vos premiers pas
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Validation et activation</h2>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Processus de validation</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">1</div>
            <div>
              <p className="font-medium text-gray-900">Soumission des documents</p>
              <p className="text-sm text-gray-600">Upload et vérification automatique</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">2</div>
            <div>
              <p className="font-medium text-gray-900">Vérification administrative</p>
              <p className="text-sm text-gray-600">Contrôle par notre équipe (24-48h)</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">3</div>
            <div>
              <p className="font-medium text-gray-900">Activation du compte</p>
              <p className="text-sm text-gray-600">Notification par email + accès complet</p>
            </div>
          </div>
        </div>
      </div>

      <Image
        src="/PageStatut2Verif.png"
        alt="Statuts de validation des documents avec indicateurs visuels"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prêt pour la suite ?</h3>
        <p className="text-gray-700 mb-4">
          Maintenant que votre compte est configuré, découvrez les guides spécifiques à votre profil.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/documentation/2-donneur-ordres"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
          >
            Guide Donneur d&apos;Ordre →
          </a>
          <a
            href="/documentation/3-sous-traitants"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Guide Sous-Traitant →
          </a>
        </div>
      </div>
    </article>
  )
}
