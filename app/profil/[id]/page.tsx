'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import FileUpload from '@/components/FileUpload'
import { SOUS_TRAITANT_DOCUMENTS } from '@/lib/document-types'
import type { DocumentType } from '@prisma/client'
import Image from 'next/image'
interface User {
  id: string
  nom: string
  prenom: string
  email: string
  nomSociete?: string
  telephone: string
  adresse: string
  ville: string
  codePostal: string
  pays: string
  nombreEmployes?: number
  expertises: string[]
  noteGlobale?: number
  nombreEvaluations?: number
  createdAt: string
  contractorProfile?: ContractorProfile | null
}

type PublicVerificationStatus = 'VERIFIED' | 'PENDING' | 'BLOCKED'

interface ContractorProfile {
  displayName?: string | null
  bio?: string | null
  hourlyRate?: number | null
  completedProjects?: number | null
  websites?: string[]
  phonePublic?: string | null
  emailPublic?: string | null
  addressLine?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string | null
  verificationStatus?: PublicVerificationStatus | null
  references?: Array<Reference>
  avatarUrl?: string | null
}

interface ReferenceMedia {
  id: string
  url: string
  title?: string | null
  description?: string | null
}

interface Reference {
  id: string
  title: string
  description?: string | null
  media?: ReferenceMedia[]
}

interface Avis {
  id: string
  note: number
  commentaire: string
  createdAt: string
  evaluateur: {
    id: string
    nom: string
    prenom: string
    nomSociete?: string
  }
  projet: {
    id: string
    titre: string
    typeChantier: string[]
    villeChantier: string
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

// Fonction pour afficher les étoiles de notation
/* const renderStars = (rating: number) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  
  // Étoiles pleines
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={`full-${i}`} className="text-yellow-400">⭐</span>
    )
  }
  
  // Étoile à moitié si nécessaire
  if (hasHalfStar) {
    stars.push(
      <span key="half" className="text-yellow-400">⭐</span>
    )
  }
  
  // Étoiles vides
  const emptyStars = 5 - Math.ceil(rating)
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className="text-gray-300">⭐</span>
    )
  }
  
  return stars
} */

export default function ProfilPublicPage() {
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser } = useUser()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ContractorProfile | null>(null)
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isClient, setIsClient] = useState(false)
  
  // Vérification documents pour sous-traitants
  const [docsFromServer, setDocsFromServer] = useState<Array<{ type: string; status: string; fileName: string }>>([])
  const [verificationStatus, setVerificationStatus] = useState<'VERIFIED' | 'PENDING' | 'BLOCKED'>('VERIFIED')
  const [docFiles, setDocFiles] = useState<Record<DocumentType, File | null>>({} as Record<DocumentType, File | null>)
  const [docUploading, setDocUploading] = useState<string | null>(null)
  const [docError, setDocError] = useState('')
  const [docSuccess, setDocSuccess] = useState('')

