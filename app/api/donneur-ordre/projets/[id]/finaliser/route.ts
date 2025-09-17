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
    const { 
      noteQualite, 
      noteDelai, 
      noteCommunication, 
      commentaire, 
      recommande 
    } = body

    // Validation des données
    if (!noteQualite || !noteDelai || !noteCommunication) {
      return NextResponse.json(
        { error: 'Toutes les notes sont requises' },
        { status: 400 }
      )
    }

    if (noteQualite < 1 || noteQualite > 5 || 
        noteDelai < 1 || noteDelai > 5 || 
        noteCommunication < 1 || noteCommunication > 5) {
      return NextResponse.json(
        { error: 'Les notes doivent être entre 1 et 5' },
        { status: 400 }
      )
    }

    if (!commentaire || commentaire.trim().length < 10) {
      return NextResponse.json(
        { error: 'Un commentaire d\'au moins 10 caractères est requis' },
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
        },
        offres: {
          where: { status: 'ACCEPTEE' },
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

    if (projet.status !== 'EN_COURS') {
      return NextResponse.json(
        { error: 'Le projet doit être en cours pour être finalisé' },
        { status: 400 }
      )
    }

    if (projet.offres.length === 0) {
      return NextResponse.json(
        { error: 'Aucun sous-traitant sélectionné pour ce projet' },
        { status: 400 }
      )
    }

    const sousTraitant = projet.offres[0].sousTraitant

    // Calculer la note globale
    const noteGlobale = (noteQualite + noteDelai + noteCommunication) / 3

    // Transaction pour tout faire en une fois
    await prisma.$transaction(async (tx) => {
      // 1. Créer l'évaluation
      await tx.evaluation.create({
        data: {
          projetId: projetId,
          evaluateurId: user.id,
          evalueId: sousTraitant.id,
          noteQualite,
          noteDelai,
          noteCommunication,
          noteGlobale,
          commentaire: commentaire.trim(),
          recommande: recommande ?? true
        }
      })

      // 2. Mettre à jour le statut du projet
      await tx.projet.update({
        where: { id: projetId },
        data: { status: 'TERMINE' }
      })

      // 3. Mettre à jour les statistiques du sous-traitant
      const evaluations = await tx.evaluation.findMany({
        where: { evalueId: sousTraitant.id }
      })

      const nouvelleNoteGlobale = evaluations.reduce((sum, evaluation) => sum + evaluation.noteGlobale, 0) / evaluations.length
      const nombreEvaluations = evaluations.length

      await tx.user.update({
        where: { id: sousTraitant.id },
        data: {
          noteGlobale: nouvelleNoteGlobale,
          nombreEvaluations
        }
      })

      // 4. Envoyer un message de notification au sous-traitant
      await tx.message.create({
        data: {
          projetId: projetId,
          offreId: projet.offres[0].id,
          expediteurId: user.id,
          destinataireId: sousTraitant.id,
          contenu: `Bonjour,\n\nLe projet "${projet.titre}" a été marqué comme terminé.\n\nNous vous remercions pour votre travail et espérons avoir l'occasion de collaborer à nouveau sur de futurs projets.\n\nCordialement,\nL'équipe ${projet.donneurOrdre.nomSociete || user.nom}`
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Projet finalisé avec succès',
      data: {
        projetId,
        sousTraitant: {
          id: sousTraitant.id,
          nom: sousTraitant.nom,
          prenom: sousTraitant.prenom,
          nomSociete: sousTraitant.nomSociete
        },
        evaluation: {
          noteGlobale,
          commentaire: commentaire.trim()
        }
      }
    })

  } catch (error) {
    console.error('Erreur finalisation projet:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
