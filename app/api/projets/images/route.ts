import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadDocument, deleteDocument } from '@/lib/cloudinary'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.role !== 'DONNEUR_ORDRE') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projetId = formData.get('projetId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string || 'PHOTO'

    if (!file || !projetId) {
      return NextResponse.json({ error: 'Fichier et ID projet requis' }, { status: 400 })
    }

    // Vérifier que le projet appartient à l'utilisateur
    const projet = await prisma.projet.findFirst({
      where: {
        id: projetId,
        donneurOrdreId: user.id
      }
    })

    if (!projet) {
      return NextResponse.json({ error: 'Projet non trouvé ou accès non autorisé' }, { status: 404 })
    }

    // Vérifier le nombre d'images existantes
    const existingImagesCount = await prisma.projectImage.count({
      where: { projetId }
    })

    if (existingImagesCount >= 10) {
      return NextResponse.json({ error: 'Limite de 10 images par projet atteinte' }, { status: 400 })
    }

    // Upload vers Cloudinary
    const uploadResult = await uploadDocument(file, 'project-images', user.id)

    // Sauvegarder en base
    const projectImage = await prisma.projectImage.create({
      data: {
        projetId,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        title: title || file.name,
        description: description || null,
        type,
        order: existingImagesCount
      }
    })

    return NextResponse.json({
      success: true,
      image: projectImage
    })

  } catch (error) {
    console.error('Erreur upload image projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.role !== 'DONNEUR_ORDRE') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json({ error: 'ID image requis' }, { status: 400 })
    }

    // Récupérer l'image et vérifier les permissions
    const projectImage = await prisma.projectImage.findFirst({
      where: { id: imageId },
      include: {
        projet: {
          select: { donneurOrdreId: true }
        }
      }
    })

    if (!projectImage || projectImage.projet.donneurOrdreId !== user.id) {
      return NextResponse.json({ error: 'Image non trouvée ou accès non autorisé' }, { status: 404 })
    }

    // Supprimer de Cloudinary
    if (projectImage.publicId) {
      await deleteDocument(projectImage.publicId)
    }

    // Supprimer de la base
    await prisma.projectImage.delete({
      where: { id: imageId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur suppression image projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
