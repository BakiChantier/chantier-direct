/**
 * Validation côté client pour les fichiers
 * N'utilise pas Cloudinary pour éviter les erreurs d'import
 */

/**
 * Valider le type de fichier
 */
export function isValidFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
  ]
  
  return allowedTypes.includes(file.type)
}

/**
 * Valider la taille du fichier (max 10MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Valider un fichier avant upload
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  if (!isValidFileType(file)) {
    return {
      isValid: false,
      error: 'Type de fichier non autorisé. Formats acceptés: PDF, JPG, PNG'
    }
  }

  if (!isValidFileSize(file)) {
    return {
      isValid: false,
      error: 'Fichier trop volumineux. Taille maximale: 10MB'
    }
  }

  return { isValid: true }
} 