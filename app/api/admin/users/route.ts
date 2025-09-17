import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await getCurrentUser(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      )
    }

    // Récupérer tous les utilisateurs (sauf les mots de passe)
    const users = await prisma.user.findMany({
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
        pays: true,
        nombreEmployes: true,
        expertises: true,
        noteGlobale: true,
        nombreEvaluations: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: users
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
} 