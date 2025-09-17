import { v2 as cloudinary } from 'cloudinary'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  originalFilename: string
}

/**
 * Uploader un fichier vers Cloudinary
 */
export async function uploadDocument(
  file: File | Buffer,
  folder: string = 'documents',
  userId: string
): Promise<UploadResult> {
  try {
    let buffer: Buffer
    let originalFilename: string

    const FileCtor = (globalThis as any).File // eslint-disable-line @typescript-eslint/no-explicit-any
    if (FileCtor && typeof FileCtor === 'function' && file instanceof FileCtor) {
      const webFile = file as any // eslint-disable-line @typescript-eslint/no-explicit-any
      const arrayBuffer = await webFile.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      originalFilename = webFile.name
    } else if (file && typeof (file as any).arrayBuffer === 'function') { // eslint-disable-line @typescript-eslint/no-explicit-any
      const webLike = file as any // eslint-disable-line @typescript-eslint/no-explicit-any
      const arrayBuffer = await webLike.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      originalFilename = typeof webLike.name === 'string' ? webLike.name : 'document'
    } else {
      buffer = file as Buffer
      originalFilename = 'document'
    }

    // Générer un nom unique pour le fichier (laisser Cloudinary préfixer par folder)
    const timestamp = Date.now()
    const publicId = `${userId}/${timestamp}_${originalFilename.replace(/\.[^/.]+$/, '')}`

    // Détecter le type MIME du fichier
    const fileExtension = originalFilename.toLowerCase().split('.').pop()
    let mimeType = 'application/octet-stream'
    
    switch (fileExtension) {
      case 'pdf':
        mimeType = 'application/pdf'
        break
      case 'png':
        mimeType = 'image/png'
        break
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg'
        break
    }

    // Configuration spéciale pour les PDFs
    const isAvatar = folder === 'avatars'
    const isProjectImage = folder === 'project-images'
    const uploadOptions: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
      resource_type: fileExtension === 'pdf' ? 'auto' : 'image',
      public_id: publicId,
      folder: folder,
      tags: [`user_${userId}`, isAvatar ? 'avatar' : isProjectImage ? 'project-image' : 'document'],
      // Avatars et images de projet doivent être publics; documents restent privés
      type: (isAvatar || isProjectImage) ? 'upload' : 'authenticated',
    }

    // Pour les PDFs, on active la conversion en images pour preview
    if (fileExtension === 'pdf') {
      uploadOptions.resource_type = 'raw'
      uploadOptions.format = 'pdf'
      uploadOptions.pages = true // Permettre l'accès aux pages individuelles
    }

    console.log('Upload options:', uploadOptions)
    console.log('File type:', fileExtension, 'MIME:', mimeType)

    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${buffer.toString('base64')}`,
      uploadOptions
    )

    console.log('Cloudinary result:', result)

    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalFilename,
    }
  } catch (error) {
    console.error('Erreur lors de l\'upload vers Cloudinary:', error)
    throw new Error('Erreur lors de l\'upload du document')
  }
}

/**
 * Supprimer un fichier de Cloudinary
 */
export async function deleteDocument(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Erreur lors de la suppression sur Cloudinary:', error)
    return false
  }
}

/**
 * Obtenir l'URL transformée d'un document (ex: thumbnail, watermark)
 */
export function getTransformedUrl(
  publicId: string,
  transformations: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any
): string {
  return cloudinary.url(publicId, transformations)
}

/**
 * Obtenir le nombre de pages d'un PDF (côté serveur uniquement)
 */
export async function getPdfPageCount(publicId: string): Promise<number> {
  try {
    const result = await cloudinary.api.resource(publicId, { 
      resource_type: 'raw',
      pages: true 
    })
    return result.pages || 1
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de pages:', error)
    return 1
  }
}

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