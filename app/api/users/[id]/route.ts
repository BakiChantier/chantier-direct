import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    let userId = params.id as unknown as string
    if (typeof userId !== 'string') {
      userId = String(userId)
    }
    // Nettoyer les cas [object Object]
    if (userId && userId.includes('[object Object]')) {
      return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 })
    }

    // Récupérer les informations publiques de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        nomSociete: true,
        telephone: true,
        adresse: true,
        ville: true,
        codePostal: true,
        pays: true,
        nombreEmployes: true,
        expertises: true,
        autresExpertises: true,
        noteGlobale: true,
        nombreEvaluations: true,
        createdAt: true,
        contractorProfile: {
          select: {
            displayName: true,
            bio: true,
            hourlyRate: true,
            completedProjects: true,
            websites: true,
            phonePublic: true,
            emailPublic: true,
            addressLine: true,
            city: true,
            postalCode: true,
            country: true,
            verificationStatus: true,
            avatarUrl: true,
            avatarPublicId: true,
            references: {
              select: {
                id: true,
                title: true,
                description: true,
                media: {
                  select: { id: true, url: true, title: true, description: true }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { user }
    })

  } catch (error) {
    console.error('Erreur récupération utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
