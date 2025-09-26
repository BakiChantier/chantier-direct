'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import { SOUS_TRAITANT_DOCUMENTS } from '@/lib/document-types'
import type { DocumentType } from '@prisma/client'

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  nomSociete?: string
}

interface Projet {
  id: string
  titre: string
  description: string
  typeChantier: string[]
  prixMax: number | null
  isEnchereLibre: boolean
  dureeEstimee: number
  status: string
  villeChantier: string
  codePostalChantier: string
  delai: string
  createdAt: string
  donneurOrdre: User
  _count: {
    offres: number
  }
}

interface Offre {
  id: string
  prixPropose: number
  delaiPropose: number
  message?: string
  status: string
  createdAt: string
  hasUnreadMessages: boolean
  unreadCount: number
  projet: {
    id: string
    titre: string
    villeChantier: string
    prixMax: number | null
    isEnchereLibre: boolean
    status: string
    donneurOrdre: User
  }
}


interface Stats {
  offresEnAttente: number
  offresAcceptees: number
  offresRefusees: number
  totalOffres: number
  messagesNonLus: number
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

export default function SousTraitantDashboard() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  const [projetsRecommandes, setProjetsRecommandes] = useState<Projet[]>([])
  const [mesOffres, setMesOffres] = useState<Offre[]>([])
  const [stats, setStats] = useState<Stats>({
    offresEnAttente: 0,
    offresAcceptees: 0,
    offresRefusees: 0,
    totalOffres: 0,
    messagesNonLus: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'projets' | 'offres'>('projets')
  // Vérification des documents
  const [docsFromServer, setDocsFromServer] = useState<Array<{ type: string; status: string; fileName: string }>>([])
  const [verifLoading, setVerifLoading] = useState(true)
  const [, setIsVerified] = useState(false)
  const [docFiles, setDocFiles] = useState<Record<DocumentType, File | null>>({} as Record<DocumentType, File | null>)
  const [docUploading, setDocUploading] = useState<string | null>(null)
  const [docError, setDocError] = useState('')
  const [docSuccess, setDocSuccess] = useState('')

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== 'SOUS_TRAITANT') {
        router.push('/login')
        return
      }
      // Vérifier les documents avant de charger le reste
      verifyDocuments().then((ok) => {
        setIsVerified(ok)
        setVerifLoading(false)
        if (ok) {
          fetchDashboardData()
        } else {
          setLoading(false)
        }
      })
    } else if (!isLoading && !user) {
      setLoading(false)
      router.push('/login')
    }
  }, [user, isLoading, router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/sous-traitant/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjetsRecommandes(data.projetsRecommandes)
        setMesOffres(data.mesOffres)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyDocuments = async (): Promise<boolean> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch('/api/documents', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      })
      // En cas d'échec (ex: cookie manquant en dev), ne pas bloquer le dashboard
      if (!res.ok) return true
      const json = await res.json()
      const list = (json?.data || []) as Array<{ type: string; status: string; fileName: string }>
      setDocsFromServer(list)
      const required = SOUS_TRAITANT_DOCUMENTS.filter((d: any) => d.required) // eslint-disable-line @typescript-eslint/no-explicit-any
      // Tous les requis doivent exister ET être APPROVED
      return required.every((cfg: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const found = list.find(d => d.type === cfg.type)
        return found && found.status === 'APPROVED'
      })
    } catch (e) {
      console.error('Erreur:', e)
      // En cas d'erreur réseau, ne pas bloquer
      return true
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
      // Uploader les requis sélectionnés
      for (const cfg of required) {
        const file = docFiles[cfg.type as DocumentType]
        if (!file) continue
        const fd = new FormData()
        fd.append('file', file)
        fd.append('documentType', cfg.type)
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        })
        const data = await response.json()
        if (!data.success) throw new Error(data.error || `Échec upload: ${cfg.label}`)
      }
      // Uploader optionnels si présents
      const optional = SOUS_TRAITANT_DOCUMENTS.filter((d: any) => !d.required) // eslint-disable-line @typescript-eslint/no-explicit-any
      for (const cfg of optional) {
        const file = docFiles[cfg.type as DocumentType]
        if (!file) continue
        const fd = new FormData()
        fd.append('file', file)
        fd.append('documentType', cfg.type)
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        })
        const data = await response.json()
        if (!data.success) throw new Error(data.error || `Échec upload: ${cfg.label}`)
      }
      setDocSuccess('Documents uploadés. En attente de validation par un administrateur.')
      // Rafraîchir l’état
      verifyDocuments().then(ok => setIsVerified(ok))
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setDocError(e?.message || 'Erreur lors de l\'upload des documents') 
    } finally {
      setDocUploading(null)
    }
  }

 /*  const fetchMessages = async (offreId: string) => {
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
  } */

