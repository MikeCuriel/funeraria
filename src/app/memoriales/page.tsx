'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, Typography, Dialog, DialogTitle,
  DialogContent, IconButton,
} from '@mui/material'
import { supabase } from '../../services/dbConnection'
import Image from 'next/image'
import { Visibility } from '@mui/icons-material'
import Cookies from 'js-cookie'

interface Memorial {
  id: string
  nombre: string
  celular: string
  imagen_url: string
}

export default function MemorialesPage() {
  const router = useRouter()
  const [memoriales, setMemoriales] = useState<Memorial[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(null)
  const [isGuadalupe, setIsGuadalupe] = useState<boolean | null>(null)

  // Leer cookie al montar
  useEffect(() => {
    const raw = Cookies.get('isGuadalupe')
    if (raw !== undefined) setIsGuadalupe(raw === 'true')
    else setIsGuadalupe(null)
  }, [])

  useEffect(() => {
    if (isGuadalupe === null) return
    let cancelled = false
    const cargarMemoriales = async () => {
      const { data, error } = await supabase
        .from('memorial')
        .select('id, nombre, celular, imagen_url')
        .eq('bGuadalupe', isGuadalupe)
        .order('id', { ascending: false })

      if (!cancelled && !error && data) setMemoriales(data)
    }
    cargarMemoriales()
    return () => { cancelled = true }
  }, [isGuadalupe])

  const eliminarMemorial = async (id: string) => {
    await supabase.from('memorial').delete().eq('id', id)
    setMemoriales(prev => prev.filter(m => m.id !== id))
  }

  const reenviarWhatsapp = (celular: string, imagenUrl: string) => {
    const url = `https://api.whatsapp.com/send?phone=${celular}&text=${encodeURIComponent(`Aquí está el memorial: ${imagenUrl}`)}`
    window.open(url, '_blank')
  }

  const abrirModal = (memorial: Memorial) => {
    setSelectedMemorial(memorial)
    setOpenModal(true)
  }

  // 🔴 Cerrar sesión: limpia cookies cliente + pide al servidor borrar httpOnly
  const handleLogout = async () => {
    try {
      // Llama al endpoint para limpiar la cookie httpOnly
      await fetch('/api/logout', { method: 'POST' }).catch(() => {})
    } finally {
      // Limpia estado y redirige
      setIsGuadalupe(null)
      setMemoriales([])
      setOpenModal(false)
      setSelectedMemorial(null)
      router.replace('/login') // ajusta la ruta a tu pantalla de acceso
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <Card className="w-full max-w-6xl shadow-lg border border-gray-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            {isGuadalupe !== null && (
              <Image
                src={isGuadalupe ? '/images/logoGuadalupe.svg' : '/images/logoSanRamon.svg'} // 👈 rutas según la cookie
                alt={isGuadalupe ? 'Funeraria Guadalupe' : 'Funeraria San Ramón'}
                width={92}
                height={92}
              />
            )}
            <Typography variant="h5" className="font-bold text-gray-800">
              Memoriales Generados
            </Typography>

            <div className="flex gap-2">
              <Button variant="contained" color="primary" href="/SanRamon">
                Nuevo Memorial
              </Button>
              <Button variant="outlined" color="error" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-200">
                  <TableCell className="font-semibold">Nombre</TableCell>
                  <TableCell className="font-semibold">Celular</TableCell>
                  <TableCell className="font-semibold">Vista</TableCell>
                  <TableCell className="font-semibold">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memoriales.length > 0 ? (
                  memoriales.map((memorial) => (
                    <TableRow key={memorial.id}>
                      <TableCell>{memorial.nombre}</TableCell>
                      <TableCell>{memorial.celular}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => abrirModal(memorial)}>
                          <Visibility />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => eliminarMemorial(memorial.id)}
                          >
                            Eliminar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => reenviarWhatsapp(memorial.celular, memorial.imagen_url)}
                          >
                            Reenviar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No hay memoriales registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Vista Previa */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Vista del Memorial</DialogTitle>
        <DialogContent>
          {selectedMemorial && (
            <Image
              src={selectedMemorial.imagen_url}
              alt="memorial"
              width={0}
              height={0}
              sizes="100vw"
              className="w-auto h-[80vh] mx-auto object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
