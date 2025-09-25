'use client'

import React, { useState, useEffect } from 'react'
import { OffreStatus } from '@prisma/client'

interface Offre {
  id: string
  prixPropose: number
  delaiPropose: number
  message?: string
  status: OffreStatus
  createdAt: string
  experienceSimilaire?: string
  materielsDisponibles?: string
  equipeAssignee?: string
  projet: {
    id: string
    titre: string
    typeChantier: string[]
    villeChantier: string
    donneurOrdre: {
      nom: string
      prenom?: string
      nomSociete?: string
    }
  }
  sousTraitant: {
    id: string
    nom: string
    prenom?: string
    nomSociete?: string
    email: string
    telephone: string
  }
}

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (reason: string) => void
  offre: Offre | null
  loading?: boolean
}

function DeleteModal({ isOpen, onClose, onDelete, offre, loading = false }: DeleteModalProps) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim()) {
      onDelete(reason.trim())
      setReason('')
      onClose()
    }
  }

  if (!isOpen || !offre) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Supprimer l&apos;offre</h3>
        <p className="text-sm text-gray-600 mb-4">
          Offre de <strong>{offre.sousTraitant.nomSociete || `${offre.sousTraitant.prenom} ${offre.sousTraitant.nom}`}</strong> 
          pour le projet <strong>&quot;{offre.projet.titre}&quot;</strong>
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Attention :</strong> Cette action est irréversible. L&apos;offre sera définitivement supprimée après envoi de l&apos;email de notification.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Raison de la suppression *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="Expliquez pourquoi cette offre est supprimée..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Suppression...' : 'Supprimer définitivement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminOffresPage() {
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    offre: Offre | null
  }>({
    isOpen: false,
    offre: null
  })
  const [deleting, setDeleting] = useState(false)

  const fetchOffres = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/offres')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des offres')
      }
      const data = await response.json()
      setOffres(data.offres || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reason: string) => {
    if (!deleteModal.offre) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/offres/${deleteModal.offre.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'offre')
      }

      // Recharger les offres
      await fetchOffres()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    fetchOffres()
  }, [])

  // Grouper les offres par projet
  const offresByProjet = offres.reduce((acc, offre) => {
    const projetId = offre.projet.id
    if (!acc[projetId]) {
      acc[projetId] = {
        projet: offre.projet,
        offres: []
      }
    }
    acc[projetId].offres.push(offre)
    return acc
  }, {} as Record<string, { projet: Offre['projet'], offres: Offre[] }>)

  const getStatusBadge = (status: OffreStatus) => {
    const styles = {
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
      ACCEPTEE: 'bg-green-100 text-green-800',
      REFUSEE: 'bg-red-100 text-red-800',
      RETIREE: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      EN_ATTENTE: 'En attente',
      ACCEPTEE: 'Acceptée',
      REFUSEE: 'Refusée',
      RETIREE: 'Retirée'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des offres</h1>
        <button
          onClick={fetchOffres}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {Object.keys(offresByProjet).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune offre trouvée</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(offresByProjet).map(([projetId, { projet, offres: projetOffres }]) => (
            <div key={projetId} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{projet.titre}</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                  <span>📍 {projet.villeChantier}</span>
                  <span>•</span>
                  <span>🏗️ {projet.typeChantier.join(', ')}</span>
                  <span>•</span>
                  <span>👤 {projet.donneurOrdre.nomSociete || `${projet.donneurOrdre.prenom} ${projet.donneurOrdre.nom}`}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {projetOffres.length} offre{projetOffres.length > 1 ? 's' : ''}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sous-traitant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix proposé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Délai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projetOffres.map((offre) => (
                      <React.Fragment key={offre.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {offre.sousTraitant.nomSociete || `${offre.sousTraitant.prenom} ${offre.sousTraitant.nom}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {offre.sousTraitant.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                📞 {offre.sousTraitant.telephone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(offre.prixPropose)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {offre.delaiPropose} jour{offre.delaiPropose > 1 ? 's' : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(offre.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(offre.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, offre })}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                        
                        {/* Détails de l'offre */}
                        {(offre.message || offre.experienceSimilaire || offre.materielsDisponibles || offre.equipeAssignee) && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="bg-white p-4 rounded border">
                                <div className="text-sm font-medium text-gray-900 mb-3">
                                  Détails de l&apos;offre de {offre.sousTraitant.nomSociete || `${offre.sousTraitant.prenom} ${offre.sousTraitant.nom}`}
                                </div>
                                <div className="space-y-3">
                                  {offre.message && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-600">💬 Message :</span>
                                      <p className="text-sm text-gray-800 mt-1 p-2 bg-blue-50 rounded">{offre.message}</p>
                                    </div>
                                  )}
                                  {offre.experienceSimilaire && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-600">🏗️ Expérience similaire :</span>
                                      <p className="text-sm text-gray-800 mt-1 p-2 bg-green-50 rounded">{offre.experienceSimilaire}</p>
                                    </div>
                                  )}
                                  {offre.materielsDisponibles && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-600">🔧 Matériels disponibles :</span>
                                      <p className="text-sm text-gray-800 mt-1 p-2 bg-yellow-50 rounded">{offre.materielsDisponibles}</p>
                                    </div>
                                  )}
                                  {offre.equipeAssignee && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-600">👥 Équipe assignée :</span>
                                      <p className="text-sm text-gray-800 mt-1 p-2 bg-purple-50 rounded">{offre.equipeAssignee}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, offre: null })}
        onDelete={handleDelete}
        offre={deleteModal.offre}
        loading={deleting}
      />
    </div>
  )
}
