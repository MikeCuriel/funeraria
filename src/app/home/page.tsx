// page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HomePageContenido from '../contenido/page'

export default function HomePageWrapper() {
  const [autenticado, setAutenticado] = useState(false)
  const router = useRouter()

  useEffect(() => {
  const autorizado = localStorage.getItem('auth_funeraria') === 'true'
  if (!autorizado) {
    router.push('/login') // o a donde tengas tu "pantalla de acceso"
  } else {
    setAutenticado(true)
  }
}, [])

  if (!autenticado) {
    return <div className="text-center mt-10 text-gray-500">Validando acceso...</div>
  }

  return <HomePageContenido />
}