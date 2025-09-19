import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer les statistiques de modération
    const [
      totalProjets,
      projetsPending,
      projetsValidated,
      projetsRejected,
      recentProjets
    ] = await Promise.all([
      prisma.projet.count(),
      prisma.projet.count({ where: { moderationStatus: 'PENDING' } }),
      prisma.projet.count({ where: { moderationStatus: 'VALIDATED' } }),
      prisma.projet.count({ where: { moderationStatus: 'REJECTED' } }),
      prisma.projet.findMany({
        where: { moderationStatus: 'PENDING' },
        include: {
          donneurOrdre: {
            select: {
              nom: true,
              prenom: true,
              nomSociete: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Statistiques par période (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      projetsCreatedLast30Days,
      projetsValidatedLast30Days,
      projetsRejectedLast30Days
    ] = await Promise.all([
      prisma.projet.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.projet.count({
        where: {
          moderationStatus: 'VALIDATED',
          moderatedAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.projet.count({
        where: {
          moderationStatus: 'REJECTED',
          moderatedAt: { gte: thirtyDaysAgo }
        }
      })
    ]);

    return NextResponse.json({
      totals: {
        total: totalProjets,
        pending: projetsPending,
        validated: projetsValidated,
        rejected: projetsRejected
      },
      last30Days: {
        created: projetsCreatedLast30Days,
        validated: projetsValidatedLast30Days,
        rejected: projetsRejectedLast30Days
      },
      recentPending: recentProjets
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
