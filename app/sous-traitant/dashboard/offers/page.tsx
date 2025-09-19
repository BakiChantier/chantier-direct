'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  nomSociete?: string
  role: string
}

interface Offre {
  id: string
  prixPropose: number
  delaiPropose: number
  message?: string
  experienceSimilaire?: string
  materielsDisponibles?: string
  equipeAssignee?: string
  status: string
  createdAt: string
  hasUnreadMessages: boolean
  unreadCount: number
  projet: {
    id: string
    titre: string
    description: string
    typeChantier: string[]
    villeChantier: string
    codePostalChantier: string
    adresseChantier: string
    prixMax: number
    dureeEstimee: number
    dateDebut: string
    dateFin: string
    status: string
    donneurOrdre: User
  }
}

interface Message {
  id: string
  contenu: string
  expediteurId: string
  destinataireId: string
  lu: boolean
  createdAt: string
  expediteur: Pick<User, 'id' | 'nom' | 'prenom' | 'role'>
}

const TYPE_CHANTIER_OPTIONS = [
  { value: 'PLOMBERIE', label: 'Plomberie' },
  { value: 'ELECTRICITE', label: 'Électricité' },
  { value: 'MACONNERIE', label: 'Maçonnerie' },
  { value: 'PLAQUISTE', label: 'Plaquiste' },
  { value: 'CARRELAGE', label: 'Carrelage' },
  { value: 'CLIMATISATION', label: 'Climatisation' },
  { value: 'PEINTURE', label: 'Peinture' },
  { value: 'COUVERTURE', label: 'Couverture' },
  { value: 'MENUISERIE', label: 'Menuiserie' },
  { value: 'TERRASSEMENT', label: 'Terrassement' },
  { value: 'AUTRE', label: 'Autre' }
]

