'use client'

import { useState, useEffect } from 'react'
import { getDocumentLabel } from '@/lib/document-types'
import { getPdfPreviewUrl, getPublicIdFromUrl } from '@/lib/pdf-utils'
import { DocumentType } from '@prisma/client'
import Image from 'next/image'
// Composant pour visualiser les PDFs
function PdfViewer({ document }: { document: Document }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [imageError, setImageError] = useState(false)

  const publicId = getPublicIdFromUrl(document.fileUrl)

  const handleImageError = () => {
    setImageError(true)
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      setImageError(false)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setImageError(false)
    }
  }

  if (!publicId || imageError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center p-8">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Impossible d&apos;afficher la preview du PDF</p>
          <p className="text-sm text-gray-500 mb-4">Utilisez le lien ci-dessous pour ouvrir le document</p>
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            📄 Ouvrir le PDF
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-lg">
      {/* Navigation PDF */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant →
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value)
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page)
                setImageError(false)
              }
            }}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <button
            onClick={() => setTotalPages(Math.max(totalPages, currentPage + 1))}
            className="text-xs text-blue-600 hover:text-blue-800"
            title="Ajouter une page"
          >
            + Page
          </button>
        </div>
      </div>

      {/* Image de la page PDF */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center">
          <Image
            src={getPdfPreviewUrl(publicId, currentPage)}
            alt={`Page ${currentPage} de ${document.fileName}`}
            className="max-w-full h-auto rounded-lg shadow-lg"
            onError={handleImageError}
            onLoad={() => setImageError(false)}
            width={1000}
            height={1000}
          />
        </div>
      </div>
    </div>
  )
}

interface Document {
  id: string
  type: DocumentType
  fileName: string
  fileUrl: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  rejectedReason?: string
  user: {
    id: string
    nom: string
    prenom: string | null
    email: string
    nomSociete: string | null
    role: string
  }
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'validate' | 'reject'>('view')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDocuments(data.data)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidateDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/documents/${documentId}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'approve' })
      })

      if (response.ok) {
        await loadDocuments()
        setShowModal(false)
        setSelectedDocument(null)
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
    }
  }

  const handleRejectDocument = async (documentId: string, reason: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/admin/documents/${documentId}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'reject', 
          rejectedReason: reason 
        })
      })

      if (response.ok) {
        await loadDocuments()
        setShowModal(false)
        setSelectedDocument(null)
        setRejectionReason('')
      }
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesStatus = doc.status === activeTab
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesStatus && matchesType
  })

  // Grouper les documents par utilisateur
  const documentsByUser = filteredDocuments.reduce((acc, doc) => {
    const userId = doc.user.id
    if (!acc[userId]) {
      acc[userId] = {
        user: doc.user,
        documents: []
      }
    }
    acc[userId].documents.push(doc)
    return acc
  }, {} as Record<string, { user: Document['user'], documents: Document[] }>)

