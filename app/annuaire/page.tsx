'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import FileUpload from '@/components/FileUpload'
import { SOUS_TRAITANT_DOCUMENTS } from '@/lib/document-types'
import type { DocumentType } from '@prisma/client'

/* interface Contractor {
  id: string
  nom: string
  prenom: string | null
  nomSociete: string | null
  ville: string | null
  noteGlobale?: number | null
  expertises: string[]
  nombreEvaluations?: number | null
  isActive?: boolean
} */

// Fonction pour afficher les étoiles de notation
const renderStars = (rating: number) => {
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
}

export default function AnnuairePage() {
  const router = useRouter()
  const { user } = useUser()
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  // Vérif docs sous-traitant
  const [docsFromServer, setDocsFromServer] = useState<Array<{ type: string; status: string; fileName: string }>>([])
  const [verificationStatus, setVerificationStatus] = useState<'VERIFIED' | 'PENDING' | 'BLOCKED'>('VERIFIED')
  const [docFiles, setDocFiles] = useState<Record<DocumentType, File | null>>({} as Record<DocumentType, File | null>)
  const [docUploading, setDocUploading] = useState<string | null>(null)
  const [docError, setDocError] = useState('')
  const [docSuccess, setDocSuccess] = useState('')
  const [minRating, setMinRating] = useState('')
  const [minProjects, setMinProjects] = useState('')
  const [selectedExpertises, setSelectedExpertises] = useState<string[]>([])
  const EXPERTISES = ['PLOMBERIE','ELECTRICITE','MACONNERIE','PLAQUISTE','CARRELAGE','CLIMATISATION','PEINTURE','COUVERTURE','MENUISERIE','TERRASSEMENT','AUTRE']

  useEffect(() => {
    const saved = localStorage.getItem('search:annuaire:q')
    if (saved) {
      setQ(saved)
      localStorage.removeItem('search:annuaire:q')
    } else {
      // Charger une liste par défaut au premier affichage
      search('')
    }
    if (user?.role === 'SOUS_TRAITANT') {
      verifyDocuments().then(status => setVerificationStatus(status))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Exige validation utilisateur (bouton) pour lancer la requête DB avec filtres
  const runSearch = () => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (minRating) params.set('minRating', minRating)
    if (minProjects) params.set('minProjects', minProjects)
    if (selectedExpertises.length) params.set('expertises', selectedExpertises.join(','))
    search(params.toString() ? `?${params.toString()}` : '')
  }

  const search = async (query: string | undefined) => {
    setLoading(true)
    try {
      const url = query && query.startsWith('?')
        ? `/api/search/contractors${query}`
        : `/api/search/contractors${query ? `?q=${encodeURIComponent(query)}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      setResults(data.data?.results || [])
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
      setDocSuccess('Documents uploadés. En attente de validation admin.')
      verifyDocuments().then(status => setVerificationStatus(status))
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setDocError(e?.message || 'Erreur lors de l\'upload des documents')
    } finally {
      setDocUploading(null)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Annuaire des sous-traitants</h1>
          <p className="mt-2 text-gray-600">Recherchez des profils publics par nom, société ou expertise</p>
        </div>

        {/* Alerte vérification documents pour sous-traitants non vérifiés */}
        {user?.role === 'SOUS_TRAITANT' && verificationStatus === 'BLOCKED' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800">Votre compte doit être vérifié</h3>
            <p className="text-sm text-yellow-700 mt-1">Vous pouvez consulter l&apos;annuaire, mais certaines actions sont désactivées tant que vos documents ne sont pas déposés et validés.</p>
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

        <div className="bg-white rounded-lg shadow p-6 mb-8 space-y-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un sous-traitant, une société, une expertise..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Note minimale</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Aucune</option>
                <option value="3">3★ et +</option>
                <option value="3.5">3.5★ et +</option>
                <option value="4">4★ et +</option>
                <option value="4.5">4.5★ et +</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Projets réalisés (min)</label>
              <input
                type="number"
                value={minProjects}
                onChange={(e) => setMinProjects(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                placeholder="Ex: 5"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Expertises</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EXPERTISES.map(exp => (
                  <label key={exp} className="inline-flex items-center text-xs">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-red-600 rounded"
                      checked={selectedExpertises.includes(exp)}
                      onChange={() => setSelectedExpertises(prev => prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp])}
                    />
                    <span className="ml-2">{exp}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={runSearch}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              Rechercher
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Chargement...</div>
        ) : results.length === 0 && q.trim().length > 1 ? (
          <div className="text-center text-gray-500">Aucun sous-traitant trouvé</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results
              .filter((c) => !minRating || (c.rating || 0) >= parseFloat(minRating))
              .filter((c) => !minProjects || (c.completedProjects || 0) >= parseInt(minProjects))
              .filter((c) => selectedExpertises.length === 0 || (c.expertise || []).some((e: string) => selectedExpertises.includes(e)))
              .map((c: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <div key={c.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{c.title}</h3>
                  {c.rating && (
                    <div className="flex items-center space-x-1">
                      <div className="flex">{renderStars(c.rating)}</div>
                      <span className="text-sm text-gray-600">({c.rating.toFixed(1)})</span>
                    </div>
                  )}
                </div>
                {c.company && (
                  <p className="text-sm text-gray-500">{c.company}</p>
                )}
                {c.location && (
                  <p className="text-sm text-gray-500">{c.location}</p>
                )}
                {c.expertise && c.expertise.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.expertise.slice(0, 5).map((e: string) => (
                      <span key={e} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{e}</span>
                    ))}
                  </div>
                )}
                {typeof c.completedProjects === 'number' && (
                  <div className="mt-3 text-sm text-gray-600">Projets terminés: {c.completedProjects}</div>
                )}
                <div className="mt-4">
                  <button
                    onClick={() => router.push(`/profil/${c.id}`)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    Voir le profil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section CTA colorée */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-xl overflow-hidden">
          <div className="px-8 py-12 sm:px-12 sm:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Trouvez les meilleurs professionnels du BTP près de chez vous
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Accédez à notre réseau de sous-traitants certifiés et qualifiés. 
                Consultez leurs profils, évaluations et réalisations pour faire le bon choix.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                  <div className="text-2xl font-bold">1200+</div>
                  <div className="text-sm text-blue-100">Professionnels vérifiés</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-sm text-blue-100">Spécialités BTP</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                  <div className="text-2xl font-bold">4.8/5</div>
                  <div className="text-sm text-blue-100">Note moyenne</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Documentation */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comment utiliser efficacement notre annuaire BTP ?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Maximisez vos chances de trouver les bons partenaires ou d&apos;être trouvé selon votre profil
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Pour les Donneurs d'ordre */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-orange-900">
                    Pour les Donneurs d&apos;Ordre
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">Recherchez par expertise</h4>
                      <p className="text-orange-800 text-sm">
                        Utilisez nos filtres avancés pour trouver des professionnels spécialisés dans 
                        votre domaine : plomberie, électricité, maçonnerie, carrelage...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">Analysez les profils détaillés</h4>
                      <p className="text-orange-800 text-sm">
                        Consultez les certifications, réalisations, évaluations clients et zone 
                        d&apos;intervention de chaque sous-traitant.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">Vérifiez les recommandations</h4>
                      <p className="text-orange-800 text-sm">
                        Lisez les avis clients, consultez les notes de qualité et examinez 
                        les références de projets similaires au vôtre.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">Contactez directement</h4>
                      <p className="text-orange-800 text-sm">
                        Établissez le contact avec les professionnels sélectionnés pour 
                        discuter de votre projet et obtenir des devis personnalisés.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-orange-100 rounded-lg">
                  <h5 className="font-semibold text-orange-900 mb-2">Critères de sélection :</h5>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Proximité géographique et zone d&apos;intervention</li>
                    <li>• Spécialisation et expertise technique</li>
                    <li>• Évaluations et recommandations clients</li>
                    <li>• Certifications et assurances professionnelles</li>
                  </ul>
                </div>
              </div>

              {/* Pour les Sous-traitants */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-8 border border-purple-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-purple-900">
                    Pour les Sous-Traitants
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Optimisez votre profil</h4>
                      <p className="text-purple-800 text-sm">
                        Complétez votre profil avec photos de réalisations, certifications, 
                        zone d&apos;intervention et spécialités pour maximiser votre visibilité.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Collectez les évaluations</h4>
                      <p className="text-purple-800 text-sm">
                        Encouragez vos clients satisfaits à laisser des avis positifs pour 
                        améliorer votre réputation et votre classement dans l&apos;annuaire.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Maintenez vos informations</h4>
                      <p className="text-purple-800 text-sm">
                        Tenez à jour vos disponibilités, tarifs, nouvelles certifications 
                        et références pour rester compétitif sur le marché.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Développez votre réseau</h4>
                      <p className="text-purple-800 text-sm">
                        Répondez rapidement aux sollicitations, entretenez vos relations clients 
                        et participez activement à la communauté professionnelle.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-purple-100 rounded-lg">
                  <h5 className="font-semibold text-purple-900 mb-2">Conseils de visibilité :</h5>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Photos de qualité de vos réalisations</li>
                    <li>• Descriptions détaillées de vos services</li>
                    <li>• Réactivité dans les réponses aux demandes</li>
                    <li>• Mise à jour régulière de votre profil</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section spécialisations BTP */}
            <div className="mt-12 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Spécialités BTP disponibles dans notre annuaire
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { name: 'Plomberie', icon: '🔧' },
                  { name: 'Électricité', icon: '⚡' },
                  { name: 'Maçonnerie', icon: '🧱' },
                  { name: 'Carrelage', icon: '🏠' },
                  { name: 'Peinture', icon: '🎨' },
                  { name: 'Menuiserie', icon: '🪚' },
                  { name: 'Couverture', icon: '🏘️' },
                  { name: 'Climatisation', icon: '❄️' },
                  { name: 'Terrassement', icon: '🚜' },
                  { name: 'Plaquiste', icon: '🔨' }
                ].map((specialite) => (
                  <div key={specialite.name} className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-2">{specialite.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{specialite.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to action vers la documentation */}
            <div className="mt-12 text-center bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Besoin d&apos;aide pour optimiser votre recherche ou votre profil ?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Consultez notre guide complet d&apos;utilisation de l&apos;annuaire ou contactez notre équipe 
                pour des conseils personnalisés sur l&apos;optimisation de votre présence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/documentation" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Guide d&apos;utilisation
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Support personnalisé
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


