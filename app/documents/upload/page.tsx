'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import { getDocumentsForUserRole, DocumentConfig } from '@/lib/document-types'
import { DocumentType } from '@prisma/client'

interface UploadedDocument {
  type: DocumentType
  fileName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  id: string
}

export default function DocumentUploadPage() { 
  const [user, setUser] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Récupérer les informations utilisateur depuis localStorage
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userData || !token) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Charger les documents existants
    loadUserDocuments(token)
  }, [router])

  const loadUserDocuments = async (token: string) => {
    try {
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDocuments(data.data || [])
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, documentType: DocumentType) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.')
      router.push('/login')
      return
    }

    setUploading(documentType)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Document "${file.name}" uploadé avec succès !`)
        // Mettre à jour la liste des documents
        const updatedDocuments = documents.filter(doc => doc.type !== documentType)
        updatedDocuments.push({
          type: documentType,
          fileName: data.data.fileName,
          status: data.data.status,
          id: data.data.id
        })
        setDocuments(updatedDocuments)
      } else {
        setError(data.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      setError('Erreur lors de l\'upload du document')
    } finally {
      setUploading(null)
    }
  }

  const getDocumentStatus = (documentType: DocumentType) => {
    const doc = documents.find(d => d.type === documentType)
    return doc ? doc.status : null
  }

  const getDocumentFileName = (documentType: DocumentType) => {
    const doc = documents.find(d => d.type === documentType)
    return doc ? doc.fileName : null
  }

  const isAllRequiredDocumentsUploaded = () => {
    if (!user) return false
    const requiredDocs = getDocumentsForUserRole(user.role).filter(doc => doc.required)
    return requiredDocs.every(doc => documents.some(uploaded => uploaded.type === doc.type))
  }

  const handleContinue = () => {
    if (user.role === 'DONNEUR_ORDRE') {
      router.push('/donneur-ordre/dashboard')
    } else {
      router.push('/sous-traitant/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const requiredDocuments = getDocumentsForUserRole(user.role)
  const roleColor = user.role === 'DONNEUR_ORDRE' ? 'blue' : 'green'

  return (
    <div className={`min-h-screen bg-gradient-to-br from-${roleColor}-50 to-${roleColor === 'blue' ? 'indigo' : 'emerald'}-100 py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`mx-auto h-12 w-12 bg-${roleColor}-600 rounded-xl flex items-center justify-center`}>
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Téléchargement des Documents
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {user.role === 'DONNEUR_ORDRE' 
                ? 'Téléchargez vos documents d\'entreprise'
                : 'Téléchargez vos documents obligatoires pour validation'
              }
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Documents à uploader */}
          <div className="space-y-8">
            {requiredDocuments.map((docConfig: DocumentConfig) => {
              const status = getDocumentStatus(docConfig.type)
              const fileName = getDocumentFileName(docConfig.type)
              const isUploading = uploading === docConfig.type

              return (
                <div key={docConfig.type} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        {docConfig.label}
                        {docConfig.required && <span className="ml-1 text-red-500">*</span>}
                        {status && (
                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {status === 'APPROVED' ? 'Approuvé' :
                             status === 'REJECTED' ? 'Rejeté' :
                             'En attente'}
                          </span>
                        )}
                      </h3>
                      {docConfig.description && (
                        <p className="text-sm text-gray-600 mt-1">{docConfig.description}</p>
                      )}
                    </div>
                  </div>

                  <FileUpload
                    onFileSelect={(file) => handleFileUpload(file, docConfig.type)}
                    disabled={isUploading}
                    currentFile={fileName || undefined}
                  />

                  {isUploading && (
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Upload en cours...
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleContinue}
              className={`flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-${roleColor}-600 hover:bg-${roleColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${roleColor}-500`}
            >
              {isAllRequiredDocumentsUploaded() 
                ? 'Continuer vers le tableau de bord'
                : 'Plus tard - Accéder au tableau de bord'
              }
            </button>
          </div>

          {!isAllRequiredDocumentsUploaded() && (
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>⚠️ Votre compte ne sera pas entièrement validé tant que tous les documents obligatoires ne seront pas uploadés et approuvés.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 