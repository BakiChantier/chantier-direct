import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, context: { params: Promise<{ offreId: string }> }) {
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

    // Marquer tous les messages non lus de cette offre comme lus pour cet utilisateur
    await prisma.message.updateMany({
      where: {
        offreId: offreId,
        destinataireId: user.id,
        lu: false
      },
      data: {
        lu: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Messages marqués comme lus'
    })

  } catch (error) {
    console.error('Erreur marquage messages lus:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 