export default function SousTraitantOffersPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  const [mesOffres, setMesOffres] = useState<Offre[]>([])
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showOffersList, setShowOffersList] = useState(true) // Pour mobile

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== 'SOUS_TRAITANT') {
        router.push('/login')
        return
      }
      fetchOffres()
    }
  }, [user, isLoading, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOffres = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/sous-traitant/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMesOffres(data.mesOffres)
        if (data.mesOffres.length > 0) {
          setSelectedOffre(data.mesOffres[0])
          fetchMessages(data.mesOffres[0].id)
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (offreId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/messages/${offreId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        markMessagesAsRead(offreId)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  const markMessagesAsRead = async (offreId: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/messages/${offreId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOffre) return

    setSendingMessage(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projetId: selectedOffre.projet.id,
          offreId: selectedOffre.id,
          destinataireId: selectedOffre.projet.donneurOrdre.id,
          contenu: newMessage
        })
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedOffre.id)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSelectOffre = (offre: Offre) => {
    setSelectedOffre(offre)
    fetchMessages(offre.id)
    setShowOffersList(false) // Masquer la liste sur mobile après sélection
  }

  const handleBackToList = () => {
    setShowOffersList(true)
    setSelectedOffre(null)
  }

  const getTypeChantierLabel = (type: string) => {
    return TYPE_CHANTIER_OPTIONS.find(t => t.value === type)?.label || type
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
      ACCEPTEE: 'bg-green-100 text-green-800',
      REFUSEE: 'bg-red-100 text-red-800',
      RETIREE: 'bg-gray-100 text-gray-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      EN_ATTENTE: 'En attente',
      ACCEPTEE: 'Acceptée',
      REFUSEE: 'Refusée',
      RETIREE: 'Retirée'
    }
    return labels[status as keyof typeof labels] || status
  }

  const renderAdminBadge = (expediteur: Pick<User, 'id' | 'nom' | 'prenom' | 'role'>) => {
    if (expediteur.role === 'ADMIN' || expediteur.role === 'SUPER_ADMIN') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 ml-2">
          👑 Admin
        </span>
      )
    }
    return null
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/sous-traitant/dashboard')}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900">Mes Offres</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Gérez vos candidatures et communiquez avec les donneurs d&apos;ordre</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 flex-shrink-0">
            {mesOffres.length} offre{mesOffres.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Vue mobile : affichage conditionnel */}
        <div className="lg:hidden w-full flex flex-col min-h-0">
          {showOffersList ? (
            /* Liste des offres sur mobile */
            <div className="flex-1 bg-white overflow-y-auto">
              <div className="p-4">
                {mesOffres.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Aucune offre soumise</p>
                    <button
                      onClick={() => router.push('/sous-traitant/dashboard')}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Découvrir des projets
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mesOffres.map((offre) => (
                      <div
                        key={offre.id}
                        onClick={() => handleSelectOffre(offre)}
                        className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {offre.projet.titre}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {offre.projet.villeChantier} • {offre.projet.donneurOrdre.nomSociete || `${offre.projet.donneurOrdre.prenom} ${offre.projet.donneurOrdre.nom}`}
                            </p>
                            <div className="mt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-green-600">
                                  {offre.prixPropose.toLocaleString('fr-FR')} €
                                </span>
                                <span className="text-xs text-gray-500">
                                  {offre.delaiPropose} jours
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(offre.status)}`}>
                                  {getStatusLabel(offre.status)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(offre.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          {offre.hasUnreadMessages && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Vue détail sur mobile */
            selectedOffre && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header avec bouton retour */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleBackToList}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-gray-900 truncate">{selectedOffre.projet.titre}</h2>
                      <p className="text-sm text-gray-600 truncate">
                        {selectedOffre.projet.donneurOrdre.nomSociete || 
                        `${selectedOffre.projet.donneurOrdre.prenom} ${selectedOffre.projet.donneurOrdre.nom}`}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadge(selectedOffre.status)}`}>
                      {getStatusLabel(selectedOffre.status)}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Commencez la conversation
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.expediteurId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg break-words ${
                            message.expediteurId === user?.id
                              ? 'bg-red-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm break-words">{message.contenu}</p>
                            {message.expediteurId !== user?.id && renderAdminBadge(message.expediteur)}
                          </div>
                          <p className={`text-xs mt-1 ${
                            message.expediteurId === user?.id ? 'text-red-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Zone de saisie */}
                <div className="px-4 py-4 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Tapez votre message..."
                      className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex-shrink-0"
                    >
                      {sendingMessage ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Vue desktop : layout side-by-side */}
        <div className="hidden lg:flex w-full">
          {/* Sidebar des offres */}
          <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-4">
              {mesOffres.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Aucune offre soumise</p>
                  <button
                    onClick={() => router.push('/sous-traitant/dashboard')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Découvrir des projets
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mesOffres.map((offre) => (
                    <div
                      key={offre.id}
                      onClick={() => {
                        setSelectedOffre(offre)
                        fetchMessages(offre.id)
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedOffre?.id === offre.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {offre.projet.titre}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {offre.projet.villeChantier} • {offre.projet.donneurOrdre.nomSociete || `${offre.projet.donneurOrdre.prenom} ${offre.projet.donneurOrdre.nom}`}
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-green-600">
                                {offre.prixPropose.toLocaleString('fr-FR')} €
                              </span>
                              <span className="text-xs text-gray-500">
                                {offre.delaiPropose} jours
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(offre.status)}`}>
                                {getStatusLabel(offre.status)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(offre.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        {offre.hasUnreadMessages && (
                          <div className="flex-shrink-0 ml-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contenu principal desktop */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedOffre ? (
              <>
                {/* Header détail */}
                <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 max-h-96 overflow-y-auto">
                  <div className="flex flex-col space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900 truncate pr-2">{selectedOffre.projet.titre}</h2>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${getStatusBadge(selectedOffre.status)}`}>
                        {getStatusLabel(selectedOffre.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Conversation avec {selectedOffre.projet.donneurOrdre.nomSociete || 
                      `${selectedOffre.projet.donneurOrdre.prenom} ${selectedOffre.projet.donneurOrdre.nom}`}
                    </p>
                  </div>

                  {/* Détails du projet */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Informations du projet</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Budget maximum:</span>
                          <span className="font-medium">{selectedOffre.projet.prixMax.toLocaleString('fr-FR')} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Durée estimée:</span>
                          <span className="font-medium">{selectedOffre.projet.dureeEstimee} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Lieu:</span>
                          <span className="font-medium">{selectedOffre.projet.villeChantier}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedOffre.projet.typeChantier.map((type) => (
                            <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getTypeChantierLabel(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Votre offre</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Prix proposé:</span>
                          <span className="font-bold text-green-600">{selectedOffre.prixPropose.toLocaleString('fr-FR')} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Délai proposé:</span>
                          <span className="font-medium">{selectedOffre.delaiPropose} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Soumise le:</span>
                          <span className="font-medium">{new Date(selectedOffre.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description du projet */}
                  {selectedOffre.projet.description && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Description du projet</h3>
                      <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ 
                          __html: selectedOffre.projet.description
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/\n/g, '<br>')
                        }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Zone de messagerie desktop */}
                <div className="flex-1 bg-white flex flex-col min-h-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Commencez la conversation avec le donneur d&apos;ordre
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.expediteurId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs sm:max-w-md lg:max-w-2xl px-4 py-2 rounded-lg break-words ${
                              message.expediteurId === user?.id
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-sm break-words overflow-wrap-anywhere">{message.contenu}</p>
                              {message.expediteurId !== user?.id && renderAdminBadge(message.expediteur)}
                            </div>
                            <p className={`text-xs mt-1 ${
                              message.expediteurId === user?.id ? 'text-red-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Zone de saisie desktop */}
                  <div className="px-4 py-4 border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Tapez votre message..."
                        className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                        disabled={sendingMessage}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sendingMessage || !newMessage.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex-shrink-0"
                      >
                        {sendingMessage ? 'Envoi...' : 'Envoyer'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 bg-white flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune offre sélectionnée</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Sélectionnez une de vos offres pour voir la conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
