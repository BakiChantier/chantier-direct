import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    if (user.role !== 'SOUS_TRAITANT') {
      return NextResponse.json(
        { error: 'Seuls les sous-traitants peuvent soumettre des offres' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      projetId,
      prixPropose,
      delaiPropose,
      message,
      experienceSimilaire,
      materielsDisponibles,
      equipeAssignee
    } = body

    // Validation des champs obligatoires
    if (!projetId || !prixPropose || !delaiPropose || !message?.trim()) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    if (prixPropose <= 0) {
      return NextResponse.json(
        { error: 'Le prix proposé doit être supérieur à 0' },
        { status: 400 }
      )
    }

    if (delaiPropose <= 0) {
      return NextResponse.json(
        { error: 'Le délai proposé doit être supérieur à 0' },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe et est ouvert
    const projet = await prisma.projet.findUnique({
      where: { id: projetId }
    })

    if (!projet) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    if (projet.status !== 'OUVERT') {
      return NextResponse.json(
        { error: 'Ce projet n\'accepte plus de nouvelles offres' },
        { status: 400 }
      )
    }

    // Vérifier que la date limite n'est pas dépassée
    if (new Date(projet.delai) <= new Date()) {
      return NextResponse.json(
        { error: 'La date limite de candidature est dépassée' },
        { status: 400 }
      )
    }

    // Vérifier que le prix proposé ne dépasse pas le budget maximum
    if (prixPropose > projet.prixMax) {
      return NextResponse.json(
        { error: `Le prix proposé ne peut pas dépasser le budget maximum de ${projet.prixMax.toLocaleString('fr-FR')} €` },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur n'a pas déjà soumis d'offre pour ce projet
    const existingOffre = await prisma.offre.findFirst({
      where: {
        projetId: projetId,
        sousTraitantId: user.id
      }
    })

    if (existingOffre) {
      return NextResponse.json(
        { error: 'Vous avez déjà soumis une offre pour ce projet' },
        { status: 400 }
      )
    }

    // Créer l'offre
    const offre = await prisma.offre.create({
      data: {
        projetId,
        sousTraitantId: user.id,
        prixPropose: parseFloat(prixPropose),
        delaiPropose: parseInt(delaiPropose),
        message: message.trim(),
        experienceSimilaire: experienceSimilaire?.trim() || null,
        materielsDisponibles: materielsDisponibles?.trim() || null,
        equipeAssignee: equipeAssignee?.trim() || null,
        status: 'EN_ATTENTE'
      },
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
            donneurOrdreId: true
          }
        }
      }
    })

    // Envoyer un message automatique avec l'offre
    await prisma.message.create({
      data: {
        projetId,
        offreId: offre.id,
        expediteurId: user.id,
        destinataireId: projet.donneurOrdreId,
        contenu: `Nouvelle offre soumise pour le projet "${projet.titre}":\n\nPrix proposé: ${prixPropose.toLocaleString('fr-FR')} €\nDélai proposé: ${delaiPropose} jours\n\nMessage:\n${message}`
      }
    })

    console.log('Offre créée:', offre.id)

    return NextResponse.json({
      message: 'Offre soumise avec succès',
      offre
    })

  } catch (error) {
    console.error('Erreur soumission offre:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la soumission de l\'offre' },
      { status: 500 }
    )
  }
} 