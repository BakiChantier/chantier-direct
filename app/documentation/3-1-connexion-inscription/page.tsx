import Image from 'next/image'

export default function ConnexionInscriptionSTPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">3.1 Connexion / Inscription Sous-Traitant</h1>
      
      <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-900 mb-2">Rejoignez le réseau Chantier-Direct</h2>
        <p className="text-green-800">
          Créez votre profil professionnel et accédez aux meilleures opportunités BTP de votre région.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Processus d&apos;inscription détaillé</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Création du compte</h3>
              <p className="text-green-800 text-sm">
                Accédez au formulaire d&apos;inscription sous-traitant et remplissez vos informations de base.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Profil professionnel</h3>
              <p className="text-green-800 text-sm">
                Complétez votre profil avec spécialités, zone d&apos;intervention et équipe.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Documents obligatoires</h3>
              <p className="text-green-800 text-sm">
                Téléchargez toutes les attestations et certifications requises.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Validation administrative</h3>
              <p className="text-green-800 text-sm">
                Attendez la vérification de vos documents (24-48h).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Checklist d&apos;inscription</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded mr-3" />
              <span className="text-sm text-gray-700">Informations personnelles complètes</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded mr-3" />
              <span className="text-sm text-gray-700">Informations entreprise/SIRET</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded mr-3" />
              <span className="text-sm text-gray-700">Spécialités et expertises</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded mr-3" />
              <span className="text-sm text-gray-700">Zone d&apos;intervention définie</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded mr-3" />
              <span className="text-sm text-gray-700">Documents légaux téléchargés</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded mr-3" />
              <span className="text-sm text-gray-700">Email validé</span>
            </label>
          </div>
        </div>
      </div>

      <Image
        src="/PageFormulaireInscriptionST.png"
        alt="Formulaire d'inscription sous-traitant avec champs spécialisés"
        width={800}
        height={600}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Documents obligatoires détaillés</h2>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Attestation de vigilance</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-red-600 text-sm">✅ Obligatoire</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 mois</td>
              <td className="px-6 py-4 text-sm text-gray-500">Document URSSAF prouvant la régularité sociale</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Extrait Kbis</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-red-600 text-sm">✅ Obligatoire</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 mois</td>
              <td className="px-6 py-4 text-sm text-gray-500">Justificatif d&apos;immatriculation au RCS</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Assurance RC Pro</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-red-600 text-sm">✅ Obligatoire</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 an</td>
              <td className="px-6 py-4 text-sm text-gray-500">Responsabilité civile professionnelle</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Assurance décennale</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-red-600 text-sm">✅ Obligatoire</span></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 an</td>
              <td className="px-6 py-4 text-sm text-gray-500">Selon le type d&apos;activité exercée</td>
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

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Validation et activation</h2>

      <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">⏱️ Délais de validation</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">1h</div>
            <div className="text-sm text-blue-800">Vérification automatique</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">24-48h</div>
            <div className="text-sm text-yellow-800">Validation manuelle</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">Immédiat</div>
            <div className="text-sm text-green-800">Activation du compte</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaine étape</h3>
        <p className="text-gray-700 mb-4">
          Votre compte est maintenant configuré ! Découvrez comment rechercher et postuler aux annonces.
        </p>
        <a
          href="/documentation/3-2-configurer-profil-public"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          Configurer mon profil public →
        </a>
      </div>
    </article>
  )
}
