/**
 * Utilitaires pour la gestion des PDFs côté client
 * (sans dépendances Node.js)
 */

/**
 * Obtenir l'URL de preview pour les PDFs (converti en image)
 */
export function getPdfPreviewUrl(publicId: string, page: number = 1): string {
  // Construction manuelle de l'URL Cloudinary pour éviter d'importer le SDK
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  
  if (!cloudName) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME manquant')
    return ''
  }

  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/pg_{page}/w_800,h_1200,c_fit,q_auto/{public_id}.png
  return `https://res.cloudinary.com/${cloudName}/image/upload/pg_${page}/w_800,h_1200,c_fit,q_auto/${publicId}.png`
}

/**
 * Extraire le publicId d'une URL Cloudinary
 */
export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Format Cloudinary: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
    const parts = url.split('/')
    const uploadIndex = parts.findIndex(part => part === 'upload')
    if (uploadIndex === -1) return null
    
    const publicIdParts = parts.slice(uploadIndex + 2) // Skip 'upload' and version
    const publicIdWithFormat = publicIdParts.join('/')
    return publicIdWithFormat.replace(/\.[^/.]+$/, '') // Remove extension
  } catch {
    return null
  }
} 