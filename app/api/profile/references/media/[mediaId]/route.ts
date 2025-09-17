import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { deleteDocument } from '@/lib/cloudinary'

export async function DELETE(request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

  const { mediaId } = await context.params
  const media = await prisma.referenceMedia.findUnique({ where: { id: mediaId }, include: { reference: { include: { profile: true } } } })
  if (!media || media.reference.profile.userId !== user.id) return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })

  if (media.publicId) {
    try { await deleteDocument(media.publicId) } catch {}
  }
  await prisma.referenceMedia.delete({ where: { id: mediaId } })
  return NextResponse.json({ success: true })
}


