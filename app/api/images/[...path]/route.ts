import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const imagePath = path.join('/')
    
    console.log('Proxy image path:', imagePath)
    
    // Si c'est une URL authentifiée, extraire le publicId
    if (imagePath.includes('authenticated')) {
      // Format: image/authenticated/s--signature--/v123456/project-images/userId/filename
      const parts = imagePath.split('/')
      const versionIndex = parts.findIndex(part => part.startsWith('v'))
      
      if (versionIndex > -1) {
        // Récupérer le publicId après la version
        const publicId = parts.slice(versionIndex + 1).join('/')
        console.log('Extracted publicId:', publicId)
        
        try {
          // Utiliser l'API Cloudinary pour récupérer l'image authentifiée
          const signedUrl = cloudinary.url(publicId, {
            type: 'authenticated',
            sign_url: true,
            secure: true
          })
          
          console.log('Signed URL:', signedUrl)
          
          // Faire la requête avec l'URL signée
          const response = await fetch(signedUrl)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          
          const imageBuffer = await response.arrayBuffer()
          const contentType = response.headers.get('content-type') || 'image/jpeg'
          
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
            },
          })
        } catch (error) {
          console.error('Erreur avec URL signée:', error)
        }
      }
    }
    
    // Fallback: essayer l'URL directe
    const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${imagePath}`
    console.log('Fallback URL:', cloudinaryUrl)
    
    const response = await fetch(cloudinaryUrl)
    
    if (!response.ok) {
      console.log('Image non trouvée:', cloudinaryUrl)
      return new NextResponse('Image non trouvée', { status: 404 })
    }
    
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
    
  } catch (error) {
    console.error('Erreur proxy image:', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
