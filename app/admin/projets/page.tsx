'use client'

import { useState, useEffect } from 'react'
import { DONNEUR_ORDRE_DOCUMENTS } from '@/lib/document-types'
import toast from 'react-hot-toast'

import Image from 'next/image'

interface Projet {
  id: string
  titre: string
  description: string
  prixMax: number
  dureeEstimee: number
  typeChantier: string[]
  adresseChantier: string
  villeChantier: string
  codePostalChantier: string
  dateDebut: string
  dateFin: string
  delai: string
  requisTechniques?: string
  materiaux?: string
  acces?: string
  infosAdditionnelles?: string
  externalFilesLink?: string
  moderationStatus: 'PENDING' | 'VALIDATED' | 'REJECTED'
  rejectionReason?: string
  createdAt: string
  donneurOrdre: {
    id: string
    nom: string
    prenom: string
    email: string
    nomSociete?: string
    documents: Array<{
      type: string
      status: string
    }>
  }
  moderator?: {
    nom: string
    prenom: string
    email: string
  }
  moderatedAt?: string
  _count: {
    offres: number
  }
  images?: Array<{
    id: string
    url: string
    title?: string
    description?: string
    type: string
  }>
}

interface Stats {
  totals: {
    total: number
    pending: number
    validated: number
    rejected: number
  }
  last30Days: {
    created: number
    validated: number
    rejected: number
  }
  recentPending: Projet[]
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  VALIDATED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800'
}

const statusLabels = {
  PENDING: 'En attente',
  VALIDATED: 'Validé',
  REJECTED: 'Rejeté'
}

