import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactReply } from '@/lib/email'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
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
    const { reponse } = body

    // Validation
    if (!reponse || reponse.trim().length === 0) {
      return NextResponse.json(
        { error: 'La réponse ne peut pas être vide' },
        { status: 400 }
      )
    }

    if (reponse.length > 2000) {
      return NextResponse.json(
        { error: 'La réponse ne peut pas dépasser 2000 caractères' },
        { status: 400 }
      )
    }

    const contactId = (await params).id

    // Récupérer la demande de contact
    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id: contactId }
    })

    if (!contactRequest) {
      return NextResponse.json(
        { error: 'Demande de contact non trouvée' },
        { status: 404 }
      )
    }

    if (contactRequest.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Cette demande est déjà fermée' },
        { status: 400 }
      )
    }

    // Mettre à jour la demande avec la réponse
    const updatedContactRequest = await prisma.contactRequest.update({
      where: { id: contactId },
      data: {
        reponse: reponse.trim(),
        reponseAt: new Date(),
        reponseBy: user.id,
        status: 'REPLIED',
        updatedAt: new Date()
      }
    })

    // Envoyer l'email de réponse au client
    try {
      await sendContactReply({
        nom: contactRequest.nom,
        email: contactRequest.email,
        sujet: contactRequest.sujet,
        messageOriginal: contactRequest.message,
        reponse: reponse.trim(),
        reponseBy: user.nom
      })
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de réponse:', emailError)
      
      // Mettre à jour le statut pour indiquer que la réponse n'a pas pu être envoyée
      await prisma.contactRequest.update({
        where: { id: contactId },
        data: {
          status: 'READ', // Marquer comme lu mais pas envoyé
          reponse: reponse.trim(),
          reponseAt: new Date(),
          reponseBy: user.id,
          updatedAt: new Date()
        }
      })

      return NextResponse.json(
        { 
          message: 'Réponse sauvegardée mais l\'email n\'a pas pu être envoyé. Veuillez contacter le client manuellement.',
          error: 'Email non envoyé'
        },
        { status: 207 } // 207 Multi-Status pour indiquer succès partiel
      )
    }

    return NextResponse.json({
      message: 'Réponse envoyée avec succès',
      contactRequest: updatedContactRequest
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la réponse:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la réponse' },
      { status: 500 }
    )
  }
}
