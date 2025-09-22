import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    if (!q || q.length < 2) {
      return NextResponse.json({ data: { results: [] } })
    }

    // Rechercher projets ouverts, tri récents
    const projets = await prisma.projet.findMany({
      where: {
        status: 'OUVERT',
        OR: [
          { titre: { startsWith: q, mode: 'insensitive' } },
          { titre: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        donneurOrdreId: true,
        titre: true,
        description: true,
        prixMax: true,
        villeChantier: true,
        typeChantier: true,
        createdAt: true,
      },
    })

    const results = projets.map(p => ({
      id: p.id,
      type: 'project',
      title: p.titre,
      description: p.description.slice(0, 160),
      budget: p.prixMax,
      location: p.villeChantier,
      expertise: p.typeChantier,
      ownerId: p.donneurOrdreId,
    }))

    return NextResponse.json({ data: { results } })
  } catch (e) {
    console.error('Erreur lors de la recherche de projets', e)
    return NextResponse.json({ data: { results: [] } }, { status: 200 })
  }
}


