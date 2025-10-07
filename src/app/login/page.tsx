'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TextField, Button, Card, CardContent, Typography } from '@mui/material'

export default function LoginPage() {
  const router = useRouter()
  const [clave, setClave] = useState('')
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANTE: el nombre del campo debe ser 'clave'
        body: JSON.stringify({ clave }),
      });

      if (!res.ok) {
        // 401 u otro error
        const msg = await res.text();
        setError(msg || "No autorizado");
        setLoading(false);
        return;
      }

      const data: { success: boolean; isGuadalupe: boolean } = await res.json();
      // Redirección según el booleano
      if (data.isGuadalupe) {
        router.push("/memoriales"); // ✅ true
      } else {
        router.push("/memoriales");
      }
    } catch (err) {
      setError("Error de red o servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 max-w-sm">
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

            <Button variant="contained" color="primary" type='submit'>
              {loading ? "Validando..." : "Entrar"}
            </Button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
