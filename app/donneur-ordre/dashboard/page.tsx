'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'

interface Projet {
  id: string
  titre: string
  description: string
  typeChantier: string[]
  prixMax: number
  status: string
  adresseChantier: string
  villeChantier: string
  dateDebut: string
  dateFin: string
  delai: string
  createdAt: string
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

  useEffect(() => {
    if (!isLoading && user) {
      // Vérifier les permissions
      if (user.role !== 'DONNEUR_ORDRE' && !isAdmin) {
        router.push('/login')
        return
      }
      fetchDashboardData()
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
      const response = await fetch('/api/donneur-ordre/dashboard', { headers })

      if (response.ok) {
        const data = await response.json()
        setProjets(data.projets)
        setStats(data.stats)
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
            <button
              onClick={() => router.push('/donneur-ordre/projets/nouveau')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvel Appel d&apos;Offre
            </button>
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
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadge(projet.status)}`}>
                              {getStatusLabel(projet.status)}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {cleanMarkdown(projet.description)}
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                📍 <span className="ml-1 truncate">{projet.villeChantier}</span>
                              </span>
                              <span className="flex items-center">
                                💰 <span className="ml-1">{projet.prixMax.toLocaleString('fr-FR')} €</span>
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
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">{cleanMarkdown(projet.description)}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📍 {projet.villeChantier}</span>
                              <span>💰 {projet.prixMax.toLocaleString('fr-FR')} €</span>
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
    </div>
  )
} 