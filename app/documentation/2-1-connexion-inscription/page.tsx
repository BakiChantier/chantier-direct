import Image from 'next/image'

export default function ConnexionInscriptionDOPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">2.1 Connexion / Inscription Donneur d&apos;Ordre</h1>
      
      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-orange-900 mb-2">Créez votre compte donneur d&apos;ordre</h2>
        <p className="text-orange-800">
          Configurez votre profil d&apos;entreprise pour publier vos premiers appels d&apos;offres.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Processus d&apos;inscription</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-orange-600 font-bold">1</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Accès au formulaire</h3>
          <p className="text-sm text-gray-600">Cliquez sur &quot;S&apos;inscrire&quot; puis &quot;Donneur d&apos;ordre&quot;</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-orange-600 font-bold">2</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Informations entreprise</h3>
          <p className="text-sm text-gray-600">Remplissez vos données professionnelles</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-orange-600 font-bold">3</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Validation email</h3>
          <p className="text-sm text-gray-600">Confirmez votre adresse email</p>
        </div>
      </div>

      <Image
        src="/PageFormulaireInscriptionDO.png"
        alt="Formulaire d'inscription donneur d'ordre avec champs entreprise"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Informations requises</h2>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Champs obligatoires</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Informations personnelles</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• Nom et prénom</li>
              <li>• Adresse email professionnelle</li>
              <li>• Numéro de téléphone</li>
              <li>• Mot de passe sécurisé</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Informations entreprise</h4>
            <ul className="text-gray-700 space-y-1">
              <li>• Nom de la société</li>
              <li>• Adresse complète</li>
              <li>• Code postal et ville</li>
              <li>• Secteur d&apos;activité</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Connexion à votre compte</h2>


      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Conseils pour la connexion</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Utilisez une adresse email professionnelle</li>
          <li>• Choisissez un mot de passe fort (8+ caractères)</li>
          <li>• Activez les notifications par email</li>
          <li>• Complétez votre profil après inscription</li>
        </ul>
      </div>

     

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaine étape</h3>
        <p className="text-gray-700 mb-4">
          Maintenant que votre compte est configuré, apprenez à créer votre premier appel d&apos;offres.
        </p>
        <a
          href="/documentation/2-2-poster-appel-offres"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
        >
          Poster un appel d&apos;offres →
        </a>
      </div>
    </article>
  )
}
