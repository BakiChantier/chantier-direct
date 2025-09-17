'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import FileUpload from '@/components/FileUpload'
import { SOUS_TRAITANT_DOCUMENTS } from '@/lib/document-types'
import type { DocumentType } from '@prisma/client'
import Image from 'next/image'

type PublicVerificationStatus = 'VERIFIED' | 'PENDING' | 'BLOCKED'

interface ProfileForm {
  displayName: string
  bio: string
  hourlyRate: string
  completedProjects: string
  websites: string
  phonePublic: string
  emailPublic: string
  addressLine: string
  city: string
  postalCode: string
  country: string
}

export default function EditPublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading, setUser } = useUser()
  const userId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [, setVerificationStatus] = useState<PublicVerificationStatus | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  
  // Vérification documents pour sous-traitants
  const [docsFromServer, setDocsFromServer] = useState<Array<{ type: string; status: string; fileName: string }>>([])
  const [docVerificationStatus, setDocVerificationStatus] = useState<'VERIFIED' | 'PENDING' | 'BLOCKED'>('VERIFIED')
  const [docFiles, setDocFiles] = useState<Record<DocumentType, File | null>>({} as Record<DocumentType, File | null>)
  const [docUploading, setDocUploading] = useState<string | null>(null)
  const [docError, setDocError] = useState('')
  const [docSuccess, setDocSuccess] = useState('')
  
  // États pour les références
  const [references, setReferences] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [showAddReference, setShowAddReference] = useState(false)
  const [editingReference, setEditingReference] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [newReference, setNewReference] = useState({ title: '', description: '' })
  const [uploadingMedia, setUploadingMedia] = useState<string | null>(null)

  const [form, setForm] = useState<ProfileForm>({
    displayName: '',
    bio: '',
    hourlyRate: '',
    completedProjects: '',
    websites: '',
    phonePublic: '',
    emailPublic: '',
    addressLine: '',
    city: '',
    postalCode: '',
    country: ''
  })

  const bioRef = useRef<HTMLTextAreaElement>(null)

  // Sauvegarder le brouillon dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('profile:edit:draft', JSON.stringify(form))
    } catch {}
  }, [form])

  // Guard: seul le propriétaire peut éditer
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (user.id !== userId) {
        router.push(`/profil/${userId}`)
        return
      }
      loadProfile()
      loadReferences()
      
      // Vérifier les documents si c'est un sous-traitant
      if (user.role === 'SOUS_TRAITANT') {
        verifyDocuments().then(status => setDocVerificationStatus(status))
      }
    }
  }, [isLoading, user, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) {
        // Si c'est un sous-traitant et que c'est une 401, c'est normal (documents en attente)
        if (res.status === 401 && user?.role === 'SOUS_TRAITANT' && user.id === userId) {
          setError('')
          return
        }
        throw new Error('Erreur lors du chargement')
      }
      const data = await res.json()
      if (data.success && data.data.profile) {
        const p = data.data.profile
        setForm({
          displayName: p.displayName || '',
          bio: p.bio || '',
          hourlyRate: p.hourlyRate?.toString() || '',
          completedProjects: p.completedProjects?.toString() || '',
          websites: (p.websites || []).join('\n'),
          phonePublic: p.phonePublic || '',
          emailPublic: p.emailPublic || '',
          addressLine: p.addressLine || '',
          city: p.city || '',
          postalCode: p.postalCode || '',
          country: p.country || ''
        })
        setVerificationStatus(p.verificationStatus)
        setAvatarUrl(p.avatarUrl || '')
      }
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e?.message || 'Erreur')
      // Ne pas afficher de toast d'erreur si c'est un problème de documents manquants
      if (!(user?.role === 'SOUS_TRAITANT' && user.id === userId)) {
        toast.error(e?.message || 'Erreur')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Fonctions pour les références
  const loadReferences = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/profile/references', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setReferences(data.data.references || [])
        }
      }
    } catch (e) {
      console.error('Erreur chargement références:', e)
    }
  }

  const handleAddReference = async () => {
    if (!newReference.title.trim()) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/profile/references', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newReference)
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setReferences(prev => [...prev, data.data.reference])
          setNewReference({ title: '', description: '' })
          setShowAddReference(false)
          toast.success('Référence ajoutée !')
        }
      }
    } catch (e) {
      console.error('Erreur lors de l\'ajout', e)
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const handleUpdateReference = async () => {
    if (!editingReference || !editingReference.title.trim()) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/profile/references/${editingReference.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingReference.title,
          description: editingReference.description
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setReferences(prev => prev.map(ref => 
            ref.id === editingReference.id ? data.data.reference : ref
          ))
          setEditingReference(null)
          toast.success('Référence mise à jour !')
        }
      }
    } catch (e) {
      console.error('Erreur lors de la mise à jour', e)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDeleteReference = async (id: string) => {
    if (!confirm('Supprimer cette référence ?')) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/profile/references/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        setReferences(prev => prev.filter(ref => ref.id !== id))
        toast.success('Référence supprimée !')
      }
    } catch (e) {
      console.error('Erreur lors de la suppression', e)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleUploadMedia = async (referenceId: string, file: File) => {
    setUploadingMedia(referenceId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/profile/references/${referenceId}/media/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setReferences(prev => prev.map(ref => 
            ref.id === referenceId 
              ? { ...ref, media: [...(ref.media || []), data.data.media] }
              : ref
          ))
          toast.success('Image ajoutée !')
        }
      }
    } catch (e) {
      console.error('Erreur lors de l\'upload', e)
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploadingMedia(null)
    }
  }

  const handleDeleteMedia = async (referenceId: string, mediaId: string) => {
    if (!confirm('Supprimer cette image ?')) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/profile/references/media/${mediaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        setReferences(prev => prev.map(ref => 
          ref.id === referenceId 
            ? { ...ref, media: ref.media?.filter((m: any) => m.id !== mediaId) || [] } // eslint-disable-line @typescript-eslint/no-explicit-any
            : ref
        ))
        toast.success('Image supprimée !')
      }
    } catch (e) {
      console.error('Erreur lors de la suppression', e)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleBioKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = bioRef.current
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const value = ta.value
      const insertion = '  '
      const newValue = value.substring(0, start) + insertion + value.substring(end)
      setForm(prev => ({ ...prev, bio: newValue }))
      requestAnimationFrame(() => {
        if (bioRef.current) {
          bioRef.current.selectionStart = bioRef.current.selectionEnd = start + insertion.length
        }
      })
    }
  }

  const applyFormatting = (type: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'list') => {
    const ta = bioRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const value = ta.value
    let newValue = value
    let newCursorPos = start

    switch (type) {
      case 'bold':
        newValue = value.substring(0, start) + '**texte**' + value.substring(end)
        newCursorPos = start + 2
        break
      case 'italic':
        newValue = value.substring(0, start) + '_texte_' + value.substring(end)
        newCursorPos = start + 1
        break
      case 'h1':
        newValue = value.substring(0, start) + '# Titre' + value.substring(end)
        newCursorPos = start + 2
        break
      case 'h2':
        newValue = value.substring(0, start) + '## Titre' + value.substring(end)
        newCursorPos = start + 3
        break
      case 'h3':
        newValue = value.substring(0, start) + '### Titre' + value.substring(end)
        newCursorPos = start + 4
        break
      case 'list':
        newValue = value.substring(0, start) + '- Élément' + value.substring(end)
        newCursorPos = start + 2
        break
    }

    setForm(prev => ({ ...prev, bio: newValue }))
    requestAnimationFrame(() => {
      if (bioRef.current) {
        bioRef.current.selectionStart = bioRef.current.selectionEnd = newCursorPos
        bioRef.current.focus()
      }
    })
  }

  // Parser Markdown léger pour la preview
  const bioHtml = useMemo(() => {
    if (!form.bio) return ''
    const md = form.bio
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
      // paragraphe normal, conserver l'indentation minimale
      html += `<p class="mb-2 leading-relaxed">${renderInline(line)}</p>`
    }
    if (inList) html += '</ul>'
    return html
  }, [form.bio])

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
      verifyDocuments().then(status => setDocVerificationStatus(status))
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setDocError(e?.message || 'Erreur lors de la soumission des documents. Veuillez réessayer.')
    } finally {
      setDocUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
          websites: form.websites.split('\n').filter(Boolean),
          expertises: (user as any)?.expertises || [], // eslint-disable-line @typescript-eslint/no-explicit-any
          autresExpertises: (user as any)?.autresExpertises || [] // eslint-disable-line @typescript-eslint/no-explicit-any
        })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Erreur lors de la sauvegarde')
      setSuccess('Profil mis à jour avec succès')
      toast.success('Profil mis à jour avec succès')
      localStorage.removeItem('profile:edit:draft')
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e?.message || 'Erreur')
      // Ne pas afficher de toast d'erreur si c'est un problème de documents manquants
      if (!(user?.role === 'SOUS_TRAITANT' && user.id === userId)) {
        toast.error(e?.message || 'Erreur')
      }
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // Vérifier si l'utilisateur doit uploader des documents ou attendre la validation
  const needsDocumentUpload = user?.role === 'SOUS_TRAITANT' && docVerificationStatus === 'BLOCKED'
  const waitingForValidation = user?.role === 'SOUS_TRAITANT' && docVerificationStatus === 'PENDING'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8">
        
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
                <p className="text-sm text-yellow-700 mt-1">Vos documents ont été soumis avec succès et sont en cours de vérification par notre équipe administrative. Vous pourrez accéder à l&apos;édition de votre profil une fois la validation terminée.</p>
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
                <p className="text-sm text-blue-700 mt-1">Pour accéder à l&apos;édition de votre profil public et aux fonctionnalités de la plateforme, veuillez soumettre vos documents obligatoires pour vérification par notre équipe administrative.</p>
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

        {/* Contenu du formulaire - masqué si documents manquants ou en attente */}
        {!needsDocumentUpload && !waitingForValidation && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Formulaire (gauche) */}
            <div className="bg-white rounded-lg shadow p-6 order-2 lg:order-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Configurer mon profil public</h1>
                <button
                  onClick={() => router.push(`/profil/${userId}`)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Voir le profil public
                </button>
              </div>

              {/* Avatar */}
              <AvatarUploader 
                currentAvatarUrl={avatarUrl}
                onUploaded={async (newAvatarUrl) => {
                  console.log('🔄 [AvatarUploader] Rechargement du profil...')
                  await loadProfile()
                  // Mettre à jour le UserContext avec le nouvel avatar
                  if (user) {
                    const updatedUser = { ...user, avatarUrl: newAvatarUrl || null }
                    setUser(updatedUser)
                    localStorage.setItem('user', JSON.stringify(updatedUser))
                    console.log('✅ [AvatarUploader] UserContext mis à jour avec avatar:', newAvatarUrl || 'supprimé')
                    if (newAvatarUrl) {
                      toast.success('Photo de profil mise à jour !')
                    } else {
                      toast.success('Photo de profil supprimée !')
                    }
                  }
                }} 
              />

              {/* Infos non modifiables */}
              {form.completedProjects && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Projets réalisés:</strong> {form.completedProjects} (calculé automatiquement)
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom d&apos;affichage</label>
                    <input name="displayName" value={form.displayName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="Ex: Jean Dupont" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarif horaire moyen (€ / h)</label>
                    <input name="hourlyRate" type="number" value={form.hourlyRate} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="Ex: 45" />
                  </div>
                  {/* Projets réalisés calculés automatiquement côté serveur */}
                  {/* Email public non éditable: basé sur le compte */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email public</label>
                    <input disabled name="emailPublic" type="email" value={form.emailPublic} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Markdown)</label>
                  <div className="flex items-center gap-2 mb-2">
                    <button type="button" onClick={() => applyFormatting('bold')} className="text-xs px-2 py-1 border rounded">Gras</button>
                    <button type="button" onClick={() => applyFormatting('italic')} className="text-xs px-2 py-1 border rounded">Italique</button>
                    <button type="button" onClick={() => applyFormatting('h1')} className="text-xs px-2 py-1 border rounded">H1</button>
                    <button type="button" onClick={() => applyFormatting('h2')} className="text-xs px-2 py-1 border rounded">H2</button>
                    <button type="button" onClick={() => applyFormatting('list')} className="text-xs px-2 py-1 border rounded">Liste</button>
                  </div>
                  <textarea ref={bioRef} onKeyDown={handleBioKeyDown} name="bio" value={form.bio} onChange={handleChange} rows={10} className="w-full px-3 py-2 border rounded-md font-mono" placeholder={"# Titre\n**Texte en gras** et _italique_.\nListe:\n- Élément 1\n- Élément 2"} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone public</label>
                    <input name="phonePublic" value={form.phonePublic} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="06 12 34 56 78" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sites internet (un par ligne)</label>
                    <textarea name="websites" value={form.websites} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md" placeholder={'https://votre-site.com\nhttps://facebook.com/votre-page'} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input name="addressLine" value={form.addressLine} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input name="city" value={form.city} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                    <input name="postalCode" value={form.postalCode} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                    <input name="country" value={form.country} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                </div>

                {/* Section Références */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Références de chantiers</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddReference(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter une référence
                    </button>
                  </div>

                  <div className="space-y-4">
                    {references.map((ref) => (
                      <div key={ref.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{ref.title}</h4>
                            {ref.description && (
                              <p className="text-sm text-gray-600 mt-1">{ref.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => setEditingReference(ref)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteReference(ref.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                        
                        {/* Images existantes */}
                        {ref.media && ref.media.length > 0 && (
                          <div className="mb-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {ref.media.map((media: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                <div key={media.id} className="relative group">
                                  <Image
                                    src={media.url}
                                    alt={media.title || 'Image de référence'}
                                    className="w-full h-20 object-cover rounded-md"
                                    width={800}
                                    height={500}
                                  />
                                  <button
                                    onClick={() => handleDeleteMedia(ref.id, media.id)}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-white bg-red-600 hover:bg-red-700 rounded-full p-1.5 transition-opacity"
                                    title="Supprimer cette image"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Zone d'upload d'images */}
                        <div className="border-t pt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter des images</label>
                          <FileUpload
                            onFileSelect={(file) => handleUploadMedia(ref.id, file)}
                            accept="image/*"
                            disabled={uploadingMedia === ref.id}
                          />
                          {uploadingMedia === ref.id && (
                            <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {references.length === 0 && (
                      <p className="text-gray-500 text-center py-8">Aucune référence ajoutée</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="inline-flex items-center px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview (droite) */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prévisualisation</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="avatar" className="h-12 w-12 rounded-full object-cover" width={48} height={48} />
                    ) : (
                      <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user?.prenom?.[0] || user?.nom?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{form.displayName || 'Nom d\'affichage'}</h4>
                      <p className="text-sm text-gray-600">{user?.nomSociete || `${user?.prenom} ${user?.nom}`}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Nom d&apos;affichage</p>
                      <p className="text-gray-900 font-medium">{form.displayName || '—'}</p>
                    </div>
                    {bioHtml && (
                      <div>
                        <p className="text-gray-500">Bio</p>
                        <div className="prose prose-sm max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: bioHtml }} />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      {form.hourlyRate && (
                        <div>
                          <p className="text-gray-500">Tarif horaire</p>
                          <p className="text-gray-900 font-medium">{form.hourlyRate} €/h</p>
                        </div>
                      )}
                      {form.completedProjects && (
                        <div>
                          <p className="text-gray-500">Projets réalisés</p>
                          <p className="text-gray-900 font-medium">{form.completedProjects}</p>
                        </div>
                      )}
                    </div>
                    {(form.phonePublic || form.emailPublic) && (
                      <div className="grid grid-cols-2 gap-3">
                        {form.phonePublic && (
                          <div>
                            <p className="text-gray-500">Téléphone</p>
                            <p className="text-gray-900 font-medium">{form.phonePublic}</p>
                          </div>
                        )}
                        {form.emailPublic && (
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className="text-gray-900 font-medium break-all">{form.emailPublic}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {(form.addressLine || form.city || form.postalCode || form.country) && (
                      <div>
                        <p className="text-gray-500">Adresse</p>
                        <p className="text-gray-900 font-medium whitespace-pre-wrap">{[form.addressLine, `${form.postalCode} ${form.city}`.trim(), form.country].filter(Boolean).join('\n')}</p>
                      </div>
                    )}
                    {form.websites && (
                      <div>
                        <p className="text-gray-500">Sites</p>
                        <ul className="list-disc list-inside text-gray-900">
                          {form.websites.split('\n').filter(Boolean).map((w, i) => (<li key={i} className="break-all">{w}</li>))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Références dans la preview */}
                  {references.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Références de chantiers</h4>
                      <div className="space-y-3">
                        {references.map((ref) => (
                          <div key={ref.id} className="border border-gray-200 rounded-lg p-3">
                            <h5 className="font-medium text-gray-900 text-sm">{ref.title}</h5>
                            {ref.description && (
                              <p className="text-xs text-gray-600 mt-1">{ref.description}</p>
                            )}
                            {ref.media && ref.media.length > 0 && (
                              <div className="mt-2 grid grid-cols-3 gap-1">
                                {ref.media.slice(0, 3).map((media: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                  <div key={media.id} className="relative group">
                                    <Image
                                      src={media.url}
                                      alt={media.title || 'Image de référence'}
                                      className="w-full h-16 object-cover rounded"
                                      width={800}
                                      height={500}
                                    />
                                    <button
                                      onClick={() => handleDeleteMedia(ref.id, media.id)}
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-white bg-red-600 hover:bg-red-700 rounded-full p-1 transition-opacity"
                                      title="Supprimer cette image"
                                    >
                                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                                {ref.media.length > 3 && (
                                  <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center">
                                    <span className="text-xs text-gray-500">+{ref.media.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ajouter Référence */}
      {showAddReference && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Ajouter une référence</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={newReference.title}
                  onChange={(e) => setNewReference(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ex: Rénovation appartement Paris"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newReference.description}
                  onChange={(e) => setNewReference(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Description du projet..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddReference(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleAddReference}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Éditer Référence */}
      {editingReference && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Modifier la référence</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={editingReference.title}
                  onChange={(e) => setEditingReference((prev: any) => ({ ...prev, title: e.target.value }))} // eslint-disable-line @typescript-eslint/no-explicit-any
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingReference.description}
                  onChange={(e) => setEditingReference((prev: any) => ({ ...prev, description: e.target.value }))} // eslint-disable-line @typescript-eslint/no-explicit-any
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                💡 <strong>Astuce :</strong> Pour ajouter des images, utilisez la zone de drag &amp; drop directement dans la carte de référence.
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingReference(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateReference}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Composant pour l'upload d'avatar
function AvatarUploader({ 
  currentAvatarUrl, 
  onUploaded 
}: { 
  currentAvatarUrl?: string
  onUploaded: (avatarUrl?: string) => void 
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = async (file: File) => {
    console.log('🖼️ [AvatarUploader] Fichier sélectionné:', file.name, file.type, file.size)
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = localStorage.getItem('token')
      console.log('📤 [AvatarUploader] Upload vers /api/profile/avatar...')
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      console.log('📥 [AvatarUploader] Réponse:', data)
      if (!data.success) throw new Error(data.error || 'Erreur upload')
      console.log('✅ [AvatarUploader] Upload réussi, appel onUploaded()')
      onUploaded(data.data?.profile?.avatarUrl)
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('❌ [AvatarUploader] Erreur:', e)
      setError(e?.message || 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!currentAvatarUrl) return
    
    setUploading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Erreur suppression')
      onUploaded('') // Passer une chaîne vide pour indiquer la suppression
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('❌ [AvatarUploader] Erreur suppression:', e)
      setError(e?.message || 'Erreur suppression')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Photo de profil</label>
      <FileUpload
        onFileSelect={handleFileSelect}
        disabled={uploading}
        accept="image/*"
        currentImageUrl={currentAvatarUrl}
      />
      {currentAvatarUrl && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={handleDeleteAvatar}
            disabled={uploading}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Supprimer la photo
          </button>
        </div>
      )}
      {uploading && <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}