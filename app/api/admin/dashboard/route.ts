import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await getCurrentUser(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      )
    }

    // Récupérer les statistiques
    const [
      totalUsers,
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      donneurOrdreCount,
      sousTraitantCount
    ] = await Promise.all([
      // Total utilisateurs
      prisma.user.count({
        where: {
          role: {
            in: ['DONNEUR_ORDRE', 'SOUS_TRAITANT']
          }
        }
      }),
      
      // Total documents
      prisma.document.count(),
      
      // Documents en attente
      prisma.document.count({
        where: { status: 'PENDING' }
      }),
      
      // Documents approuvés
      prisma.document.count({
        where: { status: 'APPROVED' }
      }),
      
      // Documents rejetés
      prisma.document.count({
        where: { status: 'REJECTED' }
      }),
      
      // Donneurs d'ordre
      prisma.user.count({
        where: { role: 'DONNEUR_ORDRE' }
      }),
      
      // Sous-traitants
      prisma.user.count({
        where: { role: 'SOUS_TRAITANT' }
      })
    ])

    const stats = {
      totalUsers,
      totalDocuments,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      donneurOrdreCount,
      sousTraitantCount
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
} 