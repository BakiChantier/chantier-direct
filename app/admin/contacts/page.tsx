'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'

interface Contact {
  id: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  entreprise?: string
  sujet: string
  message: string
  typeContact: 'GENERAL' | 'SUPPORT' | 'COMMERCIAL' | 'TECHNIQUE'
  status: 'NOUVEAU' | 'EN_COURS' | 'RESOLU' | 'FERME' | 'ARCHIVE'
  priority: number
  assignedTo?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  assignedAdmin?: {
    id: string
    nom: string
    prenom: string
  }
}

const STATUS_LABELS = {
  NOUVEAU: 'Nouveau',
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  FERME: 'Fermé',
  ARCHIVE: 'Archivé'
}

const STATUS_COLORS = {
  NOUVEAU: 'bg-blue-100 text-blue-800',
  EN_COURS: 'bg-yellow-100 text-yellow-800',
  RESOLU: 'bg-green-100 text-green-800',
  FERME: 'bg-gray-100 text-gray-800',
  ARCHIVE: 'bg-purple-100 text-purple-800'
}

const TYPE_LABELS = {
  GENERAL: 'Général',
  SUPPORT: 'Support',
  COMMERCIAL: 'Commercial',
  TECHNIQUE: 'Technique'
}

const PRIORITY_LABELS = {
  1: 'Normal',
  2: 'Élevée',
  3: 'Urgente'
}

const PRIORITY_COLORS = {
  1: 'text-gray-600',
  2: 'text-orange-600',
  3: 'text-red-600'
}

export default function AdminContactsPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [replySubject, setReplySubject] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        router.push('/login')
        return
      }
      fetchContacts()
    }
  }, [user, isLoading, router])

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContactStatus = async (contactId: string, status: string, adminNotes?: string) => {
    setUpdating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          adminNotes,
          assignedTo: user?.id
        })
      })

      if (response.ok) {
        await fetchContacts()
        if (selectedContact?.id === contactId) {
          const updatedContact = contacts.find(c => c.id === contactId)
          if (updatedContact) {
            setSelectedContact({ ...updatedContact, status: status as any, adminNotes }) // eslint-disable-line @typescript-eslint/no-explicit-any
          }
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setUpdating(false)
    }
  }

  const sendReply = async () => {
    if (!selectedContact || !replySubject.trim() || !replyMessage.trim()) return

    setSendingReply(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/contacts/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contactId: selectedContact.id,
          subject: replySubject,
          message: replyMessage
        })
      })

      if (response.ok) {
        setShowModal(false)
        setReplySubject('')
        setReplyMessage('')
        await updateContactStatus(selectedContact.id, 'RESOLU')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setSendingReply(false)
    }
  }

  const openReplyModal = (contact: Contact) => {
    setSelectedContact(contact)
    setReplySubject(`Re: ${contact.sujet}`)
    setReplyMessage(`Bonjour ${contact.prenom} ${contact.nom},\n\nMerci pour votre message concernant "${contact.sujet}".\n\n\n\nCordialement,\nL'équipe Chantier-Direct`)
    setShowModal(true)
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus
    const matchesType = filterType === 'all' || contact.typeContact === filterType
    const matchesSearch = !searchTerm || 
      contact.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.entreprise?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesType && matchesSearch
  })

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Contacts</h1>
              <p className="mt-1 text-gray-600">Gérez les demandes de contact et répondez aux utilisateurs</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, email, sujet..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="NOUVEAU">Nouveaux</option>
                <option value="EN_COURS">En cours</option>
                <option value="RESOLU">Résolus</option>
                <option value="FERME">Fermés</option>
                <option value="ARCHIVE">Archivés</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Tous les types</option>
                <option value="GENERAL">Général</option>
                <option value="SUPPORT">Support</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="TECHNIQUE">Technique</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all')
                  setFilterType('all')
                  setSearchTerm('')
                }}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des contacts */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun contact trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">Modifiez vos filtres de recherche</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <li key={contact.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {contact.prenom} {contact.nom}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[contact.status]}`}>
                            {STATUS_LABELS[contact.status]}
                          </span>
                          <span className={`text-xs font-medium ${PRIORITY_COLORS[contact.priority as keyof typeof PRIORITY_COLORS]}`}>
                            {PRIORITY_LABELS[contact.priority as keyof typeof PRIORITY_LABELS]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {TYPE_LABELS[contact.typeContact]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">{contact.sujet}</p>
                        <p className="text-sm text-gray-500 truncate">{contact.message}</p>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>{contact.email}</span>
                        {contact.telephone && <span>{contact.telephone}</span>}
                        {contact.entreprise && <span>{contact.entreprise}</span>}
                      </div>
                    </div>
                    
                    <div className="ml-6 flex items-center space-x-2">
                      {contact.status === 'NOUVEAU' && (
                        <button
                          onClick={() => updateContactStatus(contact.id, 'EN_COURS')}
                          disabled={updating}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50"
                        >
                          Prendre en charge
                        </button>
                      )}
                      
                      <button
                        onClick={() => openReplyModal(contact)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Répondre
                      </button>
                      
                      {contact.status !== 'ARCHIVE' && (
                        <button
                          onClick={() => updateContactStatus(contact.id, 'ARCHIVE')}
                          disabled={updating}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                          Archiver
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de réponse */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Répondre à {selectedContact.prenom} {selectedContact.nom}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Message original :</h4>
                <p className="text-sm text-gray-700">{selectedContact.message}</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); sendReply(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message de réponse
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {sendingReply ? 'Envoi...' : 'Envoyer et marquer comme résolu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
