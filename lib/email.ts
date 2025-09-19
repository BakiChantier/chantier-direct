import nodemailer from 'nodemailer'

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'ssl0.ovh.net',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
  requireTLS: true,
  tls: {
    rejectUnauthorized: false // Pour éviter les erreurs de certificat
  },
  auth: {
    user: process.env.CONTACT_EMAIL,
    pass: process.env.CONTACT_EMAIL_PASSWORD,
  },
})

// Configuration pour les réponses
const replyTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'ssl0.ovh.net',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  requireTLS: true,
  tls: {
    rejectUnauthorized: false // Pour éviter les erreurs de certificat
  },
  auth: {
    user: process.env.REPLY_EMAIL,
    pass: process.env.REPLY_EMAIL_PASSWORD,
  },
})

// Interface pour les données de contact
export interface ContactFormData {
  nom: string
  email: string
  telephone?: string
  sujet: string
  message: string
}

// Interface pour les données de réponse
export interface ContactReplyData {
  nom: string
  email: string
  sujet: string
  messageOriginal: string
  reponse: string
  reponseBy: string
}

// Interface pour les notifications d'offre
export interface OffreNotificationData {
  donneurOrdre: {
    nom: string
    prenom: string
    email: string
    nomSociete?: string
  }
  sousTraitant: {
    nom: string
    prenom: string
    email: string
    nomSociete?: string
  }
  projet: {
    id: string
    titre: string
    description: string
    adresseChantier: string
    villeChantier: string
  }
  offre: {
    id: string
    prix: number
    delai: number
    message?: string
  }
  action: 'nouvelle' | 'selectionnee' | 'rejetee'
}

// Interface pour les notifications de projet
export interface ProjetNotificationData {
  donneurOrdre: {
    nom: string
    prenom: string
    email: string
    nomSociete?: string
  }
  projet: {
    id: string
    titre: string
    description: string
    adresseChantier: string
    villeChantier: string
    prixMax?: number
  }
  action: 'accepte' | 'rejete'
}

// Interface pour les notifications de nouveau projet
export interface NouveauProjetNotificationData {
  donneurOrdre: {
    nom: string
    prenom: string
    nomSociete?: string
  }
  projet: {
    id: string
    titre: string
    description: string
    adresseChantier: string
    villeChantier: string
    prixMax?: number
    typeChantier: string[]
  }
  sousTraitant: {
    nom: string
    prenom: string
    email: string
  }
}

// Interface pour les notifications de message
export interface MessageNotificationData {
  destinataire: {
    nom: string
    prenom: string
    email: string
    nomSociete?: string
  }
  expediteur: {
    nom: string
    prenom: string
    nomSociete?: string
  }
  projet: {
    id: string
    titre: string
    description: string
    adresseChantier: string
    villeChantier: string
  }
  offre: {
    id: string
    prix: number
    delai: number
  }
  message: {
    contenu: string
    createdAt: Date
  }
}