export default function AdminProjetsPage() {
  const [projets, setProjets] = useState<Projet[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VALIDATED' | 'REJECTED'>('PENDING')
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [moderationAction, setModerationAction] = useState<'VALIDATE' | 'REJECT' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les statistiques
      const statsResponse = await fetch('/api/admin/projets/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Récupérer les projets selon le filtre
      const url = filter === 'ALL' 
        ? '/api/admin/projets' 
        : `/api/admin/projets?status=${filter}`
        
      const projetsResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (projetsResponse.ok) {
        const projetsData = await projetsResponse.json()
        setProjets(projetsData.projets)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async () => {
    if (!selectedProjet || !moderationAction) return
    
    if (moderationAction === 'REJECT' && !rejectionReason.trim()) {
      toast.error('Veuillez préciser la raison du rejet')
      return
    }

    try {
      setSubmitting(true)
      
      const response = await fetch(`/api/admin/projets/${selectedProjet.id}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: moderationAction,
          rejectionReason: moderationAction === 'REJECT' ? rejectionReason : undefined
        })
      })

      if (response.ok) {
        
        // Notification de succès avec icône personnalisée
        if (moderationAction === 'VALIDATE') {
          toast.success('✅ Projet validé avec succès !', {
            duration: 5000,
            style: {
              background: '#10b981',
              color: '#fff',
              fontWeight: '600',
            }
          })
        } else {
          toast.success('🚫 Projet rejeté avec succès', {
            duration: 5000,
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: '600',
            }
          })
        }
        
        setShowModerationModal(false)
        setSelectedProjet(null)
        setModerationAction(null)
        setRejectionReason('')
        fetchData() // Recharger les données
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la modération', {
          duration: 6000,
          style: {
            background: '#ef4444',
            color: '#fff',
            fontWeight: '600',
          }
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la modération', {
        duration: 6000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: '600',
        }
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openModerationModal = (projet: Projet, action: 'VALIDATE' | 'REJECT') => {
    setSelectedProjet(projet)
    setModerationAction(action)
    setShowModerationModal(true)
  }

  const openDetailsModal = (projet: Projet) => {
    setSelectedProjet(projet)
    setShowDetailsModal(true)
  }

  const checkDonneurOrdreDocuments = (projet: Projet): 'VERIFIED' | 'PENDING' | 'BLOCKED' => {
    const required = DONNEUR_ORDRE_DOCUMENTS.filter(d => d.required)
    const statuses = required.map(cfg => 
      projet.donneurOrdre.documents.find(d => d.type === cfg.type)?.status || 'MISSING'
    )
    
    if (statuses.every(s => s === 'APPROVED')) return 'VERIFIED'
    if (statuses.some(s => s === 'REJECTED' || s === 'MISSING')) return 'BLOCKED'
    return 'PENDING'
  }

  const isPdfFile = (image: { url: string; title?: string }) => {
    // Vérifier si c'est un PDF par l'URL ou le nom du fichier
    return image.url.toLowerCase().includes('.pdf') || image.title?.toLowerCase().endsWith('.pdf')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modération des Projets</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérer la validation des appels d&apos;offres publiés par les donneurs d&apos;ordre
          </p>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totals.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totals.pending}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Validés</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totals.validated}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rejetés</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totals.rejected}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'ALL', label: 'Tous' },
              { key: 'PENDING', label: 'En attente' },
              { key: 'VALIDATED', label: 'Validés' },
              { key: 'REJECTED', label: 'Rejetés' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === key
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {projets.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              Aucun projet trouvé pour ce filtre
            </li>
          ) : (
            projets.map((projet) => {
              const documentStatus = checkDonneurOrdreDocuments(projet)
              
              return (
                <li key={projet.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {projet.titre}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {projet.donneurOrdre.nomSociete || `${projet.donneurOrdre.prenom} ${projet.donneurOrdre.nom}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {projet.villeChantier} • {projet.prixMax.toLocaleString()}€ max
                          </p>
                        </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[projet.moderationStatus]}`}>
                          {statusLabels[projet.moderationStatus]}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Créé le {new Date(projet.createdAt).toLocaleDateString()}</span>
                      {projet.moderatedAt && (
                        <span className="ml-4">
                          Modéré le {new Date(projet.moderatedAt).toLocaleDateString()}
                        </span>
                      )}
                      <span className="ml-4">
                        {projet._count.offres} offre(s)
                      </span>
                    </div>

                    {/* Alerte documents donneur d'ordre */}
                    {documentStatus !== 'VERIFIED' && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-4 w-4 text-orange-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-2">
                            <p className="text-sm font-medium text-orange-800">
                              {documentStatus === 'BLOCKED' 
                                ? '⚠️ Documents du donneur d\'ordre manquants ou rejetés'
                                : '⏳ Documents du donneur d\'ordre en attente de validation'
                              }
                            </p>
                            <p className="text-xs text-orange-700 mt-1">
                              Vérifiez d&apos;abord les documents de l&apos;entreprise avant de valider ce projet
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {projet.rejectionReason && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          <strong>Raison du rejet:</strong> {projet.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => openDetailsModal(projet)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Voir
                    </button>
                    {projet.moderationStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => openModerationModal(projet, 'VALIDATE')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => openModerationModal(projet, 'REJECT')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
              )
            })
          )}
        </ul>
      </div>

      {/* Modal de modération */}
      {showModerationModal && selectedProjet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-6 border max-w-2xl w-full shadow-xl rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {moderationAction === 'VALIDATE' ? 'Valider le projet' : 'Rejeter le projet'}
              </h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{selectedProjet.titre}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Par {selectedProjet.donneurOrdre.nomSociete || `${selectedProjet.donneurOrdre.prenom} ${selectedProjet.donneurOrdre.nom}`}
                </p>
              </div>

              {moderationAction === 'REJECT' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du rejet *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-sans text-base resize-none shadow-sm"
                    placeholder="Expliquez pourquoi ce projet est rejeté...

Exemples de raisons :
• Description trop vague ou incomplète
• Budget irréaliste pour le type de travaux
• Informations techniques insuffisantes
• Non-conformité aux règles de la plateforme

Conseils pour améliorer le projet :
• Ajouter plus de détails techniques
• Préciser les matériaux souhaités
• Ajuster le budget selon les prestations

Vous pouvez utiliser des listes à puces, des retours à la ligne, etc."
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    💡 Conseil : Utilisez des retours à la ligne et des listes à puces pour une meilleure lisibilité. Le formatage sera préservé pour le donneur d&apos;ordre.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModerationModal(false)
                    setSelectedProjet(null)
                    setModerationAction(null)
                    setRejectionReason('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  onClick={handleModeration}
                  disabled={submitting || (moderationAction === 'REJECT' && !rejectionReason.trim())}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    moderationAction === 'VALIDATE'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? 'En cours...' : (moderationAction === 'VALIDATE' ? 'Valider' : 'Rejeter')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails du projet */}
      {showDetailsModal && selectedProjet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-medium text-gray-900">
                Détails du projet
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedProjet(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Informations principales */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{selectedProjet.titre}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Donneur d&apos;ordre :</span>
                    <div className="mt-1">
                      {selectedProjet.donneurOrdre.nomSociete || `${selectedProjet.donneurOrdre.prenom} ${selectedProjet.donneurOrdre.nom}`}
                    </div>
                    <div className="text-gray-500">{selectedProjet.donneurOrdre.email}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Créé le :</span>
                    <div className="mt-1">{new Date(selectedProjet.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</div>
                  </div>
                </div>
              </div>

              {/* Alerte statut documents donneur d'ordre */}
              {(() => {
                const documentStatus = checkDonneurOrdreDocuments(selectedProjet)
                if (documentStatus === 'VERIFIED') return null
                
                return (
                  <div className={`p-4 rounded-lg border ${
                    documentStatus === 'BLOCKED' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className={`h-5 w-5 mt-0.5 ${
                          documentStatus === 'BLOCKED' ? 'text-red-400' : 'text-orange-400'
                        }`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${
                          documentStatus === 'BLOCKED' ? 'text-red-800' : 'text-orange-800'
                        }`}>
                          {documentStatus === 'BLOCKED' 
                            ? '🚫 Documents d\'entreprise non validés'
                            : '⏳ Documents d\'entreprise en attente'
                          }
                        </h3>
                        <div className={`mt-1 text-sm ${
                          documentStatus === 'BLOCKED' ? 'text-red-700' : 'text-orange-700'
                        }`}>
                          <p className="mb-2">
                            Le donneur d&apos;ordre doit avoir ses documents d&apos;entreprise validés avant que ce projet puisse être approuvé.
                          </p>
                          <div className="space-y-1 text-xs">
                            {DONNEUR_ORDRE_DOCUMENTS.filter(d => d.required).map(docConfig => {
                              const doc = selectedProjet.donneurOrdre.documents.find(d => d.type === docConfig.type)
                              const status = doc?.status || 'MISSING'
                              return (
                                <div key={docConfig.type} className="flex items-center">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${
                                    status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                                    status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {status === 'APPROVED' ? '✅' :
                                     status === 'PENDING' ? '⏳' :
                                     status === 'REJECTED' ? '❌' : '❓'
                                    }
                                  </span>
                                  <span>{docConfig.label}</span>
                                </div>
                              )
                            })}
                          </div>
                          <div className="mt-2">
                            <a 
                              href="/admin/documents" 
                              target="_blank"
                              className="text-xs underline hover:no-underline"
                            >
                              → Aller valider les documents
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Types de chantier */}
              <div>
                <span className="font-medium text-gray-500">Types de chantier :</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedProjet.typeChantier.map((type) => (
                    <span key={type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Informations financières et temporelles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium text-gray-500">Budget maximum :</span>
                  <div className="mt-1 text-lg font-semibold text-green-600">
                    {selectedProjet.prixMax.toLocaleString('fr-FR')} €
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Durée estimée :</span>
                  <div className="mt-1 text-lg font-semibold text-blue-600">
                    {selectedProjet.dureeEstimee} jours
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Date limite candidatures :</span>
                  <div className="mt-1 text-lg font-semibold text-orange-600">
                    {new Date(selectedProjet.delai).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Localisation */}
              <div>
                <span className="font-medium text-gray-500">Adresse du chantier :</span>
                <div className="mt-1">
                  {selectedProjet.adresseChantier}<br />
                  {selectedProjet.codePostalChantier} {selectedProjet.villeChantier}
                </div>
              </div>

              {/* Dates du projet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-500">Date de début :</span>
                  <div className="mt-1">{new Date(selectedProjet.dateDebut).toLocaleDateString('fr-FR')}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Date de fin :</span>
                  <div className="mt-1">{new Date(selectedProjet.dateFin).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="font-medium text-gray-500">Description :</span>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ 
                    __html: selectedProjet.description.replace(/\n/g, '<br>')
                  }} />
                </div>
              </div>

              {/* Informations techniques */}
              {(selectedProjet.requisTechniques || selectedProjet.materiaux || selectedProjet.acces) && (
                <div>
                  <span className="font-medium text-gray-500">Informations techniques :</span>
                  <div className="mt-2 space-y-3">
                    {selectedProjet.requisTechniques && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">Prérequis techniques :</div>
                        <div className="mt-1 p-3 bg-gray-50 rounded text-sm">{selectedProjet.requisTechniques}</div>
                      </div>
                    )}
                    {selectedProjet.materiaux && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">Matériaux :</div>
                        <div className="mt-1 p-3 bg-gray-50 rounded text-sm">{selectedProjet.materiaux}</div>
                      </div>
                    )}
                    {selectedProjet.acces && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">Accès au chantier :</div>
                        <div className="mt-1 p-3 bg-gray-50 rounded text-sm">{selectedProjet.acces}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informations additionnelles */}
              {selectedProjet.infosAdditionnelles && (
                <div>
                  <span className="font-medium text-gray-500">Informations additionnelles :</span>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {(() => {
                      try {
                        const infos = JSON.parse(selectedProjet.infosAdditionnelles)
                        return (
                          <div className="space-y-2">
                            {Object.entries(infos).map(([key, value]) => (
                              <div key={key} className="flex">
                                <span className="font-medium text-gray-700 mr-2">{key} :</span>
                                <span className="text-gray-600">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        )
                      } catch {
                        return <div className="text-gray-600">{selectedProjet.infosAdditionnelles}</div>
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Lien externe pour les fichiers */}
              {selectedProjet.externalFilesLink && (
                <div>
                  <span className="font-medium text-gray-500">Fichiers externes :</span>
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">
                          Lien de téléchargement des fichiers
                        </h4>
                        <div className="mt-1">
                          <a 
                            href={selectedProjet.externalFilesLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {selectedProjet.externalFilesLink}
                          </a>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          Plans et photos disponibles via lien externe
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Images uploadées */}
              {selectedProjet.images && selectedProjet.images.length > 0 && (
                <div>
                  <span className="font-medium text-gray-500">Images et documents uploadés ({selectedProjet.images.length}) :</span>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedProjet.images.map((image) => (
                      <div key={image.id} className="relative">
                        {isPdfFile(image) ? (
                          // Affichage pour PDF
                          <div className="w-full h-32 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center">
                            <svg className="w-8 h-8 text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-red-600 font-medium mb-2">PDF</span>
                            <a
                              href={image.url}
                              download={image.title || 'document.pdf'}
                              className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              title="Télécharger le PDF"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Télécharger
                            </a>
                          </div>
                        ) : (
                          // Affichage pour images
                          <>
                            <Image 
                              src={image.url}
                              alt={image.description || image.title || 'Image du projet'}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              width={100}
                              height={100}
                            />
                            <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1">
                              <span className="text-xs font-medium">
                                {image.type === 'PHOTO' ? '📷' : image.type === 'PLAN' ? '📋' : '📐'}
                              </span>
                            </div>
                          </>
                        )}
                        {(image.title || image.description) && (
                          <div className="mt-1 text-xs text-gray-600">
                            {image.title && <div className="font-medium">{image.title}</div>}
                            {image.description && <div>{image.description}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions de modération dans la modale */}
            {selectedProjet.moderationStatus === 'PENDING' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      openModerationModal(selectedProjet, 'REJECT')
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Rejeter ce projet
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      openModerationModal(selectedProjet, 'VALIDATE')
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Valider ce projet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
