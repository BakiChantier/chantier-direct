import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
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

    // Vérifier les permissions (donneur d'ordre ou admin)
    if (user.role !== 'DONNEUR_ORDRE' && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    const {
      titre,
      description,
      typeChantier,
      prixMax,
      dureeEstimee,
      adresseChantier,
      villeChantier,
      codePostalChantier,
      dateDebut,
      dateFin,
      delai,
      requisTechniques,
      materiaux,
      acces,
      infosAdditionnelles
    } = body

    // Validation des champs obligatoires
    if (!titre || !description || !typeChantier || typeChantier.length === 0) {
      return NextResponse.json(
        { error: 'Les champs titre, description et type de chantier sont obligatoires' },
        { status: 400 }
      )
    }

    if (!prixMax || prixMax <= 0) {
      return NextResponse.json(
        { error: 'Le prix maximum doit être supérieur à 0' },
        { status: 400 }
      )
    }

    if (!dureeEstimee || dureeEstimee <= 0) {
      return NextResponse.json(
        { error: 'La durée estimée doit être supérieure à 0' },
        { status: 400 }
      )
    }

    if (!adresseChantier || !villeChantier || !codePostalChantier) {
      return NextResponse.json(
        { error: 'L\'adresse du chantier est obligatoire' },
        { status: 400 }
      )
    }

    if (!dateDebut || !dateFin || !delai) {
      return NextResponse.json(
        { error: 'Les dates sont obligatoires' },
        { status: 400 }
      )
    }

    // Validation des dates
    const dateDebutObj = new Date(dateDebut)
    const dateFinObj = new Date(dateFin)
    const delaiObj = new Date(delai)
    const now = new Date()

    if (delaiObj <= now) {
      return NextResponse.json(
        { error: 'La date limite de candidature doit être dans le futur' },
        { status: 400 }
      )
    }

    if (dateDebutObj <= delaiObj) {
      return NextResponse.json(
        { error: 'La date de début doit être après la date limite de candidature' },
        { status: 400 }
      )
    }

    if (dateFinObj <= dateDebutObj) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      )
    }

    // Convertir les informations additionnelles en texte
    let infosAdditionnellesText = ''
    if (infosAdditionnelles && typeof infosAdditionnelles === 'object') {
      const infosArray = Object.entries(infosAdditionnelles)
        .filter(([key, value]) => key && value)
        .map(([key, value]) => `${key}: ${value}`)
      infosAdditionnellesText = infosArray.join('\n')
    }

    // Créer le projet
    const projet = await prisma.projet.create({
      data: {
        donneurOrdreId: user.id,
        titre,
        description,
        typeChantier,
        prixMax: parseFloat(prixMax),
        dureeEstimee: parseInt(dureeEstimee),
        status: 'OUVERT',
        adresseChantier,
        villeChantier,
        codePostalChantier,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        delai: new Date(delai),
        requisTechniques: requisTechniques || '',
        materiaux: materiaux || '',
        acces: acces || '',
        // Stocker les infos additionnelles dans un champ text séparé
        infosAdditionnelles: infosAdditionnellesText
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
        _count: {
          select: {
            offres: true
          }
        }
      }
    })

    console.log('Projet créé:', projet.id)

    return NextResponse.json({
      id: projet.id,
      message: 'Projet créé avec succès',
      projet
    })

  } catch (error) {
    console.error('Erreur création projet:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du projet' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Pour les admins, on peut voir tous les projets
    // Pour les donneurs d'ordres, seulement leurs projets
    const whereClause = isAdmin(user) ? {} : { donneurOrdreId: user.id }

    const projets = await prisma.projet.findMany({
      where: whereClause,
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
        _count: {
          select: {
            offres: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ projets })

  } catch (error) {
    console.error('Erreur récupération projets:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 