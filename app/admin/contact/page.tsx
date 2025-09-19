'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface ContactRequest {
  id: string
  nom: string
  email: string
  telephone?: string
  sujet: string
  message: string
  status: 'PENDING' | 'READ' | 'REPLIED' | 'CLOSED'
  reponse?: string
  reponseAt?: string
  reponseBy?: {
    id: string
    nom: string
    prenom?: string
  }
  createdAt: string
  updatedAt: string
}

export default function AdminContactPage() {
  const { user } = useUser()
  const router = useRouter()
  
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [statusCounts, setStatusCounts] = useState({
    PENDING: 0,
    READ: 0,
    REPLIED: 0,
    CLOSED: 0
  })
  
  // Filtres et onglets
  const [activeTab, setActiveTab] = useState('PENDING')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (user && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      router.push('/')
      return
    }
    fetchContactRequests()
  }, [user, router, activeTab, searchTerm, currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchContactRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      params.append('status', activeTab)
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/admin/contact?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContactRequests(data.contactRequests)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast.error('Erreur lors du chargement des demandes')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour récupérer les compteurs de statut
  const fetchStatusCounts = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Récupérer les compteurs pour chaque statut
      const counts = await Promise.all([
        fetch(`/api/admin/contact?status=PENDING&limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/contact?status=READ&limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/contact?status=REPLIED&limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/contact?status=CLOSED&limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const statusCountsData = await Promise.all(
        counts.map(async (response) => {
          if (response.ok) {
            const data = await response.json()
            return data.pagination.totalCount
          }
          return 0
        })
      )

      setStatusCounts({
        PENDING: statusCountsData[0],
        READ: statusCountsData[1],
        REPLIED: statusCountsData[2],
        CLOSED: statusCountsData[3]
      })
    } catch (error) {
      console.error('Erreur lors du chargement des compteurs:', error)
    }
  }

  // Charger les compteurs au montage du composant
  useEffect(() => {
    if (user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      fetchStatusCounts()
    }
  }, [user])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Statut mis à jour')
        fetchContactRequests()
        fetchStatusCounts() // Rafraîchir les compteurs
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion')
    }
  }

  const sendReply = async () => {
    if (!selectedRequest || !replyMessage.trim()) return

    setSendingReply(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/contact/${selectedRequest.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reponse: replyMessage })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Réponse envoyée avec succès')
        setShowReplyModal(false)
        setReplyMessage('')
        setSelectedRequest(null)
        fetchContactRequests()
        fetchStatusCounts() // Rafraîchir les compteurs
      } else if (response.status === 207) {
        toast.success('Réponse sauvegardée (email non envoyé)')
        setShowReplyModal(false)
        setReplyMessage('')
        setSelectedRequest(null)
        fetchContactRequests()
        fetchStatusCounts() // Rafraîchir les compteurs
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion')
    } finally {
      setSendingReply(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      READ: 'bg-blue-100 text-blue-800',
      REPLIED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800'
    }
    return badges[status as keyof typeof badges] || badges.PENDING
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'En attente',
      READ: 'Lu',
      REPLIED: 'Répondu',
      CLOSED: 'Fermé'
    }
    return labels[status as keyof typeof labels] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demandes de contact</h1>
          <p className="mt-2 text-gray-600">Gérez les demandes de contact des utilisateurs</p>
        </div>

        {/* Onglets de navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'PENDING', label: 'En attente', count: statusCounts.PENDING },
                { key: 'READ', label: 'Lus', count: statusCounts.READ },
                { key: 'REPLIED', label: 'Répondues', count: statusCounts.REPLIED },
                { key: 'CLOSED', label: 'Fermées', count: statusCounts.CLOSED }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setCurrentPage(1)
                  }}
                  className={`${
                    activeTab === tab.key
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.key
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Barre de recherche */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, email, sujet..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="bg-white rounded-lg shadow">
          {contactRequests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Aucune demande de contact trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sujet
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
                  {contactRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.email}
                          </div>
                          {request.telephone && (
                            <div className="text-sm text-gray-500">
                              {request.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {request.sujet}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {request.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Voir
                          </button>
                          {request.status !== 'REPLIED' && request.status !== 'CLOSED' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowReplyModal(true)
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Répondre
                            </button>
                          )}
                          <select
                            value={request.status}
                            onChange={(e) => updateStatus(request.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="PENDING">En attente</option>
                            <option value="READ">Lu</option>
                            <option value="REPLIED">Répondu</option>
                            <option value="CLOSED">Fermé</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-md text-sm ${
                    page === currentPage
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Demande de contact
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <p className="text-sm text-gray-900">{selectedRequest.nom}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedRequest.email}</p>
                  </div>
                </div>

                {selectedRequest.telephone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <p className="text-sm text-gray-900">{selectedRequest.telephone}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sujet</label>
                  <p className="text-sm text-gray-900">{selectedRequest.sujet}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedRequest.message}
                    </p>
                  </div>
                </div>

                {selectedRequest.reponse && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Réponse {selectedRequest.reponseBy && `(par ${selectedRequest.reponseBy.nom})`}
                    </label>
                    <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedRequest.reponse}
                      </p>
                      {selectedRequest.reponseAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Répondu le {new Date(selectedRequest.reponseAt).toLocaleString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedRequest.status)}`}>
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Créé le {new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
                {selectedRequest.status !== 'REPLIED' && selectedRequest.status !== 'CLOSED' && (
                  <button
                    onClick={() => {
                      setShowReplyModal(true)
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Répondre
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réponse */}
      {showReplyModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Répondre à {selectedRequest.nom}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre réponse
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Tapez votre réponse ici..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false)
                    setReplyMessage('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={sendReply}
                  disabled={sendingReply || !replyMessage.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingReply ? 'Envoi...' : 'Envoyer la réponse'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
