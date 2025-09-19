import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construire le filtre
    const where: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (status) {
      where.moderationStatus = status;
    }

    // Récupérer les projets avec pagination
    const [projets, total] = await Promise.all([
      prisma.projet.findMany({
        where,
        include: {
          donneurOrdre: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              nomSociete: true,
              documents: {
                select: {
                  type: true,
                  status: true
                }
              }
            }
          },
          moderator: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true
            }
          },
          images: {
            select: {
              id: true,
              url: true,
              title: true,
              description: true,
              type: true
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
        skip,
        take: limit
      }),
      prisma.projet.count({ where })
    ]);

    return NextResponse.json({
      projets,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}
