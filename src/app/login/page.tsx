'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Card, CardContent, Typography } from '@mui/material';

function LoginForm() {
  const router = useRouter();
  const [clave, setClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClave(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || 'No autorizado');
        return;
      }
      const data: { success: boolean; isGuadalupe: boolean } = await res.json();
      router.push('/memoriales');
    } catch (err) {
      setError('Error de red o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="flex flex-col gap-4 p-6">
          <Typography variant="h6" className="text-center font-bold text-gray-800">
            Acceso al Generador de Memoriales
          </Typography>
          <TextField
            type="password"
            label="Contraseña"
            value={clave}
            onChange={handleChange}
            error={!!error}
            helperText={error}
            fullWidth
          />
          <Button variant="contained" color="primary" type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar'}
          </Button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </CardContent>
      </Card>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
