import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

  const params = await context.params
  const referenceId = params.id

  const { url, publicId, title, description } = await request.json()
  if (!url) return NextResponse.json({ success: false, error: 'URL requise' }, { status: 400 })

  // Vérifier ownership
  const ref = await prisma.reference.findUnique({
    where: { id: referenceId },
    include: { profile: true }
  })
  if (!ref || ref.profile.userId !== user.id) return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })

  const media = await prisma.referenceMedia.create({
    data: { referenceId, url, publicId, title, description }
  })
  return NextResponse.json({ success: true, data: { media } })
}


