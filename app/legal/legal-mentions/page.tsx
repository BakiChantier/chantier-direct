export default function LegalMentionsPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Mentions Légales
          </h1>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800 text-sm">
              Informations légales obligatoires conformément à la loi française
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Éditeur */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Éditeur du Site</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Raison sociale</h3>
                  <p className="text-gray-700">Chantier-Direct SAS</p>
                  
                  <h3 className="font-semibold text-gray-900 mb-3 mt-4">Forme juridique</h3>
                  <p className="text-gray-700">Société par Actions Simplifiée (SAS)</p>
                  
                  <h3 className="font-semibold text-gray-900 mb-3 mt-4">Capital social</h3>
                  <p className="text-gray-700">10 000 € (dix mille euros)</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Siège social</h3>
                  <p className="text-gray-700">
                    [Adresse du siège social]<br/>
                    [Code postal] [Ville]<br/>
                    France
                  </p>
                  
                  <h3 className="font-semibold text-gray-900 mb-3 mt-4">Identification</h3>
                  <div className="space-y-1 text-gray-700">
                    <p><strong>RCS :</strong> [Ville] [Numéro RCS]</p>
                    <p><strong>SIRET :</strong> [Numéro SIRET]</p>
                    <p><strong>TVA :</strong> FR[XX][XXXXXXXXX]</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Directeur de publication */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Directeur de la Publication</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                <strong>Nom :</strong> [Nom du directeur de publication]<br/>
                <strong>Qualité :</strong> Président de Chantier-Direct SAS
              </p>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hébergement</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Vercel Inc.</h3>
                  <div className="text-blue-800 text-sm space-y-1">
                    <p>185 Broadway</p>
                    <p>New York, NY 10006</p>
                    <p><strong>Téléphone :</strong> +1 (212) 475-8290</p>
                    <p><strong>Site web :</strong> <a href="https://www.vercel.com" className="text-blue-600 hover:text-blue-700">www.vercel.com</a></p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Propriété Intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              L&apos;ensemble des éléments composant le site Chantier-Direct (textes, images, vidéos, logos, 
              icônes, sons, logiciels, etc.) ainsi que le site lui-même sont protégés par les lois 
              françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Utilisation autorisée</h4>
              <p className="text-yellow-800 text-sm">
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie 
                des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, 
                sauf autorisation écrite préalable de Chantier-Direct.
              </p>
            </div>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation de Responsabilité</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Chantier-Direct s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations 
              diffusées sur ce site. Toutefois, Chantier-Direct ne peut garantir l&apos;exactitude, 
              la précision ou l&apos;exhaustivité des informations mises à disposition.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">🚫 Exclusions de responsabilité</h4>
              <ul className="text-red-800 text-sm space-y-1">
                <li>• Interruptions temporaires du service pour maintenance</li>
                <li>• Dysfonctionnements techniques indépendants de notre volonté</li>
                <li>• Relations contractuelles entre utilisateurs</li>
                <li>• Contenus publiés par les utilisateurs</li>
              </ul>
            </div>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Droit Applicable</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les présentes mentions légales sont soumises au droit français. 
              En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-lg p-6 mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant ces mentions légales :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>Email :</strong> legal@chantier-direct.fr</p>
                <p><strong>Téléphone :</strong> +33 (0)1 XX XX XX XX</p>
              </div>
              <div>
                <p><strong>Courrier :</strong></p>
                <p>Service Juridique - Chantier-Direct<br/>
                [Adresse complète]</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
