'use client'

import { useState, useRef } from 'react'
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
interface ProjectImage {
  id?: string
  url: string
  title?: string
  description?: string
  type: 'PHOTO' | 'PLAN' | 'SCHEMA'
  file?: File // Pour les nouvelles images
}

interface ProjectImageUploadProps {
  images: ProjectImage[]
  onImagesChange: (images: ProjectImage[]) => void
  maxImages?: number
  disabled?: boolean
}

export default function ProjectImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10, 
  disabled = false 
}: ProjectImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return

    const newImages: ProjectImage[] = []
    
    Array.from(files).forEach((file) => {
      if (images.length + newImages.length >= maxImages) return
      
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        newImages.push({
          url,
          title: file.name,
          type: 'PHOTO',
          file
        })
      }
    })

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const updateImageInfo = (index: number, field: 'title' | 'description' | 'type', value: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], [field]: value }
    onImagesChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-6">
      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive 
            ? 'border-red-500 bg-red-50' 
            : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
        }`}
      >
        <div className="flex flex-col items-center">
          <Upload className={`w-12 h-12 mb-4 ${dragActive ? 'text-red-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Déposez vos fichiers ici' : 'Ajoutez des photos et plans'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Glissez-déposez vos fichiers ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-gray-400">
            Formats acceptés : JPG, PNG, PDF • Taille max : 10MB par fichier
          </p>
          <p className="text-xs text-gray-400">
            {images.length}/{maxImages} images ajoutées
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Liste des images */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Photos et plans ajoutés ({images.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {/* Aperçu de l'image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {image.url ? (
                        <Image 
                          src={image.url} 
                          alt={image.title || 'Image du projet'}
                          className="w-full h-full object-cover"
                          width={250}
                          height={250}
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={image.title || ''}
                        onChange={(e) => updateImageInfo(index, 'title', e.target.value)}
                        placeholder="Nom de l'image"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                        disabled={disabled}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={image.type}
                        onChange={(e) => updateImageInfo(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                        disabled={disabled}
                      >
                        <option value="PHOTO">Photo du chantier</option>
                        <option value="PLAN">Plan / Schéma</option>
                        <option value="SCHEMA">Schéma technique</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={image.description || ''}
                        onChange={(e) => updateImageInfo(index, 'description', e.target.value)}
                        placeholder="Description optionnelle"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col space-y-2">
                    {/* Boutons de réorganisation */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Déplacer vers le haut"
                        disabled={disabled}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                    )}
                    
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Déplacer vers le bas"
                        disabled={disabled}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Bouton de suppression */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Supprimer l'image"
                      disabled={disabled}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conseils */}
      {images.length === 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Conseils pour de meilleures candidatures</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Ajoutez des photos de l&apos;état actuel du chantier</li>
            <li>• Incluez les plans techniques si disponibles</li>
            <li>• Montrez les contraintes d&apos;accès ou spécificités</li>
            <li>• Les visuels aident les sous-traitants à mieux évaluer</li>
          </ul>
        </div>
      )}
    </div>
  )
}
