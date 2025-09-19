import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const debug = url.searchParams.get('debug')
    const ignoreDeadline = url.searchParams.get('ignoreDeadline') === 'true'

    // Construire le filtre de base
    const baseFilter = {
      status: 'OUVERT' as const,
      moderationStatus: 'VALIDATED', // Seuls les projets validés sont visibles
    }

    // Ajouter le filtre de date limite seulement si demandé
    const whereClause = debug === 'true' 
      ? {} 
      : {
          ...baseFilter,
          ...(ignoreDeadline ? {} : {
            delai: {
              gte: new Date() // Date limite non dépassée (inclut aujourd'hui)
            }
          })
        }

    // DEBUG: Afficher tous les projets pour débugger
    if (debug === 'true') {
      const allProjets = await prisma.projet.findMany({
        include: {
          donneurOrdre: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              nomSociete: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      console.log('DEBUG - Tous les projets:', allProjets.map(p => ({
        id: p.id,
        titre: p.titre,
        status: p.status,
        moderationStatus: p.moderationStatus,
        delai: p.delai,
        donneurOrdre: p.donneurOrdre.nomSociete || `${p.donneurOrdre.prenom} ${p.donneurOrdre.nom}`
      })))
      
      return NextResponse.json({
        debug: true,
        allProjets: allProjets.length,
        projets: allProjets
      })
    }

    console.log('Récupération des projets avec filtre:', whereClause)

    // Récupérer les projets selon le filtre
    const projets = await prisma.projet.findMany({
      where: whereClause,
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
      }
    })

    console.log(`Nombre de projets trouvés: ${projets.length}`)
    console.log('Projets trouvés:', projets.map(p => ({
      id: p.id,
      titre: p.titre,
      status: p.status,
      moderationStatus: p.moderationStatus,
      delai: p.delai
    })))

    return NextResponse.json({
      projets
    })

  } catch (error) {
    console.error('Erreur récupération projets publics:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 