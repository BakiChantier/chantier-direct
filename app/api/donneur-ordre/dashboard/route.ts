import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (donneur d'ordre ou admin)
    if (user.role !== 'DONNEUR_ORDRE' && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Pour les admins, on peut voir tous les projets
    // Pour les donneurs d'ordres, seulement leurs projets
    const whereClause = isAdmin(user) ? {} : { donneurOrdreId: user.id }

    // Récupérer les projets avec le nombre d'offres
    const projets = await prisma.projet.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            offres: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques
    const stats = {
      totalProjets: projets.length,
      projetsOuverts: projets.filter(p => p.status === 'OUVERT').length,
      projetsEnCours: projets.filter(p => p.status === 'EN_COURS').length,
      projetsTermines: projets.filter(p => p.status === 'TERMINE').length,
      totalOffres: projets.reduce((sum, projet) => sum + projet._count.offres, 0)
    }

    return NextResponse.json({
      projets,
      stats
    })

  } catch (error) {
    console.error('Erreur dashboard donneur d\'ordre:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 