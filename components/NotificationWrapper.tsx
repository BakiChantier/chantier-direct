'use client'

import { Toaster } from 'react-hot-toast'

export default function NotificationWrapper() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Configuration par défaut
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '10px',
          border: '1px solid #525252',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        // Styles pour les différents types
        success: {
          style: {
            background: '#10b981',
            color: '#fff',
            border: '1px solid #059669',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: '#fff',
            border: '1px solid #dc2626',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
        loading: {
          style: {
            background: '#3b82f6',
            color: '#fff',
            border: '1px solid #2563eb',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#3b82f6',
          },
        },
      }}
    />
  )
} 