  useEffect(() => {
    setIsClient(true)
    fetchUserProfile()
    
    // Vérifier les documents si c'est le profil de l'utilisateur connecté et qu'il est sous-traitant
    if (currentUser?.role === 'SOUS_TRAITANT' && currentUser.id === userId) {
      verifyDocuments().then(status => setVerificationStatus(status))
    }
  }, [userId, currentUser]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
        setProfile(data.data.user.contractorProfile)
      } else {
        // Ne pas afficher d'erreur si c'est un problème de documents manquants
        if (currentUser?.role === 'SOUS_TRAITANT' && currentUser.id === userId) {
          setError('')
        } else {
          setError('Erreur lors du chargement du profil')
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      // Ne pas afficher d'erreur si c'est un problème de documents manquants
      if (currentUser?.role === 'SOUS_TRAITANT' && currentUser.id === userId) {
        setError('')
      } else {
        setError('Erreur de connexion')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAvis = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/avis`)
      if (response.ok) {
        const data = await response.json()
        setAvis(data.data.avis)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error)
    }
  }

  const verifyDocuments = async (): Promise<'VERIFIED' | 'PENDING' | 'BLOCKED'> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch('/api/documents', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      })
      if (!res.ok) return 'VERIFIED'
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
        const response = await fetch('/api/documents/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd })
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
        const response = await fetch('/api/documents/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd })
        const data = await response.json()
        if (!data.success) throw new Error(data.error || `Échec upload: ${cfg.label}`)
      }
      setDocSuccess('Documents soumis avec succès ! Votre compte sera vérifié sous 48h par notre équipe administrative.')
      verifyDocuments().then(status => setVerificationStatus(status))
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setDocError(e?.message || 'Erreur lors de la soumission des documents. Veuillez réessayer.')
    } finally {
      setDocUploading(null)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAvis()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Parser Markdown léger (même logique que l'éditeur) - stabilisé avec useMemo
  const bioHtml = useMemo(() => {
    if (!profile?.bio || !isClient) return ''
    const md = profile.bio
    const escapeHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const lines = md.split(/\n/)
    let html = ''
    let inList = false
    const renderInline = (s: string) => {
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      s = s.replace(/_([^_]+)_/g, '<em>$1</em>')
      return s
    }
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      const line = escapeHtml(raw)
      if (/^\s*$/.test(line)) {
        if (inList) { html += '</ul>'; inList = false }
        html += '<br/>'
        continue
      }
      const mH = line.match(/^(#{1,6})\s+(.+)$/)
      if (mH) {
        if (inList) { html += '</ul>'; inList = false }
        const level = mH[1].length
        const cls = level === 1 ? 'text-2xl font-bold mt-4 mb-2'
          : level === 2 ? 'text-xl font-semibold mt-3 mb-2'
          : 'text-lg font-medium mt-2 mb-2'
        html += `<h${level} class="${cls}">${renderInline(mH[2])}</h${level}>`
        continue
      }
      const mLi = line.match(/^\s*-\s+(.+)$/)
      if (mLi) {
        if (!inList) { html += '<ul class="list-disc pl-6 my-2 space-y-1">'; inList = true }
        html += `<li class="leading-relaxed">${renderInline(mLi[1])}</li>`
        continue
      }
      html += `<p class="mb-2 leading-relaxed">${renderInline(line)}</p>`
    }
    if (inList) html += '</ul>'
    return html
  }, [profile?.bio, isClient])

  const renderVerificationBadge = (status: PublicVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Vérifié</span>
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>
      case 'BLOCKED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Bloqué</span>
      default:
        return null
    }
  }

  const renderStars = (note: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`h-4 w-4 ${i < note ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  const getTypeChantierLabel = (type: string) => {
    return TYPE_CHANTIER_OPTIONS.find(t => t.value === type)?.label || type
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profil non trouvé</h3>
        </div>
      </div>
    )
  }

  // Vérifier si c'est le profil de l'utilisateur connecté et qu'il doit uploader des documents
  const isOwnProfile = currentUser?.id === userId
  const needsDocumentUpload = isOwnProfile && currentUser?.role === 'SOUS_TRAITANT' && verificationStatus === 'BLOCKED'
  const waitingForValidation = isOwnProfile && currentUser?.role === 'SOUS_TRAITANT' && verificationStatus === 'PENDING'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Alerte documents en attente de validation */}
        {waitingForValidation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800">Documents en cours de vérification</h3>
                <p className="text-sm text-yellow-700 mt-1">Vos documents ont été soumis avec succès et sont en cours de vérification par notre équipe administrative. Votre profil public sera visible une fois la validation terminée.</p>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-yellow-600">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Vérification en cours...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerte vérification documents pour sous-traitants */}
        {needsDocumentUpload && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-blue-800">Vérification de votre compte requise</h3>
                <p className="text-sm text-blue-700 mt-1">Pour accéder à votre profil public et aux fonctionnalités de la plateforme, veuillez soumettre vos documents obligatoires pour vérification par notre équipe administrative.</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-blue-800 mb-4">Documents à soumettre :</h4>
              <div className="space-y-4">
                {SOUS_TRAITANT_DOCUMENTS.map((cfg: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                  <div key={cfg.type} className="border border-blue-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-900">{cfg.label} {cfg.required && <span className="text-red-500">*</span>}</div>
                      {docsFromServer.find(x => x.type === cfg.type)?.status === 'APPROVED' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">✓ Validé</span>
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
            </div>
            
            {docError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{docError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {docSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{docSuccess}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={handleUploadAllDocs}
                disabled={docUploading !== null}
                className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm"
              >
                {docUploading === 'BATCH' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Soumission en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Soumettre les documents pour vérification
                  </>
                )}
              </button>
              <p className="mt-2 text-xs text-blue-600">Votre compte sera vérifié sous 48h après soumission</p>
            </div>
          </div>
        )}

        {/* Contenu du profil - masqué si documents manquants ou en attente */}
        {!needsDocumentUpload && !waitingForValidation && (
          <>
            {/* Header du profil */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  {profile?.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="avatar" className="h-20 w-20 rounded-full object-cover" width={80} height={80} />
                  ) : (
                    <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-medium text-gray-600">
                        {user.prenom?.[0] || user.nom[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile?.displayName || `${user.prenom} ${user.nom}`}
                    </h1>
                    {profile?.verificationStatus && renderVerificationBadge(profile.verificationStatus)}
                  </div>
                  <p className="text-lg text-gray-600 mb-4">
                    {user.nomSociete || `${user.prenom} ${user.nom}`}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                    {user.noteGlobale && (
                      <div className="flex items-center space-x-1">
                        <div className="flex">{renderStars(user.noteGlobale)}</div>
                        <span>({user.nombreEvaluations} avis)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Corps: grille responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Colonne gauche (infos) */}
              <div className="lg:col-span-1">
                {/* Bio et infos pro */}
                {(profile?.bio || profile?.hourlyRate || profile?.completedProjects || (profile?.websites && profile.websites.length > 0) || profile?.emailPublic) && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Présentation</h2>
                    {profile?.bio && bioHtml && (
                      <div className="text-gray-700 prose prose-sm max-w-none mb-4" dangerouslySetInnerHTML={{ __html: bioHtml }} />
                    )}
                    <div className="space-y-3">
                      {profile?.hourlyRate && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Tarif horaire moyen</span>
                          <p className="text-lg font-semibold text-gray-900">{profile.hourlyRate} €/h</p>
                        </div>
                      )}
                      {profile?.completedProjects && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Projets réalisés</span>
                          <p className="text-lg font-semibold text-gray-900">{profile.completedProjects}</p>
                        </div>
                      )}
                      {profile?.websites && profile.websites.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Sites internet</span>
                          <ul className="mt-1 space-y-1">
                            {profile.websites.map((site, index) => (
                              <li key={index}>
                                <a href={site} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm break-all">
                                  {site}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {profile?.emailPublic && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Email public</span>
                          <p className="text-sm text-gray-900 break-all">{profile.emailPublic}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expertises */}
                {user.expertises && user.expertises.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Expertises</h2>
                    <div className="flex flex-wrap gap-2">
                      {user.expertises.map((expertise) => (
                        <span key={expertise} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {getTypeChantierLabel(expertise)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact public */}
                {(profile?.phonePublic || profile?.addressLine || profile?.city) && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
                    <div className="space-y-3">
                      {profile?.phonePublic && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Téléphone</span>
                          <p className="text-sm text-gray-900">{profile.phonePublic}</p>
                        </div>
                      )}
                      {(profile?.addressLine || profile?.city) && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Adresse</span>
                          <p className="text-sm text-gray-900">
                            {[profile.addressLine, profile.city, profile.postalCode, profile.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne droite (large): Références + Avis */}
              <div className="lg:col-span-2">
                {/* Références */}
                {profile?.references && profile.references.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Références de chantiers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profile.references.map((ref) => (
                        <div key={ref.id} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{ref.title}</h3>
                          {ref.description && (
                            <p className="text-sm text-gray-600 mb-3">{ref.description}</p>
                          )}
                          {ref.media && ref.media.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {ref.media.slice(0, 4).map((media) => (
                                <div key={media.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                  <Image
                                    src={media.url}
                                    alt={media.title || 'Image de référence'}
                                    className="w-full h-full object-cover"
                                    width={500}
                                    height={500}
                                  />
                                </div>
                              ))}
                              {ref.media.length > 4 && (
                                <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                                  <span className="text-sm text-gray-500">+{ref.media.length - 4}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Avis clients */}
                {avis.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Avis clients</h2>
                    <div className="space-y-4">
                      {avis.map((avis) => (
                        <div key={avis.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex">{renderStars(avis.note)}</div>
                              <span className="text-sm font-medium text-gray-900">
                                {avis.evaluateur.nomSociete || `${avis.evaluateur.prenom} ${avis.evaluateur.nom}`}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(avis.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{avis.commentaire}</p>
                          <div className="text-xs text-gray-500">
                            Projet: {avis.projet.titre} • {avis.projet.villeChantier}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}