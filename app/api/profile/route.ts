import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

  try {
    const profile = await prisma.contractorProfile.findUnique({
      where: { userId: user.id },
      include: { references: { include: { media: true } } }
    })
    // Calcul dynamique des projets réalisés (terminés et acceptés pour ce sous-traitant)
    const completedProjects = await prisma.projet.count({
      where: {
        status: 'TERMINE',
        offres: { some: { sousTraitantId: user.id, status: 'ACCEPTEE' } }
      }
    })
    const emailPublic = profile?.emailPublic ?? user.email
    const merged = profile ? { ...profile, completedProjects, emailPublic } : { userId: user.id, completedProjects, emailPublic }
    return NextResponse.json({ success: true, data: { profile: merged } })
  } catch (e) {
    console.error('Erreur lors de la récupération du profil', e)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      displayName, bio, hourlyRate, websites,
      phonePublic, addressLine, city, postalCode, country,
    } = body || {}

    const profile = await prisma.contractorProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName, bio, hourlyRate, websites,
        phonePublic, addressLine, city, postalCode, country,
      },
      create: {
        userId: user.id,
        displayName, bio, hourlyRate, websites,
        phonePublic, addressLine, city, postalCode, country,
      }
    })

    return NextResponse.json({ success: true, data: { profile } })
  } catch (e) {
    console.error('Erreur lors de la mise à jour du profil', e)
    return NextResponse.json({ success: false, error: 'Requête invalide' }, { status: 400 })
  }
}


