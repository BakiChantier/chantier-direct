'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import ProjectImageUpload from '@/components/ProjectImageUpload'
import Image from 'next/image'
import { DONNEUR_ORDRE_DOCUMENTS } from '@/lib/document-types'

interface ProjectImage {
  id?: string
  url: string
  title?: string
  description?: string
  type: 'PHOTO' | 'PLAN' | 'SCHEMA'
  file?: File
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

interface ProjetFormData {
  titre: string
  description: string
  typeChantier: string[]
  prixMax: string
  isEnchereLibre: boolean
  dureeEstimee: string
  adresseChantier: string
  villeChantier: string
  codePostalChantier: string
  departement: string
  dateDebut: string
  dateFin: string
  delai: string
  requisTechniques: string
  materiaux: string
  acces: string
  infosAdditionnelles: { [key: string]: string }
}

export default function NouvelAppelOffre() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [additionalFields, setAdditionalFields] = useState<Array<{id: string, label: string, value: string}>>([])
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'VERIFIED' | 'PENDING' | 'BLOCKED'>('VERIFIED')
  const [checkingDocuments, setCheckingDocuments] = useState(true)
  const [filesMode, setFilesMode] = useState<'upload' | 'link'>('upload')
  const [externalFilesLink, setExternalFilesLink] = useState('')
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)

  // Fonction pour obtenir la date de demain au format YYYY-MM-DD
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState<ProjetFormData>({
    titre: '',
    description: '',
    typeChantier: [],
    prixMax: '',
    isEnchereLibre: false,
    dureeEstimee: '',
    adresseChantier: '',
    villeChantier: '',
    codePostalChantier: '',
    departement: '',
    dateDebut: '',
    dateFin: '',
    delai: '',
    requisTechniques: '',
    materiaux: '',
    acces: '',
    infosAdditionnelles: {}
  })

  // Clés pour le localStorage
  const STORAGE_KEY = 'nouveau-projet-form'
  const ADDITIONAL_FIELDS_KEY = 'nouveau-projet-additional-fields'
  const EXTERNAL_LINK_KEY = 'nouveau-projet-external-link'
  const FILES_MODE_KEY = 'nouveau-projet-files-mode'

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const savedFormData = localStorage.getItem(STORAGE_KEY)
    const savedAdditionalFields = localStorage.getItem(ADDITIONAL_FIELDS_KEY)
    const savedExternalLink = localStorage.getItem(EXTERNAL_LINK_KEY)
    const savedFilesMode = localStorage.getItem(FILES_MODE_KEY)

    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        setFormData(parsedData)
      } catch (error) {
        console.error('Erreur lors du chargement des données sauvegardées:', error)
      }
    }

    if (savedAdditionalFields) {
      try {
        const parsedFields = JSON.parse(savedAdditionalFields)
        setAdditionalFields(parsedFields)
      } catch (error) {
        console.error('Erreur lors du chargement des champs additionnels:', error)
      }
    }

    if (savedExternalLink) {
      setExternalFilesLink(savedExternalLink)
    }

    if (savedFilesMode) {
      setFilesMode(savedFilesMode as 'upload' | 'link')
    }
  }, [])

  // Sauvegarder les données dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    localStorage.setItem(ADDITIONAL_FIELDS_KEY, JSON.stringify(additionalFields))
  }, [additionalFields])

  useEffect(() => {
    localStorage.setItem(EXTERNAL_LINK_KEY, externalFilesLink)
  }, [externalFilesLink])

  useEffect(() => {
    localStorage.setItem(FILES_MODE_KEY, filesMode)
  }, [filesMode])

  // Vérifier les documents du donneur d'ordre
  useEffect(() => {
    if (!isLoading && user?.role === 'DONNEUR_ORDRE') {
      verifyDocuments()
    } else if (!isLoading && user?.role !== 'DONNEUR_ORDRE') {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const verifyDocuments = async () => {
    try {
      setCheckingDocuments(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/documents', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (!res.ok) {
        setVerificationStatus('BLOCKED')
        return
      }
      
      const json = await res.json()
      const list = (json?.data || []) as Array<{ type: string; status: string; fileName: string }>
      const required = DONNEUR_ORDRE_DOCUMENTS.filter(d => d.required)
      const statuses = required.map(cfg => list.find(d => d.type === cfg.type)?.status || 'MISSING')
      
      if (statuses.every(s => s === 'APPROVED')) {
        setVerificationStatus('VERIFIED')
      } else if (statuses.some(s => s === 'REJECTED' || s === 'MISSING')) {
        setVerificationStatus('BLOCKED')
      } else {
        setVerificationStatus('PENDING')
      }
    } catch {
      setVerificationStatus('BLOCKED')
    } finally {
      setCheckingDocuments(false)
    }
  }

  // Nettoyer le localStorage après soumission réussie
  const clearFormData = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ADDITIONAL_FIELDS_KEY)
    localStorage.removeItem(EXTERNAL_LINK_KEY)
    localStorage.removeItem(FILES_MODE_KEY)
  }

  // Vider le formulaire manuellement
  const resetForm = () => {
    const emptyFormData: ProjetFormData = {
      titre: '',
      description: '',
      typeChantier: [],
      prixMax: '',
      isEnchereLibre: false,
      dureeEstimee: '',
      adresseChantier: '',
      villeChantier: '',
      codePostalChantier: '',
      departement: '',
      dateDebut: '',
      dateFin: '',
      delai: '',
      requisTechniques: '',
      materiaux: '',
      acces: '',
      infosAdditionnelles: {}
    }
    setFormData(emptyFormData)
    setAdditionalFields([])
    setProjectImages([])
    setExternalFilesLink('')
    setFilesMode('upload')
    clearFormData()
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => {
      const newData = { ...prev, [name]: type === 'checkbox' ? checked : value }
      
      // Si on active l'enchère libre, vider le champ prixMax
      if (name === 'isEnchereLibre' && checked) {
        newData.prixMax = ''
      }
      
      // Validation des dates pour s'assurer de la cohérence
      if (name === 'dateDebut' && value && newData.dateFin && value >= newData.dateFin) {
        // Si date de début >= date de fin, ajuster la date de fin
        const dateDebut = new Date(value)
        dateDebut.setDate(dateDebut.getDate() + 1)
        newData.dateFin = dateDebut.toISOString().split('T')[0]
      }
      
      if ((name === 'dateDebut' || name === 'dateFin') && value && newData.delai && value >= newData.delai) {
        // Si date de début ou fin >= délai, ajuster le délai
        const dateRef = new Date(value)
        dateRef.setDate(dateRef.getDate() + 1)
        newData.delai = dateRef.toISOString().split('T')[0]
      }
      
      return newData
    })
  }

  // Gérer Tab pour indenter dans la description
  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const value = target.value
      const insertion = '  ' // 2 espaces
      const newValue = value.substring(0, start) + insertion + value.substring(end)
      setFormData(prev => ({ ...prev, description: newValue }))
      // Restaurer le caret
      requestAnimationFrame(() => {
        if (descriptionRef.current) {
          descriptionRef.current.selectionStart = descriptionRef.current.selectionEnd = start + insertion.length
        }
      })
    }
  }

  // Toolbar Markdown minimal
  const applyMarkdown = (syntax: 'bold' | 'italic' | 'h1' | 'h2') => {
    const textarea = descriptionRef.current
    if (!textarea) return
    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const value = formData.description
    const selected = value.substring(start, end)
    let wrapped = selected
    switch (syntax) {
      case 'bold':
        wrapped = `**${selected || 'texte en gras'}**`
        break
      case 'italic':
        wrapped = `*${selected || 'texte en italique'}*`
        break
      case 'h1':
        wrapped = `# ${selected || 'Titre niveau 1'}`
        break
      case 'h2':
        wrapped = `## ${selected || 'Titre niveau 2'}`
        break
    }
    const newValue = value.substring(0, start) + wrapped + value.substring(end)
    setFormData(prev => ({ ...prev, description: newValue }))
    requestAnimationFrame(() => {
      const pos = start + wrapped.length
      textarea.selectionStart = textarea.selectionEnd = pos
      textarea.focus()
    })
  }

  // Parser Markdown limité et rendre les liens non cliquables
  const previewHtml = useMemo(() => {
    const escapeHtml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;')

    const text = formData.description || ''
    let html = escapeHtml(text)
    // Préserver indentation en début de ligne (2 espaces -> nbsp)
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
    // Liens: transformer http(s)://... en texte simple (non cliquable)
    html = html.replace(/(https?:\/\/[^\s]+)/g, '<span class="text-blue-700 font-medium">$1</span>')
    // Paragraphes respectant les blocs HTML (ul/ol/h*)
    const parts = html.split(/\n\n+/)
    const out = parts.map(part => (/^\s*<(ul|ol|h\d)/.test(part) ? part : `<p>${part.replace(/\n/g, '<br/>')}</p>`)).join('')
    return out
  }, [formData.description])

  const handleTypeChantierChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      typeChantier: prev.typeChantier.includes(type)
        ? prev.typeChantier.filter(t => t !== type)
        : [...prev.typeChantier, type]
    }))
  }

  const addAdditionalField = () => {
    const newField = {
      id: Date.now().toString(),
      label: '',
      value: ''
    }
    setAdditionalFields(prev => [...prev, newField])
  }

  const updateAdditionalField = (id: string, field: 'label' | 'value', newValue: string) => {
    setAdditionalFields(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: newValue } : item
      )
    )
  }

  const removeAdditionalField = (id: string) => {
    setAdditionalFields(prev => prev.filter(item => item.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.titre || !formData.description || formData.typeChantier.length === 0) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }

      if (!formData.isEnchereLibre && (!formData.prixMax || parseFloat(formData.prixMax) <= 0)) {
        throw new Error('Le prix maximum doit être supérieur à 0')
      }

      if (!formData.dureeEstimee || parseInt(formData.dureeEstimee) <= 0) {
        throw new Error('La durée estimée doit être supérieure à 0')
      }

      // Validation des dates
      if (!formData.dateDebut || !formData.dateFin || !formData.delai) {
        throw new Error('Toutes les dates sont requises')
      }

      const dateDebut = new Date(formData.dateDebut)
      const dateFin = new Date(formData.dateFin)
      const delai = new Date(formData.delai)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Réinitialiser l'heure pour la comparaison

      if (dateDebut <= today) {
        throw new Error('La date de début doit être dans le futur')
      }

      if (dateFin <= dateDebut) {
        throw new Error('La date de fin doit être après la date de début')
      }

      if (delai <= today) {
        throw new Error('La date limite de candidature doit être dans le futur')
      }

      // Préparer les infos additionnelles
      const infosAdditionnelles: { [key: string]: string } = {}
      additionalFields.forEach(field => {
        if (field.label && field.value) {
          infosAdditionnelles[field.label] = field.value
        }
      })

      const projetData = {
        ...formData,
        prixMax: formData.isEnchereLibre ? null : parseFloat(formData.prixMax),
        dureeEstimee: parseInt(formData.dureeEstimee),
        infosAdditionnelles,
        externalFilesLink: filesMode === 'link' ? externalFilesLink : null
      }

      const token = localStorage.getItem('token')
      const response = await fetch('/api/donneur-ordre/projets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projetData)
      })

      if (response.ok) {
        const result = await response.json()
        // Nettoyer les données sauvegardées après succès
        // Upload des images si il y en a
        if (projectImages.length > 0) {
          setUploadingImages(true)
          
          for (const image of projectImages) {
            if (image.file) {
              const imageFormData = new FormData()
              imageFormData.append('file', image.file)
              imageFormData.append('projetId', result.projet.id)
              imageFormData.append('title', image.title || '')
              imageFormData.append('description', image.description || '')
              imageFormData.append('type', image.type)

              await fetch('/api/projets/images', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: imageFormData
              })
            }
          }
          setUploadingImages(false)
        }
        
        clearFormData()
        router.push(`/donneur-ordre/projets/${result.projet.id}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création du projet')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user || (user.role !== 'DONNEUR_ORDRE' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    router.push('/login')
    return null
  }

  if (checkingDocuments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des documents...</p>
        </div>
      </div>
    )
  }

  if (user.role === 'DONNEUR_ORDRE' && verificationStatus === 'BLOCKED') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">
                Documents d&apos;entreprise requis
              </h3>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Pour pouvoir créer un appel d&apos;offre, vous devez d&apos;abord télécharger et faire valider vos documents d&apos;entreprise (Kbis et Attestation RC Pro).
              </p>
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => router.push('/donneur-ordre/dashboard')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Aller uploader mes documents
                </button>
                <div>
                  <button
                    onClick={() => router.back()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retour
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Créer un nouvel appel d&apos;offre
              </h1>
              <p className="mt-2 text-gray-600">
                Décrivez votre projet pour recevoir des offres de sous-traitants qualifiés
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Vider le formulaire
            </button>
          </div>
          
          {/* Indication de sauvegarde automatique */}
          <div className="mt-4 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Vos données sont automatiquement sauvegardées localement
          </div>

          {/* Alerte pour documents en attente */}
          {verificationStatus === 'PENDING' && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Documents en cours de validation
                  </h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>
                      Vos documents d&apos;entreprise sont en cours de validation par notre équipe. 
                      Vous pouvez créer votre appel d&apos;offre dès maintenant, il sera publié après validation de vos documents et modération de votre projet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-none mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Colonne Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-8 order-2 lg:order-1">
          {/* Informations générales */}
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Informations générales
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Décrivez votre projet de manière claire et précise.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="titre" className="block text-sm font-medium text-gray-700">
                      Titre du projet *
                    </label>
                    <input
                      type="text"
                      name="titre"
                      id="titre"
                      value={formData.titre}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: Rénovation salle de bain"
                      required
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description détaillée *
                    </label>
                    {/* Toolbar Markdown */}
                    <div className="flex items-center gap-2 mb-2">
                      <button type="button" onClick={() => applyMarkdown('h1')} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">H1</button>
                      <button type="button" onClick={() => applyMarkdown('h2')} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">H2</button>
                      <button type="button" onClick={() => applyMarkdown('bold')} className="px-2 py-1 rounded border text-xs hover:bg-gray-50 font-semibold">B</button>
                      <button type="button" onClick={() => applyMarkdown('italic')} className="px-2 py-1 rounded border text-xs hover:bg-gray-50 italic">I</button>
                    </div>
                    <textarea
                      name="description"
                      id="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      onKeyDown={handleDescriptionKeyDown}
                      ref={descriptionRef}
                      rows={12}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                      placeholder="Décrivez en détail les travaux à réaliser..."
                      required
                    />
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Type(s) de chantier *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TYPE_CHANTIER_OPTIONS.map((option) => (
                        <label key={option.value} className="inline-flex items-center p-2 rounded-md border border-gray-200 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-red-600 rounded"
                            checked={formData.typeChantier.includes(option.value)}
                            onChange={() => handleTypeChantierChange(option.value)}
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id="isEnchereLibre"
                        name="isEnchereLibre"
                        checked={formData.isEnchereLibre}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isEnchereLibre" className="text-sm font-medium text-gray-700">
                        Enchère libre (pas de budget maximum)
                      </label>
                    </div>
                    <label htmlFor="prixMax" className="block text-sm font-medium text-gray-700">
                      Budget maximum (€) {!formData.isEnchereLibre && '*'}
                    </label>
                    <input
                      type="number"
                      name="prixMax"
                      id="prixMax"
                      value={formData.prixMax}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      disabled={formData.isEnchereLibre}
                      className={`mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 ${formData.isEnchereLibre ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder={formData.isEnchereLibre ? 'Enchère libre - pas de budget maximum' : 'Ex: 5000'}
                      required={!formData.isEnchereLibre}
                    />
                    {formData.isEnchereLibre && (
                      <p className="mt-2 text-sm text-blue-600">
                        💡 Votre projet sera en enchère libre. Les sous-traitants pourront proposer n&apos;importe quel prix.
                      </p>
                    )}
                  </div>

                  <div className="col-span-3">
                    <label htmlFor="dureeEstimee" className="block text-sm font-medium text-gray-700">
                      Durée estimée (jours) *
                    </label>
                    <input
                      type="number"
                      name="dureeEstimee"
                      id="dureeEstimee"
                      value={formData.dureeEstimee}
                      onChange={handleInputChange}
                      min="1"
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lieu du chantier */}
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Lieu du chantier
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Indiquez où se dérouleront les travaux.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="adresseChantier" className="block text-sm font-medium text-gray-700">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      name="adresseChantier"
                      id="adresseChantier"
                      value={formData.adresseChantier}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="col-span-4">
                    <label htmlFor="villeChantier" className="block text-sm font-medium text-gray-700">
                      Ville *
                    </label>
                    <input
                      type="text"
                      name="villeChantier"
                      id="villeChantier"
                      value={formData.villeChantier}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="codePostalChantier" className="block text-sm font-medium text-gray-700">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      name="codePostalChantier"
                      id="codePostalChantier"
                      value={formData.codePostalChantier}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="departement" className="block text-sm font-medium text-gray-700">
                      Département (France) *
                    </label>
                    <select
                      name="departement"
                      id="departement"
                      value={formData.departement}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Sélectionnez un département</option>
                      {[
                        '01 - Ain','02 - Aisne','03 - Allier','04 - Alpes de Haute-Provence','05 - Hautes-Alpes','06 - Alpes-Maritimes','07 - Ardèche','08 - Ardennes','09 - Ariège','10 - Aube','11 - Aude','12 - Aveyron','13 - Bouches-du-Rhône','14 - Calvados','15 - Cantal','16 - Charente','17 - Charente-Maritime','18 - Cher','19 - Corrèze','2A - Corse-du-Sud','2B - Haute-Corse','21 - Côte-d\'Or','22 - Côtes-d\'Armor','23 - Creuse','24 - Dordogne','25 - Doubs','26 - Drôme','27 - Eure','28 - Eure-et-Loir','29 - Finistère','30 - Gard','31 - Haute-Garonne','32 - Gers','33 - Gironde','34 - Hérault','35 - Ille-et-Vilaine','36 - Indre','37 - Indre-et-Loire','38 - Isère','39 - Jura','40 - Landes','41 - Loir-et-Cher','42 - Loire','43 - Haute-Loire','44 - Loire-Atlantique','45 - Loiret','46 - Lot','47 - Lot-et-Garonne','48 - Lozère','49 - Maine-et-Loire','50 - Manche','51 - Marne','52 - Haute-Marne','53 - Mayenne','54 - Meurthe-et-Moselle','55 - Meuse','56 - Morbihan','57 - Moselle','58 - Nièvre','59 - Nord','60 - Oise','61 - Orne','62 - Pas-de-Calais','63 - Puy-de-Dôme','64 - Pyrénées-Atlantiques','65 - Hautes-Pyrénées','66 - Pyrénées-Orientales','67 - Bas-Rhin','68 - Haut-Rhin','69 - Rhône','70 - Haute-Saône','71 - Saône-et-Loire','72 - Sarthe','73 - Savoie','74 - Haute-Savoie','75 - Paris','76 - Seine-Maritime','77 - Seine-et-Marne','78 - Yvelines','79 - Deux-Sèvres','80 - Somme','81 - Tarn','82 - Tarn-et-Garonne','83 - Var','84 - Vaucluse','85 - Vendée','86 - Vienne','87 - Haute-Vienne','88 - Vosges','89 - Yonne','90 - Territoire de Belfort','91 - Essonne','92 - Hauts-de-Seine','93 - Seine-Saint-Denis','94 - Val-de-Marne','95 - Val-d\'Oise'
                      ].map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dates et délais */}
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Planning
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Définissez les dates importantes du projet. Seules les dates futures sont autorisées.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-2">
                    <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      id="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      min={getTomorrowDate()}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      id="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      min={getTomorrowDate()}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="delai" className="block text-sm font-medium text-gray-700">
                      Date limite candidature *
                    </label>
                    <input
                      type="date"
                      name="delai"
                      id="delai"
                      value={formData.delai}
                      onChange={handleInputChange}
                      min={getTomorrowDate()}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations techniques */}
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Détails techniques
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Informations optionnelles mais utiles pour les prestataires.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="requisTechniques" className="block text-sm font-medium text-gray-700">
                      Prérequis techniques
                    </label>
                    <textarea
                      name="requisTechniques"
                      id="requisTechniques"
                      value={formData.requisTechniques}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Certifications requises, normes à respecter..."
                    />
                  </div>

                  <div>
                    <label htmlFor="materiaux" className="block text-sm font-medium text-gray-700">
                      Matériaux et équipements
                    </label>
                    <textarea
                      name="materiaux"
                      id="materiaux"
                      value={formData.materiaux}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Matériaux fournis, équipements nécessaires..."
                    />
                  </div>

                  <div>
                    <label htmlFor="acces" className="block text-sm font-medium text-gray-700">
                      Conditions d&apos;accès
                    </label>
                    <textarea
                      name="acces"
                      id="acces"
                      value={formData.acces}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Parking, ascenseur, contraintes d'accès..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations additionnelles personnalisées */}
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Informations additionnelles
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ajoutez des champs personnalisés selon vos besoins.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-4">
                  {additionalFields.map((field) => (
                    <div key={field.id} className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Nom du champ"
                          value={field.label}
                          onChange={(e) => updateAdditionalField(field.id, 'label', e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Valeur"
                          value={field.value}
                          onChange={(e) => updateAdditionalField(field.id, 'value', e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAdditionalField(field.id)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAdditionalField}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    + Ajouter un champ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

          {/* Photos et plans */}
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Photos et plans
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ajoutez des visuels pour aider les sous-traitants à mieux comprendre votre projet.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                {/* Onglets pour choisir le mode */}
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        type="button"
                        onClick={() => setFilesMode('upload')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          filesMode === 'upload'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload direct
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilesMode('link')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          filesMode === 'link'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Lien externe
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Contenu selon le mode sélectionné */}
                {filesMode === 'upload' ? (
                  <div>
                    <ProjectImageUpload
                      images={projectImages}
                      onImagesChange={setProjectImages}
                      disabled={loading || uploadingImages}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien de téléchargement
                      </label>
                      <input
                        type="url"
                        value={externalFilesLink}
                        onChange={(e) => setExternalFilesLink(e.target.value)}
                        placeholder="https://wetransfer.com/downloads/... ou https://www.swisstransfer.com/..."
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Vous pouvez utiliser WeTransfer, SwissTransfer, Google Drive, Dropbox, ou tout autre service de partage de fichiers.
                      </p>
                    </div>
                    
                    {externalFilesLink && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Lien externe configuré
                            </h3>
                            <div className="mt-1 text-sm text-blue-700">
                              <p>
                                Les sous-traitants pourront accéder à vos fichiers via le lien fourni. 
                                Assurez-vous que le lien reste accessible pendant toute la durée de l&apos;appel d&apos;offre.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Conseils pour le lien externe
                          </h3>
                          <div className="mt-1 text-sm text-yellow-700">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Utilisez un service fiable (WeTransfer, SwissTransfer, Google Drive, Dropbox)</li>
                              <li>Vérifiez que le lien fonctionne avant de publier</li>
                              <li>Assurez-vous que les fichiers restent disponibles pendant au moins 30 jours</li>
                              <li>Incluez un mot de passe si nécessaire et mentionnez-le dans la description du projet</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Création...' : uploadingImages ? 'Upload en cours...' : 'Créer l\'appel d\'offre'}
            </button>
          </div>
            </form>

            {/* Colonne Preview */}
            <div className="order-1 lg:order-2">
              <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Prévisualisation</h2>
                {/* Titre */}
                <h1 className="text-3xl font-extrabold text-gray-900">{formData.titre || 'Titre du projet'}</h1>
                {/* Domaines */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.typeChantier.length > 0 ? (
                    formData.typeChantier.map(t => (
                      <span key={t} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{t}</span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Choisissez des domaines</span>
                  )}
                </div>
                {/* Adresse */}
                <div className="mt-4 text-sm text-gray-600">
                  {formData.adresseChantier && (
                    <div>📍 {formData.adresseChantier}, {formData.codePostalChantier} {formData.villeChantier}</div>
                  )}
                </div>
                {/* Budget / Durée */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  {formData.isEnchereLibre ? (
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      🎯 Enchère libre
                    </div>
                  ) : formData.prixMax && (
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-200">
                      💰 {Number(formData.prixMax || 0).toLocaleString('fr-FR')} €
                    </div>
                  )}
                  {formData.dureeEstimee && (
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-700 border border-gray-200">
                      ⏱ {formData.dureeEstimee} jours
                    </div>
                  )}
                </div>
                {/* Photos et plans preview */}
                {projectImages.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos et plans ({projectImages.length})</h3>
                    <div className="space-y-4">
                      {projectImages.map((image, index) => (
                        <div key={index} className="relative">
                          <Image 
                            src={image.url} 
                            alt={image.title || 'Image du projet'}
                            className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                            width={1000}
                            height={1000}
                          />
                          <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 shadow-sm">
                            <span className="text-xs font-medium">
                              {image.type === 'PHOTO' ? '📷 Photo' : image.type === 'PLAN' ? '📋 Plan' : '📐 Schéma'}
                            </span>
                          </div>
                          {image.title && (
                            <div className="mt-2 text-sm font-medium text-gray-900">{image.title}</div>
                          )}
                          {image.description && (
                            <div className="text-xs text-gray-600">{image.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lien externe preview */}
                {filesMode === 'link' && externalFilesLink && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fichiers externes</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                              href={externalFilesLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                            >
                              {externalFilesLink}
                            </a>
                          </div>
                          <p className="text-xs text-blue-700 mt-2">
                            Les sous-traitants pourront télécharger vos plans et photos via ce lien
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Markdown */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  </div>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>

                {/* Détails techniques */}
                {(formData.requisTechniques || formData.materiaux || formData.acces || Object.keys(formData.infosAdditionnelles || {}).length > 0) && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations techniques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.requisTechniques && (
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Prérequis techniques</div>
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">{formData.requisTechniques}</div>
                        </div>
                      )}
                      {formData.materiaux && (
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Matériaux et équipements</div>
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">{formData.materiaux}</div>
                        </div>
                      )}
                      {formData.acces && (
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Conditions d&apos;accès</div>
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">{formData.acces}</div>
                        </div>
                      )}
                      {Object.keys(formData.infosAdditionnelles || {}).length > 0 && (
                        <div className="md:col-span-2">
                          <div className="text-sm font-medium text-gray-500 mb-2">Informations additionnelles</div>
                          <div className="text-sm text-gray-900 space-y-1">
                            {Object.entries(formData.infosAdditionnelles).map(([k, v]) => (
                              <div key={k} className="flex">
                                <div className="w-56 text-gray-500">{k}</div>
                                <div className="flex-1 whitespace-pre-wrap">{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 