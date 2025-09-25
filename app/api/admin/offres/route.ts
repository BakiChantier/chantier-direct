import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const offres = await prisma.offre.findMany({
      include: {
        projet: {
          include: {
            donneurOrdre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                nomSociete: true,
                email: true,
                telephone: true
              }
            }
          }
        },
        sousTraitant: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            nomSociete: true,
            email: true,
            telephone: true
          }
        }
      },
      orderBy: [
        {
          projet: {
            titre: 'asc'
          }
        },
        {
          createdAt: 'desc'
        }
      ]
    })

    return NextResponse.json({ offres })
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des offres' },
      { status: 500 }
    )
  }
}
