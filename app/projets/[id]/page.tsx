'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useUser } from '@/lib/user-context'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
interface User {
  id: string
  nom: string
  prenom: string
  email: string
  nomSociete?: string
}

interface Offre {
  id: string
  delaiPropose: number
  createdAt: string
  sousTraitant: User
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
  userAlreadyApplied?: boolean
  offres?: Offre[]
  images?: ProjectImage[]
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

export default function ProjetDetailSousTraitantPage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const projetId = params.id as string

  const [projet, setProjet] = useState<Projet | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null)

  // État du formulaire d'offre
  const [, setShowOffreForm] = useState(false)
  const [offreData, setOffreData] = useState({
    prixPropose: '',
    delaiPropose: '',
    message: '',
    experienceSimilaire: '',
    materielsDisponibles: '',
    equipeAssignee: ''
  })

  // Refs pour gérer Tab (indentation) dans les textarea
  const msgRef = useRef<HTMLTextAreaElement>(null as unknown as HTMLTextAreaElement)
  const expRef = useRef<HTMLTextAreaElement>(null as unknown as HTMLTextAreaElement)
  const matRef = useRef<HTMLTextAreaElement>(null as unknown as HTMLTextAreaElement)
  const eqpRef = useRef<HTMLTextAreaElement>(null as unknown as HTMLTextAreaElement)

  const handleTextareaTab = (ref: React.RefObject<HTMLTextAreaElement>) => (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = ref.current
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const value = ta.value
      const insertion = '  '
      const newValue = value.substring(0, start) + insertion + value.substring(end)
      const name = ta.name as keyof typeof offreData
      setOffreData(prev => ({ ...prev, [name]: newValue }))
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.selectionStart = ref.current.selectionEnd = start + insertion.length
        }
      })
    }
  }

  // Preview du message façon bulle chat (non cliquable, préserve sauts/indentation)
  const messagePreviewHtml = useMemo(() => {
    const escape = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;')
    let html = escape(offreData.message || '')
    html = html.replace(/^\s{2}/gm, '&nbsp;&nbsp;')
    html = html.replace(/(https?:\/\/[^\s]+)/g, '<span class="text-blue-700 font-medium">$1</span>')
    // Chaque saut de ligne -> <br/> pour préserver exactement les lignes blanches
    html = html.replace(/\n/g, '<br/>')
    return html
  }, [offreData.message])

  // Parser Markdown limité pour la description (titres, gras, italique) et liens non cliquables
  const descriptionHtml = useMemo(() => {
    const escapeHtml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;')

    const raw = projet?.description || ''
    let html = escapeHtml(raw)
    // Préserver indentation (2 espaces en début de ligne)
    html = html.replace(/^\s{2}/gm, '&nbsp;&nbsp;')
    // Listes ordonnées
    html = html.replace(/^(?:\d+\.\s+.+(?:\n\d+\.\s+.+)*)/gm, (block) => {
      const items = block.split('\n').map(l => l.replace(/^\d+\.\s+/, '')).map(i => `<li>${i}</li>`).join('')
      return `<ol class=\"list-decimal ml-6 my-2\">${items}</ol>`
    })
    // Listes à puces
    html = html.replace(/^(?:[-*+]\s+.+(?:\n[-*+]\s+.+)*)/gm, (block) => {
      const items = block.split('\n').map(l => l.replace(/^[-*+]\s+/, '')).map(i => `<li>${i}</li>`).join('')
      return `<ul class=\"list-disc ml-6 my-2\">${items}</ul>`
    })
    // Titres
    html = html.replace(/^######\s(.+)$/gm, '<h6 class="text-sm font-semibold mt-4 mb-2">$1</h6>')
    html = html.replace(/^#####\s(.+)$/gm, '<h5 class="text-base font-semibold mt-4 mb-2">$1</h5>')
    html = html.replace(/^####\s(.+)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
    html = html.replace(/^###\s(.+)$/gm, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
    html = html.replace(/^##\s(.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    html = html.replace(/^#\s(.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-3">$1</h1>')
    // Gras et italique
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Liens -> texte simple non cliquable
    html = html.replace(/(https?:\/\/[^\s]+)/g, '<span class="text-blue-700 font-medium">$1</span>')
    // Paragraphes respectant les blocs HTML
    const parts = html.split(/\n\n+/)
    const out = parts.map(part => (/^\s*<(ul|ol|h\d)/.test(part) ? part : `<p>${part.replace(/\n/g, '<br/>')}</p>`)).join('')
    return out
  }, [projet?.description])

  useEffect(() => {
    fetchProjetDetails()
  }, [projetId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjetDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/projets/${projetId}`, {
        headers
      })

      if (response.ok) {
        const data = await response.json()
        setProjet(data)  // L'API retourne directement le projet, pas { projet: ... }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOffreData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitOffre = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Vous devez être connecté pour soumettre une offre')
      return
    }

    if (user.role !== 'SOUS_TRAITANT') {
      setError('Seuls les sous-traitants peuvent soumettre des offres')
      return
    }

    const prixPropose = parseFloat(offreData.prixPropose)
    const delaiPropose = parseInt(offreData.delaiPropose)

    // Validation
    if (!prixPropose || prixPropose <= 0) {
      setError('Le prix proposé doit être supérieur à 0')
      return
    }

    if (prixPropose > (projet?.prixMax || 0)) {
      setError(`Le prix proposé ne peut pas dépasser le budget maximum de ${projet?.prixMax?.toLocaleString('fr-FR')} €`)
      return
    }

    if (!delaiPropose || delaiPropose <= 0) {
      setError('Le délai proposé doit être supérieur à 0')
      return
    }

    if (!offreData.message.trim()) {
      setError('Un message de présentation est requis')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/offres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projetId,
          prixPropose,
          delaiPropose,
          message: offreData.message,
          experienceSimilaire: offreData.experienceSimilaire,
          materielsDisponibles: offreData.materielsDisponibles,
          equipeAssignee: offreData.equipeAssignee
        })
      })

      if (response.ok) {
        setSuccess('Votre offre a été soumise avec succès !')
        setShowOffreForm(false)
        setOffreData({
          prixPropose: '',
          delaiPropose: '',
          message: '',
          experienceSimilaire: '',
          materielsDisponibles: '',
          equipeAssignee: ''
        })
        fetchProjetDetails() // Recharger pour mettre à jour l'état
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la soumission de l\'offre')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeChantierLabel = (type: string) => {
    return TYPE_CHANTIER_OPTIONS.find(t => t.value === type)?.label || type
  }

  const isDeadlinePassed = projet ? new Date(projet.delai) <= new Date() : false
  const canSubmitOffre = user?.role === 'SOUS_TRAITANT' && !projet?.userAlreadyApplied && !isDeadlinePassed && projet?.status === 'OUVERT'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error && !projet) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-90/100 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{projet.titre}</h1>
              <p className="text-gray-600 mt-1">
                {projet.villeChantier} • Budget max: {projet.prixMax.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>

          {/* Alertes */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isDeadlinePassed && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">La date limite de candidature est dépassée</p>
                </div>
              </div>
            </div>
          )}

          {projet.userAlreadyApplied && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">Vous avez déjà soumis une offre pour ce projet</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Détails du projet */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description du projet</h2>
              <div className="prose prose-sm max-w-none text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />

              {/* Photos et plans */}
              {projet.images && projet.images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Photos et plans du projet</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {projet.images.map((image) => (
                      <div 
                        key={image.id} 
                        className="relative group cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Image 
                          src={image.url}
                          alt={image.description || image.title || 'Image du projet'}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                          width={500}
                          height={500}
                        />
                        {/* Badge de type d'image */}
                        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1">
                          <div className="text-gray-800 text-xs font-medium">
                            {image.type === 'PHOTO' ? '📷 Photo' : image.type === 'PLAN' ? '📋 Plan' : '📐 Schéma'}
                          </div>
                        </div>
                        {/* Description au lieu du titre */}
                        {image.description && (
                          <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1">
                            <div className="text-gray-800 text-xs font-medium truncate">{image.description}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informations générales</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Types de chantier :</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {projet.typeChantier.map((type) => (
                          <span key={type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getTypeChantierLabel(type)}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Budget maximum :</span>
                        <p className="text-sm text-gray-900 mt-1 font-semibold">{projet.prixMax.toLocaleString('fr-FR')} €</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Durée estimée :</span>
                        <p className="text-sm text-gray-900 mt-1">{projet.dureeEstimee} jours</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Lieu et planning</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Adresse :</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {projet.adresseChantier}<br/>
                        {projet.codePostalChantier} {projet.villeChantier}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Date de début :</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(projet.dateDebut).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Date de fin :</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(projet.dateFin).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date limite candidature :</span>
                      <p className={`text-sm mt-1 font-medium ${isDeadlinePassed ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(projet.delai).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations techniques */}
              {(projet.requisTechniques || projet.materiaux || projet.acces || projet.infosAdditionnelles) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informations techniques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projet.requisTechniques && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Prérequis techniques :</span>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{projet.requisTechniques}</p>
                      </div>
                    )}
                    
                    {projet.materiaux && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Matériaux :</span>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{projet.materiaux}</p>
                      </div>
                    )}
                    
                    {projet.acces && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Conditions d&apos;accès :</span>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{projet.acces}</p>
                      </div>
                    )}
                    
                    {projet.infosAdditionnelles && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Informations additionnelles :</span>
                        <div className="text-sm text-gray-900 mt-1 whitespace-pre-line">{projet.infosAdditionnelles}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Formulaire de soumission + Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Soumettre une offre</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Formulaire */}
                <form onSubmit={handleSubmitOffre} className={`space-y-6 order-2 lg:order-1 ${projet.userAlreadyApplied ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix proposé (€) *</label>
                    <input
                      type="number"
                      name="prixPropose"
                      value={offreData.prixPropose}
                      onChange={handleInputChange}
                      max={projet.prixMax}
                      step="0.01"
                      disabled={projet.userAlreadyApplied}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={`Max: ${projet.prixMax.toLocaleString('fr-FR')} €`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Délai proposé (jours) *</label>
                    <input
                      type="number"
                      name="delaiPropose"
                      value={offreData.delaiPropose}
                      onChange={handleInputChange}
                      min="1"
                      disabled={projet.userAlreadyApplied}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message de présentation *</label>
                    <textarea
                      name="message"
                      ref={msgRef}
                      value={offreData.message}
                      onChange={handleInputChange}
                      onKeyDown={handleTextareaTab(msgRef)}
                      rows={6}
                      disabled={projet.userAlreadyApplied}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Présentez votre approche, votre expérience, vos références..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expérience similaire</label>
                    <textarea
                      name="experienceSimilaire"
                      ref={expRef}
                      value={offreData.experienceSimilaire}
                      onChange={handleInputChange}
                      onKeyDown={handleTextareaTab(expRef)}
                      rows={4}
                      disabled={projet.userAlreadyApplied}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Décrivez vos projets similaires en détail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matériels disponibles</label>
                    <textarea
                      name="materielsDisponibles"
                      ref={matRef}
                      value={offreData.materielsDisponibles}
                      onChange={handleInputChange}
                      onKeyDown={handleTextareaTab(matRef)}
                      rows={3}
                      disabled={projet.userAlreadyApplied}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Listez vos équipements, outils spécialisés, véhicules..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Équipe assignée</label>
                    <textarea
                      name="equipeAssignee"
                      ref={eqpRef}
                      value={offreData.equipeAssignee}
                      onChange={handleInputChange}
                      onKeyDown={handleTextareaTab(eqpRef)}
                      rows={2}
                      disabled={projet.userAlreadyApplied}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Ex: 3 personnes, chef d'équipe certifié, apprenti..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowOffreForm(false)}
                      disabled={projet.userAlreadyApplied}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || projet.userAlreadyApplied}
                      className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Envoi...' : 'Envoyer l\'offre'}
                    </button>
                  </div>
                </form>

                {/* Preview */}
                <div className="order-1 lg:order-2">
                  <div className="bg-white border rounded-2xl p-4 sm:p-6 sticky top-24">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Aperçu du message</h3>
                    <div className="flex ${''} justify-start">
                      <div className="max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                        <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: messagePreviewHtml }} />
                      </div>
                    </div>
                    {(offreData.experienceSimilaire || offreData.materielsDisponibles || offreData.equipeAssignee) && (
                      <div className="mt-4 space-y-3 text-sm">
                        {offreData.experienceSimilaire && (
                          <div>
                            <div className="text-gray-500">Expérience similaire</div>
                            <div className="whitespace-pre-wrap">{offreData.experienceSimilaire}</div>
                          </div>
                        )}
                        {offreData.materielsDisponibles && (
                          <div>
                            <div className="text-gray-500">Matériels disponibles</div>
                            <div className="whitespace-pre-wrap">{offreData.materielsDisponibles}</div>
                          </div>
                        )}
                        {offreData.equipeAssignee && (
                          <div>
                            <div className="text-gray-500">Équipe assignée</div>
                            <div className="whitespace-pre-wrap">{offreData.equipeAssignee}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Informations donneur d'ordre */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Donneur d&apos;ordre</h3>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {projet.donneurOrdre.prenom?.[0] || projet.donneurOrdre.nom[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {projet.donneurOrdre.nomSociete || `${projet.donneurOrdre.prenom} ${projet.donneurOrdre.nom}`}
                  </p>
                  {projet.donneurOrdre.nomSociete && (
                    <p className="text-sm text-gray-500">
                      {projet.donneurOrdre.prenom} {projet.donneurOrdre.nom}
                    </p>
                  )}
                  <a
                    href={`/profil/${projet.donneurOrdre.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center"
                  >
                    Voir le profil public
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Actions</h3>
              {canSubmitOffre ? (
                <p className="text-sm text-gray-600">Utilisez le formulaire “Soumettre une offre” ci‑dessous.</p>
              ) : (
                <div className="text-center py-2">
                  {!user ? (
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                    >
                      Se connecter
                    </button>
                  ) : user.role !== 'SOUS_TRAITANT' ? (
                    <p className="text-sm text-gray-500">Seuls les sous-traitants peuvent soumettre des offres</p>
                  ) : projet.userAlreadyApplied ? (
                    <p className="text-sm text-gray-500">Vous avez déjà soumis une offre</p>
                  ) : isDeadlinePassed ? (
                    <p className="text-sm text-gray-500">Date limite dépassée</p>
                  ) : (
                    <p className="text-sm text-gray-500">Projet non disponible</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de visualisation d'image */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            {/* Bouton fermer */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image en grand */}
            <Image
              src={selectedImage.url}
              alt={selectedImage.description || selectedImage.title || 'Image du projet'}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              width={500}
              height={500}
            />

            {/* Informations sur l'image */}
            {(selectedImage.description || selectedImage.title) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedImage.description && (
                      <h3 className="text-lg font-medium">{selectedImage.description}</h3>
                    )}
                    {selectedImage.title && selectedImage.title !== selectedImage.description && (
                      <p className="text-sm text-gray-300 mt-1">{selectedImage.title}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    {selectedImage.type === 'PHOTO' ? '📷 Photo' : selectedImage.type === 'PLAN' ? '📋 Plan' : '📐 Schéma'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cliquer à l'extérieur pour fermer */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setSelectedImage(null)}
          ></div>
        </div>
      )}
    </div>
  )
} 