import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
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

    // Vérifier les permissions
    if (user.role !== 'DONNEUR_ORDRE' && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const params = await context.params
    const projetId = params.id

    // Récupérer le projet avec ses offres et les messages non lus
    const projet = await prisma.projet.findUnique({
      where: { id: projetId },
      include: {
        donneurOrdre: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            nomSociete: true
          }
        },
        offres: {
          select: {
            id: true,
            prixPropose: true,
            delaiPropose: true,
            message: true,
            experienceSimilaire: true,
            materielsDisponibles: true,
            equipeAssignee: true,
            status: true,
            createdAt: true,
            sousTraitant: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                nomSociete: true,
                noteGlobale: true
              }
            }
          },
          orderBy: [
            {
              status: 'asc' // ACCEPTEE en premier, puis EN_ATTENTE, puis REFUSEE
            },
            {
              createdAt: 'desc'
            }
          ]
        }
      }
    })

    if (!projet) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur a le droit d'accéder à ce projet
    if (!isAdmin(user) && projet.donneurOrdreId !== user.id) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Pour chaque offre, vérifier s'il y a des messages non lus
    const offresWithUnreadStatus = await Promise.all(
      projet.offres.map(async (offre) => {
        const unreadCount = await prisma.message.count({
          where: {
            offreId: offre.id,
            destinataireId: user.id,
            lu: false
          }
        })

        return {
          ...offre,
          hasUnreadMessages: unreadCount > 0
        }
      })
    )

    const projetWithUnreadStatus = {
      ...projet,
      offres: offresWithUnreadStatus
    }

    return NextResponse.json({
      projet: projetWithUnreadStatus
    })

  } catch (error) {
    console.error('Erreur récupération projet:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 