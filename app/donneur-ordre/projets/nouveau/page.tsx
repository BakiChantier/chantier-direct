'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import ProjectImageUpload from '@/components/ProjectImageUpload'
import Image from 'next/image'

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
  dureeEstimee: string
  adresseChantier: string
  villeChantier: string
  codePostalChantier: string
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
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)

  const [formData, setFormData] = useState<ProjetFormData>({
    titre: '',
    description: '',
    typeChantier: [],
    prixMax: '',
    dureeEstimee: '',
    adresseChantier: '',
    villeChantier: '',
    codePostalChantier: '',
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

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const savedFormData = localStorage.getItem(STORAGE_KEY)
    const savedAdditionalFields = localStorage.getItem(ADDITIONAL_FIELDS_KEY)

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
  }, [])

  // Sauvegarder les données dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    localStorage.setItem(ADDITIONAL_FIELDS_KEY, JSON.stringify(additionalFields))
  }, [additionalFields])

  // Nettoyer le localStorage après soumission réussie
  const clearFormData = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ADDITIONAL_FIELDS_KEY)
  }

  // Vider le formulaire manuellement
  const resetForm = () => {
    const emptyFormData: ProjetFormData = {
      titre: '',
      description: '',
      typeChantier: [],
      prixMax: '',
      dureeEstimee: '',
      adresseChantier: '',
      villeChantier: '',
      codePostalChantier: '',
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
    clearFormData()
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

      if (!formData.prixMax || parseFloat(formData.prixMax) <= 0) {
        throw new Error('Le prix maximum doit être supérieur à 0')
      }

      if (!formData.dureeEstimee || parseInt(formData.dureeEstimee) <= 0) {
        throw new Error('La durée estimée doit être supérieure à 0')
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
        prixMax: parseFloat(formData.prixMax),
        dureeEstimee: parseInt(formData.dureeEstimee),
        infosAdditionnelles
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
              imageFormData.append('projetId', result.id)
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
        router.push(`/donneur-ordre/projets/${result.id}`)
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
                    <label htmlFor="prixMax" className="block text-sm font-medium text-gray-700">
                      Budget maximum (€) *
                    </label>
                    <input
                      type="number"
                      name="prixMax"
                      id="prixMax"
                      value={formData.prixMax}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
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
                  Définissez les dates importantes du projet.
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
                <ProjectImageUpload
                  images={projectImages}
                  onImagesChange={setProjectImages}
                  disabled={loading || uploadingImages}
                />
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
                  {formData.prixMax && (
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