'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUpload from '@/components/FileUpload'
import { SOUS_TRAITANT_DOCUMENTS, DocumentConfig } from '@/lib/document-types'
import { DocumentType } from '@prisma/client'

const SPECIALITES = [
  'PLOMBERIE',
  'ELECTRICITE', 
  'MACONNERIE',
  'PLAQUISTE',
  'CARRELAGE',
  'CLIMATISATION',
  'PEINTURE',
  'COUVERTURE',
  'MENUISERIE',
  'TERRASSEMENT',
  'AUTRE'
]

const SPECIALITES_LABELS: Record<string, string> = {
  'PLOMBERIE': 'Plomberie',
  'ELECTRICITE': 'Électricité',
  'MACONNERIE': 'Maçonnerie',
  'PLAQUISTE': 'Plaquiste',
  'CARRELAGE': 'Carrelage',
  'CLIMATISATION': 'Climatisation',
  'PEINTURE': 'Peinture',
  'COUVERTURE': 'Couverture',
  'MENUISERIE': 'Menuiserie',
  'TERRASSEMENT': 'Terrassement',
  'AUTRE': 'Autre'
}

export default function RegisterSousTraitantPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Étape 1 - Informations personnelles
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    nomSociete: '', // Raison sociale
    siret: '',
    specialitePrincipale: '',
    expertises: [] as string[],
    autresExpertises: [] as string[], // Pour les spécialités "Autre"
    nombreEmployes: '',
    adresse: '',
    codePostal: '',
    ville: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [autreExpertiseInput, setAutreExpertiseInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [, setUserId] = useState('')
  const [token, setToken] = useState('')
  const [documents, setDocuments] = useState<Record<DocumentType, File | null>>({} as Record<DocumentType, File | null>)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSpecialiteChange = (specialite: string) => {
    const expertises = formData.expertises.includes(specialite)
      ? formData.expertises.filter(s => s !== specialite)
      : [...formData.expertises, specialite]
    
    setFormData({
      ...formData,
      expertises,
      // Si c'est la première spécialité sélectionnée, la définir comme principale
      specialitePrincipale: !formData.specialitePrincipale && expertises.length === 1 
        ? specialite 
        : formData.specialitePrincipale
    })
  }

  const handleSpecialitePrincipaleChange = (specialite: string) => {
    // S'assurer que la spécialité principale est AUSSI dans expertises pour envoi serveur
    const nextExpertises = Array.from(new Set([...(formData.expertises || []), specialite]))
    setFormData({
      ...formData,
      specialitePrincipale: specialite,
      expertises: nextExpertises
    })
  }

  const handleAutreExpertiseAdd = () => {
    if (autreExpertiseInput.trim() && !formData.autresExpertises.includes(autreExpertiseInput.trim())) {
      setFormData({
        ...formData,
        autresExpertises: [...formData.autresExpertises, autreExpertiseInput.trim()]
      })
      setAutreExpertiseInput('')
    }
  }

  const handleAutreExpertiseRemove = (expertise: string) => {
    setFormData({
      ...formData,
      autresExpertises: formData.autresExpertises.filter(e => e !== expertise)
    })
  }

  const validateStep1 = () => {
    const errors = []
    
    if (!formData.prenom.trim()) errors.push('Le prénom est requis')
    if (!formData.nom.trim()) errors.push('Le nom est requis')
    if (!formData.email.trim()) errors.push('L\'email est requis')
    if (!formData.telephone.trim()) errors.push('Le téléphone est requis')
    if (!formData.nomSociete.trim()) errors.push('La raison sociale est requise')
    if (!formData.siret.trim()) errors.push('Le N° SIRET est requis')
    if (!formData.specialitePrincipale) errors.push('La spécialité principale est requise')
    if (formData.expertises.length === 0 && formData.autresExpertises.length === 0) errors.push('Au moins une expertise est requise')
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

    // Validation nombre d'employés
    if (formData.nombreEmployes && (parseInt(formData.nombreEmployes) < 0 || isNaN(parseInt(formData.nombreEmployes)))) {
      errors.push('Le nombre d\'employés doit être un nombre valide')
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
          role: 'SOUS_TRAITANT',
          nombreEmployes: formData.nombreEmployes ? parseInt(formData.nombreEmployes) : null,
          // Envoyer séparément expertises (enum) et autresExpertises (texte libre)
          expertises: formData.expertises,
          autresExpertises: formData.autresExpertises,
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

  /* const handleUploadDocument = async (documentType: DocumentType) => {
    const file = documents[documentType]
    if (!file || !token) return

    setUploading(documentType)
    setError('')
    setUploadSuccess('')

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
        setUploadSuccess(`Document uploadé avec succès !`)
      } else {
        setError(data.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      setError('Erreur lors de l\'upload du document')
    } finally {
      setUploading(null)
    }
  } */

  const requiredDocs = SOUS_TRAITANT_DOCUMENTS.filter((d: DocumentConfig) => d.required && d.type !== 'LISTE_SALARIES_ETRANGERS')
  const allRequiredSelected = requiredDocs.every((d: DocumentConfig) => !!documents[d.type])

  const handleUploadAllDocuments = async () => {
    if (!token) return
    if (!allRequiredSelected) {
      setError('Veuillez sélectionner tous les documents requis.')
      return
    }

    setUploading('BATCH')
    setError('')
    setUploadSuccess('')

    try {
      // Uploader d'abord les requis
      for (const doc of requiredDocs) {
        const file = documents[doc.type]
        if (!file) throw new Error(`Document requis manquant: ${doc.label}`)

        const fd = new FormData()
        fd.append('file', file)
        fd.append('documentType', doc.type)

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: fd
        })
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || `Échec upload: ${doc.label}`)
        }
      }

      // Uploader ensuite les optionnels déjà sélectionnés (s'il y en a)
      const optionalDocs = SOUS_TRAITANT_DOCUMENTS.filter((d: DocumentConfig) => !d.required)
      for (const doc of optionalDocs) {
        const selected = documents[doc.type]
        if (!selected) continue
        const fd = new FormData()
        fd.append('file', selected)
        fd.append('documentType', doc.type)
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        })
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || `Échec upload: ${doc.label}`)
        }
      }

      setUploadSuccess('Tous les documents requis ont été uploadés avec succès.')
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Upload batch error:', err)
      setError(err?.message || 'Erreur lors de l\'upload des documents')
    } finally {
      setUploading(null)
    }
  }

  const handleCompleteRegistration = () => {
    router.push('/sous-traitant/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Inscription Sous-Traitant
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Créez votre compte professionnel
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Informations</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                <div className={`h-full bg-green-600 rounded transition-all duration-300 ${
                  step >= 2 ? 'w-full' : 'w-0'
                }`}></div>
              </div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div>
                <label htmlFor="nomSociete" className="block text-sm font-medium text-gray-700 mb-2">
                  Raison sociale *
                </label>
                <input
                  type="text"
                  id="nomSociete"
                  name="nomSociete"
                  required
                  value={formData.nomSociete}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="SARL Martin Construction"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="12345678901234"
                    maxLength={14}
                  />
                </div>

                <div>
                  <label htmlFor="nombreEmployes" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d&apos;employés (optionnel)
                  </label>
                  <input
                    type="number"
                    id="nombreEmployes"
                    name="nombreEmployes"
                    min="0"
                    value={formData.nombreEmployes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specialitePrincipale" className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialité principale *
                </label>
                <select
                  id="specialitePrincipale"
                  name="specialitePrincipale"
                  required
                  value={formData.specialitePrincipale}
                  onChange={(e) => handleSpecialitePrincipaleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Choisir une spécialité</option>
                  {SPECIALITES.map(specialite => (
                    <option key={specialite} value={specialite}>
                      {SPECIALITES_LABELS[specialite]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Toutes vos expertises * (sélectionnez toutes vos compétences)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIALITES.map(specialite => (
                    <label 
                      key={specialite} 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.specialitePrincipale === specialite 
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.expertises.includes(specialite)}
                        onChange={() => handleSpecialiteChange(specialite)}
                        disabled={formData.specialitePrincipale === specialite}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:cursor-not-allowed"
                      />
                      <span className="ml-2 text-sm text-gray-900">{SPECIALITES_LABELS[specialite]}</span>
                    </label>
                  ))}
                </div>

                {/* Section pour les autres expertises */}
                {formData.expertises.includes('AUTRE') && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Spécifiez vos autres spécialités
                    </h4>
                    
                    {/* Liste des autres expertises ajoutées */}
                    {formData.autresExpertises.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {formData.autresExpertises.map((expertise, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                            >
                              {expertise}
                              <button
                                type="button"
                                onClick={() => handleAutreExpertiseRemove(expertise)}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input pour ajouter une nouvelle expertise */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={autreExpertiseInput}
                        onChange={(e) => setAutreExpertiseInput(e.target.value)}
                        placeholder="Ex: Étanchéité, Isolation, etc."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAutreExpertiseAdd()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAutreExpertiseAdd}
                        disabled={!autreExpertiseInput.trim()}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Ajouter
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Appuyez sur Entrée ou cliquez sur &quot;Ajouter&quot; pour ajouter une spécialité
                    </p>
                  </div>
                )}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                  J&apos;accepte les{' '}
                  <Link href="/legal/terms" className="text-green-600 hover:text-green-500">
                    conditions d&apos;utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link href="/legal/privacy" className="text-green-600 hover:text-green-500">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  'Créer mon compte sous-traitant'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Déjà inscrit ?{' '}
                  <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
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
                  Téléchargez maintenant vos documents obligatoires pour valider votre profil professionnel.
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
                {SOUS_TRAITANT_DOCUMENTS.map((docConfig: DocumentConfig) => {
                  const selectedFile = documents[docConfig.type]

                  return (
                    <div key={docConfig.type} className="border border-gray-200 rounded-lg p-6">
                      <div className="mb-4">
                        <h4 className="text-lg font-medium text-gray-900 flex items-center">
                          {docConfig.label}
                          {docConfig.required ? (
                            <span className="ml-1 text-red-500">*</span>
                          ) : (
                            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">optionnel</span>
                          )}
                        </h4>
                        {docConfig.description && (
                          <p className="text-sm text-gray-600 mt-1">{docConfig.description}</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <FileUpload
                          onFileSelect={(file) => handleFileSelect(docConfig.type, file)}
                          disabled={uploading !== null}
                          currentFile={selectedFile?.name}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Actions globales d'upload */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={handleUploadAllDocuments}
                  disabled={!allRequiredSelected || uploading !== null}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading === 'BATCH' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Upload des documents...
                    </>
                  ) : (
                    'Uploader les documents'
                  )}
                </button>

                <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  Votre compte est créé mais vous n&apos;avez aucun droit tant que vos documents obligatoires ne sont pas uploadés et validés. Vous pouvez uniquement déposer vos documents.
                </div>
              </div>

              {/* Bouton pour continuer */}
              <div className="pt-6">
                <button
                  onClick={handleCompleteRegistration}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Accéder au tableau de bord
                </button>
                <p className="mt-2 text-center text-xs text-gray-600">
                  ⚠️ Votre profil ne sera pas entièrement validé tant que tous les documents obligatoires ne seront pas uploadés et approuvés par un administrateur. Aucune action (recherche, candidature, messagerie) n&apos;est disponible tant que vos documents ne sont pas validés.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 