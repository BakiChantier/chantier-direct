import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { status, adminNotes, assignedTo, priority } = body

    const updateData: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
    
    if (status) {
      updateData.status = status
      if (status === 'RESOLU' || status === 'FERME') {
        updateData.resolvedAt = new Date()
      }
    }
    
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (priority !== undefined) updateData.priority = priority

    const contact = await prisma.contact.update({
      where: { id: (await params).id },
      data: updateData,
      include: {
        assignedAdmin: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    })

    return NextResponse.json({ contact })

  } catch (error) {
    console.error('Erreur API update contact:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé - Super Admin requis' }, { status: 403 })
    }

    await prisma.contact.delete({
      where: { id: (await params).id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur API delete contact:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
