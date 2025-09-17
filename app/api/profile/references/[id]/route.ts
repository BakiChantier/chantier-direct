import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { deleteDocument } from '@/lib/cloudinary'

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

  const { id } = await context.params

  // Charger la référence et vérifier ownership
  const ref = await prisma.reference.findUnique({ where: { id }, include: { profile: true, media: true } })
  if (!ref || ref.profile.userId !== user.id) return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })

  // Supprimer d'abord les médias de Cloudinary
  if (ref.media && ref.media.length > 0) {
    for (const m of ref.media) {
      if (m.publicId) {
        try { await deleteDocument(m.publicId) } catch {}
      }
    }
  }

  // Supprimer en base (cascade sur media)
  await prisma.referenceMedia.deleteMany({ where: { referenceId: id } })
  await prisma.reference.delete({ where: { id } })

  return NextResponse.json({ success: true })
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  const { title, description } = body || {}

  const ref = await prisma.reference.findUnique({ where: { id }, include: { profile: true } })
  if (!ref || ref.profile.userId !== user.id) {
    return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })
  }

  const updated = await prisma.reference.update({
    where: { id },
    data: {
      title: typeof title === 'string' ? title : ref.title,
      description: typeof description === 'string' ? description : ref.description,
    },
  })

  return NextResponse.json({ success: true, data: { reference: updated } })
}


