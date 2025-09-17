'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { useUser } from '@/lib/user-context'
import { useRouter, useParams } from 'next/navigation'
import { notifications } from '@/lib/notifications'

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  nomSociete?: string
  noteGlobale?: number
}

interface Offre {
  id: string
  prixPropose: number
  delaiPropose: number
  message?: string
  status: string
  experienceSimilaire?: string
  materielsDisponibles?: string
  equipeAssignee?: string
  createdAt: string
  sousTraitant: User
  _count: {
    messages: number
  }
  hasUnreadMessages: boolean
}

interface ProjectImage {
  id: string
  url: string
  title?: string
  description?: string
  type: string
}

interface Projet {
  id: string
  titre: string
  description: string
  typeChantier: string[]
  prixMax: number
  dureeEstimee: number
  status: string
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
  createdAt: string
  donneurOrdre: User
  offres: Offre[]
  images?: ProjectImage[]
}

interface Message {
  id: string
  contenu: string
  expediteurId: string
  destinataireId: string
  lu: boolean
  createdAt: string
  expediteur: Pick<User, 'id' | 'nom' | 'prenom'>
}

export default function ProjetDetailPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const params = useParams()
  const projetId = params.id as string

  const [projet, setProjet] = useState<Projet | null>(null)
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState('')
  const [showEvaluationForm, setShowEvaluationForm] = useState(false)
  const [evaluationData, setEvaluationData] = useState({
    noteQualite: 5,
    noteDelai: 5,
    noteCommunication: 5,
    commentaire: '',
    recommande: true
  })
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false)
  const [showOffersList, setShowOffersList] = useState(true) // Pour mobile
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== 'DONNEUR_ORDRE' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        router.push('/login')
        return
      }
      fetchProjetDetails()
    }
  }, [user, isLoading, projetId, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjetDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/donneur-ordre/projets/${projetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjet(data.projet)
        if (data.projet.offres.length > 0) {
          setSelectedOffre(data.projet.offres[0])
          fetchMessages(data.projet.offres[0].id)
        }
      } else {
        setError('Erreur lors du chargement du projet')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion')
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

  const deleteOffre = async (offreId: string) => {
    if (!confirm('Supprimer cette offre ? Un message d\'information sera envoyé au sous-traitant.')) return
    try {
      const res = await fetch(`/api/donneur-ordre/projets/${projetId}/offres/${offreId}`, { method: 'DELETE' })
      if (res.ok) {
        notifications.projectUpdated()
        fetchProjetDetails()
        setMessages([])
        if (selectedOffre?.id === offreId) setSelectedOffre(null)
      } else {
        notifications.projectError()
      }
    } catch (e) {
      console.error('Erreur lors de la suppression de l\'offre:', e)
      notifications.networkError()
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
          projetId,
          offreId: selectedOffre.id,
          destinataireId: selectedOffre.sousTraitant.id,
          contenu: newMessage
        })
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedOffre.id)
      } else {
        setError('Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSelectOffre = (offre: Offre) => {
    setSelectedOffre(offre)
    fetchMessages(offre.id)
    if (isMobile) {
      setShowOffersList(false) // Masquer la liste sur mobile après sélection
    }
  }

  const handleBackToOffers = () => {
    setShowOffersList(true)
    setSelectedOffre(null)
  }

  const selectSousTraitant = async (offre: Offre) => {
    if (!confirm(`Êtes-vous sûr de vouloir sélectionner ${offre.sousTraitant.prenom} ${offre.sousTraitant.nom} pour ce projet ?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/donneur-ordre/projets/${projetId}/select-sous-traitant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          offreId: offre.id
        })
      })

      if (response.ok) {
        fetchProjetDetails()
        notifications.contractorSelected(`${offre.sousTraitant.prenom} ${offre.sousTraitant.nom}`)
      } else {
        const errorData = await response.json()
        notifications.saveError()
        setError(errorData.error || 'Erreur lors de la sélection du sous-traitant')
      }
    } catch (error) {
      console.error('Erreur:', error)
      notifications.networkError()
      setError('Erreur de connexion')
    }
  }

  const handleEvaluationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setEvaluationData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!evaluationData.commentaire.trim() || evaluationData.commentaire.trim().length < 10) {
      setError('Un commentaire d\'au moins 10 caractères est requis')
      return
    }

    setSubmittingEvaluation(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/donneur-ordre/projets/${projetId}/finaliser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evaluationData)
      })

      if (response.ok) {
        fetchProjetDetails()
        setShowEvaluationForm(false)
        setEvaluationData({
          noteQualite: 5,
          noteDelai: 5,
          noteCommunication: 5,
          commentaire: '',
          recommande: true
        })
        notifications.saveSuccess()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la finalisation du projet')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion')
    } finally {
      setSubmittingEvaluation(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      OUVERT: 'bg-green-100 text-green-800',
      EN_COURS: 'bg-blue-100 text-blue-800',
      TERMINE: 'bg-gray-100 text-gray-800',
      ANNULE: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getOffreStatusBadge = (status: string) => {
    const styles = {
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
      ACCEPTEE: 'bg-green-100 text-green-800',
      REFUSEE: 'bg-red-100 text-red-800',
      RETIREE: 'bg-gray-100 text-gray-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  if (!projet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Projet non trouvé</h3>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{projet.titre}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">
                {projet.villeChantier} • {projet.offres.length} offre{projet.offres.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${getStatusBadge(projet.status)}`}>
            {projet.status === 'OUVERT' && 'Ouvert'}
            {projet.status === 'EN_COURS' && 'En cours'}
            {projet.status === 'TERMINE' && 'Terminé'}
            {projet.status === 'ANNULE' && 'Annulé'}
          </span>
        </div>
      </div>

      {/* Contenu principal avec gestion mobile/desktop */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar des offres - masquée sur mobile */}
        <div className="hidden lg:block w-80 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Offres reçues ({projet.offres.length})
            </h3>
            
            {projet.offres.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Aucune offre reçue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projet.offres.map((offre) => (
                  <div
                    key={offre.id}
                    onClick={() => handleSelectOffre(offre)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                      offre.status === 'ACCEPTEE'
                        ? 'bg-green-600 border-green-700 text-white'
                        : selectedOffre?.id === offre.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${offre.status === 'ACCEPTEE' ? 'bg-white/20 text-white' : 'bg-gray-300'}`}>
                          <span className={`text-sm font-medium ${offre.status === 'ACCEPTEE' ? 'text-white' : 'text-gray-700'}`}>
                            {offre.sousTraitant.prenom?.[0] || offre.sousTraitant.nom[0]}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium truncate ${offre.status === 'ACCEPTEE' ? 'text-white' : 'text-gray-900'}`}>
                            {offre.sousTraitant.prenom} {offre.sousTraitant.nom}
                          </p>
                          {offre.hasUnreadMessages && (
                            <div className={`w-2 h-2 ${offre.status === 'ACCEPTEE' ? 'bg-white' : 'bg-red-500'} rounded-full`}></div>
                          )}
                        </div>
                        
                        {offre.sousTraitant.nomSociete && (
                          <p className={`text-xs truncate ${offre.status === 'ACCEPTEE' ? 'text-white/80' : 'text-gray-500'}`}>
                            {offre.sousTraitant.nomSociete}
                          </p>
                        )}

                        <div className="mt-2">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <span className={`text-lg font-bold whitespace-nowrap ${offre.status === 'ACCEPTEE' ? 'text-white' : 'text-green-600'}`}>
                              {offre.prixPropose.toLocaleString('fr-FR')} €
                            </span>
                            <span className={`text-xs whitespace-nowrap ${offre.status === 'ACCEPTEE' ? 'text-white/80' : 'text-gray-500'}`}>
                              {offre.delaiPropose} jours
                            </span>
                          </div>
                          
                          {offre.status === 'ACCEPTEE' && offre.sousTraitant.noteGlobale !== null && offre.sousTraitant.noteGlobale !== undefined && (
                            <div className="flex items-center mt-1">
                              <span className={`${offre.status === 'ACCEPTEE' ? 'text-yellow-300' : 'text-yellow-400'}`}>★</span>
                              <span className={`text-xs ml-1 ${offre.status === 'ACCEPTEE' ? 'text-white/80' : 'text-gray-600'}`}>
                                {offre.sousTraitant.noteGlobale.toFixed(1)}
                              </span>
                            </div>
                          )}

                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                            offre.status === 'ACCEPTEE' ? 'bg-white/20 text-white' : getOffreStatusBadge(offre.status)
                          }`}>
                            {offre.status === 'EN_ATTENTE' && 'En attente'}
                            {offre.status === 'ACCEPTEE' && 'Acceptée'}
                            {offre.status === 'REFUSEE' && 'Refusée'}
                            {offre.status === 'RETIREE' && 'Retirée'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions offre */}
                    <div className="flex-shrink-0 pl-2">
                      {offre.status !== 'ACCEPTEE' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteOffre(offre.id) }}
                          className={`inline-flex items-center justify-center h-8 w-8 rounded-md border ${
                            offre.status === 'ACCEPTEE' ? 'hidden' : 'border-red-200 text-red-700 hover:bg-red-50'
                          }`}
                          title="Supprimer l'offre"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vue mobile avec navigation par onglets */}
        <div className="lg:hidden flex-1 flex flex-col min-h-0">
          {showOffersList ? (
            /* Liste des offres sur mobile */
            <div className="flex-1 bg-white overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Offres reçues ({projet.offres.length})
                </h3>
                
                {projet.offres.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Aucune offre reçue</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projet.offres.map((offre) => (
                      <div
                        key={offre.id}
                        onClick={() => handleSelectOffre(offre)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          offre.status === 'ACCEPTEE'
                            ? 'bg-green-600 border-green-700 text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${offre.status === 'ACCEPTEE' ? 'bg-white/20 text-white' : 'bg-gray-300'}`}>
                                <span className={`text-sm font-medium ${offre.status === 'ACCEPTEE' ? 'text-white' : 'text-gray-700'}`}>
                                  {offre.sousTraitant.prenom?.[0] || offre.sousTraitant.nom[0]}
                                </span>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${offre.status === 'ACCEPTEE' ? 'text-white' : 'text-gray-900'}`}>
                                    {offre.sousTraitant.prenom} {offre.sousTraitant.nom}
                                  </p>
                                  {offre.sousTraitant.nomSociete && (
                                    <p className={`text-xs truncate ${offre.status === 'ACCEPTEE' ? 'text-white/80' : 'text-gray-500'}`}>
                                      {offre.sousTraitant.nomSociete}
                                    </p>
                                  )}
                                </div>
                                {offre.hasUnreadMessages && (
                                  <div className={`w-2 h-2 ${offre.status === 'ACCEPTEE' ? 'bg-white' : 'bg-red-500'} rounded-full flex-shrink-0 ml-2`}></div>
                                )}
                              </div>

                              <div className="mt-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-base font-bold ${offre.status === 'ACCEPTEE' ? 'text-white' : 'text-green-600'}`}>
                                    {offre.prixPropose.toLocaleString('fr-FR')} €
                                  </span>
                                  <span className={`text-xs ${offre.status === 'ACCEPTEE' ? 'text-white/80' : 'text-gray-500'}`}>
                                    {offre.delaiPropose} jours
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    offre.status === 'ACCEPTEE' ? 'bg-white/20 text-white' : getOffreStatusBadge(offre.status)
                                  }`}>
                                    {offre.status === 'EN_ATTENTE' && 'En attente'}
                                    {offre.status === 'ACCEPTEE' && 'Acceptée'}
                                    {offre.status === 'REFUSEE' && 'Refusée'}
                                    {offre.status === 'RETIREE' && 'Retirée'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions mobile */}
                          {offre.status !== 'ACCEPTEE' && (
                            <div className="flex-shrink-0 ml-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteOffre(offre.id) }}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                                title="Supprimer l'offre"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
                {/* Header avec bouton retour mobile */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleBackToOffers}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-gray-900 truncate">
                        {selectedOffre.sousTraitant.prenom} {selectedOffre.sousTraitant.nom}
                      </h2>
                      <p className="text-sm text-gray-600 truncate">
                        {selectedOffre.prixPropose.toLocaleString('fr-FR')} € • {selectedOffre.delaiPropose} jours
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {selectedOffre.status === 'EN_ATTENTE' && (
                        <button
                          onClick={() => selectSousTraitant(selectedOffre)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          ✓ Sélectionner
                        </button>
                      )}
                      {selectedOffre.status === 'ACCEPTEE' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Sélectionné
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages mobile */}
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
                          <p className="text-sm break-words">{message.contenu}</p>
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

                {/* Zone de saisie mobile */}
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

        {/* Contenu principal desktop */}
        <div className="hidden lg:flex flex-1 flex-col min-h-0">
          {selectedOffre ? (
            <>
              {/* Header détail de l'offre */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedOffre.sousTraitant.prenom?.[0] || selectedOffre.sousTraitant.nom[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedOffre.sousTraitant.prenom} {selectedOffre.sousTraitant.nom}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Offre : {selectedOffre.prixPropose.toLocaleString('fr-FR')} € • {selectedOffre.delaiPropose} jours
                      </p>
                    </div>
                  </div>
                  
                                      {selectedOffre.status === 'EN_ATTENTE' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => selectSousTraitant(selectedOffre)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          ✓ Sélectionner
                        </button>
                      </div>
                    )}
                    
                    {selectedOffre.status === 'ACCEPTEE' && (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ✓ Sélectionné
                        </span>
                        {projet.status === 'EN_COURS' && (
                          <button
                            onClick={() => setShowEvaluationForm(true)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                          >
                            🏁 Finaliser le projet
                          </button>
                        )}
                      </div>
                    )}
                    
                    {selectedOffre.status === 'REFUSEE' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => selectSousTraitant(selectedOffre)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          ↻ Re-sélectionner
                        </button>
                      </div>
                    )}
                </div>
                
                {/* Détails de l'offre */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Détails de l&apos;offre</h4>
                  
                  {selectedOffre.message && (
                    <div className="mb-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Message de présentation</span>
                      <div className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                        {selectedOffre.message}
                      </div>
                    </div>
                  )}
                  
                  {selectedOffre.experienceSimilaire && (
                    <div className="mb-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expérience similaire</span>
                      <div className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                        {selectedOffre.experienceSimilaire}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOffre.materielsDisponibles && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Matériels disponibles</span>
                        <div className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {selectedOffre.materielsDisponibles}
                        </div>
                      </div>
                    )}
                    
                    {selectedOffre.equipeAssignee && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Équipe assignée</span>
                        <div className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {selectedOffre.equipeAssignee}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Zone de messagerie pleine page */}
              <div id="messages" className="flex-1 bg-white flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Commencez la conversation avec le sous-traitant
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
                          className={`max-w-md lg:max-w-2xl px-4 py-2 rounded-lg break-words ${
                            message.expediteurId === user?.id
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm break-words overflow-wrap-anywhere">{message.contenu}</p>
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
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Tapez votre message..."
                      className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
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
                  Sélectionnez une offre pour voir la conversation avec le sous-traitant
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'évaluation */}
      {showEvaluationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Finaliser le projet
                </h3>
                <button
                  onClick={() => setShowEvaluationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEvaluationSubmit} className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Veuillez évaluer le travail de <strong>{selectedOffre?.sousTraitant.prenom} {selectedOffre?.sousTraitant.nom}</strong> pour ce projet.
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualité du travail (1-5 étoiles)
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvaluationData(prev => ({ ...prev, noteQualite: star }))}
                          className={`text-2xl ${star <= evaluationData.noteQualite ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{evaluationData.noteQualite}/5</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Respect des délais (1-5 étoiles)
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvaluationData(prev => ({ ...prev, noteDelai: star }))}
                          className={`text-2xl ${star <= evaluationData.noteDelai ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{evaluationData.noteDelai}/5</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Communication (1-5 étoiles)
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvaluationData(prev => ({ ...prev, noteCommunication: star }))}
                          className={`text-2xl ${star <= evaluationData.noteCommunication ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{evaluationData.noteCommunication}/5</span>
                    </div>
                  </div>
                </div>

                {/* Commentaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (obligatoire, min. 10 caractères)
                  </label>
                  <textarea
                    name="commentaire"
                    value={evaluationData.commentaire}
                    onChange={handleEvaluationInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="Décrivez votre expérience avec ce sous-traitant..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {evaluationData.commentaire.length}/10 caractères minimum
                  </p>
                </div>

                {/* Recommandation */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="recommande"
                    checked={evaluationData.recommande}
                    onChange={handleEvaluationInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Je recommande ce sous-traitant
                  </label>
                </div>

                {/* Boutons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEvaluationForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEvaluation || evaluationData.commentaire.trim().length < 10}
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                  >
                    {submittingEvaluation ? 'Finalisation...' : 'Finaliser le projet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 