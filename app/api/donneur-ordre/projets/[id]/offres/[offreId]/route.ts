import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; offreId: string }> }) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { id: projetId, offreId } = await context.params

    // Vérifier l'offre et l'appartenance du projet
    const offre = await prisma.offre.findUnique({
      where: { id: offreId },
      include: {
        projet: { select: { id: true, titre: true, donneurOrdreId: true } },
        sousTraitant: { select: { id: true } },
      },
    })
    if (!offre || offre.projet.id !== projetId) {
      return NextResponse.json({ error: 'Offre non trouvée' }, { status: 404 })
    }

    if (!isAdmin(user) && offre.projet.donneurOrdreId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Supprimer l'offre et envoyer un message d'information au sous-traitant
    await prisma.$transaction(async (tx) => {
      // Créer un message d'information
      await tx.message.create({
        data: {
          projetId: offre.projet.id,
          offreId: offre.id,
          expediteurId: user.id,
          destinataireId: offre.sousTraitant.id,
          contenu: `Bonjour,\n\nDésolé, nous ne pouvons pas donner suite à votre offre pour le projet "${offre.projet.titre}".\n\nMerci pour votre proposition et votre intérêt.\n\nCordialement,\nL'équipe`,
        },
      })

      // Supprimer les messages liés à l'offre pour nettoyer le fil côté DO (facultatif)
      await tx.message.deleteMany({ where: { offreId: offre.id } })

      // Supprimer l'offre
      await tx.offre.delete({ where: { id: offre.id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression offre:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