// Template HTML pour la notification de nouvelle demande
const getContactNotificationTemplate = (data: ContactFormData) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle demande de contact - Chantier Direct</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 30px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .info-item { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #dc2626; }
        .info-label { font-weight: bold; color: #dc2626; margin-bottom: 5px; }
        .message-box { background: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #e9ecef; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6c757d; font-size: 14px; }
        @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Nouvelle demande de contact</h1>
            <p>Chantier Direct - Plateforme de mise en relation</p>
        </div>
        
        <div class="content">
            <h2>Informations du contact</h2>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Nom complet</div>
                    <div>${data.nom}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div>${data.email}</div>
                </div>
                ${data.telephone ? `
                <div class="info-item">
                    <div class="info-label">Téléphone</div>
                    <div>${data.telephone}</div>
                </div>
                ` : ''}
                <div class="info-item">
                    <div class="info-label">Sujet</div>
                    <div>${data.sujet}</div>
                </div>
            </div>
            
            <h3>Message</h3>
            <div class="message-box">
                ${data.message.replace(/\n/g, '<br>')}
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
                <strong>⚠️ Action requise :</strong> Connectez-vous au panel d'administration pour répondre à cette demande.
            </div>
        </div>
        
        <div class="footer">
            <p>Ce message a été envoyé automatiquement depuis le formulaire de contact de Chantier Direct.</p>
            <p>© ${new Date().getFullYear()} Chantier Direct. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
`

// Template HTML pour la réponse au client
const getContactReplyTemplate = (data: ContactReplyData) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réponse à votre demande - Chantier Direct</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 30px; }
        .original-message { background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #6c757d; margin: 20px 0; }
        .reply-message { background: #e8f5e8; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Réponse à votre demande</h1>
            <p>Chantier Direct - Plateforme de mise en relation</p>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>${data.nom}</strong>,</p>
            
            <p>Merci pour votre message concernant : <strong>${data.sujet}</strong></p>
            
            <h3>Votre message original :</h3>
            <div class="original-message">
                ${data.messageOriginal.replace(/\n/g, '<br>')}
            </div>
            
            <h3>Notre réponse :</h3>
            <div class="reply-message">
                ${data.reponse.replace(/\n/g, '<br>')}
            </div>
            
            <p>Si vous avez d'autres questions, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe Chantier Direct</strong></p>
        </div>
        
        <div class="footer">
            <p>Ce message est une réponse à votre demande de contact du ${new Date().toLocaleDateString('fr-FR')}.</p>
            <p>© ${new Date().getFullYear()} Chantier Direct. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
`

// Template HTML pour notification d'offre (nouvelle, sélectionnée, rejetée)
const getOffreNotificationTemplate = (data: OffreNotificationData) => {
  const actionLabels = {
    nouvelle: 'Nouvelle offre reçue',
    selectionnee: 'Votre offre a été sélectionnée !',
    rejetee: 'Votre offre a été rejetée'
  }
  
  const actionColors = {
    nouvelle: '#3b82f6',
    selectionnee: '#10b981',
    rejetee: '#ef4444'
  }
  
  const actionMessages = {
    nouvelle: 'Vous avez reçu une nouvelle offre pour votre projet.',
    selectionnee: 'Félicitations ! Votre offre a été sélectionnée par le client.',
    rejetee: 'Votre offre n\'a pas été sélectionnée pour ce projet.'
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${actionLabels[data.action]} - Chantier Direct</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: ${actionColors[data.action]}; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 30px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .info-item { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid ${actionColors[data.action]}; }
        .info-label { font-weight: bold; color: ${actionColors[data.action]}; margin-bottom: 5px; }
        .project-box { background: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #e9ecef; margin: 20px 0; }
        .offer-box { background: #e8f5e8; padding: 20px; border-radius: 5px; border-left: 4px solid ${actionColors[data.action]}; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6c757d; font-size: 14px; }
        .cta-button { display: inline-block; background: ${actionColors[data.action]}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.action === 'nouvelle' ? '📩' : data.action === 'selectionnee' ? '🎉' : '❌'} ${actionLabels[data.action]}</h1>
            <p>Chantier Direct - Plateforme de mise en relation</p>
        </div>
        
        <div class="content">
            <p>Bonjour ${data.action === 'nouvelle' ? data.donneurOrdre.prenom : data.sousTraitant.prenom},</p>
            
            <p>${actionMessages[data.action]}</p>
            
            <h3>Détails du projet</h3>
            <div class="project-box">
                <h4>${data.projet.titre}</h4>
                <p><strong>Description :</strong> ${data.projet.description}</p>
                <p><strong>Localisation :</strong> ${data.projet.adresseChantier}, ${data.projet.villeChantier}</p>
            </div>
            
            ${data.action === 'nouvelle' ? `
            <h3>Nouvelle offre reçue</h3>
            <div class="offer-box">
                <p><strong>De :</strong> ${data.sousTraitant.prenom} ${data.sousTraitant.nom}${data.sousTraitant.nomSociete ? ` (${data.sousTraitant.nomSociete})` : ''}</p>
                <p><strong>Prix proposé :</strong> ${data.offre.prix.toLocaleString('fr-FR')} €</p>
                <p><strong>Délai proposé :</strong> ${data.offre.delai} jours</p>
                ${data.offre.message ? `<p><strong>Message :</strong> ${data.offre.message}</p>` : ''}
            </div>
            ` : `
            <h3>Détails de votre offre</h3>
            <div class="offer-box">
                <p><strong>Prix proposé :</strong> ${data.offre.prix.toLocaleString('fr-FR')} €</p>
                <p><strong>Délai proposé :</strong> ${data.offre.delai} jours</p>
                ${data.offre.message ? `<p><strong>Votre message :</strong> ${data.offre.message}</p>` : ''}
            </div>
            `}
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donneur-ordre/projets/${data.projet.id}" class="cta-button">
                    ${data.action === 'nouvelle' ? 'Voir le projet' : 'Voir le projet'}
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>Ce message a été envoyé automatiquement depuis Chantier Direct.</p>
            <p>© ${new Date().getFullYear()} Chantier Direct. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
`
}

// Template HTML pour notification de projet (accepté/rejeté)
const getProjetNotificationTemplate = (data: ProjetNotificationData) => {
  const actionLabels = {
    accepte: 'Votre projet a été accepté !',
    rejete: 'Votre projet a été rejeté'
  }
  
  const actionColors = {
    accepte: '#10b981',
    rejete: '#ef4444'
  }
  
  const actionMessages = {
    accepte: 'Félicitations ! Votre projet a été validé et est maintenant visible sur la plateforme.',
    rejete: 'Votre projet n\'a pas été validé. Veuillez consulter les raisons ci-dessous.'
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${actionLabels[data.action]} - Chantier Direct</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: ${actionColors[data.action]}; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 30px; }
        .project-box { background: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #e9ecef; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6c757d; font-size: 14px; }
        .cta-button { display: inline-block; background: ${actionColors[data.action]}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.action === 'accepte' ? '✅' : '❌'} ${actionLabels[data.action]}</h1>
            <p>Chantier Direct - Plateforme de mise en relation</p>
        </div>
        
        <div class="content">
            <p>Bonjour ${data.donneurOrdre.prenom},</p>
            
            <p>${actionMessages[data.action]}</p>
            
            <h3>Détails du projet</h3>
            <div class="project-box">
                <h4>${data.projet.titre}</h4>
                <p><strong>Description :</strong> ${data.projet.description}</p>
                <p><strong>Localisation :</strong> ${data.projet.adresseChantier}, ${data.projet.villeChantier}</p>
                ${data.projet.prixMax ? `<p><strong>Budget maximum :</strong> ${data.projet.prixMax.toLocaleString('fr-FR')} €</p>` : ''}
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donneur-ordre/projets/${data.projet.id}" class="cta-button">
                    Voir le projet
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>Ce message a été envoyé automatiquement depuis Chantier Direct.</p>
            <p>© ${new Date().getFullYear()} Chantier Direct. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
`
}

// Template HTML pour notification de message
const getMessageNotificationTemplate = (data: MessageNotificationData) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau message - Chantier Direct</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 30px; }
        .project-box { background: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #e9ecef; margin: 20px 0; }
        .message-box { background: #e8f5e8; padding: 20px; border-radius: 5px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .sender-box { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6c757d; font-size: 14px; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💬 Nouveau message reçu</h1>
            <p>Chantier Direct - Plateforme de mise en relation</p>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>${data.destinataire.prenom}</strong>,</p>
            
            <p>Vous avez reçu un nouveau message concernant un projet sur Chantier Direct.</p>
            
            <h3>Projet concerné</h3>
            <div class="project-box">
                <h4>${data.projet.titre}</h4>
                <p><strong>Description :</strong> ${data.projet.description}</p>
                <p><strong>Localisation :</strong> ${data.projet.adresseChantier}, ${data.projet.villeChantier}</p>
                <p><strong>Budget :</strong> ${data.offre.prix.toLocaleString('fr-FR')} €</p>
                <p><strong>Délai proposé :</strong> ${data.offre.delai} jours</p>
            </div>
            
            <h3>Message de ${data.expediteur.prenom} ${data.expediteur.nom}${data.expediteur.nomSociete ? ` (${data.expediteur.nomSociete})` : ''}</h3>
            <div class="sender-box">
                <p><strong>Envoyé le :</strong> ${data.message.createdAt.toLocaleString('fr-FR')}</p>
            </div>
            <div class="message-box">
                ${data.message.contenu.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donneur-ordre/projets/${data.projet.id}" class="cta-button">
                    Répondre au message
                </a>
            </div>
            
            <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                <strong>💡 Conseil :</strong> Répondez rapidement pour maintenir une communication fluide avec votre interlocuteur.
            </p>
        </div>
        
        <div class="footer">
            <p>Ce message a été envoyé automatiquement depuis Chantier Direct.</p>
            <p>© ${new Date().getFullYear()} Chantier Direct. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
`

// Template HTML pour notification de nouveau projet
const getNouveauProjetNotificationTemplate = (data: NouveauProjetNotificationData) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau projet disponible - Chantier Direct</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 30px; }
        .project-box { background: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #e9ecef; margin: 20px 0; }
        .client-box { background: #e8f5e8; padding: 20px; border-radius: 5px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6c757d; font-size: 14px; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
        .skill-tag { background: #3b82f6; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Nouveau projet disponible !</h1>
            <p>Chantier Direct - Plateforme de mise en relation</p>
        </div>
        
        <div class="content">
            <p>Bonjour ${data.sousTraitant.prenom},</p>
            
            <p>Un nouveau projet correspondant à vos compétences a été publié sur Chantier Direct !</p>
            
            <h3>Détails du projet</h3>
            <div class="project-box">
                <h4>${data.projet.titre}</h4>
                <p><strong>Description :</strong> ${data.projet.description}</p>
                <p><strong>Localisation :</strong> ${data.projet.adresseChantier}, ${data.projet.villeChantier}</p>
                ${data.projet.prixMax ? `<p><strong>Budget maximum :</strong> ${data.projet.prixMax.toLocaleString('fr-FR')} €</p>` : ''}
                <div class="skills">
                    ${data.projet.typeChantier.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            
            <h3>Client</h3>
            <div class="client-box">
                <p><strong>${data.donneurOrdre.prenom} ${data.donneurOrdre.nom}</strong>${data.donneurOrdre.nomSociete ? ` (${data.donneurOrdre.nomSociete})` : ''}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/projets/${data.projet.id}" class="cta-button">
                    Voir le projet et soumettre une offre
                </a>
            </div>
            
            <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
                <strong>💡 Conseil :</strong> Soumettez rapidement votre offre pour maximiser vos chances d'être sélectionné !
            </p>
        </div>
        
        <div class="footer">
            <p>Ce message a été envoyé automatiquement depuis Chantier Direct.</p>
            <p>© ${new Date().getFullYear()} Chantier Direct. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
`

// Fonction pour envoyer une notification de nouvelle demande
export async function sendContactNotification(data: ContactFormData) {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Chantier Direct'}" <${process.env.CONTACT_EMAIL}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `[Contact] Nouvelle demande - ${data.sujet}`,
      html: getContactNotificationTemplate(data),
      text: `
Nouvelle demande de contact reçue :

Nom : ${data.nom}
Email : ${data.email}
${data.telephone ? `Téléphone : ${data.telephone}` : ''}
Sujet : ${data.sujet}

Message :
${data.message}
      `.trim()
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Notification de contact envoyée:', result.messageId)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error)
    throw error
  }
}

// Fonction pour envoyer une réponse au client
export async function sendContactReply(data: ContactReplyData) {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Chantier Direct'}" <${process.env.REPLY_EMAIL}>`,
      to: data.email,
      subject: `Re: ${data.sujet} - Chantier Direct`,
      html: getContactReplyTemplate(data),
      text: `
Bonjour ${data.nom},

Merci pour votre message concernant : ${data.sujet}

Votre message original :
${data.messageOriginal}

Notre réponse :
${data.reponse}

Cordialement,
L'équipe Chantier Direct
      `.trim()
    }

    const result = await replyTransporter.sendMail(mailOptions)
    console.log('Réponse de contact envoyée:', result.messageId)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la réponse:', error)
    throw error
  }
}

// Fonction pour envoyer une notification d'offre
export async function sendOffreNotification(data: OffreNotificationData) {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Chantier Direct'}" <${process.env.REPLY_EMAIL}>`,
      to: data.action === 'nouvelle' ? data.donneurOrdre.email : data.sousTraitant.email,
      subject: data.action === 'nouvelle' 
        ? `[Nouvelle offre] ${data.projet.titre} - Chantier Direct`
        : data.action === 'selectionnee'
        ? `[Offre sélectionnée] ${data.projet.titre} - Chantier Direct`
        : `[Offre rejetée] ${data.projet.titre} - Chantier Direct`,
      html: getOffreNotificationTemplate(data),
      text: `
${data.action === 'nouvelle' ? 'Nouvelle offre reçue' : data.action === 'selectionnee' ? 'Votre offre a été sélectionnée' : 'Votre offre a été rejetée'}

Projet: ${data.projet.titre}
Description: ${data.projet.description}
Localisation: ${data.projet.adresseChantier}, ${data.projet.villeChantier}

${data.action === 'nouvelle' ? `
Nouvelle offre de: ${data.sousTraitant.prenom} ${data.sousTraitant.nom}
Prix: ${data.offre.prix.toLocaleString('fr-FR')} €
Délai: ${data.offre.delai} jours
${data.offre.message ? `Message: ${data.offre.message}` : ''}
` : `
Votre offre:
Prix: ${data.offre.prix.toLocaleString('fr-FR')} €
Délai: ${data.offre.delai} jours
${data.offre.message ? `Message: ${data.offre.message}` : ''}
`}

Consultez le projet: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/projets/${data.projet.id}
      `.trim()
    }

    const result = await replyTransporter.sendMail(mailOptions)
    console.log('Notification d\'offre envoyée:', result.messageId)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification d\'offre:', error)
    throw error
  }
}

// Fonction pour envoyer une notification de projet
export async function sendProjetNotification(data: ProjetNotificationData) {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Chantier Direct'}" <${process.env.REPLY_EMAIL}>`,
      to: data.donneurOrdre.email,
      subject: data.action === 'accepte' 
        ? `[Projet accepté] ${data.projet.titre} - Chantier Direct`
        : `[Projet rejeté] ${data.projet.titre} - Chantier Direct`,
      html: getProjetNotificationTemplate(data),
      text: `
${data.action === 'accepte' ? 'Votre projet a été accepté' : 'Votre projet a été rejeté'}

Projet: ${data.projet.titre}
Description: ${data.projet.description}
Localisation: ${data.projet.adresseChantier}, ${data.projet.villeChantier}
${data.projet.prixMax ? `Budget: ${data.projet.prixMax.toLocaleString('fr-FR')} €` : ''}

Consultez le projet: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donneur-ordre/projets/${data.projet.id}
      `.trim()
    }

    const result = await replyTransporter.sendMail(mailOptions)
    console.log('Notification de projet envoyée:', result.messageId)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de projet:', error)
    throw error
  }
}

