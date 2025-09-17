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

    const body = await request.json()
    const { projetId, offreId, destinataireId, contenu } = body

    // Validation des données
    if (!projetId || !offreId || !destinataireId || !contenu?.trim()) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier que l'offre existe et que l'utilisateur a le droit d'envoyer un message
    const offre = await prisma.offre.findUnique({
      where: { id: offreId },
      include: {
        projet: {
          include: {
            donneurOrdre: {
              select: { id: true }
            }
          }
        },
        sousTraitant: {
          select: { id: true }
        }
      }
    })

    if (!offre) {
      return NextResponse.json(
        { error: 'Offre non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur fait partie de la conversation (DO, ST ou ADMIN)
    const isDonneurOrdre = offre.projet.donneurOrdre.id === user.id
    const isSousTraitant = offre.sousTraitant.id === user.id
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

    if (!isDonneurOrdre && !isSousTraitant && !isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé à cette conversation' },
        { status: 403 }
      )
    }

    // Vérifier que le destinataire est valide
    let validDestinataire = false
    
    if (isAdmin) {
      // Les admins peuvent envoyer des messages aux deux parties
      validDestinataire = destinataireId === offre.sousTraitant.id || destinataireId === offre.projet.donneurOrdre.id
    } else if (isDonneurOrdre) {
      // DO peut envoyer au ST
      validDestinataire = offre.sousTraitant.id === destinataireId
    } else if (isSousTraitant) {
      // ST peut envoyer au DO
      validDestinataire = offre.projet.donneurOrdre.id === destinataireId
    }

    if (!validDestinataire) {
      return NextResponse.json(
        { error: 'Destinataire invalide' },
        { status: 400 }
      )
    }

    // Créer le message
    const nouveauMessage = await prisma.message.create({
      data: {
        projetId,
        offreId,
        expediteurId: user.id,
        destinataireId,
        contenu: contenu.trim()
      },
      include: {
        expediteur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: nouveauMessage
    })

  } catch (error) {
    console.error('Erreur envoi message:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 