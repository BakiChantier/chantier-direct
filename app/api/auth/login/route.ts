import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createToken } from '@/lib/auth'
import { apiResponse, handleApiError, validateFields } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  return validateFields(
    request,
    ['email', 'password'],
    async (req, data) => {
      try {
        const { email, password } = data

        // Authentifier l'utilisateur
        const user = await authenticateUser(email, password)
        if (!user) {
          return apiResponse(false, null, 'Email ou mot de passe incorrect', 401)
        }

        // Créer le token JWT
        const token = createToken({
          userId: user.id,
          email: user.email,
          role: user.role,
        })

        // Définir un cookie HttpOnly pour le token (et conserver aussi la réponse JSON existante)
        const response = apiResponse(true, {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            nom: user.nom,
            prenom: user.prenom,
            nomSociete: user.nomSociete,
          },
          token,
        }, 'Connexion réussie') as NextResponse

        // Cookie: HttpOnly, Secure en prod, SameSite=Lax, path global
        response.cookies.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        })

        return response

      } catch (error) {
        return handleApiError(error)
      }
    }
  )
} 