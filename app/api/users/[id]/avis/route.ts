import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const params = await context.params
    const userId = params.id

    // Vérifier que l'utilisateur existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les avis reçus par l'utilisateur
    const avis = await prisma.evaluation.findMany({
      where: { evalueId: userId },
      include: {
        evaluateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            nomSociete: true
          }
        },
        projet: {
          select: {
            id: true,
            titre: true,
            typeChantier: true,
            villeChantier: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        avis,
        nombreAvis: avis.length
      }
    })

  } catch (error) {
    console.error('Erreur récupération avis:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
