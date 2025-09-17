import { NextRequest, NextResponse } from 'next/server'
import { uploadDocument, validateFile } from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { DocumentType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Parser les données du formulaire
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as DocumentType

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    if (!documentType) {
      return NextResponse.json(
        { success: false, error: 'Type de document requis' },
        { status: 400 }
      )
    }

    // Valider le fichier
    const validation = validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Vérifier si un document de ce type existe déjà pour cet utilisateur
    const existingDocument = await prisma.document.findFirst({
      where: {
        userId: user.id,
        type: documentType
      }
    })

    // Uploader vers Cloudinary
    const uploadResult = await uploadDocument(
      file,
      `documents/${user.role.toLowerCase()}`,
      user.id
    )

    // Si un document existait, le supprimer de la base de données (Cloudinary garde l'historique)
    if (existingDocument) {
      await prisma.document.delete({
        where: { id: existingDocument.id }
      })
    }

    // Créer l'enregistrement en base de données
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        type: documentType,
        fileName: uploadResult.originalFilename,
        fileUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        status: document.status,
        type: document.type
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'upload du document' },
      { status: 500 }
    )
  }
} 