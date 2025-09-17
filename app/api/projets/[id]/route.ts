import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteDocument } from '@/lib/cloudinary'
import jwt from 'jsonwebtoken'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projetId } = await params
    console.log('Recherche du projet avec ID:', projetId)

    // Vérifier que l'ID est valide (format MongoDB ObjectId)
    if (!projetId || projetId.length !== 24) {
      console.log('ID invalide:', projetId)
      return NextResponse.json({ error: 'ID de projet invalide' }, { status: 400 })
    }

    const projet = await prisma.projet.findUnique({
      where: { id: projetId },
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
        offres: {
          include: {
            sousTraitant: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                nomSociete: true
              }
            }
          }
        },
        images: true
      }
    })

    if (!projet) {
      console.log('Aucun projet trouvé avec cet ID:', projetId)
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    console.log('Projet trouvé:', projet.titre)

    // Vérifier si l'utilisateur actuel a déjà postulé (si connecté)
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    let userAlreadyApplied = false

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        const existingOffre = await prisma.offre.findFirst({
          where: {
            projetId: projetId,
            sousTraitantId: decoded.userId
          }
        })
        userAlreadyApplied = !!existingOffre
      } catch (error) {
        // Token invalide, continuer sans authentification
        console.log('Token invalide:', error)
      }
    }

    return NextResponse.json({
      ...projet,
      userAlreadyApplied
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error)
    
    // Si c'est une erreur Prisma liée à l'ID
    if (error instanceof Error && error.message.includes('Invalid ObjectId')) {
      return NextResponse.json(
        { error: 'ID de projet invalide' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 })
    }

    const { id: projetId } = await params

    // Récupérer le projet avec toutes ses relations
    const projet = await prisma.projet.findUnique({
      where: { id: projetId },
      include: {
        images: true,
        offres: {
          include: {
            messages: true
          }
        },
        evaluations: true
      }
    })

    if (!projet) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est le donneur d'ordre du projet
    if (projet.donneurOrdreId !== user.id) {
      return NextResponse.json({ 
        error: 'Accès non autorisé. Seul le donneur d\'ordre peut supprimer ce projet' 
      }, { status: 403 })
    }

    // 1. Supprimer toutes les images de Cloudinary
    console.log(`Suppression de ${projet.images.length} images de Cloudinary...`)
    for (const image of projet.images) {
      if (image.publicId) {
        try {
          await deleteDocument(image.publicId)
          console.log(`Image supprimée de Cloudinary: ${image.publicId}`)
        } catch (error) {
          console.error(`Erreur lors de la suppression de l'image ${image.publicId}:`, error)
          // Continue même si une image ne peut pas être supprimée
        }
      }
    }

    // 2. Supprimer toutes les évaluations liées au projet
    if (projet.evaluations.length > 0) {
      await prisma.evaluation.deleteMany({
        where: { projetId: projetId }
      })
      console.log(`${projet.evaluations.length} évaluations supprimées`)
    }

    // 3. Supprimer tous les messages liés aux offres
    const messageIds = projet.offres.flatMap(offre => 
      offre.messages.map(msg => msg.id)
    )
    if (messageIds.length > 0) {
      await prisma.message.deleteMany({
        where: { id: { in: messageIds } }
      })
      console.log(`${messageIds.length} messages supprimés`)
    }

    // 4. Supprimer toutes les offres
    if (projet.offres.length > 0) {
      await prisma.offre.deleteMany({
        where: { projetId: projetId }
      })
      console.log(`${projet.offres.length} offres supprimées`)
    }

    // 5. Supprimer toutes les images du projet en base
    if (projet.images.length > 0) {
      await prisma.projectImage.deleteMany({
        where: { projetId: projetId }
      })
      console.log(`${projet.images.length} images supprimées de la base`)
    }

    // 6. Supprimer le projet lui-même
    await prisma.projet.delete({
      where: { id: projetId }
    })

    console.log(`Projet ${projetId} supprimé avec succès`)

    return NextResponse.json({ 
      success: true,
      message: 'Projet supprimé avec succès',
        deleted: {
          projet: 1,
          images: projet.images.length,
          offres: projet.offres.length,
          messages: messageIds.length,
          evaluations: projet.evaluations.length
        }
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}