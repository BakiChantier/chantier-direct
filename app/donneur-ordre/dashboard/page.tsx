'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import { DONNEUR_ORDRE_DOCUMENTS } from '@/lib/document-types'
import type { DocumentType } from '@prisma/client'

interface Projet {
  id: string
  titre: string
  description: string
  typeChantier: string[]
  prixMax: number | null
  isEnchereLibre: boolean
  status: string
  adresseChantier: string
  villeChantier: string
  dateDebut: string
  dateFin: string
  delai: string
  createdAt: string
  moderationStatus: 'PENDING' | 'VALIDATED' | 'REJECTED'
  rejectionReason?: string
  _count: {
    offres: number
  }
}

interface DashboardStats {
  totalProjets: number
  projetsOuverts: number
  projetsEnCours: number
  projetsTermines: number
  totalOffres: number
}

export default function DonneurOrdreDashboard() {
  const { user, isLoading, isAdmin } = useUser()
  const router = useRouter()
  const [projets, setProjets] = useState<Projet[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalProjets: 0,
    projetsOuverts: 0,
    projetsEnCours: 0,
    projetsTermines: 0,
    totalOffres: 0
  })
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'OUVERT' | 'EN_COURS' | 'TERMINE' | 'ANNULE'>('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projetToDelete, setProjetToDelete] = useState<Projet | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [selectedRejectedProjet, setSelectedRejectedProjet] = useState<Projet | null>(null)
  
  // États pour la vérification des documents
  const [docsFromServer, setDocsFromServer] = useState<Array<{ type: string; status: string; fileName: string }>>([])
  const [verificationStatus, setVerificationStatus] = useState<'VERIFIED' | 'PENDING' | 'BLOCKED'>('VERIFIED')
  const [docFiles, setDocFiles] = useState<Record<DocumentType, File | null>>({} as Record<DocumentType, File | null>)
  const [docUploading, setDocUploading] = useState<string | null>(null)
  const [docError, setDocError] = useState('')
  const [docSuccess, setDocSuccess] = useState('')
  const [uploadedDocuments, setUploadedDocuments] = useState<Set<DocumentType>>(new Set())

  useEffect(() => {
    if (!isLoading && user) {
      // Vérifier les permissions
      if (user.role !== 'DONNEUR_ORDRE' && !isAdmin) {
        router.push('/login')
        return
      }
      fetchDashboardData()
      // Vérifier les documents pour les donneurs d'ordre
      verifyDocuments().then(status => setVerificationStatus(status))
    } else if (!isLoading && !user) {
      // Aucun utilisateur: arrêter le loader et rediriger
      setLoadingData(false)
      router.push('/login')
    }
  }, [user, isLoading, isAdmin, router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch('/api/donneur-ordre/projets', { headers })

      if (response.ok) {
        const data = await response.json()
        const projets = data.projets
        setProjets(projets)
        
        // Calculer les statistiques
        const stats = {
          totalProjets: projets.length,
          projetsOuverts: projets.filter((p: Projet) => p.status === 'OUVERT').length,
          projetsEnCours: projets.filter((p: Projet) => p.status === 'EN_COURS').length,
          projetsTermines: projets.filter((p: Projet) => p.status === 'TERMINE').length,
          totalOffres: projets.reduce((sum: number, p: Projet) => sum + p._count.offres, 0)
        }
        setStats(stats)
      } else {
        console.error('Erreur lors de la récupération des données:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoadingData(false)
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

  const getStatusLabel = (status: string) => {
    const labels = {
      OUVERT: 'Ouvert',
      EN_COURS: 'En cours',
      TERMINE: 'Terminé',
      ANNULE: 'Annulé'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getModerationBadge = (moderationStatus: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      VALIDATED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[moderationStatus as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getModerationLabel = (moderationStatus: string) => {
    const labels = {
      PENDING: 'En attente de validation',
      VALIDATED: 'Validé',
      REJECTED: 'Rejeté'
    }
    return labels[moderationStatus as keyof typeof labels] || moderationStatus
  }

  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Retirer **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Retirer *italic*
      .replace(/#{1,6}\s?/g, '')       // Retirer # headers
      .replace(/\n/g, ' ')             // Remplacer retours à la ligne par espaces
      .trim()
  }

  const filteredProjets = projets.filter(projet => {
    if (activeTab === 'all') return true
    return projet.status === activeTab
  })

  const handleDeleteClick = (projet: Projet) => {
    setProjetToDelete(projet)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!projetToDelete) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/projets/${projetToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Projet supprimé:', result)
        
        // Mettre à jour la liste des projets
        setProjets(projets.filter(p => p.id !== projetToDelete.id))
        
        // Mettre à jour les stats
        setStats(prevStats => ({
          ...prevStats,
          totalProjets: prevStats.totalProjets - 1,
          projetsOuverts: projetToDelete.status === 'OUVERT' ? prevStats.projetsOuverts - 1 : prevStats.projetsOuverts,
          projetsEnCours: projetToDelete.status === 'EN_COURS' ? prevStats.projetsEnCours - 1 : prevStats.projetsEnCours,
          projetsTermines: projetToDelete.status === 'TERMINE' ? prevStats.projetsTermines - 1 : prevStats.projetsTermines,
          totalOffres: prevStats.totalOffres - projetToDelete._count.offres
        }))

        alert(`Projet supprimé avec succès !\n- Images: ${result.deleted.images}\n- Offres: ${result.deleted.offres}\n- Messages: ${result.deleted.messages}`)
      } else {
        const error = await response.json()
        alert(`Erreur lors de la suppression: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression du projet')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setProjetToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setProjetToDelete(null)
  }

  const openRejectionModal = (projet: Projet) => {
    setSelectedRejectedProjet(projet)
    setShowRejectionModal(true)
  }

  const verifyDocuments = async (): Promise<'VERIFIED' | 'PENDING' | 'BLOCKED'> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch('/api/documents', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      })
      if (!res.ok) return 'BLOCKED' // Par défaut, bloquer si on ne peut pas vérifier
      const json = await res.json()
      const list = (json?.data || []) as Array<{ type: string; status: string; fileName: string }>
      setDocsFromServer(list)
      const required = DONNEUR_ORDRE_DOCUMENTS.filter(d => d.required)
      const statuses = required.map(cfg => list.find(d => d.type === cfg.type)?.status || 'MISSING')
      if (statuses.every(s => s === 'APPROVED')) return 'VERIFIED'
      if (statuses.some(s => s === 'REJECTED' || s === 'MISSING')) return 'BLOCKED'
      return 'PENDING'
    } catch {
      return 'BLOCKED' // En cas d'erreur, bloquer par sécurité
    }
  }

  const handleDocSelect = (documentType: DocumentType, file: File) => {
    setDocFiles(prev => ({ ...prev, [documentType]: file }))
  }

  const handleUploadAllDocuments = async () => {
    const filesToUpload = Object.entries(docFiles).filter(([file]) => file !== null)
    
    if (filesToUpload.length === 0) return

    setDocUploading('BATCH')
    setDocError('')
    setDocSuccess('')

    try {
      let uploadedCount = 0
      const failedUploads: string[] = []

      for (const [documentType, file] of filesToUpload) {
        if (!file) continue

        const formData = new FormData()
        formData.append('file', file)
        formData.append('documentType', documentType)

        try {
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          })

          const data = await response.json()

          if (data.success) {
            uploadedCount++
            setUploadedDocuments(prev => new Set([...prev, documentType as DocumentType]))
          } else {
            const docConfig = DONNEUR_ORDRE_DOCUMENTS.find(d => d.type === documentType)
            failedUploads.push(docConfig?.label || documentType)
          }
        } catch (error) {
          console.error('Erreur upload batch:', error)
          const docConfig = DONNEUR_ORDRE_DOCUMENTS.find(d => d.type === documentType)
          failedUploads.push(docConfig?.label || documentType)
        }
      }

      if (uploadedCount > 0) {
        setDocSuccess(`${uploadedCount} document(s) uploadé(s) avec succès !`)
        // Revérifier le statut après upload
        verifyDocuments().then(status => setVerificationStatus(status))
      }
      
      if (failedUploads.length > 0) {
        setDocError(`Erreur lors de l'upload de : ${failedUploads.join(', ')}`)
      }

    } catch (error) {
      console.error('Erreur upload batch:', error)
      setDocError('Erreur lors de l\'upload des documents')
    } finally {
      setDocUploading(null)
    }
  }

  if (isLoading || loadingData) {
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
            Dashboard Donneur d&apos;Ordre
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez vos appels d&apos;offres et suivez vos projets
          </p>
        </div>

        {/* Alerte vérification documents pour donneurs d'ordre non vérifiés */}
        {verificationStatus === 'BLOCKED' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-yellow-800">Documents d&apos;entreprise requis</h3>
                <p className="text-sm text-yellow-700 mt-1 mb-4">
                  Pour pouvoir publier des appels d&apos;offres, vous devez d&apos;abord télécharger et faire valider vos documents d&apos;entreprise.
                </p>
                
                <div className="space-y-4">
                  {DONNEUR_ORDRE_DOCUMENTS.map((docConfig) => {
                    const selectedFile = docFiles[docConfig.type]
                    const isUploaded = uploadedDocuments.has(docConfig.type)
                    const serverDoc = docsFromServer.find(d => d.type === docConfig.type)
                    const isApproved = serverDoc?.status === 'APPROVED'
                    const isPending = serverDoc?.status === 'PENDING'
                    const isRejected = serverDoc?.status === 'REJECTED'
                    const isUploading = docUploading === 'BATCH' && selectedFile

                    return (
                      <div key={docConfig.type} className={`border rounded-lg p-4 ${
                        isApproved ? 'border-green-200 bg-green-50' : 
                        isPending ? 'border-blue-200 bg-blue-50' :
                        isRejected ? 'border-red-200 bg-red-50' :
                        'border-yellow-200 bg-yellow-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {docConfig.label}
                            {docConfig.required && <span className="text-red-500 ml-1">*</span>}
                          </div>
                          {isApproved && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Validé
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              En attente
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              Rejeté
                            </span>
                          )}
                          {isUploaded && !isApproved && !isPending && !isRejected && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Uploadé
                            </span>
                          )}
                          {isUploading && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Upload...
                            </span>
                          )}
                        </div>
                        {docConfig.description && (
                          <p className="text-xs text-gray-600 mb-3">{docConfig.description}</p>
                        )}
                        <FileUpload
                          onFileSelect={(file) => handleDocSelect(docConfig.type, file)}
                          disabled={docUploading === 'BATCH' || isApproved}
                          currentFile={selectedFile?.name || (isApproved ? serverDoc?.fileName : undefined)}
                        />
                      </div>
                    )
                  })}
                </div>

                {docError && <div className="mt-4 text-sm text-red-700 bg-red-100 p-3 rounded">{docError}</div>}
                {docSuccess && <div className="mt-4 text-sm text-green-700 bg-green-100 p-3 rounded">{docSuccess}</div>}

                {/* Bouton pour uploader tous les documents */}
                {Object.values(docFiles).some(file => file !== null) && (
                  <div className="mt-4">
                    <button
                      onClick={handleUploadAllDocuments}
                      disabled={docUploading === 'BATCH'}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {docUploading === 'BATCH' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Uploader les Documents ({Object.values(docFiles).filter(file => file !== null).length})
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Projets
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalProjets}
                    </dd>
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
                    <span className="text-white text-sm font-medium">🟢</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ouverts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.projetsOuverts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🔵</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      En Cours
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.projetsEnCours}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Terminés
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.projetsTermines}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">💼</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Offres
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalOffres}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions et Onglets Statuts */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <button
                onClick={() => (verificationStatus === 'VERIFIED' || verificationStatus === 'PENDING') ? router.push('/donneur-ordre/projets/nouveau') : null}
                disabled={verificationStatus === 'BLOCKED'}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                  verificationStatus === 'VERIFIED' || verificationStatus === 'PENDING'
                    ? 'text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    : 'text-gray-500 bg-gray-300 cursor-not-allowed'
                }`}
                title={verificationStatus === 'BLOCKED' ? 'Vous devez d\'abord uploader vos documents d\'entreprise' : ''}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nouvel Appel d&apos;Offre
              </button>
              {verificationStatus === 'BLOCKED' && (
                <p className="text-xs text-gray-500 mt-1">
                  Documents d&apos;entreprise requis pour publier
                </p>
              )}
              {verificationStatus === 'PENDING' && (
                <p className="text-xs text-blue-600 mt-1">
                  Documents en cours de validation
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: 'all', label: 'Tous', count: stats.totalProjets },
              { key: 'OUVERT', label: 'Ouverts', count: stats.projetsOuverts },
              { key: 'EN_COURS', label: 'En cours', count: stats.projetsEnCours },
              { key: 'TERMINE', label: 'Terminés', count: stats.projetsTermines },
              { key: 'ANNULE', label: 'Annulés', count: stats.totalProjets - (stats.projetsOuverts + stats.projetsEnCours + stats.projetsTermines) },
            ] as Array<{ key: 'all' | 'OUVERT' | 'EN_COURS' | 'TERMINE' | 'ANNULE'; label: string; count: number }>).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border ${
                  activeTab === tab.key
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.key ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Liste des Projets */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredProjets.length === 0 ? (
              <li className="px-6 py-8 text-center">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-sm">Aucun projet trouvé</p>
                  <p className="text-xs text-gray-400">Créez votre premier appel d&apos;offre</p>
                </div>
              </li>
            ) : (
              filteredProjets.map((projet) => (
                <li key={projet.id}>
                  <div
                    className={`px-4 sm:px-6 py-4 hover:bg-gray-50 ${
                      projet.status === 'TERMINE' || projet.status === 'ANNULE' ? 'opacity-80' : ''
                    } ${
                      projet.moderationStatus === 'REJECTED' ? 'bg-red-50 border-l-4 border-red-400' : ''
                    }`}
                  >
                    {/* Layout mobile/tablet */}
                    <div className="block lg:hidden">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 pr-2 leading-tight">
                              {projet.titre}
                            </h3>
                            <div className="flex flex-col space-y-1 flex-shrink-0">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(projet.status)}`}>
                                {getStatusLabel(projet.status)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getModerationBadge(projet.moderationStatus)}`}>
                                {getModerationLabel(projet.moderationStatus)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {cleanMarkdown(projet.description)}
                          </div>
                          {projet.moderationStatus === 'REJECTED' && projet.rejectionReason && (
                            <div className="mt-3 flex items-center justify-between p-3 bg-red-100 border border-red-300 rounded-md">
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-red-800">
                                  Projet rejeté par l&apos;équipe de modération
                                </span>
                              </div>
                              <button
                                onClick={() => openRejectionModal(projet)}
                                className="inline-flex items-center px-3 py-1.5 bg-white border border-red-300 text-sm font-medium rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Voir la raison
                              </button>
                            </div>
                          )}
                          <div className="mt-3 space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                📍 <span className="ml-1 truncate">{projet.villeChantier}</span>
                              </span>
                              <span className="flex items-center">
                                {projet.isEnchereLibre ? (
                                  <>🎯 <span className="ml-1">Enchère libre</span></>
                                ) : (
                                  <>💰 <span className="ml-1">{projet.prixMax?.toLocaleString('fr-FR')} €</span></>
                                )}
                              </span>
                              <span className="flex items-center">
                                📅 <span className="ml-1">{new Date(projet.dateDebut).toLocaleDateString('fr-FR')}</span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {projet._count.offres} offre{projet._count.offres !== 1 ? 's' : ''}
                              </span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => router.push(`/donneur-ordre/projets/${projet.id}`)}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                                  aria-label="Voir les détails du projet"
                                >
                                  Détails
                                </button>
                                <button
                                  onClick={() => router.push(`/donneur-ordre/projets/${projet.id}#messages`)}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                  aria-label="Ouvrir les messages du projet"
                                >
                                  Messages
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(projet)}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                                  aria-label="Supprimer le projet"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Layout desktop */}
                    <div className="hidden lg:block">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {projet.titre}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(projet.status)}`}>
                                {getStatusLabel(projet.status)}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getModerationBadge(projet.moderationStatus)}`}>
                                {getModerationLabel(projet.moderationStatus)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">{cleanMarkdown(projet.description)}</span>
                          </div>
                          {projet.moderationStatus === 'REJECTED' && projet.rejectionReason && (
                            <div className="mt-3 flex items-center justify-between p-3 bg-red-100 border border-red-300 rounded-md">
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-red-800">
                                  Projet rejeté par l&apos;équipe de modération
                                </span>
                              </div>
                              <button
                                onClick={() => openRejectionModal(projet)}
                                className="inline-flex items-center px-3 py-1.5 bg-white border border-red-300 text-sm font-medium rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Voir la raison
                              </button>
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📍 {projet.villeChantier}</span>
                              <span>
                                {projet.isEnchereLibre ? (
                                  <>🎯 Enchère libre</>
                                ) : (
                                  <>💰 {projet.prixMax?.toLocaleString('fr-FR')} €</>
                                )}
                              </span>
                              <span>📅 {new Date(projet.dateDebut).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {projet._count.offres} offre{projet._count.offres !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-6 flex-shrink-0 flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/donneur-ordre/projets/${projet.id}`)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                            aria-label="Voir les détails du projet"
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => router.push(`/donneur-ordre/projets/${projet.id}#messages`)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            aria-label="Ouvrir les messages du projet"
                          >
                            Messages
                          </button>
                          <button
                            onClick={() => handleDeleteClick(projet)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                            aria-label="Supprimer le projet"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && projetToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-2 px-7 py-3">
                <h3 className="text-lg font-medium text-gray-900">Supprimer le projet</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir supprimer le projet <strong>&quot;{projetToDelete.titre}&quot;</strong> ?
                  </p>
                  <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded">
                    <p className="font-medium">⚠️ Cette action est irréversible et supprimera :</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Le projet et toutes ses données</li>
                      <li>Toutes les images associées (Cloudinary)</li>
                      <li>Toutes les offres reçues ({projetToDelete._count.offres})</li>
                      <li>Tous les messages échangés</li>
                      <li>Toutes les évaluations liées</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex items-center px-4 py-3 space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    'Supprimer définitivement'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de raison de rejet */}
      {showRejectionModal && selectedRejectedProjet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-6 border max-w-3xl w-full shadow-xl rounded-lg bg-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  Projet rejeté
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRejectedProjet.titre}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setSelectedRejectedProjet(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-medium text-red-800 mb-3">
                      Raison du rejet par l&apos;équipe de modération
                    </h3>
                    <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                        {selectedRejectedProjet.rejectionReason}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      Que faire maintenant ?
                    </h4>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>
                        Prenez en compte les remarques de notre équipe et créez un nouveau projet corrigé. 
                        Vous pouvez supprimer ce projet rejeté et en créer un nouveau qui respecte nos guidelines.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setSelectedRejectedProjet(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 