/*   const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
 */
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente'
      case 'APPROVED': return 'Approuvé'
      case 'REJECTED': return 'Rejeté'
      default: return status
    }
  }



  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'DONNEUR_ORDRE': return 'bg-blue-100 text-blue-800'
      case 'SOUS_TRAITANT': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4 mb-4">
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Documents</h1>
          <p className="mt-2 text-gray-600">Validation et traitement des documents soumis</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-lg">
                ⏳
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg">
                ✅
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-lg">
                ❌
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejetés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => d.status === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { key: 'PENDING', label: 'En attente', count: documents.filter(d => d.status === 'PENDING').length, color: 'yellow' },
                { key: 'APPROVED', label: 'Approuvés', count: documents.filter(d => d.status === 'APPROVED').length, color: 'green' },
                { key: 'REJECTED', label: 'Rejetés', count: documents.filter(d => d.status === 'REJECTED').length, color: 'red' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tab.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    tab.color === 'green' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Filtre par type */}
          <div className="p-4">
            <div className="max-w-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par type de document
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Tous les types</option>
                <option value="KBIS">Extrait Kbis</option>
                <option value="ATTESTATION_VIGILANCE">Attestation Vigilance</option>
                <option value="ATTESTATION_ASSURANCE_RC_PRO">Assurance RC Pro</option>
                <option value="ATTESTATION_ASSURANCE_DECENNALE">Assurance Décennale</option>
                <option value="IBAN">IBAN</option>
                <option value="LISTE_SALARIES_ETRANGERS">Liste Salariés Étrangers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents groupés par utilisateur */}
        <div className="space-y-6">
          {Object.keys(documentsByUser).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Aucun document {getStatusLabel(activeTab).toLowerCase()} trouvé</p>
            </div>
          ) : (
            Object.values(documentsByUser).map(({ user, documents }) => (
              <div key={user.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Header utilisateur */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.prenom?.[0] || user.nom[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.prenom} {user.nom}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.nomSociete && (
                          <p className="text-sm text-gray-500">{user.nomSociete}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'DONNEUR_ORDRE' ? 'Donneur d\'Ordre' : 'Sous-Traitant'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {documents.length} document{documents.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Documents de l'utilisateur */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date soumission
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((document) => (
                        <tr key={document.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                {document.fileName.toLowerCase().endsWith('.pdf') ? (
                                  <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{document.fileName}</p>
                                <p className="text-sm text-gray-500">{getDocumentLabel(document.type)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{getDocumentLabel(document.type)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDocument(document)
                                setModalMode('view')
                                setShowModal(true)
                              }}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              👁️ Voir
                            </button>
                            {document.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedDocument(document)
                                    setModalMode('validate')
                                    setShowModal(true)
                                  }}
                                  className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100"
                                >
                                  ✅ Valider
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDocument(document)
                                    setModalMode('reject')
                                    setShowModal(true)
                                  }}
                                  className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                                >
                                  ❌ Rejeter
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && selectedDocument && (
          <DocumentModal
            document={selectedDocument}
            mode={modalMode}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
            onClose={() => {
              setShowModal(false)
              setSelectedDocument(null)
              setRejectionReason('')
            }}
            onValidate={() => handleValidateDocument(selectedDocument.id)}
            onReject={() => handleRejectDocument(selectedDocument.id, rejectionReason)}
          />
        )}
      </div>
    </div>
  )
}

interface DocumentModalProps {
  document: Document
  mode: 'view' | 'validate' | 'reject'
  rejectionReason: string
  setRejectionReason: (reason: string) => void
  onClose: () => void
  onValidate: () => void
  onReject: () => void
}

function DocumentModal({ 
  document, 
  mode, 
  rejectionReason, 
  setRejectionReason,
  onClose, 
  onValidate, 
  onReject 
}: DocumentModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {mode === 'view' && 'Visualisation du document'}
                {mode === 'validate' && 'Valider le document'}
                {mode === 'reject' && 'Rejeter le document'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {document.fileName} - {getDocumentLabel(document.type)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Document Info */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Utilisateur:</span>
                <p className="text-gray-900">{document.user.prenom} {document.user.nom}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{document.user.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <p className="text-gray-900">{getDocumentLabel(document.type)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <p className="text-gray-900">{new Date(document.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Document Preview - Plein écran avec scroll */}
          <div className="flex-1 min-h-0 p-4 overflow-hidden">
            {document.fileName.toLowerCase().endsWith('.pdf') ? (
              <PdfViewer document={document} />
            ) : (
              // Pour les images - affichage avec scroll
              <div className="h-full overflow-auto bg-gray-50 rounded-lg flex items-start justify-center p-4">
                <Image
                  src={document.fileUrl}
                  alt={document.fileName}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.classList.remove('hidden')
                  }}
                  width={1000}
                  height={1000}
                />
                <div className="hidden text-center p-8">
                  <p className="text-gray-600 mb-4">Impossible d&apos;afficher l&apos;aperçu</p>
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ouvrir dans un nouvel onglet
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer avec actions */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            {/* Lien d'ouverture externe */}
            <div className="mb-4 text-center">
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-900 text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ouvrir dans un nouvel onglet
              </a>
            </div>

            {/* Action Buttons */}
            {mode === 'validate' && (
              <div>
                <p className="text-gray-600 mb-4">
                  Êtes-vous sûr de vouloir valider ce document ?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={onValidate}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Valider le document
                  </button>
                </div>
              </div>
            )}

            {mode === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du rejet *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Expliquez pourquoi ce document est rejeté..."
                  required
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={onReject}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Rejeter le document
                  </button>
                </div>
              </div>
            )}

            {document.status === 'REJECTED' && document.rejectedReason && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">Raison du rejet :</p>
                <p className="text-sm text-red-700">{document.rejectedReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
  )
} 