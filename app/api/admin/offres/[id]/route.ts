import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { sendOffreRejectNotification } from '@/lib/email'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: 'Raison de suppression requise' }, { status: 400 })
    }

    const offre = await prisma.offre.findUnique({
      where: { id },
      include: {
        sousTraitant: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            nomSociete: true
          }
        },
        projet: {
          select: {
            id: true,
            titre: true,
            donneurOrdre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                nomSociete: true
              }
            }
          }
        }
      }
    })

    if (!offre) {
      return NextResponse.json({ error: 'Offre non trouvée' }, { status: 404 })
    }

    // Envoyer l'email de notification avant suppression
    try {
      await sendOffreRejectNotification({
        sousTraitantNom: offre.sousTraitant.nomSociete || `${offre.sousTraitant.prenom} ${offre.sousTraitant.nom}`,
        projetTitre: offre.projet.titre,
        donneurOrdreNom: offre.projet.donneurOrdre.nomSociete || `${offre.projet.donneurOrdre.prenom} ${offre.projet.donneurOrdre.nom}`,
        raisonRejet: reason.trim(),
        prixPropose: offre.prixPropose,
        delaiPropose: offre.delaiPropose
      }, offre.sousTraitant.email)
      
      console.log(`Email de suppression envoyé à ${offre.sousTraitant.email}`)
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de suppression:', emailError)
      // On continue même si l'email échoue
    }

    // Supprimer l'offre (cascade automatique pour les messages liés)
    await prisma.offre.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Offre supprimée avec succès et notification envoyée'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'offre' },
      { status: 500 }
    )
  }
}
