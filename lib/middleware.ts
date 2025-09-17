import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin, isSuperAdmin, AuthUser } from './auth'
import { Role } from '@prisma/client'

// Types pour les middlewares
export type AuthenticatedRequest = NextRequest & {
  user: AuthUser
}

export interface ApiResponse {
  success: boolean
  message?: string
  data?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  error?: string
}

/**
 * Middleware d'authentification requis
 */
export async function requireAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token d\'authentification requis' },
        { status: 401 }
      )
    }

    // Ajouter l'utilisateur à la requête
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user

    return handler(authenticatedRequest)
  } catch (error) {
    console.error('Erreur middleware auth:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur d\'authentification' },
      { status: 500 }
    )
  }
}

/**
 * Middleware pour les admins uniquement
 */
export async function requireAdmin(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(request, async (authenticatedRequest) => {
    if (!isAdmin(authenticatedRequest.user)) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      )
    }
    
    return handler(authenticatedRequest)
  })
}

/**
 * Middleware pour les super admins uniquement
 */
export async function requireSuperAdmin(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(request, async (authenticatedRequest) => {
    if (!isSuperAdmin(authenticatedRequest.user)) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux super administrateurs' },
        { status: 403 }
      )
    }
    
    return handler(authenticatedRequest)
  })
}

/**
 * Middleware pour les donneurs d'ordres uniquement
 */
export async function requireDonneurOrdre(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(request, async (authenticatedRequest) => {
    if (authenticatedRequest.user.role !== Role.DONNEUR_ORDRE && !isAdmin(authenticatedRequest.user)) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux donneurs d\'ordres' },
        { status: 403 }
      )
    }
    
    return handler(authenticatedRequest)
  })
}

/**
 * Middleware pour les sous-traitants uniquement
 */
export async function requireSousTraitant(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(request, async (authenticatedRequest) => {
    if (authenticatedRequest.user.role !== Role.SOUS_TRAITANT && !isAdmin(authenticatedRequest.user)) {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux sous-traitants' },
        { status: 403 }
      )
    }
    
    return handler(authenticatedRequest)
  })
}

/**
 * Middleware pour plusieurs rôles
 */
export async function requireRoles(
  roles: Role[],
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return requireAuth(request, async (authenticatedRequest) => {
    if (!roles.includes(authenticatedRequest.user.role) && !isAdmin(authenticatedRequest.user)) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      )
    }
    
    return handler(authenticatedRequest)
  })
}

/**
 * Utilitaire pour créer une réponse API standardisée
 */
export function apiResponse(
  success: boolean,
  data?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse = { success }
  
  if (data !== undefined) response.data = data
  if (message) {
    if (success) {
      response.message = message
    } else {
      response.error = message
    }
  }
  
  return NextResponse.json(response, { status })
}

/**
 * Gestionnaire d'erreurs pour les routes API
 */
export function handleApiError(error: any): NextResponse { // eslint-disable-line @typescript-eslint/no-explicit-any
  console.error('Erreur API:', error)
  
  // Erreur de validation Prisma
  if (error.code === 'P2002') {
    return apiResponse(false, null, 'Cette donnée existe déjà', 409)
  }
  
  // Erreur de relation Prisma
  if (error.code === 'P2025') {
    return apiResponse(false, null, 'Ressource non trouvée', 404)
  }
  
  // Erreur générique
  return apiResponse(false, null, 'Erreur interne du serveur', 500)
}

/**
 * Valider les champs requis dans une requête
 */
export function validateRequiredFields(
  data: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

/**
 * Middleware de validation des champs requis
 */
export async function validateFields(
  request: NextRequest,
  requiredFields: string[],
  handler: (req: NextRequest, data: any) => Promise<NextResponse> // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<NextResponse> {
  try {
    const data = await request.json()
    const { isValid, missingFields } = validateRequiredFields(data, requiredFields)
    
    if (!isValid) {
      return apiResponse(
        false,
        null,
        `Champs requis manquants: ${missingFields.join(', ')}`,
        400
      )
    }
    
    return handler(request, data)
  } catch (error) {
    console.error('Erreur middleware de validation des champs:', error)
    return apiResponse(false, null, 'Format JSON invalide', 400)
  }
} 