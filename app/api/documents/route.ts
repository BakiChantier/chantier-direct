import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer les documents de l'utilisateur
    const documents = await prisma.document.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        type: true,
        fileName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        rejectedReason: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: documents
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    )
  }
} 