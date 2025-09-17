import { NextRequest } from 'next/server'
import { hashPassword, createToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, handleApiError, validateFields } from '@/lib/middleware'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  return validateFields(
    request,
    ['email', 'password', 'role', 'nom', 'telephone', 'adresse', 'ville', 'codePostal'],
    async (req, data) => { 
      try {
        const {
          email,
          password,
          role,
          nom,
          prenom,
          nomSociete,
          telephone,
          adresse,
          ville,
          codePostal,
          pays = 'France',
          nombreEmployes,
          expertises,
          autresExpertises
        } = data

        // Vérifier que l'email n'existe pas déjà
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() }
        })

        if (existingUser) {
          return apiResponse(false, null, 'Cet email est déjà utilisé', 409)
        }

        // Valider le rôle
        if (!Object.values(Role).includes(role)) {
          return apiResponse(false, null, 'Rôle invalide', 400)
        }

        // Empêcher la création d'admins via l'API publique
        if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
          return apiResponse(false, null, 'Création de compte admin non autorisée', 403)
        }

        // Hacher le mot de passe
        const hashedPassword = await hashPassword(password)

        // Créer l'utilisateur
        const user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            nom,
            prenom,
            nomSociete,
            telephone,
            adresse,
            ville,
            codePostal,
            pays,
            nombreEmployes: role === Role.SOUS_TRAITANT ? nombreEmployes : null,
            expertises: role === Role.SOUS_TRAITANT ? (expertises || []) : [],
            autresExpertises: role === Role.SOUS_TRAITANT ? (autresExpertises || []) : [],
          } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        })

        // Créer le token JWT
        const token = createToken({
          userId: user.id,
          email: user.email,
          role: user.role,
        })

        return apiResponse(true, {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            nom: user.nom,
            prenom: user.prenom,
            nomSociete: user.nomSociete,
          },
          token,
        }, 'Inscription réussie', 201)

      } catch (error) {
        return handleApiError(error)
      }
    }
  )
} 