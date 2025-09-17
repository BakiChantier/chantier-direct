import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

// Configuration du transporteur Zimbra OVH (réutilisation)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.ZIMBRA_HOST,
    port: parseInt(process.env.ZIMBRA_PORT || '587'),
    secure: process.env.ZIMBRA_SECURE === 'true',
    auth: {
      user: process.env.ZIMBRA_USER,
      pass: process.env.ZIMBRA_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

export async function POST(request: NextRequest) {
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
    const { contactId, subject, message } = body

    if (!contactId || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Récupérer le contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact non trouvé' }, { status: 404 })
    }

    // Configuration de l'email de réponse
    const transporter = createTransporter()

    const emailOptions = {
      from: `"${user.prenom} ${user.nom} - ${process.env.SITE_NAME || 'Chantier-Direct'}" <${process.env.ZIMBRA_USER}>`,
      to: contact.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Réponse à votre demande</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p>Bonjour <strong>${contact.prenom} ${contact.nom}</strong>,</p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  <strong>Référence de votre demande:</strong> #${contact.id.slice(-8).toUpperCase()}<br>
                  <strong>Sujet original:</strong> ${contact.sujet}
                </p>
              </div>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #1e40af;">
                <strong>Besoin d'aide supplémentaire ?</strong><br>
                N'hésitez pas à nous recontacter via notre <a href="${process.env.NEXTAUTH_URL}/contact" style="color: #dc2626;">formulaire de contact</a>
                ou par téléphone au <strong>01 23 45 67 89</strong>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>
              Cordialement,<br>
              <strong>${user.prenom} ${user.nom}</strong><br>
              ${process.env.SITE_NAME || 'Chantier-Direct'} - Plateforme de mise en relation BTP
            </p>
          </div>
        </div>
      `
    }

    // Envoi de l'email
    await transporter.sendMail(emailOptions)

    // Mise à jour du contact avec les notes admin
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        status: 'RESOLU',
        resolvedAt: new Date(),
        assignedTo: user.id,
        adminNotes: `Réponse envoyée par ${user.prenom} ${user.nom} le ${new Date().toLocaleString('fr-FR')}\n\nSujet: ${subject}\n\nMessage:\n${message}`
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Réponse envoyée avec succès'
    })

  } catch (error) {
    console.error('Erreur API reply contact:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
