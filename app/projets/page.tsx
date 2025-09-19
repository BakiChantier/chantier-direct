'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import FileUpload from '@/components/FileUpload'
import { SOUS_TRAITANT_DOCUMENTS } from '@/lib/document-types'
import type { DocumentType } from '@prisma/client'

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
  createdAt: string
  donneurOrdre: {
    id: string
    nom: string
    prenom: string
    nomSociete?: string
  }
  _count: {
    offres: number
  }
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

export default function ProjetsPage() {
  const { user } = useUser()
  const router = useRouter()

  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Vérif documents
  const [docsFromServer, setDocsFromServer] = useState<Array<{ type: string; status: string; fileName: string }>>([])
  const [, setVerifLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'VERIFIED' | 'PENDING' | 'BLOCKED'>('VERIFIED')
  const [docFiles, setDocFiles] = useState<Record<DocumentType, File | null>>({} as Record<DocumentType, File | null>)
  const [docUploading, setDocUploading] = useState<string | null>(null)
  const [docError, setDocError] = useState('')
  const [docSuccess, setDocSuccess] = useState('')

  // États des filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVille, setSelectedVille] = useState('')
  const [prixMin, setPrixMin] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [dureeMin, setDureeMin] = useState('')
  const [dureeMax, setDureeMax] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc'>('recent')

  useEffect(() => {
    fetchProjets()
    // Vérifier docs pour sous-traitants
    if (user?.role === 'SOUS_TRAITANT') {
      setVerifLoading(true)
      verifyDocuments().then(status => {
        setVerificationStatus(status)
        setVerifLoading(false)
      })
    }
    const saved = localStorage.getItem('search:projets:q')
    if (saved) {
      setSearchTerm(saved)
      // auto-clear pour prochaine visite
      localStorage.removeItem('search:projets:q')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjets = async () => {
    try {
      const response = await fetch('/api/projets')
      
      if (response.ok) {
        const data = await response.json()
        setProjets(data.projets)
      } else {
        setError('Erreur lors du chargement des projets')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const verifyDocuments = async (): Promise<'VERIFIED' | 'PENDING' | 'BLOCKED'> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch('/api/documents', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      })
      if (!res.ok) return 'VERIFIED' // ne bloque pas l'accès à la liste si échec
      const json = await res.json()
      const list = (json?.data || []) as Array<{ type: string; status: string; fileName: string }>
      setDocsFromServer(list)
      const required = SOUS_TRAITANT_DOCUMENTS.filter((d: any) => d.required) // eslint-disable-line @typescript-eslint/no-explicit-any
      const statuses = required.map((cfg: any) => list.find(d => d.type === cfg.type)?.status || 'MISSING') // eslint-disable-line @typescript-eslint/no-explicit-any
      if (statuses.every(s => s === 'APPROVED')) return 'VERIFIED'
      if (statuses.some(s => s === 'REJECTED' || s === 'MISSING')) return 'BLOCKED'
      return 'PENDING'
    } catch {
      return 'VERIFIED'
    }
  }

  const handleDocSelect = (documentType: DocumentType, file: File) => {
    setDocFiles(prev => ({ ...prev, [documentType]: file }))
  }

  const handleUploadAllDocs = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    setDocError('')
    setDocSuccess('')
    setDocUploading('BATCH')
    try {
      const required = SOUS_TRAITANT_DOCUMENTS.filter((d: any) => d.required) // eslint-disable-line @typescript-eslint/no-explicit-any
      for (const cfg of required) {
        const file = docFiles[cfg.type as DocumentType]
        if (!file) continue
        const fd = new FormData()
        fd.append('file', file)
        fd.append('documentType', cfg.type)
        const response = await fetch('/api/documents/upload', {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd
        })
        const data = await response.json()
        if (!data.success) throw new Error(data.error || `Échec upload: ${cfg.label}`)
      }
      const optional = SOUS_TRAITANT_DOCUMENTS.filter((d: any) => !d.required) // eslint-disable-line @typescript-eslint/no-explicit-any
      for (const cfg of optional) {
        const file = docFiles[cfg.type as DocumentType]
        if (!file) continue
        const fd = new FormData()
        fd.append('file', file)
        fd.append('documentType', cfg.type)
        const response = await fetch('/api/documents/upload', {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd
        })
        const data = await response.json()
        if (!data.success) throw new Error(data.error || `Échec upload: ${cfg.label}`)
      }
      setDocSuccess('Documents uploadés. En attente de validation admin.')
      verifyDocuments().then(status => setVerificationStatus(status))
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setDocError(e?.message || 'Erreur lors de l\'upload des documents')
    } finally {
      setDocUploading(null)
    }
  }

  // Obtenir la liste unique des villes
  const villes = useMemo(() => {
    const villesSet = new Set(projets.map(p => p.villeChantier))
    return Array.from(villesSet).sort()
  }, [projets])

  // Filtrer et trier les projets
  const filteredProjets = useMemo(() => {
    const filtered = projets.filter(projet => {
      // Recherche par titre
      const matchesSearch = !searchTerm || 
        projet.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projet.description.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtre par ville
      const matchesVille = !selectedVille || projet.villeChantier === selectedVille

      // Filtre par prix
      const matchesPrixMin = !prixMin || projet.prixMax >= parseFloat(prixMin)
      const matchesPrixMax = !prixMax || projet.prixMax <= parseFloat(prixMax)

      // Filtre par durée
      const matchesDureeMin = !dureeMin || projet.dureeEstimee >= parseInt(dureeMin)
      const matchesDureeMax = !dureeMax || projet.dureeEstimee <= parseInt(dureeMax)

      // Filtre par types de chantier
      const matchesTypes = selectedTypes.length === 0 || 
        selectedTypes.some(type => projet.typeChantier.includes(type))

      // Seulement les projets ouverts
      const isOpen = projet.status === 'OUVERT'

      // Date limite non dépassée
      const notExpired = new Date(projet.delai) > new Date()

      return matchesSearch && matchesVille && matchesPrixMin && matchesPrixMax && 
             matchesDureeMin && matchesDureeMax && matchesTypes && isOpen && notExpired
    })

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'price-asc':
          return a.prixMax - b.prixMax
        case 'price-desc':
          return b.prixMax - a.prixMax
        case 'duration-asc':
          return a.dureeEstimee - b.dureeEstimee
        case 'duration-desc':
          return b.dureeEstimee - a.dureeEstimee
        default:
          return 0
      }
    })

    return filtered
  }, [projets, searchTerm, selectedVille, prixMin, prixMax, dureeMin, dureeMax, selectedTypes, sortBy])

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedVille('')
    setPrixMin('')
    setPrixMax('')
    setDureeMin('')
    setDureeMax('')
    setSelectedTypes([])
    setSortBy('recent')
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

  // Retirer la syntaxe Markdown pour affichage dans les cards
  const stripMarkdown = (input: string): string => {
    if (!input) return ''
    let s = input
    // Enlever code fences
    s = s.replace(/```[\s\S]*?```/g, ' ')
    // En-têtes
    s = s.replace(/^#{1,6}\s*/gm, '')
    // Listes
    s = s.replace(/^\s*[-*+]\s+/gm, '')
    s = s.replace(/^\s*\d+\.\s+/gm, '')
    // Blockquotes
    s = s.replace(/^>\s?/gm, '')
    // Liens images
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    // Liens
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    // Gras/Italique/Inline code
    s = s.replace(/\*\*([^*]+)\*\*/g, '$1')
    s = s.replace(/__([^_]+)__/g, '$1')
    s = s.replace(/\*([^*]+)\*/g, '$1')
    s = s.replace(/_([^_]+)_/g, '$1')
    s = s.replace(/`([^`]+)`/g, '$1')
    // Nettoyage espaces
    s = s.replace(/\r/g, '')
    s = s.replace(/\n{3,}/g, '\n\n')
    s = s.trim()
    return s
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Appels d&apos;offres disponibles
          </h1>
          <p className="mt-2 text-gray-600">
            Découvrez les projets en cours et soumettez vos offres
          </p>
        </div>

        {/* Alerte vérification documents pour sous-traitants non vérifiés */}
        {user?.role === 'SOUS_TRAITANT' && verificationStatus === 'BLOCKED' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800">Votre compte doit être vérifié</h3>
            <p className="text-sm text-yellow-700 mt-1">Vous pouvez consulter les projets, mais vous ne pourrez pas soumettre d&apos;offre tant que vos documents ne sont pas déposés et validés.</p>
            <div className="mt-4 space-y-4">
              {SOUS_TRAITANT_DOCUMENTS.map((cfg: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <div key={cfg.type} className="border border-yellow-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">{cfg.label} {cfg.required && <span className="text-red-500">*</span>}</div>
                    {docsFromServer.find(x => x.type === cfg.type)?.status === 'APPROVED' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Validé</span>
                    )}
                  </div>
                  <FileUpload
                    onFileSelect={(file) => handleDocSelect(cfg.type as DocumentType, file)}
                    disabled={docUploading !== null}
                    currentFile={docFiles[cfg.type as DocumentType]?.name}
                  />
                </div>
              ))}
            </div>
            {docError && <div className="mt-3 text-sm text-red-700">{docError}</div>}
            {docSuccess && <div className="mt-3 text-sm text-green-700">{docSuccess}</div>}
            <div className="mt-4">
              <button
                onClick={handleUploadAllDocs}
                disabled={docUploading !== null}
                className="inline-flex items-center px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {docUploading === 'BATCH' ? 'Upload en cours...' : 'Uploader les documents'}
              </button>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Filtres de recherche</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Effacer tous les filtres
            </button>
          </div>

          <div className="space-y-6">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un projet
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom du projet, description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Filtres en ligne */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  value={selectedVille}
                  onChange={(e) => setSelectedVille(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Toutes les villes</option>
                  {villes.map(ville => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>

              {/* Prix minimum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix minimum (€)
                </label>
                <input
                  type="number"
                  value={prixMin}
                  onChange={(e) => setPrixMin(e.target.value)}
                  placeholder="Ex: 1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Prix maximum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix maximum (€)
                </label>
                <input
                  type="number"
                  value={prixMax}
                  onChange={(e) => setPrixMax(e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)} // eslint-disable-line @typescript-eslint/no-explicit-any  
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="recent">Plus récents</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="duration-asc">Durée croissante</option>
                  <option value="duration-desc">Durée décroissante</option>
                </select>
              </div>
            </div>

            {/* Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée minimum (jours)
                </label>
                <input
                  type="number"
                  value={dureeMin}
                  onChange={(e) => setDureeMin(e.target.value)}
                  placeholder="Ex: 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée maximum (jours)
                </label>
                <input
                  type="number"
                  value={dureeMax}
                  onChange={(e) => setDureeMax(e.target.value)}
                  placeholder="Ex: 30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Types de chantier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Types de chantier
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {TYPE_CHANTIER_OPTIONS.map((option) => (
                  <label key={option.value} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-red-600 rounded"
                      checked={selectedTypes.includes(option.value)}
                      onChange={() => handleTypeToggle(option.value)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredProjets.length} projet{filteredProjets.length !== 1 ? 's' : ''} trouvé{filteredProjets.length !== 1 ? 's' : ''}
            </p>
            {user?.role === 'DONNEUR_ORDRE' && (
              <button
                onClick={() => router.push('/donneur-ordre/projets/nouveau')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer un appel d&apos;offre
              </button>
            )}
          </div>
        </div>

        {/* Liste des projets */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : filteredProjets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProjets.map((projet) => {
              const isContractor = user?.role === 'SOUS_TRAITANT'
              const disabledForContractor = isContractor && verificationStatus !== 'VERIFIED'
              const handleClick = () => {
                if (!user) {
                  router.push('/register');
                  return;
                }
                if (disabledForContractor) return
                
                // Vérifier si l'utilisateur est le créateur du projet
                const isProjectOwner = user?.role === 'DONNEUR_ORDRE' && projet.donneurOrdre.id === user.id
                const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
                
                if (isProjectOwner || isAdmin) {
                  router.push(`/donneur-ordre/projets/${projet.id}`)
                } else {
                  router.push(`/projets/${projet.id}`)
                }
              }
              return (
              <div
                key={projet.id}
                className={`bg-white rounded-lg shadow transition-shadow relative ${disabledForContractor ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}`}
                onClick={handleClick}
                title={disabledForContractor ? 'Action indisponible: documents en attente de validation' : ''}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-xl font-semibold text-gray-900 ${!user ? 'blur-sm select-none' : ''}`}>
                          {projet.titre}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(projet.status)}`}>
                          Ouvert
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {stripMarkdown(projet.description)}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {projet.villeChantier}
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {projet.prixMax.toLocaleString('fr-FR')} € max
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {projet.dureeEstimee} jours
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {projet._count.offres} offre{projet._count.offres !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {projet.typeChantier.slice(0, 3).map((type) => (
                            <span key={type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {TYPE_CHANTIER_OPTIONS.find(t => t.value === type)?.label || type}
                            </span>
                          ))}
                          {projet.typeChantier.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{projet.typeChantier.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Date limite : {new Date(projet.delai).toLocaleDateString('fr-FR')}
                          </p>
                          <p className={`text-xs text-gray-400 ${!user ? 'blur-sm select-none' : ''}`}>
                            Par {projet.donneurOrdre.nomSociete || `${projet.donneurOrdre.prenom} ${projet.donneurOrdre.nom}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {!user && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 mb-2">🔒 Connectez-vous pour voir ce projet</div>
                      <div className="text-sm text-gray-600 mb-4">Créez un compte pour accéder aux détails des projets</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/register');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        S&apos;inscrire maintenant
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )})}
          </div>
        )}

        {/* Section CTA colorée */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl overflow-hidden">
          <div className="px-8 py-12 sm:px-12 sm:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Développez votre activité BTP avec les bons partenaires
              </h2>
              <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
                Rejoignez des milliers de professionnels du bâtiment qui font confiance à notre plateforme 
                pour trouver des projets qualifiés et développer leur réseau d&apos;affaires.
              </p>
            </div>
          </div>
        </div>

        {/* Section Documentation */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comment fonctionne notre plateforme BTP ?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez comment optimiser votre utilisation selon votre profil professionnel
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Pour les Donneurs d'ordre */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">
                    Pour les Donneurs d&apos;Ordre
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Publiez votre appel d&apos;offres</h4>
                      <p className="text-blue-800 text-sm">
                        Décrivez votre projet BTP avec tous les détails : budget, délais, localisation, 
                        spécifications techniques et documents requis.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Recevez des candidatures qualifiées</h4>
                      <p className="text-blue-800 text-sm">
                        Les sous-traitants certifiés de notre réseau soumettent leurs offres détaillées 
                        avec devis, planning et références.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Comparez et sélectionnez</h4>
                      <p className="text-blue-800 text-sm">
                        Analysez les propositions, consultez les évaluations clients et échangez 
                        directement avec les candidats via notre messagerie sécurisée.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Pilotez votre projet</h4>
                      <p className="text-blue-800 text-sm">
                        Suivez l&apos;avancement, gérez les communications et finalisez votre projet 
                        avec notre système d&apos;évaluation intégré.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-100 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Avantages clés :</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Gain de temps dans la recherche de prestataires</li>
                    <li>• Accès à un vivier de professionnels vérifiés</li>
                    <li>• Outils de gestion de projet intégrés</li>
                    <li>• Transparence sur les coûts et délais</li>
                  </ul>
                </div>
              </div>

              {/* Pour les Sous-traitants */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">
                    Pour les Sous-Traitants
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Créez votre profil professionnel</h4>
                      <p className="text-green-800 text-sm">
                        Mettez en valeur vos compétences, certifications, réalisations et zone 
                        d&apos;intervention pour attirer les bons projets.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Recherchez des opportunités</h4>
                      <p className="text-green-800 text-sm">
                        Utilisez nos filtres avancés pour trouver les appels d&apos;offres qui correspondent 
                        à votre expertise et votre secteur géographique.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Soumettez vos offres personnalisées</h4>
                      <p className="text-green-800 text-sm">
                        Rédigez des propositions détaillées avec vos tarifs, délais, méthodes de travail 
                        et références pertinentes pour chaque projet.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Développez votre réputation</h4>
                      <p className="text-green-800 text-sm">
                        Réalisez vos missions avec excellence, collectez les évaluations positives 
                        et construisez votre réseau professionnel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-green-100 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-2">Avantages clés :</h5>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Accès privilégié aux appels d&apos;offres de votre région</li>
                    <li>• Visibilité auprès de donneurs d&apos;ordre qualifiés</li>
                    <li>• Outils de gestion commerciale intégrés</li>
                    <li>• Système de réputation et recommandations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to action vers la documentation */}
            <div className="mt-12 text-center bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Besoin de plus de détails sur notre fonctionnement ?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Consultez notre documentation complète avec guides détaillés, FAQ et API pour 
                une utilisation optimale de la plateforme. Ou contactez directement notre équipe support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/documentation" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Consulter la documentation
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Nous contacter
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 