'use client'

import Image from 'next/image'

export default function ConfigurerProfilPublicPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">3.2 Configurer son profil public</h1>
        <p className="text-lg text-gray-600">
          Avant de postuler à des offres, il est essentiel de configurer son profil public pour présenter votre entreprise de manière professionnelle aux donneurs d&apos;ordre.
        </p>
      </div>

      {/* Introduction */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Important</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Un profil public complet et professionnel augmente considérablement vos chances d&apos;être sélectionné par les donneurs d&apos;ordre. C&apos;est votre vitrine commerciale !</p>
            </div>
          </div>
        </div>
      </div>

      {/* Étape 1: Accéder au profil */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Étape 1 : Accéder à la configuration de son profil</h2>
        
        <div className="prose prose-lg max-w-none text-gray-700 mb-6">
          <p>Pour configurer votre profil public, commencez par cliquer sur votre nom dans le header, puis sélectionnez <strong>&quot;Mon Profil&quot;</strong> dans le menu déroulant.</p>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Menu déroulant d&apos;accès au profil</h3>
          <div className="flex justify-center">
            <Image
              src="/MenuDeroulantMonProfil.png"
              alt="Menu déroulant montrant l'option Mon Profil pour accéder à la configuration du profil public"
              width={400}
              height={300}
              className="border rounded-lg shadow-sm"
            />
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center">
            Cliquez sur &quot;Mon Profil&quot; pour accéder à la page de configuration
          </p>
        </div>
      </div>

      {/* Étape 2: Configuration du profil */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Étape 2 : Configuration de son profil public</h2>
        
        <div className="prose prose-lg max-w-none text-gray-700 mb-6">
          <p>La page de configuration vous permet de personnaliser tous les aspects de votre profil public avec un aperçu en temps réel.</p>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interface de configuration avec prévisualisation</h3>
          <div className="flex justify-center">
            <Image
              src="/ScreenProfilPublicEdit.png"
              alt="Interface de modification du profil public avec formulaire à gauche et prévisualisation à droite"
              width={800}
              height={600}
              className="border rounded-lg shadow-sm"
            />
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center">
            Interface de configuration avec prévisualisation en temps réel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">📷 Photo de profil</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Glissez-déposez votre photo ou cliquez pour sélectionner</li>
              <li>• Formats acceptés : JPG, PNG</li>
              <li>• Taille recommandée : 400x400 pixels minimum</li>
              <li>• La photo sera automatiquement redimensionnée</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">🏢 Informations entreprise</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Nom d&apos;affichage (nom de votre entreprise)</li>
              <li>• Slogan ou phrase d&apos;accroche</li>
              <li>• Description détaillée de votre activité</li>
              <li>• Coordonnées de contact</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">🛠️ Expertises et spécialités</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Sélectionnez vos domaines d&apos;expertise</li>
              <li>• Ajoutez des spécialités personnalisées</li>
              <li>• Indiquez votre tarif horaire moyen</li>
              <li>• Précisez le nombre d&apos;employés</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">🌐 Informations de contact</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Adresse complète de votre entreprise</li>
              <li>• Numéro de téléphone professionnel</li>
              <li>• Site web (optionnel)</li>
              <li>• Email de contact public</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Étape 3: Références chantiers */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Étape 3 : Ajouter ses références de chantiers</h2>
        
        <div className="prose prose-lg max-w-none text-gray-700 mb-6">
          <p>Les références de chantiers avec photos sont essentielles pour démontrer la qualité de votre travail aux donneurs d&apos;ordre.</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Conseil</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Ajoutez au minimum 3-5 références de chantiers récents avec des photos de qualité pour maximiser votre crédibilité.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">📸 Upload des images de chantiers</h4>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Glissez-déposez vos images</span> ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu&apos;à 10MB chacune</p>
              </div>
              
              <ul className="space-y-2">
                <li>• <strong>Photos avant/après :</strong> Montrez la transformation</li>
                <li>• <strong>Étapes de réalisation :</strong> Documentez votre processus</li>
                <li>• <strong>Détails techniques :</strong> Mettez en valeur votre savoir-faire</li>
                <li>• <strong>Résultat final :</strong> Présentez le travail achevé</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">📝 Informations des références</h4>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium mb-2">Pour chaque référence, renseignez :</h5>
                <ul className="space-y-2">
                  <li>• <strong>Titre du projet :</strong> Ex: &quot;Rénovation salle de bain complète&quot;</li>
                  <li>• <strong>Description :</strong> Détaillez les travaux réalisés</li>
                  <li>• <strong>Localisation :</strong> Ville du chantier</li>
                  <li>• <strong>Date de réalisation :</strong> Période des travaux</li>
                  <li>• <strong>Durée :</strong> Temps nécessaire à la réalisation</li>
                  <li>• <strong>Budget :</strong> Montant des travaux (optionnel)</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-blue-900">💡 Astuce :</h5>
                <p className="text-blue-800">Organisez vos images par ordre chronologique (avant, pendant, après) pour raconter l&apos;histoire de votre intervention.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Étape 4: Résultat final */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Étape 4 : Son profil public finalisé</h2>
        
        <div className="prose prose-lg max-w-none text-gray-700 mb-6">
          <p>Une fois son profil configuré, voici à quoi il ressemblera pour les donneurs d&apos;ordre qui consulteront son profil.</p>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rendu final de son profil public</h3>
          <div className="flex justify-center">
            <Image
              src="/PageRenduProfilPublic.png"
              alt="Rendu final du profil public tel qu'il apparaît aux donneurs d'ordre avec photo, informations entreprise et références chantiers"
              width={800}
              height={600}
              className="border rounded-lg shadow-sm"
            />
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center">
            Votre profil public tel qu&apos;il apparaît aux donneurs d&apos;ordre
          </p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Profil optimisé</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Votre profil public est maintenant prêt ! Les donneurs d&apos;ordre pourront voir vos compétences, vos références et vous contacter facilement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conseils pour optimiser le profil */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Conseils pour optimiser son profil</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">✅ Les bonnes pratiques</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Utilisez une photo professionnelle et récente</li>
              <li>• Rédigez une description claire et engageante</li>
              <li>• Mettez à jour régulièrement vos références</li>
              <li>• Utilisez des photos de haute qualité</li>
              <li>• Soyez précis sur vos spécialités</li>
              <li>• Répondez rapidement aux messages</li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">❌ À éviter</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Photos floues ou de mauvaise qualité</li>
              <li>• Description trop courte ou générique</li>
              <li>• Informations de contact incomplètes</li>
              <li>• Références obsolètes ou non représentatives</li>
              <li>• Tarifs irréalistes (trop hauts ou trop bas)</li>
              <li>• Profil incomplet ou non mis à jour</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <a
          href="/documentation/3-1-connexion-inscription"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          3.1 Connexion / Inscription
        </a>
        
        <a
          href="/documentation/3-3-postuler-annonces"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
        >
          3.3 Postuler à des annonces
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}
