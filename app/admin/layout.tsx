'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/user-context'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0" />
      </svg>
    )
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    )
  },
  {
    name: 'Documents',
    href: '/admin/documents',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    name: 'Contacts',
    href: '/admin/contacts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAdmin, logout } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log('🔍 [Admin Layout] Début de la vérification...')
    console.log('👤 [Admin Layout] User depuis contexte:', user)
    console.log('🎭 [Admin Layout] isAdmin depuis contexte:', isAdmin)
    console.log('⏳ [Admin Layout] isLoading depuis contexte:', isLoading)
    
    if (isLoading) {
      console.log('⏳ [Admin Layout] Chargement en cours...')
      return
    }
    
    if (!user) {
      console.log('❌ [Admin Layout] Pas d\'utilisateur, redirection vers login')
      router.push('/login')
      return
    }

    console.log('🎭 [Admin Layout] Rôle utilisateur:', user.role)
    
    // Vérifier que l'utilisateur est admin
    if (!isAdmin) {
      console.log('❌ [Admin Layout] Utilisateur pas admin, rôle:', user.role)
      const redirectUrl = user.role === 'DONNEUR_ORDRE' 
        ? '/donneur-ordre/dashboard' 
        : '/sous-traitant/dashboard'
      console.log('🔄 [Admin Layout] Redirection vers:', redirectUrl)
      router.push(redirectUrl)
      return
    }

    console.log('✅ [Admin Layout] Utilisateur admin validé!')
  }, [user, isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent user={user} pathname={pathname} onLogout={logout} />
          </div>
        </div>
      )}

      {/* Desktop layout: sidebar + content */}
      <div className="hidden md:flex md:flex-row md:items-stretch">
        {/* Sidebar Desktop (non fixed, pleine hauteur dispo) */}
        <aside className="w-64 bg-white border-r border-gray-200 md:min-h-[calc(100vh-4rem)]">
          <SidebarContent user={user} pathname={pathname} onLogout={logout} />
        </aside>
        {/* Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile content (sidebar via drawer) */}
      <div className="md:hidden flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-200">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <main className="flex-1">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ 
  user, 
  pathname, 
  onLogout 
}: { 
  user: any // eslint-disable-line @typescript-eslint/no-explicit-any
  pathname: string
  onLogout: () => void 
}) {
  return (
    <div className="flex flex-col h-full py-6">
      {/* Header */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-red-600">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Panel Admin</p>
            <p className="text-xs text-red-200">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 bg-white overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'bg-red-100 text-red-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <div className={`${
                pathname === item.href ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
              } mr-3 flex-shrink-0`}>
                {item.icon}
              </div>
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user.prenom?.[0] || user.nom[0]}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {user.prenom} {user.nom}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
        >
          <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </div>
  )
} 