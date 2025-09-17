import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { deleteDocument } from '@/lib/cloudinary'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification admin
    const user = await getCurrentUser(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher un admin de se désactiver lui-même
    if (id === user.id && body.isActive === false) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas désactiver votre propre compte' },
        { status: 400 }
      )
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        telephone: body.telephone,
        nomSociete: body.nomSociete,
        adresse: body.adresse,
        ville: body.ville,
        codePostal: body.codePostal,
        isActive: body.isActive
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        nomSociete: true,
        role: true,
        isActive: true,
        telephone: true,
        adresse: true,
        ville: true,
        codePostal: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification admin
    const currentUser = await getCurrentUser(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher un admin de se désactiver lui-même
    if (id === currentUser.id && body.isActive === false) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas désactiver votre propre compte' },
        { status: 400 }
      )
    }

    // Gestion des rôles - restrictions
    if (body.role && body.role !== existingUser.role) {
      // PERSONNE ne peut modifier le rôle d'un SUPER_ADMIN (même pas les autres SUPER_ADMIN)
      if (existingUser.role === 'SUPER_ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Le rôle Super Admin ne peut pas être modifié' },
          { status: 403 }
        )
      }

      // Seul un SUPER_ADMIN peut promouvoir en SUPER_ADMIN
      if (body.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Seul un Super Admin peut promouvoir des utilisateurs en Super Admin' },
          { status: 403 }
        )
      }

      // Un admin ne peut pas se rétrograder lui-même
      if (id === currentUser.id && (body.role === 'SOUS_TRAITANT' || body.role === 'DONNEUR_ORDRE')) {
        return NextResponse.json(
          { success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' },
          { status: 400 }
        )
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
      nom: body.nom,
      prenom: body.prenom || null,
      email: body.email,
      telephone: body.telephone,
      nomSociete: body.nomSociete || null,
      adresse: body.adresse,
      ville: body.ville,
      codePostal: body.codePostal,
      isActive: body.isActive,
      role: body.role || existingUser.role
    }

    // Ajouter les champs spécifiques aux sous-traitants
    if (existingUser.role === 'SOUS_TRAITANT' || body.role === 'SOUS_TRAITANT') {
      if (body.nombreEmployes !== undefined) {
        updateData.nombreEmployes = body.nombreEmployes
      }
      if (body.expertises !== undefined) {
        updateData.expertises = body.expertises
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        nomSociete: true,
        role: true,
        isActive: true,
        telephone: true,
        adresse: true,
        ville: true,
        codePostal: true,
        nombreEmployes: true,
        expertises: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification admin
    const user = await getCurrentUser(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Récupérer l'utilisateur avec toutes ses relations
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        documents: true,
        projets: {
          include: {
            images: true,
            offres: {
              include: {
                messages: true
              }
            },
            evaluations: true
          }
        },
        offres: {
          include: {
            messages: true
          }
        },
        evaluations: true,
        evalueDonne: true,
        messagesEnvoyes: true,
        messagesRecus: true,
        contractorProfile: {
          include: {
            references: {
              include: {
                media: true
              }
            }
          }
        },
        assignedContacts: true
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher un admin de se supprimer lui-même
    if (id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    console.log(`Suppression complète de l'utilisateur ${existingUser.email} (${existingUser.role})`)

    const deletedStats = {
      documents: 0,
      cloudinaryFiles: 0,
      projets: 0,
      projectImages: 0,
      offres: 0,
      messages: 0,
      evaluations: 0,
      references: 0,
      referenceMedia: 0,
      contacts: 0
    }

    // 1. Supprimer les documents Cloudinary de l'utilisateur
    if (existingUser.documents.length > 0) {
      console.log(`Suppression de ${existingUser.documents.length} documents Cloudinary`)
      for (const doc of existingUser.documents) {
        if (doc.publicId) {
          try {
            await deleteDocument(doc.publicId)
            deletedStats.cloudinaryFiles++
          } catch (error) {
            console.error(`Erreur suppression Cloudinary ${doc.publicId}:`, error)
          }
        }
      }
      deletedStats.documents = existingUser.documents.length
    }

    // 2. Si c'est un DONNEUR_ORDRE, supprimer ses projets et tout ce qui va avec
    if (existingUser.role === 'DONNEUR_ORDRE' && existingUser.projets.length > 0) {
      console.log(`Suppression de ${existingUser.projets.length} projets du donneur d'ordre`)
      
      for (const projet of existingUser.projets) {
        // Supprimer les images de projet de Cloudinary
        if (projet.images.length > 0) {
          console.log(`Suppression de ${projet.images.length} images du projet ${projet.titre}`)
          for (const image of projet.images) {
            if (image.publicId) {
              try {
                await deleteDocument(image.publicId)
                deletedStats.cloudinaryFiles++
              } catch (error) {
                console.error(`Erreur suppression image projet ${image.publicId}:`, error)
              }
            }
          }
          deletedStats.projectImages += projet.images.length
        }

        // Compter les messages des offres
        for (const offre of projet.offres) {
          deletedStats.messages += offre.messages.length
        }
        deletedStats.offres += projet.offres.length
        deletedStats.evaluations += projet.evaluations.length
      }
      deletedStats.projets = existingUser.projets.length
    }

    // 3. Si c'est un SOUS_TRAITANT, gérer ses offres et profil
    if (existingUser.role === 'SOUS_TRAITANT') {
      console.log(`Suppression des données du sous-traitant`)
      
      // Compter les messages des offres
      for (const offre of existingUser.offres) {
        deletedStats.messages += offre.messages.length
      }
      deletedStats.offres = existingUser.offres.length

      // Supprimer les médias des références du profil contracteur
      if (existingUser.contractorProfile) {
        for (const reference of existingUser.contractorProfile.references) {
          if (reference.media.length > 0) {
            console.log(`Suppression de ${reference.media.length} médias de référence`)
            for (const media of reference.media) {
              if (media.publicId) {
                try {
                  await deleteDocument(media.publicId)
                  deletedStats.cloudinaryFiles++
                } catch (error) {
                  console.error(`Erreur suppression média référence ${media.publicId}:`, error)
                }
              }
            }
            deletedStats.referenceMedia += reference.media.length
          }
        }
        deletedStats.references = existingUser.contractorProfile.references.length
      }
    }

    // 4. Compter les évaluations et messages
    deletedStats.evaluations += existingUser.evaluations.length + existingUser.evalueDonne.length
    deletedStats.messages += existingUser.messagesEnvoyes.length + existingUser.messagesRecus.length

    // 5. Compter les contacts assignés (pour admins)
    deletedStats.contacts = existingUser.assignedContacts.length

    // 6. Supprimer l'utilisateur (Prisma cascade s'occupera du reste)
    await prisma.user.delete({
      where: { id }
    })

    console.log('Statistiques de suppression:', deletedStats)

    return NextResponse.json({
      success: true,
      message: `Utilisateur ${existingUser.email} supprimé avec succès`,
      deletedStats
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
} 