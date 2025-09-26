import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { sendNouveauProjetNotification, sendNouveauProjetAdminNotification } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !hasRole(user, Role.DONNEUR_ORDRE)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const moderationStatus = searchParams.get('moderationStatus');

    // Construire le filtre
    const where: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
      donneurOrdreId: user.id
    };

    if (status) {
      where.status = status;
    }

    if (moderationStatus) {
      where.moderationStatus = moderationStatus;
    }

    // Récupérer les projets du donneur d'ordre
    const projets = await prisma.projet.findMany({
      where,
      include: {
        _count: {
          select: {
            offres: true
          }
        },
        images: {
          take: 1 // Première image pour l'aperçu
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ projets });

  } catch (error) {
    console.error('Erreur lors de la récupération des projets du donneur d\'ordre:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || !hasRole(user, Role.DONNEUR_ORDRE)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validation des données requises
    if (!data.titre || !data.description || !data.typeChantier || data.typeChantier.length === 0) {
      return NextResponse.json({ error: 'Titre, description et types de chantier sont requis' }, { status: 400 });
    }

    // Validation du prix maximum (seulement si pas d'enchère libre)
    if (!data.isEnchereLibre && (!data.prixMax || data.prixMax <= 0)) {
      return NextResponse.json({ error: 'Prix maximum invalide' }, { status: 400 });
    }

    if (!data.dureeEstimee || data.dureeEstimee <= 0) {
      return NextResponse.json({ error: 'Durée estimée invalide' }, { status: 400 });
    }

    // Créer le projet
    const projet = await prisma.projet.create({
      data: ({
        donneurOrdreId: user.id,
        titre: data.titre,
        description: data.description,
        typeChantier: data.typeChantier,
        prixMax: data.isEnchereLibre ? null : data.prixMax,
        isEnchereLibre: data.isEnchereLibre || false,
        dureeEstimee: data.dureeEstimee,
        adresseChantier: data.adresseChantier,
        villeChantier: data.villeChantier,
        codePostalChantier: data.codePostalChantier,
        departement: data.departement || null,
        dateDebut: new Date(data.dateDebut),
        dateFin: new Date(data.dateFin),
        delai: new Date(data.delai),
        requisTechniques: data.requisTechniques || null,
        materiaux: data.materiaux || null,
        acces: data.acces || null,
        infosAdditionnelles: data.infosAdditionnelles ? JSON.stringify(data.infosAdditionnelles) : null,
        externalFilesLink: data.externalFilesLink || null,
        // Le statut de modération est PENDING par défaut
      }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      include: {
        donneurOrdre: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            nomSociete: true
          }
        }
      }
    });

    // Envoyer des notifications aux sous-traitants correspondants
    try {
      // Trouver les sous-traitants qui ont des expertises correspondantes
      const sousTraitants = await prisma.user.findMany({
        where: {
          role: 'SOUS_TRAITANT',
          isActive: true,
          expertises: {
            hasSome: data.typeChantier
          }
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          nomSociete: true
        }
      })

      // Envoyer les notifications en parallèle (limité à 10 pour éviter le spam)
      const notificationsPromises = sousTraitants.slice(0, 10).map(sousTraitant =>
        sendNouveauProjetNotification({
          donneurOrdre: {
            nom: user.nom,
            prenom: user.prenom || '',
            nomSociete: user.nomSociete || undefined
          },
          projet: {
            id: projet.id,
            titre: projet.titre,
            description: projet.description,
            adresseChantier: projet.adresseChantier,
            villeChantier: projet.villeChantier,
            prixMax: projet.prixMax,
            isEnchereLibre: projet.isEnchereLibre,
            typeChantier: data.typeChantier
          },
          sousTraitant: {
            nom: sousTraitant.nom,
            prenom: sousTraitant.prenom || '',
            email: sousTraitant.email
          }
        }).catch(error => {
          console.error(`Erreur notification nouveau projet pour ${sousTraitant.email}:`, error)
        })
      )

      await Promise.all(notificationsPromises)
      console.log(`Notifications envoyées à ${Math.min(sousTraitants.length, 10)} sous-traitants`)
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des notifications de nouveau projet:', emailError)
      // On continue même si les emails échouent
    }

    // Envoyer une notification à l'admin pour validation
    try {
      await sendNouveauProjetAdminNotification({
        donneurOrdre: {
          nom: user.nom,
          prenom: user.prenom || '',
          nomSociete: user.nomSociete || undefined,
          email: user.email,
          telephone: ''
        },
        projet: {
          id: projet.id,
          titre: projet.titre,
          description: projet.description,
          typeChantier: data.typeChantier,
          prixMax: projet.prixMax,
          isEnchereLibre: projet.isEnchereLibre,
          dureeEstimee: projet.dureeEstimee,
          adresseChantier: projet.adresseChantier,
          villeChantier: projet.villeChantier,
          dateDebut: projet.dateDebut,
          dateFin: projet.dateFin,
          delai: projet.delai
        }
      })
      console.log('Notification de nouveau projet envoyée à l\'admin')
    } catch (adminEmailError) {
      console.error('Erreur lors de l\'envoi de la notification à l\'admin:', adminEmailError)
      // On continue même si l'email admin échoue
    }

    return NextResponse.json({ 
      success: true, 
      projet 
    });

  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}