import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export async function POST(
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
    const { action, rejectedReason } = body

    // Vérifier que le document existe
    const existingDocument = await prisma.document.findUnique({
      where: { id: id }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { success: false, error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'action est valide
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action invalide' },
        { status: 400 }
      )
    }

    // Si rejet, vérifier qu'une raison est fournie
    if (action === 'reject' && !rejectedReason?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Une raison de rejet est requise' },
        { status: 400 }
      )
    }

    // Mettre à jour le document
    const updatedDocument = await prisma.document.update({
      where: { id: id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        validatedBy: user.id,
        validatedAt: new Date(),
        rejectedReason: action === 'reject' ? rejectedReason : null
      },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            nomSociete: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedDocument,
      message: action === 'approve' 
        ? 'Document validé avec succès' 
        : 'Document rejeté avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la validation du document:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la validation du document' },
      { status: 500 }
    )
  }
} 