'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TextField, Button, Card, CardContent, Typography } from '@mui/material'

export default function LoginPage() {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const contraseñaCorrecta = '#Guadalupe25' // Cámbiala según lo necesario

  const handleLogin = () => {
    if (clave === contraseñaCorrecta) {
        // Establecer cookie válida por 1 hora     
        document.cookie = `auth_funeraria=true; path=/; max-age=3600, samesite=lax`
        router.push('/memoriales')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="flex flex-col gap-4 p-6">
          <Typography variant="h6" className="text-center font-bold text-gray-800">
            Acceso al Generador de Memoriales
          </Typography>

          <TextField
            type="password"
            label="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            error={!!error}
            helperText={error}
            fullWidth
          />

          <Button variant="contained" color="primary" onClick={handleLogin}>
            Ingresar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
