import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { uploadDocument, deleteDocument } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as unknown as File
    if (!file) return NextResponse.json({ success: false, error: 'Fichier requis' }, { status: 400 })

    // S'assurer d'avoir un profil
    const profile = await prisma.contractorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    })

    // Supprimer l'ancien avatar si présent
    if (profile.avatarPublicId) {
      try { await deleteDocument(profile.avatarPublicId) } catch {}
    }

    const uploaded = await uploadDocument(file, 'avatars', user.id)

    const updated = await prisma.contractorProfile.update({
      where: { userId: user.id },
      data: { avatarUrl: uploaded.url, avatarPublicId: uploaded.publicId }
    })

    return NextResponse.json({ success: true, data: { profile: updated } })
  } catch (e) {
    console.error('Erreur upload avatar:', e)
    const msg = e instanceof Error ? e.message : 'Erreur upload avatar'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

  try {
    const profile = await prisma.contractorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!profile?.avatarPublicId) {
      return NextResponse.json({ success: false, error: 'Aucun avatar à supprimer' }, { status: 404 })
    }

    // Supprimer l'avatar de Cloudinary
    try { 
      await deleteDocument(profile.avatarPublicId) 
    } catch (e) {
      console.warn('Erreur suppression Cloudinary:', e)
    }

    // Mettre à jour la base de données
    const updated = await prisma.contractorProfile.update({
      where: { userId: user.id },
      data: { avatarUrl: null, avatarPublicId: null }
    })

    return NextResponse.json({ success: true, data: { profile: updated } })
  } catch (e) {
    console.error('Erreur suppression avatar:', e)
    const msg = e instanceof Error ? e.message : 'Erreur suppression avatar'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}


