import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { Role } from '@prisma/client'

// Types pour JWT
export interface JWTPayload {
  userId: string
  email: string
  role: Role
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  email: string
  role: Role
  nom: string
  prenom: string | null
  nomSociete: string | null
}

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key'

/**
 * Hacher un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Vérifier un mot de passe
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Créer un token JWT
 */
export function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload as object, JWT_SECRET, { 
    expiresIn: '7d'
  })
}

/**
 * Vérifier et décoder un token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error)
    return null
  }
}

/**
 * Extraire le token du header Authorization
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Authentifier un utilisateur avec email/password
 */
export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.isActive) {
      return null
    }

    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      nomSociete: user.nomSociete,
    }
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error)
    return null
  }
}

/**
 * Obtenir un utilisateur à partir d'un token
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      nomSociete: user.nomSociete,
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return null
  }
}

/**
 * Obtenir l'utilisateur connecté à partir de la requête
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('Authorization')
  const headerToken = extractTokenFromHeader(authHeader)
  const cookieToken = request.cookies.get('token')?.value || null

  const token = headerToken || cookieToken
  if (!token) {
    return null
  }

  return getUserFromToken(token)
}

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 */
export function hasRole(user: AuthUser, role: Role): boolean {
  return user.role === role
}

/**
 * Vérifier si l'utilisateur est admin (Admin ou SuperAdmin)
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN
}

/**
 * Vérifier si l'utilisateur est SuperAdmin
 */
export function isSuperAdmin(user: AuthUser): boolean {
  return user.role === Role.SUPER_ADMIN
}

/**
 * Vérifier si l'utilisateur peut modifier un autre utilisateur
 */
export function canModifyUser(currentUser: AuthUser, targetUserId: string): boolean {
  // Un utilisateur peut toujours modifier ses propres données
  if (currentUser.id === targetUserId) {
    return true
  }
  
  // Seuls les admins peuvent modifier d'autres utilisateurs
  return isAdmin(currentUser)
}