/*   const markMessagesAsRead = async (offreId: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/messages/${offreId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      // Rafraîchir les données pour mettre à jour les compteurs
      fetchDashboardData()
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error)
    }
  } */

  /* const sendMessage = async () => {
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
  } */

  const getTypeChantierLabel = (type: string) => {
    return TYPE_CHANTIER_OPTIONS.find(t => t.value === type)?.label || type
  }

 /*  const getStatusBadge = (status: string) => {
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
  } */

  if (isLoading || loading || verifLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // Garde: si non vérifié, forcer l'upload uniquement si des documents requis manquent ou sont rejetés (BLOCKED)
  // Calcul local simple: si la liste renvoyée contient au moins un requis en REJECTED ou aucun upload pour un requis -> BLOCKED
  const requiredCfg = SOUS_TRAITANT_DOCUMENTS.filter((d: any) => d.required) // eslint-disable-line @typescript-eslint/no-explicit-any
  const statuses = requiredCfg.map((cfg: any) => docsFromServer.find(x => x.type === cfg.type)?.status || 'MISSING') // eslint-disable-line @typescript-eslint/no-explicit-any
  const allApproved = statuses.length > 0 && statuses.every(s => s === 'APPROVED')
  const hasRejectedOrMissing = statuses.some(s => s === 'REJECTED' || s === 'MISSING')
  const isPendingVerification = !verifLoading && !allApproved && !hasRejectedOrMissing

  if (!verifLoading && !allApproved && hasRejectedOrMissing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900">Vérification du compte requise</h1>
            <p className="mt-2 text-gray-600">
              Votre profil est créé, mais vous ne pouvez pas utiliser la plateforme tant que vos documents ne sont pas fournis et validés par un administrateur.
            </p>

            <div className="mt-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Statut de vos documents</h2>
              <ul className="text-sm text-gray-700 space-y-1">
                {SOUS_TRAITANT_DOCUMENTS.map((cfg: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                  const d = docsFromServer.find(x => x.type === cfg.type)
                  const statusLabel = d ? d.status : 'MANQUANT'
                  const color = !d ? 'text-red-600' : d.status === 'APPROVED' ? 'text-green-600' : d.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                  return (
                    <li key={cfg.type} className="flex items-center justify-between">
                      <span className="mr-4">{cfg.label}{cfg.required && <span className="text-red-500"> *</span>}</span>
                      <span className={`text-xs font-medium ${color}`}>{statusLabel}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="mt-8 space-y-6">
              {SOUS_TRAITANT_DOCUMENTS.map((cfg: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <div key={cfg.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">{cfg.label} {cfg.required && <span className="text-red-500">*</span>}</div>
                      {cfg.description && (
                        <div className="text-xs text-gray-500">{cfg.description}</div>
                      )}
                    </div>
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

            {docError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{docError}</div>
            )}
            {docSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{docSuccess}</div>
            )}

            <div className="mt-6">
              <button
                onClick={handleUploadAllDocs}
                disabled={docUploading !== null}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {docUploading === 'BATCH' ? 'Upload en cours...' : 'Uploader les documents'}
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Une fois tous vos documents requis déposés et validés par un administrateur, votre accès complet sera activé automatiquement.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Sous-traitant</h1>
              <p className="text-gray-600 mt-1">
                Bienvenue {user?.prenom} {user?.nom} {user?.nomSociete && `- ${user.nomSociete}`}
              </p>
            </div>
            <a
              href={`/profil/${user?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Voir mon profil public
            </a>
          </div>
        </div>

        {/* Bandeau documents en attente de validation */}
        {isPendingVerification && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-yellow-900">Documents en cours de vérification</h2>
                <p className="mt-1 text-sm text-yellow-800">Vous pouvez utiliser votre dashboard, mais certaines actions (soumettre une offre) resteront désactivées tant que la validation n&apos;est pas terminée.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {requiredCfg.map((cfg: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const d = docsFromServer.find(x => x.type === cfg.type)
                const status = d?.status || 'PENDING'
                const badge = status === 'APPROVED' ? 'bg-green-100 text-green-800' : status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                const label = status === 'APPROVED' ? 'Approuvé' : status === 'PENDING' ? 'En attente' : 'Rejeté'
                return (
                  <div key={cfg.type} className="flex items-center justify-between rounded-md border border-yellow-200 bg-white px-3 py-2">
                    <span className="text-sm text-gray-900">{cfg.label}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${badge}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.offresEnAttente}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Acceptées</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.offresAcceptees}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Refusées</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.offresRefusees}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total offres</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalOffres}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Messages non lus</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.messagesNonLus}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('projets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projets'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Projets recommandés ({projetsRecommandes.length})
              </button>
              <button
                onClick={() => router.push('/sous-traitant/dashboard/offers')}
                className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Mes offres ({mesOffres.length})
                {stats.messagesNonLus > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {stats.messagesNonLus}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Projets recommandés */}
        <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Projets recommandés pour vous</h2>
              <p className="text-gray-600">Projets correspondant à vos expertises et disponibles</p>
            </div>
            
            {projetsRecommandes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet disponible</h3>
                <p className="mt-1 text-sm text-gray-500">Il n&apos;y a pas de nouveaux projets disponibles pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projetsRecommandes.map((projet) => (
                  <div key={projet.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{projet.titre}</h3>
                        <span className="text-lg font-bold text-green-600">
                          {projet.isEnchereLibre ? '🎯 Enchère libre' : `${projet.prixMax?.toLocaleString('fr-FR')} €`}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{projet.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {projet.typeChantier.slice(0, 2).map((type) => (
                          <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getTypeChantierLabel(type)}
                          </span>
                        ))}
                        {projet.typeChantier.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{projet.typeChantier.length - 2}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>📍 {projet.villeChantier}</span>
                        <span>⏱️ {projet.dureeEstimee} jours</span>
                        <span>👥 {projet._count.offres} candidat{projet._count.offres !== 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Limite: {new Date(projet.delai).toLocaleDateString('fr-FR')}
                        </div>
                        <button
                          onClick={() => router.push(`/projets/${projet.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  )
} 