'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface SearchResult {
  id: string
  title: string
  description: string
  location?: string
  budget?: number
  expertise?: string[]
  ownerId?: string
}

interface SearchBarProps {
  userRole?: 'DONNEUR_ORDRE' | 'SOUS_TRAITANT' | 'ADMIN' | 'SUPER_ADMIN' | null
  userId?: string | null
  className?: string
}

export default function SearchBar({ userRole, userId, className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fonction de recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim())
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, userRole]) // eslint-disable-line react-hooks/exhaustive-deps

  const performSearch = async (searchQuery: string) => {
    if (!userRole) {
      // Rediriger vers login si pas connecté
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const endpoint = '/api/search/projects'
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}`, {
        // recherche publique: pas besoin d'Authorization
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.data?.results || [])
        setIsOpen(true)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Erreur de recherche:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    
    const id = typeof result.id === 'string' ? result.id : (result as any).id?.toString?.() || '' // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!id) return
    if (userRole === 'DONNEUR_ORDRE') {
      if (result.ownerId && userId && result.ownerId === userId) {
        router.push(`/donneur-ordre/projets/${id}`)
      } else {
        router.push(`/projets/${id}`)
      }
      return
    }
    router.push(`/projets/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = query.trim()
      if (!trimmed) return
      localStorage.setItem('search:projets:q', trimmed)
      router.push('/projets')
      setIsOpen(false)
    }
  }

  const getPlaceholder = () => {
    if (!userRole) return 'Connectez-vous pour rechercher...'
    return 'Rechercher des appels d\'offre...'
  }

  const handleFocus = () => {
    if (!userRole) {
      router.push('/login')
    }
  }

  // Fonction pour nettoyer le Markdown et afficher du texte propre
  const cleanMarkdown = (text: string) => {
    if (!text) return ''
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // **gras** -> gras
      .replace(/_([^_]+)_/g, '$1') // _italique_ -> italique
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [texte](url) -> texte
      .replace(/^#{1,6}\s+/gm, '') // # Titre -> Titre
      .replace(/^\s*-\s+/gm, '• ') // - item -> • item
      .replace(/\n+/g, ' ') // remplacer les sauts de ligne par des espaces
      .trim()
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={getPlaceholder()}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 py-2 w-full max-w-lg"
          disabled={!userRole}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Résultats de recherche */}
      {isOpen && results.length > 0 && (
        <Card className="fixed sm:absolute top-full sm:top-full mt-2 left-4 right-4 sm:left-0 sm:right-auto sm:w-full sm:max-w-lg z-50 shadow-lg border bg-white">
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                        {result.title}
                      </h4>
                      {result.budget && (
                        <Badge variant="secondary" className="ml-2 flex-shrink-0">
                          {result.budget.toLocaleString()}€
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {cleanMarkdown(result.description)}
                    </p>
                    {result.location && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {result.location}
                      </div>
                    )}
                    {result.expertise && result.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.expertise.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs py-0">
                            {skill}
                          </Badge>
                        ))}
                        {result.expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs py-0">
                            +{result.expertise.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message quand pas de résultats */}
      {isOpen && results.length === 0 && !loading && query.length > 2 && (
        <Card className="fixed sm:absolute top-full sm:top-full mt-2 left-4 right-4 sm:left-0 sm:right-auto sm:w-full sm:max-w-lg z-50 shadow-lg border bg-white">
          <CardContent className="p-4 text-center text-gray-500 text-sm">
            Aucun résultat trouvé pour &quot;{query}&quot;
          </CardContent>
        </Card>
      )}
    </div>
  )
} 