'use client'

import { useState, useRef } from 'react'
import { validateFile } from '@/lib/file-validation'
import Image from 'next/image'
interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  disabled?: boolean
  currentFile?: string // Nom du fichier actuellement sélectionné
  currentImageUrl?: string // URL de l'image actuelle à afficher
  error?: string
}

export default function FileUpload({
  onFileSelect,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSize = 10,
  disabled = false,
  currentFile,
  currentImageUrl,
  error
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    setUploadError('')
    
    const validation = validateFile(file)
    if (!validation.isValid) {
      setUploadError(validation.error || 'Fichier invalide')
      return
    }

    onFileSelect(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const displayError = error || uploadError

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${displayError ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
        />

        <div className="text-center">
          {currentImageUrl ? (
            <div className="space-y-2">
              <div className="mx-auto h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200">
                <Image 
                  src={currentImageUrl} 
                  alt="Image actuelle" 
                  className="h-full w-full object-cover"
                  width={250}
                  height={250}
                />
              </div>
              <p className="text-sm font-medium text-gray-900">Image actuelle</p>
              <p className="text-xs text-gray-500">Cliquez pour changer</p>
            </div>
          ) : currentFile ? (
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">{currentFile}</p>
              <p className="text-xs text-gray-500">Fichier sélectionné - Cliquez pour changer</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Cliquez pour sélectionner ou glissez-déposez votre fichier
                </p>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG jusqu&apos;à {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {displayError && (
        <p className="mt-2 text-sm text-red-600">{displayError}</p>
      )}
    </div>
  )
} 