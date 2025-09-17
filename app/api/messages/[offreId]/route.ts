import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ offreId: string }> }) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const params = await context.params
    const offreId = params.offreId

    // Vérifier que l'offre existe et que l'utilisateur a le droit d'accéder aux messages
    const offre = await prisma.offre.findUnique({
      where: { id: offreId },
      include: {
        projet: {
          include: {
            donneurOrdre: {
              select: { id: true }
            }
          }
        },
        sousTraitant: {
          select: { id: true }
        }
      }
    })

    if (!offre) {
      return NextResponse.json(
        { error: 'Offre non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur fait partie de la conversation (DO, ST ou ADMIN)
    const isDonneurOrdre = offre.projet.donneurOrdre.id === user.id
    const isSousTraitant = offre.sousTraitant.id === user.id
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

    if (!isDonneurOrdre && !isSousTraitant && !isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé à cette conversation' },
        { status: 403 }
      )
    }

    // Récupérer tous les messages de cette offre
    const messages = await prisma.message.findMany({
      where: {
        offreId: offreId
      },
      include: {
        expediteur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      messages
    })

  } catch (error) {
    console.error('Erreur récupération messages:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 