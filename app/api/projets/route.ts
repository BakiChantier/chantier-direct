import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const debug = url.searchParams.get('debug')

    // Si debug=true, récupérer TOUS les projets pour débugger
    const whereClause = debug === 'true' ? {} : {
      status: 'OUVERT' as const,
      delai: {
        gt: new Date() // Date limite non dépassée
      }
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