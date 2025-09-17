'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useUser } from '@/lib/user-context'
import { Home, Compass, ArrowLeft, LayoutDashboard } from 'lucide-react'

export default function NotFoundPage() {
  const { user } = useUser()

  const dashboardHref = useMemo(() => {
    if (!user) return '/login'
    switch (user.role) {
      case 'DONNEUR_ORDRE':
        return '/donneur-ordre/dashboard'
      case 'SOUS_TRAITANT':
        return '/sous-traitant/dashboard'
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin'
      default:
        return '/'
    }
  }, [user])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow p-8 md:p-12 text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <Compass className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Page introuvable</h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            La page que vous recherchez n&apos;existe pas ou a été déplacée. Vérifiez l&apos;URL ou utilisez les raccourcis ci-dessous pour continuer votre navigation.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 hover:bg-gray-50"
            >
              <Home className="h-5 w-5" />
              <span>Retour à l&apos;accueil</span>
            </Link>

            <Link
              href={dashboardHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Aller au tableau de bord</span>
            </Link>
          </div>

          <div className="mt-6">
            <button
              onClick={() => (typeof window !== 'undefined' ? window.history.back() : null)}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Revenir à la page précédente</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <span>Erreur 404 • Chantier Direct</span>
        </div>
      </div>
    </main>
  )
}


