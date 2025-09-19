import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactNotification, ContactFormData } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, email, telephone, sujet, message }: ContactFormData = body

    // Validation des données
    if (!nom || !email || !sujet || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // Validation de la longueur des champs
    if (nom.length > 100) {
      return NextResponse.json(
        { error: 'Le nom ne peut pas dépasser 100 caractères' },
        { status: 400 }
      )
    }

    if (sujet.length > 200) {
      return NextResponse.json(
        { error: 'Le sujet ne peut pas dépasser 200 caractères' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Le message ne peut pas dépasser 2000 caractères' },
        { status: 400 }
      )
    }

    if (telephone && telephone.length > 20) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone ne peut pas dépasser 20 caractères' },
        { status: 400 }
      )
    }

    // Créer la demande de contact en base
    const contactRequest = await prisma.contactRequest.create({
      data: {
        nom: nom.trim(),
        email: email.trim().toLowerCase(),
        telephone: telephone?.trim() || null,
        sujet: sujet.trim(),
        message: message.trim(),
        status: 'PENDING'
      }
    })

    // Envoyer l'email de notification
    try {
      await sendContactNotification({
        nom: contactRequest.nom,
        email: contactRequest.email,
        telephone: contactRequest.telephone || undefined,
        sujet: contactRequest.sujet,
        message: contactRequest.message
      })
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError)
      // On continue même si l'email échoue, la demande est quand même sauvegardée
    }

    return NextResponse.json(
      { 
        message: 'Votre demande de contact a été envoyée avec succès. Nous vous répondrons dans les plus brefs délais.',
        id: contactRequest.id
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erreur lors de la création de la demande de contact:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
