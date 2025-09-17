import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// Configuration du transporteur Zimbra OVH
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.ZIMBRA_HOST, // ex: mail.votredomaine.com
    port: parseInt(process.env.ZIMBRA_PORT || '587'),
    secure: process.env.ZIMBRA_SECURE === 'true', // true pour 465, false pour autres ports
    auth: {
      user: process.env.ZIMBRA_USER, // ex: contact@votredomaine.com
      pass: process.env.ZIMBRA_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, prenom, email, telephone, entreprise, sujet, message, typeContact } = body

    // Validation des champs requis
    if (!nom || !prenom || !email || !sujet || !message || !typeContact) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // Sauvegarde en base de données
    const contact = await prisma.contact.create({
      data: {
        nom,
        prenom,
        email,
        telephone: telephone || null,
        entreprise: entreprise || null,
        sujet,
        message,
        typeContact,
        status: 'NOUVEAU'
      }
    })

    // Configuration de l'email
    const transporter = createTransporter()

    // Email de notification interne
    const adminEmailOptions = {
      from: `"${process.env.SITE_NAME || 'Chantier-Direct'}" <${process.env.ZIMBRA_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.ZIMBRA_USER,
      subject: `[${typeContact}] Nouvelle demande de contact : ${sujet}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Nouvelle demande de contact</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin-top: 0;">Informations du contact</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Type de demande:</td>
                  <td style="padding: 8px 0;">${typeContact}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Nom complet:</td>
                  <td style="padding: 8px 0;">${prenom} ${nom}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #dc2626;">${email}</a></td>
                </tr>
                ${telephone ? `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Téléphone:</td>
                  <td style="padding: 8px 0;">${telephone}</td>
                </tr>
                ` : ''}
                ${entreprise ? `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Entreprise:</td>
                  <td style="padding: 8px 0;">${entreprise}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Sujet:</td>
                  <td style="padding: 8px 0;">${sujet}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #374151; margin-top: 0;">Message</h3>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #1e40af;">
                <strong>ID de la demande:</strong> ${contact.id}<br>
                <strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      `
    }

    // Email de confirmation pour l'utilisateur
    const userEmailOptions = {
      from: `"${process.env.SITE_NAME || 'Chantier-Direct'}" <${process.env.ZIMBRA_USER}>`,
      to: email,
      subject: `Confirmation de réception - ${sujet}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Message bien reçu !</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
              
              <p>Nous avons bien reçu votre message concernant "<strong>${sujet}</strong>" et nous vous remercions de nous avoir contactés.</p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">Récapitulatif de votre demande</h3>
                <p><strong>Type de demande:</strong> ${typeContact}</p>
                <p><strong>Sujet:</strong> ${sujet}</p>
                <p><strong>Date d'envoi:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p><strong>Numéro de référence:</strong> #${contact.id.slice(-8).toUpperCase()}</p>
              </div>
              
              <p>Notre équipe examine votre demande et vous répondra dans les <strong>24 heures</strong> suivant la réception.</p>
              
              <p>Si votre demande est urgente, vous pouvez également nous contacter directement par téléphone au <strong>01 23 45 67 89</strong>.</p>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #1e40af;">
                <strong>Besoin d'aide ?</strong><br>
                Consultez notre <a href="${process.env.NEXTAUTH_URL}/documentation" style="color: #dc2626;">documentation</a> 
                ou visitez notre <a href="${process.env.NEXTAUTH_URL}/annuaire" style="color: #dc2626;">annuaire des professionnels</a>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            <p>${process.env.SITE_NAME || 'Chantier-Direct'} - Plateforme de mise en relation BTP</p>
          </div>
        </div>
      `
    }

    // Envoi des emails
    try {
      await Promise.all([
        transporter.sendMail(adminEmailOptions),
        transporter.sendMail(userEmailOptions)
      ])
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      // On continue même si l'email échoue, le contact est sauvegardé
    }

    return NextResponse.json({
      success: true,
      message: 'Votre message a été envoyé avec succès',
      contactId: contact.id
    })

  } catch (error) {
    console.error('Erreur API contact:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
