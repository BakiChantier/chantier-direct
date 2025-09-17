import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { uploadDocument } from '@/lib/cloudinary'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const { id: referenceId } = await context.params

    // Vérifier ownership de la référence
    const reference = await prisma.reference.findUnique({ include: { profile: true }, where: { id: referenceId } })
    if (!reference || reference.profile.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as unknown as File
    const title = (formData.get('title') as string) || null
    const description = (formData.get('description') as string) || null
    if (!file) return NextResponse.json({ success: false, error: 'Fichier requis' }, { status: 400 })

    const uploaded = await uploadDocument(file, 'references', user.id)

    const media = await prisma.referenceMedia.create({
      data: {
        referenceId,
        url: uploaded.url,
        publicId: uploaded.publicId,
        title,
        description,
      },
    })

    return NextResponse.json({ success: true, data: { media } })
  } catch (e) {
    console.error('Erreur lors de l\'upload', e)
    return NextResponse.json({ success: false, error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}


