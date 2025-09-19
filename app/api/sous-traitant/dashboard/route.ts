import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getCurrentUser(request)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    if (authUser.role !== 'SOUS_TRAITANT') {
      return NextResponse.json(
        { error: 'Accès réservé aux sous-traitants' },
        { status: 403 }
      )
    }

    // Récupérer l'utilisateur complet avec ses expertises
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        expertises: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les projets recommandés (plus que nécessaire pour filtrer après)
    // Projets ouverts qui correspondent aux expertises du sous-traitant
    const projetsRecommandesRaw = await prisma.projet.findMany({
      where: {
        status: 'OUVERT',
        moderationStatus: 'VALIDATED', // Seuls les projets validés
        delai: {
          gte: new Date() // Date limite non dépassée (inclut aujourd'hui)
        },
        typeChantier: {
          hasSome: user.expertises || []
        },
        // Exclure les projets où l'utilisateur a déjà postulé
        NOT: {
          offres: {
            some: {
              sousTraitantId: user.id
            }
          }
        }
      },
      include: {
        donneurOrdre: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            nomSociete: true
          }
        },
        _count: {
          select: {
            offres: true
          }
        }
      },
      orderBy: [
        {
          createdAt: 'desc'
        }
      ],
      take: 10 // Prendre plus pour filtrer après
    })

    // Prendre les premiers projets (déjà filtrés par Prisma)
    const projetsRecommandes = projetsRecommandesRaw.slice(0, 5)

    // Si pas assez de projets correspondant aux expertises, compléter avec d'autres projets ouverts
    let projetsComplements: typeof projetsRecommandes = []
    if (projetsRecommandes.length < 5) {
      const nombreManquant = 5 - projetsRecommandes.length
      const projetsExistantsIds = projetsRecommandes.map(p => p.id)

      const projetsComplementsRaw = await prisma.projet.findMany({
        where: {
          status: 'OUVERT',
          moderationStatus: 'VALIDATED', // Seuls les projets validés
          delai: {
            gte: new Date() // Date limite non dépassée (inclut aujourd'hui)
          },
          id: {
            notIn: projetsExistantsIds
          },
          NOT: {
            offres: {
              some: {
                sousTraitantId: user.id
              }
            }
          }
        },
        include: {
          donneurOrdre: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              nomSociete: true
            }
          },
          _count: {
            select: {
              offres: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: nombreManquant * 2 // Prendre plus pour filtrer après
      })

      // Prendre les projets complémentaires (déjà filtrés par Prisma)
      projetsComplements = projetsComplementsRaw.slice(0, nombreManquant)
    }

    const tousProjetsSuggeres = [...projetsRecommandes, ...projetsComplements]

    // Récupérer les offres soumises par le sous-traitant
    const mesOffres = await prisma.offre.findMany({
      where: {
        sousTraitantId: user.id
      },
      include: {
        projet: {
          include: {
            donneurOrdre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                nomSociete: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Pour chaque offre, vérifier s'il y a des messages non lus
    const offresWithUnreadStatus = await Promise.all(
      mesOffres.map(async (offre) => {
        const unreadCount = await prisma.message.count({
          where: {
            offreId: offre.id,
            destinataireId: user.id,
            lu: false
          }
        })

        return {
          ...offre,
          hasUnreadMessages: unreadCount > 0,
          unreadCount
        }
      })
    )

    // Statistiques
    const stats = {
      offresEnAttente: mesOffres.filter(o => o.status === 'EN_ATTENTE').length,
      offresAcceptees: mesOffres.filter(o => o.status === 'ACCEPTEE').length,
      offresRefusees: mesOffres.filter(o => o.status === 'REFUSEE').length,
      totalOffres: mesOffres.length,
      messagesNonLus: offresWithUnreadStatus.reduce((total, offre) => total + (offre.unreadCount || 0), 0)
    }

    return NextResponse.json({
      projetsRecommandes: tousProjetsSuggeres,
      mesOffres: offresWithUnreadStatus,
      stats
    })

  } catch (error) {
    console.error('Erreur dashboard sous-traitant:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 