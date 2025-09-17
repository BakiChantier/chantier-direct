import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
    const body = await request.json()
    const { offreId } = body

    if (!offreId) {
      return NextResponse.json(
        { error: 'ID de l\'offre requis' },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe et appartient au donneur d'ordre
    const projet = await prisma.projet.findUnique({
      where: { id: projetId },
      include: {
        donneurOrdre: {
          select: { 
            id: true,
            nom: true,
            nomSociete: true
          }
        }
      }
    })

    if (!projet) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    if (!isAdmin(user) && projet.donneurOrdre.id !== user.id) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Vérifier que l'offre existe et appartient à ce projet
    const offreSelectionnee = await prisma.offre.findFirst({
      where: {
        id: offreId,
        projetId: projetId
      },
      include: {
        sousTraitant: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            nomSociete: true
          }
        }
      }
    })

    if (!offreSelectionnee) {
      return NextResponse.json(
        { error: 'Offre non trouvée' },
        { status: 404 }
      )
    }

    // Transaction pour tout faire en une fois
    await prisma.$transaction(async (tx) => {
      // 1. Remettre toutes les offres en attente (au cas où on change d'avis)
      await tx.offre.updateMany({
        where: {
          projetId: projetId
        },
        data: { status: 'EN_ATTENTE' }
      })

      // 2. Accepter l'offre sélectionnée
      await tx.offre.update({
        where: { id: offreId },
        data: { status: 'ACCEPTEE' }
      })

      // 3. Refuser toutes les autres offres
      await tx.offre.updateMany({
        where: {
          projetId: projetId,
          id: { not: offreId }
        },
        data: { status: 'REFUSEE' }
      })

      // 3. Changer le statut du projet
      await tx.projet.update({
        where: { id: projetId },
        data: { status: 'EN_COURS' }
      })

      // 4. Vérifier si c'est la première sélection (pour éviter de re-spammer)
      const existingMessages = await tx.message.findFirst({
        where: {
          projetId: projetId,
          expediteurId: user.id,
          contenu: {
            contains: "nous avons décidé de retenir une autre offre"
          }
        }
      })

      // 5. Seulement envoyer les notifications de refus si c'est la première sélection
      if (!existingMessages) {
        const offresRefusees = await tx.offre.findMany({
          where: {
            projetId: projetId,
            status: 'REFUSEE'
          },
          include: {
            sousTraitant: {
              select: { id: true }
            }
          }
        })

        const messagesNotification = offresRefusees.map(offre => ({
          projetId: projetId,
          offreId: offre.id,
          expediteurId: user.id,
          destinataireId: offre.sousTraitant.id,
          contenu: `Bonjour,\n\nNous vous remercions pour l'intérêt que vous avez porté à notre projet "${projet.titre}".\n\nAprès étude de toutes les candidatures, nous avons décidé de retenir une autre offre pour ce projet.\n\nNous espérons avoir l'occasion de travailler ensemble sur de futurs projets.\n\nCordialement,\nL'équipe ${projet.donneurOrdre.nomSociete || user.nom}`
        }))

        if (messagesNotification.length > 0) {
          await tx.message.createMany({
            data: messagesNotification
          })
        }
      }

      // 6. Envoyer un message de confirmation au candidat sélectionné
      await tx.message.create({
        data: {
          projetId: projetId,
          offreId: offreId,
          expediteurId: user.id,
          destinataireId: offreSelectionnee.sousTraitant.id,
          contenu: `Félicitations !\n\nNous avons le plaisir de vous informer que votre offre pour le projet "${projet.titre}" a été retenue.\n\nNous allons prendre contact avec vous très prochainement pour organiser le démarrage des travaux.\n\nMerci pour votre proposition et à bientôt !\n\nCordialement,\nL'équipe ${projet.donneurOrdre.nomSociete || user.nom}`
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Sous-traitant sélectionné avec succès',
      data: {
        selectedOffre: offreSelectionnee,
        notificationsEnvoyees: true
      }
    })

  } catch (error) {
    console.error('Erreur sélection sous-traitant:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 