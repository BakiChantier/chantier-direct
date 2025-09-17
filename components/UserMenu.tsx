'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import Link from 'next/link'
import { 
  User, 
  LogOut, 
  Building2, 
  Briefcase,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { notifications } from '@/lib/notifications'

interface AuthUser {
  id: string
  email: string
  role: 'DONNEUR_ORDRE' | 'SOUS_TRAITANT' | 'ADMIN' | 'SUPER_ADMIN'
  nom: string
  prenom: string | null
  nomSociete: string | null
  avatar?: string
}

interface UserMenuProps {
  user: AuthUser
}

export default function UserMenu({ user }: UserMenuProps) {
  const [pendingDocuments, setPendingDocuments] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const router = useRouter()
  const { logout, setUser } = useUser()

  // Charger le nombre de documents en attente et l'avatar
  useEffect(() => {
    if (user.role === 'SOUS_TRAITANT') {
      fetchPendingDocuments()
    }
    
    // Récupérer l'avatar pour tous les utilisateurs
    fetch('/api/profile')
      .then(async (res) => {
        if (!res.ok) return null
        const data = await res.json()
        const url = data?.data?.profile?.avatarUrl
        if (url) setAvatarUrl(url)
        return null
      })
      .catch(() => null)
  }, [user.role])

  const fetchPendingDocuments = async () => {
    try {
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const pending = data.data?.documents?.filter((doc: any) => doc.status === 'PENDING').length || 0 // eslint-disable-line @typescript-eslint/no-explicit-any
        setPendingDocuments(pending)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Erreur lors du chargement des documents:', e)
      // ignore
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    logout()
    notifications.logoutSuccess()
    router.push('/login')
  }

  const getInitials = () => {
    const prenom = user.prenom || ''
    const nom = user.nom || ''
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const getRoleLabel = () => {
    switch (user.role) {
      case 'DONNEUR_ORDRE':
        return 'Donneur d\'ordre'
      case 'SOUS_TRAITANT':
        return 'Sous-traitant'
      case 'ADMIN':
        return 'Administrateur'
      case 'SUPER_ADMIN':
        return 'Super Admin'
      default:
        return 'Utilisateur'
    }
  }

  const getRoleColor = () => {
    switch (user.role) {
      case 'DONNEUR_ORDRE':
        return 'bg-blue-100 text-blue-800'
      case 'SOUS_TRAITANT':
        return 'bg-green-100 text-green-800'
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDashboardUrl = () => {
    switch (user.role) {
      case 'DONNEUR_ORDRE':
        return '/donneur-ordre/dashboard'
      case 'SOUS_TRAITANT':
        return '/sous-traitant/dashboard'
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin'
      default:
        return '/dashboard'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={avatarUrl || user.avatar} 
              alt={`${user.prenom} ${user.nom}`}
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {pendingDocuments > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {pendingDocuments}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={avatarUrl || user.avatar} 
                  alt={`${user.prenom} ${user.nom}`}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
                {user.nomSociete && (
                  <p className="text-xs text-gray-400 truncate flex items-center mt-1">
                    <Building2 className="h-3 w-3 mr-1" />
                    {user.nomSociete}
                  </p>
                )}
              </div>
            </div>
            <Badge className={`w-fit text-xs ${getRoleColor()}`}>
              {getRoleLabel()}
            </Badge>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={getDashboardUrl()} className="cursor-pointer">
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Tableau de bord</span>
          </Link>
        </DropdownMenuItem>
        
        {user.role === 'SOUS_TRAITANT' && (
          <DropdownMenuItem asChild>
            <Link href={`/profil/${user.id}/edit`} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </Link>
          </DropdownMenuItem>
        )}

        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Administration</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 