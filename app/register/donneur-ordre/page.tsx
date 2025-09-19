'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'
import { DONNEUR_ORDRE_DOCUMENTS, DocumentConfig } from '@/lib/document-types'
import { DocumentType } from '@prisma/client'

export default function RegisterDonneurOrdrePage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Étape 1 - Informations personnelles
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    nomSociete: '',
    siret: '',
    adresse: '',
    codePostal: '',
    ville: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [, setUserId] = useState('')
  const [token, setToken] = useState('')
  const [documents, setDocuments] = useState<Record<DocumentType, File | null>>({} as Record<DocumentType, File | null>)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadedDocuments, setUploadedDocuments] = useState<Set<DocumentType>>(new Set())
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const validateStep1 = () => {
    const errors = []
    
    if (!formData.prenom.trim()) errors.push('Le prénom est requis')
    if (!formData.nom.trim()) errors.push('Le nom est requis')
    if (!formData.email.trim()) errors.push('L\'email est requis')
    if (!formData.telephone.trim()) errors.push('Le téléphone est requis')
    if (!formData.nomSociete.trim()) errors.push('Le nom de l\'entreprise est requis')
    if (!formData.siret.trim()) errors.push('Le N° SIRET est requis')
    if (!formData.adresse.trim()) errors.push('L\'adresse est requise')
    if (!formData.codePostal.trim()) errors.push('Le code postal est requis')
    if (!formData.ville.trim()) errors.push('La ville est requise')
    if (!formData.password) errors.push('Le mot de passe est requis')
    if (formData.password !== formData.confirmPassword) errors.push('Les mots de passe ne correspondent pas')
    if (!formData.acceptTerms) errors.push('Vous devez accepter les conditions d\'utilisation')

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Format d\'email invalide')
    }

    // Validation téléphone
    const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/
    if (formData.telephone && !phoneRegex.test(formData.telephone.replace(/\s/g, ''))) {
      errors.push('Format de téléphone invalide')
    }

    // Validation SIRET
    if (formData.siret && formData.siret.replace(/\s/g, '').length !== 14) {
      errors.push('Le SIRET doit contenir 14 chiffres')
    }

    // Validation mot de passe
    if (formData.password && formData.password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères')
    }

    return errors
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const errors = validateStep1()
    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'DONNEUR_ORDRE',
          nomSociete: formData.nomSociete,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Stocker le token et l'ID utilisateur
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        setUserId(data.data.user.id)
        setToken(data.data.token)
        setStep(2)
      } else {
        setError(data.error || 'Erreur lors de l\'inscription')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (documentType: DocumentType, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }))
  }

  const handleUploadAllDocuments = async () => {
    const filesToUpload = Object.entries(documents).filter(([file]) => file !== null)
    
    if (filesToUpload.length === 0 || !token) return

    setUploading('BATCH')
    setError('')
    setUploadSuccess('')

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
              'Authorization': `Bearer ${token}`
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
        setUploadSuccess(`${uploadedCount} document(s) uploadé(s) avec succès !`)
      }
      
      if (failedUploads.length > 0) {
        setError(`Erreur lors de l'upload de : ${failedUploads.join(', ')}`)
      }

    } catch (error) {
      console.error('Erreur upload batch:', error)
      setError('Erreur lors de l\'upload des documents')
    } finally {
      setUploading(null)
    }
  }

  const handleCompleteRegistration = () => {
    router.push('/donneur-ordre/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Inscription Donneur d&apos;Ordre
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Créez votre compte entrepreneur
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Informations</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                <div className={`h-full bg-blue-600 rounded transition-all duration-300 ${
                  step >= 2 ? 'w-full' : 'w-0'
                }`}></div>
              </div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Documents</span>
              </div>
            </div>
          </div>

          {/* Étape 1 - Formulaire */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    required
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jean"
                  />
                </div>

                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  required
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div>
                <label htmlFor="nomSociete" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l&apos;entreprise *
                </label>
                <input
                  type="text"
                  id="nomSociete"
                  name="nomSociete"
                  required
                  value={formData.nomSociete}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mon Entreprise BTP"
                />
              </div>

              <div>
                <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-2">
                  N° SIRET *
                </label>
                <input
                  type="text"
                  id="siret"
                  name="siret"
                  required
                  value={formData.siret}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345678901234"
                  maxLength={14}
                />
              </div>

              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  required
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 rue de la Construction"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="codePostal" className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    id="codePostal"
                    name="codePostal"
                    required
                    value={formData.codePostal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="75001"
                    maxLength={5}
                  />
                </div>

                <div>
                  <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="ville"
                    name="ville"
                    required
                    value={formData.ville}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paris"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    minLength={8}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                  J&apos;accepte les{' '}
                  <Link href="/legal/terms" className="text-blue-600 hover:text-blue-500">
                    conditions d&apos;utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link href="/legal/privacy" className="text-blue-600 hover:text-blue-500">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création du compte...
                  </>
                ) : (
                  'Créer mon compte entrepreneur'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Déjà inscrit ?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Se connecter
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Étape 2 - Upload des documents */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Compte créé avec succès !
                </h3>
                <p className="text-sm text-gray-600">
                  Téléchargez maintenant vos documents d&apos;entreprise pour finaliser votre inscription.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {uploadSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {uploadSuccess}
                </div>
              )}

              {/* Documents à uploader */}
              <div className="space-y-6">
                {DONNEUR_ORDRE_DOCUMENTS.map((docConfig: DocumentConfig) => {
                  const selectedFile = documents[docConfig.type]
                  const isUploaded = uploadedDocuments.has(docConfig.type)
                  const isUploading = uploading === 'BATCH' && selectedFile

                  return (
                    <div key={docConfig.type} className={`border rounded-lg p-6 ${
                      isUploaded ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-gray-900 flex items-center">
                          {docConfig.label}
                          {docConfig.required && <span className="ml-1 text-red-500">*</span>}
                          {isUploaded && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Uploadé
                            </span>
                          )}
                          {isUploading && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Upload...
                            </span>
                          )}
                        </h4>
                        {docConfig.description && (
                          <p className="text-sm text-gray-600 mt-1">{docConfig.description}</p>
                        )}
                      </div>

                      <FileUpload
                        onFileSelect={(file) => handleFileSelect(docConfig.type, file)}
                        disabled={uploading === 'BATCH'}
                        currentFile={selectedFile?.name}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Bouton pour uploader tous les documents */}
              {Object.values(documents).some(file => file !== null) && (
                <div className="pt-6">
                  <button
                    onClick={handleUploadAllDocuments}
                    disabled={uploading === 'BATCH'}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading === 'BATCH' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Uploader les Documents ({Object.values(documents).filter(file => file !== null).length})
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-xs text-gray-600">
                    Uploadez tous vos documents sélectionnés en une seule fois
                  </p>
                </div>
              )}

              {/* Bouton pour continuer */}
              <div className="pt-6">
                <button
                  onClick={handleCompleteRegistration}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Accéder au tableau de bord
                </button>
                <p className="mt-2 text-center text-xs text-gray-600">
                  Vous pourrez également télécharger vos documents plus tard depuis votre tableau de bord.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 