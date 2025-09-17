import toast from 'react-hot-toast'

// Types pour les notifications
export interface NotificationOptions {
  duration?: number
  id?: string
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

// Notifications de succès
export const notifySuccess = (message: string, options?: NotificationOptions) => {
  return toast.success(message, {
    duration: options?.duration || 4000,
    id: options?.id,
    position: options?.position,
  })
}

// Notifications d'erreur
export const notifyError = (message: string, options?: NotificationOptions) => {
  return toast.error(message, {
    duration: options?.duration || 5000,
    id: options?.id,
    position: options?.position,
  })
}

// Notifications d'information
export const notifyInfo = (message: string, options?: NotificationOptions) => {
  return toast(message, {
    duration: options?.duration || 4000,
    id: options?.id,
    position: options?.position,
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      border: '1px solid #2563eb',
    },
  })
}

// Notifications de chargement
export const notifyLoading = (message: string, options?: NotificationOptions) => {
  return toast.loading(message, {
    id: options?.id,
    position: options?.position,
  })
}

// Notifications personnalisées
export const notifyCustom = (message: string, icon?: string, options?: NotificationOptions) => {
  return toast(message, {
    duration: options?.duration || 4000,
    id: options?.id,
    position: options?.position,
    icon: icon,
  })
}

// Fermer une notification spécifique
export const dismissNotification = (id: string) => {
  toast.dismiss(id)
}

// Fermer toutes les notifications
export const dismissAllNotifications = () => {
  toast.dismiss()
}

// Notifications pour les actions courantes
export const notifications = {
  // Authentification
  loginSuccess: () => notifySuccess('Connexion réussie ! Bienvenue.'),
  loginError: () => notifyError('Erreur de connexion. Vérifiez vos identifiants.'),
  logoutSuccess: () => notifySuccess('Déconnexion réussie. À bientôt !'),
  registerSuccess: () => notifySuccess('Inscription réussie ! Bienvenue sur Chantier Direct.'),
  registerError: () => notifyError('Erreur lors de l\'inscription. Veuillez réessayer.'),

  // Documents
  documentUploadSuccess: () => notifySuccess('Document téléchargé avec succès !'),
  documentUploadError: () => notifyError('Erreur lors du téléchargement du document.'),
  documentValidated: () => notifySuccess('Document validé par nos équipes.'),
  documentRejected: (reason?: string) => notifyError(`Document rejeté${reason ? ': ' + reason : '.'}`),

  // Projets
  projectCreated: () => notifySuccess('Projet créé avec succès !'),
  projectUpdated: () => notifySuccess('Projet mis à jour.'),
  projectDeleted: () => notifySuccess('Projet supprimé.'),
  projectError: () => notifyError('Erreur lors de l\'opération sur le projet.'),

  // Offres
  offerSubmitted: () => notifySuccess('Offre soumise avec succès !'),
  offerAccepted: () => notifySuccess('Félicitations ! Votre offre a été acceptée.'),
  offerRejected: () => notifyInfo('Votre offre n\'a pas été retenue cette fois.'),
  offerWithdrawn: () => notifyInfo('Offre retirée.'),
  contractorSelected: (name: string) => notifySuccess(`${name} a été sélectionné ! Les autres candidats ont été notifiés.`),

  // Évaluations
  evaluationSubmitted: () => notifySuccess('Évaluation soumise. Merci pour votre retour !'),
  
  // Erreurs génériques
  networkError: () => notifyError('Erreur de connexion. Vérifiez votre connexion internet.'),
  unauthorizedError: () => notifyError('Accès non autorisé. Veuillez vous reconnecter.'),
  serverError: () => notifyError('Erreur serveur. Nos équipes ont été notifiées.'),
  validationError: (message: string) => notifyError(`Erreur de validation: ${message}`),

  // Actions génériques
  saveSuccess: () => notifySuccess('Sauvegarde réussie !'),
  saveError: () => notifyError('Erreur lors de la sauvegarde.'),
  deleteSuccess: () => notifySuccess('Suppression réussie.'),
  deleteError: () => notifyError('Erreur lors de la suppression.'),
  
  // Profil
  profileUpdated: () => notifySuccess('Profil mis à jour avec succès !'),
  passwordChanged: () => notifySuccess('Mot de passe modifié avec succès.'),
  
  // Recherche
  noResults: () => notifyInfo('Aucun résultat trouvé pour votre recherche.'),
} 