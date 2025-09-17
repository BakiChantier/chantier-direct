'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  nom: string
  prenom: string | null
  nomSociete: string | null
  role: 'DONNEUR_ORDRE' | 'SOUS_TRAITANT' | 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  telephone: string
  adresse: string
  ville: string
  codePostal: string
  createdAt: string
  siret?: string
  nombreEmployes?: number
  expertises?: string[]
}

interface UserModalProps {
  user: User
  mode: 'view' | 'edit' | 'delete'
  onClose: () => void
  onDelete: (userId: string) => void
  onUpdate: () => void
  currentUserRole: 'DONNEUR_ORDRE' | 'SOUS_TRAITANT' | 'ADMIN' | 'SUPER_ADMIN'
}

export default function UserModal({ user, mode, onClose, onDelete, onUpdate, currentUserRole }: UserModalProps) {
  const [editData, setEditData] = useState({
    nom: user.nom,
    prenom: user.prenom || '',
    email: user.email,
    telephone: user.telephone,
    nomSociete: user.nomSociete || '',
    adresse: user.adresse,
    ville: user.ville,
    codePostal: user.codePostal,
    isActive: user.isActive,
    role: user.role,
    nombreEmployes: user.nombreEmployes || 1,
    expertises: user.expertises || []
  })
  const [saving, setSaving] = useState(false)

  // Bloquer le scroll de la page de fond
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200'
      case 'DONNEUR_ORDRE': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SOUS_TRAITANT': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin'
      case 'ADMIN': return 'Administrateur'
      case 'DONNEUR_ORDRE': return 'Donneur d\'Ordre'
      case 'SOUS_TRAITANT': return 'Sous-Traitant'
      default: return role
    }
  }

  // Personne ne peut modifier le rôle d'un SUPER_ADMIN, même pas les autres SUPER_ADMIN
  const canEditRole = user.role !== 'SUPER_ADMIN' && (currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN')
  
  const expertiseOptions = [
    'PLOMBERIE', 'ELECTRICITE', 'MACONNERIE', 'PLAQUISTE', 'CARRELAGE', 
    'CLIMATISATION', 'PEINTURE', 'COUVERTURE', 'MENUISERIE', 'TERRASSEMENT', 'AUTRE'
  ]

  const handleExpertiseToggle = (expertise: string) => {
    const newExpertises = editData.expertises.includes(expertise)
      ? editData.expertises.filter(e => e !== expertise)
      : [...editData.expertises, expertise]
    setEditData({...editData, expertises: newExpertises})
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {mode === 'view' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
                {mode === 'edit' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )}
                {mode === 'delete' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {mode === 'view' && 'Détails de l\'utilisateur'}
                  {mode === 'edit' && 'Modifier l\'utilisateur'}
                  {mode === 'delete' && 'Supprimer l\'utilisateur'}
                </h3>
                <p className="text-red-100 text-sm">
                  {user.prenom} {user.nom} • {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'delete' ? (
            <div className="px-8 py-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Confirmer la suppression</h4>
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir supprimer définitivement l&apos;utilisateur <strong>{user.prenom} {user.nom}</strong> ?
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h5 className="font-medium text-red-900 mb-2">⚠️ Cette action supprimera :</h5>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Le compte utilisateur et toutes ses données</li>
                  <li>• Tous les documents uploadés (Cloudinary)</li>
                  {user.role === 'DONNEUR_ORDRE' && (
                    <>
                      <li>• Tous ses projets et appels d&apos;offres</li>
                      <li>• Toutes les images de projets</li>
                      <li>• Tous les messages et évaluations liés</li>
                    </>
                  )}
                  {user.role === 'SOUS_TRAITANT' && (
                    <>
                      <li>• Toutes ses offres soumises</li>
                      <li>• Son profil public et ses références</li>
                      <li>• Toutes les images de références</li>
                    </>
                  )}
                  <li>• Cette action est <strong>irréversible</strong></li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="px-8 py-6">
              {/* Info utilisateur header */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {(user.prenom?.[0] || user.nom[0]).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {user.prenom} {user.nom}
                      </h4>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {user.isActive ? '✅ Actif' : '❌ Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Inscrit le</p>
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    {mode === 'view' ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user.prenom || '-'}</p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editData.prenom}
                        onChange={(e) => setEditData({...editData, prenom: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="Prénom"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    {mode === 'view' ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900 font-medium">{user.nom}</p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editData.nom}
                        onChange={(e) => setEditData({...editData, nom: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="Nom"
                        required
                      />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    {mode === 'view' ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                    ) : (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="email@exemple.com"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    {mode === 'view' ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user.telephone}</p>
                      </div>
                    ) : (
                      <input
                        type="tel"
                        value={editData.telephone}
                        onChange={(e) => setEditData({...editData, telephone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="06 12 34 56 78"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Société</label>
                    {mode === 'view' ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user.nomSociete || '-'}</p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editData.nomSociete}
                        onChange={(e) => setEditData({...editData, nomSociete: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="Nom de l'entreprise"
                      />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    {mode === 'view' ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user.adresse}</p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editData.adresse}
                        onChange={(e) => setEditData({...editData, adresse: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="Adresse complète"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                    {mode === 'view' ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user.codePostal}</p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editData.codePostal}
                        onChange={(e) => setEditData({...editData, codePostal: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="12345"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                    {mode === 'view' ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900">{user.ville}</p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editData.ville}
                        onChange={(e) => setEditData({...editData, ville: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        placeholder="Ville"
                      />
                    )}
                  </div>

                  {/* Gestion du rôle */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                    {mode === 'view' || !canEditRole ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                        {!canEditRole && mode === 'edit' && (
                          <p className="text-xs text-gray-500 mt-2">
                            Vous n&apos;avez pas les permissions pour modifier ce rôle
                          </p>
                        )}
                      </div>
                    ) : (
                      <select
                        value={editData.role}
                        onChange={(e) => setEditData({...editData, role: e.target.value as any})} // eslint-disable-line @typescript-eslint/no-explicit-any
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      >
                        <option value="SOUS_TRAITANT">Sous-Traitant</option>
                        <option value="DONNEUR_ORDRE">Donneur d&apos;Ordre</option>
                        <option value="ADMIN">Administrateur</option>
                        {currentUserRole === 'SUPER_ADMIN' && (
                          <option value="SUPER_ADMIN">Super Administrateur</option>
                        )}
                      </select>
                    )}
                  </div>

                  {/* Statut actif/inactif */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut du compte</label>
                    {mode === 'view' ? (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? '✅ Compte actif' : '❌ Compte suspendu'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="isActive"
                            checked={editData.isActive}
                            onChange={() => setEditData({...editData, isActive: true})}
                            className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm font-medium text-green-700">✅ Actif</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="isActive"
                            checked={!editData.isActive}
                            onChange={() => setEditData({...editData, isActive: false})}
                            className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm font-medium text-red-700">❌ Suspendu</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations spécifiques au rôle */}
                {user.role === 'SOUS_TRAITANT' && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h5 className="text-lg font-medium text-gray-900 mb-4">Informations sous-traitant</h5>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre d&apos;employés</label>
                        {mode === 'view' ? (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                            <p className="text-gray-900">{user.nombreEmployes || '-'}</p>
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={editData.nombreEmployes}
                            onChange={(e) => setEditData({...editData, nombreEmployes: parseInt(e.target.value) || 1})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            placeholder="Nombre d'employés"
                          />
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expertises</label>
                        {mode === 'view' ? (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                            {user.expertises && user.expertises.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {user.expertises.map((expertise, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    {expertise}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">Aucune expertise renseignée</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">Sélectionnez les spécialités de ce sous-traitant :</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {expertiseOptions.map((expertise) => (
                                <label key={expertise} className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={editData.expertises.includes(expertise)}
                                    onChange={() => handleExpertiseToggle(expertise)}
                                    className="mr-2 w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-700">{expertise}</span>
                                </label>
                              ))}
                            </div>
                            <div className="mt-3">
                              <p className="text-xs text-gray-500">
                                {editData.expertises.length} expertise(s) sélectionnée(s)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 flex-shrink-0">
          {mode === 'delete' ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Supprimer définitivement
              </button>
            </>
          ) : mode === 'edit' ? (
            <>
              <button
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sauvegarde...
                  </>
                ) : (
                  'Sauvegarder les modifications'
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
