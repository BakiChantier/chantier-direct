import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et les droits admin
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Construire les filtres
    const whereClause: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
    
    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { sujet: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Calculer la pagination
    const skip = (page - 1) * limit

    // Récupérer les demandes de contact
    const [contactRequests, totalCount] = await Promise.all([
      prisma.contactRequest.findMany({
        where: whereClause,
        include: {
          reponseUser: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.contactRequest.count({ where: whereClause })
    ])

    // Calculer les informations de pagination
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      contactRequests,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de contact:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
