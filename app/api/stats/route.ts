import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      donneurs,
      sousTraitants,
      projetsEnCours,
      projetsTermines
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'DONNEUR_ORDRE', isActive: true } }),
      prisma.user.count({ where: { role: 'SOUS_TRAITANT', isActive: true } }),
      prisma.projet.count({ where: { status: { in: ['OUVERT', 'EN_COURS'] } } }),
      prisma.projet.count({ where: { status: 'TERMINE' } })
    ])

    return NextResponse.json({
      success: true,
      data: { donneurs, sousTraitants, projetsEnCours, projetsTermines }
    })
  } catch (e) {
    console.error('Erreur stats publiques', e)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}


