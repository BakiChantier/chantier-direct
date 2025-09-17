'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DocumentationPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la première page de documentation
    router.replace('/documentation/1-introduction')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
    </div>
  )
}
