import { NextResponse } from 'next/server'

export async function POST() {
  const response = new NextResponse(JSON.stringify({ success: true, message: 'Déconnecté' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Supprimer le cookie token
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}


