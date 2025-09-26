import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendProjetNotification } from '@/lib/email';

interface ModerationData {
  action: 'VALIDATE' | 'REJECT';
  rejectionReason?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { action, rejectionReason }: ModerationData = await request.json();
    
    // Validation des données
    if (!action || !['VALIDATE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

    if (action === 'REJECT' && !rejectionReason?.trim()) {
      return NextResponse.json({ 
        error: 'Une raison de rejet est requise' 
      }, { status: 400 });
    }

    // Vérifier que le projet existe
    const projet = await prisma.projet.findUnique({
      where: { id: (await params).id },
      include: {
        donneurOrdre: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            nomSociete: true
          }
        }
      }
    });

    if (!projet) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Mettre à jour le statut de modération
    const updatedProjet = await prisma.projet.update({
      where: { id: (await params).id },
      data: {
        moderationStatus: action === 'VALIDATE' ? 'VALIDATED' : 'REJECTED',
        moderatedBy: user.id,
        moderatedAt: new Date(),
        rejectionReason: action === 'REJECT' ? rejectionReason : null
      },
      include: {
        donneurOrdre: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            nomSociete: true
          }
        },
        moderator: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    // Envoyer une notification email au donneur d'ordre
    try {
      await sendProjetNotification({
        donneurOrdre: {
          nom: updatedProjet.donneurOrdre.nom,
          prenom: updatedProjet.donneurOrdre.prenom || '',
          email: updatedProjet.donneurOrdre.email,
          nomSociete: updatedProjet.donneurOrdre.nomSociete || undefined
        },
        projet: {
          id: updatedProjet.id,
          titre: updatedProjet.titre,
          description: updatedProjet.description,
          adresseChantier: updatedProjet.adresseChantier,
          villeChantier: updatedProjet.villeChantier,
          prixMax: updatedProjet.prixMax || undefined
        },
        action: action === 'VALIDATE' ? 'accepte' : 'rejete'
      })
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de la notification email:', emailError)
      // On continue même si l'email échoue
    }

    return NextResponse.json({
      message: action === 'VALIDATE' ? 'Projet validé avec succès' : 'Projet rejeté avec succès',
      projet: updatedProjet
    });

  } catch (error) {
    console.error('Erreur lors de la modération:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modération du projet' },
      { status: 500 }
    );
  }
}
