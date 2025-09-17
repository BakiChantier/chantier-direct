import Image from 'next/image'

export default function IntroductionPage() {
  return (
    <article className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">1. Introduction</h1>
      
      <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
        <h2 className="text-xl font-semibold text-red-900 mb-2">Bienvenue sur Chantier-Direct</h2>
        <p className="text-red-800">
          La plateforme de référence pour la mise en relation entre donneurs d&apos;ordre et sous-traitants du BTP.
        </p>
      </div>

      <Image
        src="/PageAccueil.png"
        alt="Page d'accueil de Chantier-Direct montrant les options d'inscription donneur d'ordre et sous-traitant"
        width={800}
        height={500}
        className="rounded-lg shadow-lg mb-8 border border-gray-200"
      />

      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">À propos de Chantier-Direct</h2>
      
      <p className="text-gray-700 leading-relaxed mb-6">
        Chantier-Direct révolutionne la mise en relation dans le secteur du BTP en proposant une plateforme 
        sécurisée, transparente et efficace. Notre mission est de simplifier la recherche de partenaires 
        commerciaux tout en garantissant la qualité des prestations.
      </p>

      <div className="grid md:grid-cols-2 gap-8 my-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Pour les Donneurs d&apos;Ordre</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Publiez vos appels d&apos;offres facilement</li>
            <li>• Recevez des candidatures qualifiées</li>
            <li>• Comparez les offres en toute transparence</li>
            <li>• Gérez vos projets de A à Z</li>
          </ul>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Pour les Sous-Traitants</h3>
          <ul className="text-green-800 space-y-2 text-sm">
            <li>• Trouvez des projets dans votre région</li>
            <li>• Mettez en valeur votre expertise</li>
            <li>• Développez votre réseau professionnel</li>
            <li>• Construisez votre réputation</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">Organisation de cette documentation</h2>
      
      <p className="text-gray-700 leading-relaxed mb-6">
        Cette documentation est structurée pour vous accompagner progressivement dans la découverte 
        et l&apos;utilisation optimale de Chantier-Direct :
      </p>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <nav className="space-y-3">
          <div className="flex items-center">
            <span className="text-red-600 font-mono text-sm mr-3">1.</span>
            <strong>Introduction</strong> - Vue d&apos;ensemble de la plateforme
          </div>
          <div className="flex items-center">
            <span className="text-red-600 font-mono text-sm mr-3">2.</span>
            <strong>Donneurs d&apos;Ordre</strong> - Création et gestion de projets
          </div>
          <div className="flex items-center">
            <span className="text-red-600 font-mono text-sm mr-3">3.</span>
            <strong>Sous-traitants</strong> - Candidatures et gestion d&apos;offres
          </div>
          <div className="flex items-center">
            <span className="text-red-600 font-mono text-sm mr-3">4.</span>
            <strong>FAQ</strong> - Questions fréquentes et résolution de problèmess
          </div>
        </nav>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">Prérequis</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">Avant de commencer</h3>
        <ul className="text-yellow-800 space-y-2">
          <li>✅ Avoir un navigateur web moderne (Chrome, Firefox, Safari, Edge)</li>
          <li>✅ Une adresse email valide</li>
          <li>✅ Pour les sous-traitants : documents légaux à jour</li>
          <li>✅ Accepter nos conditions générales d&apos;utilisation</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">Sécurité et confidentialité</h2>
      
      <p className="text-gray-700 leading-relaxed mb-6">
        Chantier-Direct accorde une importance primordiale à la sécurité de vos données. 
        Toutes les informations sont chiffrées et notre plateforme est conforme au RGPD.
      </p>

      <div className="grid md:grid-cols-3 gap-6 my-8">
        <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Chiffrement SSL</h3>
          <p className="text-sm text-gray-600">Toutes les communications sont sécurisées</p>
        </div>

        <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Conformité RGPD</h3>
          <p className="text-sm text-gray-600">Respect de la réglementation européenne</p>
        </div>

        <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
          <p className="text-sm text-gray-600">Plateforme rapide et disponible 24/7</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prêt à commencer ?</h3>
        <p className="text-gray-700 mb-4">
            Suivez notre guide de démarrage pour créer votre compte et publier votre premier projet 
          ou soumettre votre première candidature.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/documentation/1-2-guide-demarrage"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Commencer le guide →
          </a>
          <a
            href="/register"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            S&apos;inscrire maintenant
          </a>
        </div>
      </div>
    </article>
  )
}
