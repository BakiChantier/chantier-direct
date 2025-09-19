import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions admin
    const user = await getCurrentUser(request)
    
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    // Validation du statut
    const validStatuses = ['PENDING', 'READ', 'REPLIED', 'CLOSED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    const contactId = (await params).id

    // Vérifier que la demande existe
    const existingRequest = await prisma.contactRequest.findUnique({
      where: { id: contactId }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Demande de contact non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut
    const updatedContactRequest = await prisma.contactRequest.update({
      where: { id: contactId },
      data: {
        status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Statut mis à jour avec succès',
      contactRequest: updatedContactRequest
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions admin
    const user = await getCurrentUser(request)
    
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const contactId = (await params).id

    // Vérifier que la demande existe
    const existingRequest = await prisma.contactRequest.findUnique({
      where: { id: contactId }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Demande de contact non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer la demande
    await prisma.contactRequest.delete({
      where: { id: contactId }
    })

    return NextResponse.json({
      message: 'Demande de contact supprimée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
