'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  nom: string
  prenom: string | null
  role: 'DONNEUR_ORDRE' | 'SOUS_TRAITANT' | 'ADMIN' | 'SUPER_ADMIN'
  nomSociete: string | null
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  isAdmin: boolean
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🚀 [UserContext] Initialisation du contexte utilisateur...')
    
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    console.log('🔍 [UserContext] userData brut:', userData)
    console.log('🔍 [UserContext] token existe:', !!token)
    
    if (userData && token) {
      (async () => {
        try {
          const parsedUser = JSON.parse(userData)
          console.log('👤 [UserContext] Utilisateur récupéré:', parsedUser)
          console.log('🎭 [UserContext] Rôle:', parsedUser.role)

          if (!parsedUser?.role) {
            // Récupérer l'utilisateur complet AVANT d'exposer le contexte
            try {
              const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
              if (res.ok) {
                const data = await res.json()
                if (data?.success && data?.data?.user) {
                  setUser(data.data.user)
                } else {
                  setUser(parsedUser)
                }
              } else {
                setUser(parsedUser)
              }
            } catch {
              setUser(parsedUser)
            }
          } else {
            setUser(parsedUser)
            // Rafraîchir en arrière-plan pour assurer la fraîcheur
            fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
              .then(async (res) => {
                if (!res.ok) return null
                const data = await res.json()
                if (data?.success && data?.data?.user) {
                  setUser(data.data.user)
                }
                return null
              })
              .catch(() => null)
          }
        } catch (error) {
          console.error('❌ [UserContext] Erreur parsing user:', error)
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        } finally {
          setIsLoading(false)
        }
      })()
      return
    } else {
      console.log('🔍 [UserContext] Pas de données utilisateur stockées, tentative via /api/auth/me')
      // Essayer de récupérer via le cookie HttpOnly
      fetch('/api/auth/me')
        .then(async (res) => {
          if (!res.ok) return null
          const data = await res.json()
          if (data?.success && data?.data?.user) {
            console.log('👤 [UserContext] Utilisateur récupéré via cookie:', data.data.user)
            setUser(data.data.user)
          }
          return null
        })
        .catch((err) => {
          console.warn('⚠ [UserContext] Échec de récupération via /api/auth/me:', err)
        })
        .finally(() => setIsLoading(false))
    }
  }, [])

  const logout = () => {
    console.log('🚪 [UserContext] Déconnexion...')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  console.log('🔄 [UserContext] État actuel:', { 
    userExists: !!user, 
    role: user?.role, 
    isAdmin, 
    isLoading 
  })

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isLoading,
      isAdmin,
      logout
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 