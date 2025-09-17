import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Créer une référence (sans médias) ou lister
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
  const refs = await prisma.reference.findMany({
    where: { profile: { userId: user.id } },
    include: { media: true }
  })
  return NextResponse.json({ success: true, data: { references: refs } })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

  const body = await request.json()
  const { title, description } = body || {}
  if (!title) return NextResponse.json({ success: false, error: 'Titre requis' }, { status: 400 })

  const profile = await prisma.contractorProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id }
  })

  const ref = await prisma.reference.create({
    data: { profileId: profile.id, title, description }
  })
  return NextResponse.json({ success: true, data: { reference: ref } })
}


