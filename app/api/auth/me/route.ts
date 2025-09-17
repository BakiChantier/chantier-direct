import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { apiResponse, handleApiError } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: authenticatedRequest.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          nom: true,
          prenom: true,
          nomSociete: true,
          telephone: true,
          adresse: true,
          ville: true,
          codePostal: true,
          pays: true,
          nombreEmployes: true,
          expertises: true,
          noteGlobale: true,
          nombreEvaluations: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      if (!user) {
        return apiResponse(false, null, 'Utilisateur non trouvé', 404)
      }

      return apiResponse(true, { user }, 'Informations utilisateur récupérées')

    } catch (error) {
      return handleApiError(error)
    }
  })
} 