// Fonction pour envoyer une notification de nouveau projet
export async function sendNouveauProjetNotification(data: NouveauProjetNotificationData) {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Chantier Direct'}" <${process.env.REPLY_EMAIL}>`,
      to: data.sousTraitant.email,
      subject: `[Nouveau projet] ${data.projet.titre} - Chantier Direct`,
      html: getNouveauProjetNotificationTemplate(data),
      text: `
Nouveau projet disponible !

Projet: ${data.projet.titre}
Description: ${data.projet.description}
Localisation: ${data.projet.adresseChantier}, ${data.projet.villeChantier}
${data.projet.prixMax ? `Budget: ${data.projet.prixMax.toLocaleString('fr-FR')} €` : ''}
Compétences: ${data.projet.typeChantier.join(', ')}

Client: ${data.donneurOrdre.prenom} ${data.donneurOrdre.nom}${data.donneurOrdre.nomSociete ? ` (${data.donneurOrdre.nomSociete})` : ''}

Soumettez votre offre: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/projets/${data.projet.id}
      `.trim()
    }

    const result = await replyTransporter.sendMail(mailOptions)
    console.log('Notification de nouveau projet envoyée:', result.messageId)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de nouveau projet:', error)
    throw error
  }
}

// Fonction pour envoyer une notification de message
export async function sendMessageNotification(data: MessageNotificationData) {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Chantier Direct'}" <${process.env.REPLY_EMAIL}>`,
      to: data.destinataire.email,
      subject: `[Nouveau message] ${data.projet.titre} - Chantier Direct`,
      html: getMessageNotificationTemplate(data),
      text: `
Nouveau message reçu sur Chantier Direct

Projet: ${data.projet.titre}
Description: ${data.projet.description}
Localisation: ${data.projet.adresseChantier}, ${data.projet.villeChantier}
Budget: ${data.offre.prix.toLocaleString('fr-FR')} €
Délai: ${data.offre.delai} jours

Message de ${data.expediteur.prenom} ${data.expediteur.nom}${data.expediteur.nomSociete ? ` (${data.expediteur.nomSociete})` : ''}:
Envoyé le ${data.message.createdAt.toLocaleString('fr-FR')}

${data.message.contenu}

Répondre au message: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donneur-ordre/projets/${data.projet.id}
      `.trim()
    }

    const result = await replyTransporter.sendMail(mailOptions)
    console.log('Notification de message envoyée:', result.messageId)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de message:', error)
    throw error
  }
}

// Fonction pour vérifier la configuration email
export async function verifyEmailConfig() {
  try {
    await transporter.verify()
    console.log('Configuration email principale vérifiée')
    
    await replyTransporter.verify()
    console.log('Configuration email de réponse vérifiée')
    
    return true
  } catch (error) {
    console.error('Erreur de configuration email:', error)
    return false
  }
}
