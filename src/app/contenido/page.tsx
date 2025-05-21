'use client'

import { useEffect, useRef, useState } from 'react'
import { TextField, MenuItem, ListSubheader, Card, CardContent, Button } from '@mui/material'
import { useDropzone } from 'react-dropzone'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { supabase } from '../../services/dbConnection'
import { useRouter } from 'next/navigation'

const defaultImages = [
  "/images/img.png",
  "/images/img1.png",
  "/images/img2.png",
  "/images/img3.png",
  "/images/img4.png"
]

export default function HomePageContenido() {
  const [imageIndex, setImageIndex] = useState(0)
  const imageSelect = defaultImages[imageIndex]
  const [name, setName] = useState("Fulanito")
  const [apellido, setApellido] = useState("Perez Maldonado")
  const [nacimiento, setNacimiento] = useState("1968-03-19")
  const [iglesiaError, setIglesiaError] = useState(false)
  const [fallecimiento, setFallecimiento] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const fontSize = 36
  const [fechaDespedida, setFechaDespedida] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [horaDespedida, setHoraDespedida] = useState("15:00")
  const [iglesia, setIglesia] = useState('')
  const recintoImages = ["/images/logoSanRamon.svg", "/images/logoGuadalupe.svg"]
  const [funeraria, setFuneraria] = useState('')
  const [nameFontSize, setNameFontSize] = useState(60)
  const [celular, setCelular] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null)
  const router = useRouter()

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      const img = new Image()
      img.onload = () => setUploadedImage(img)
      img.src = URL.createObjectURL(file)
    }
  })

  const getMensajeDespedida = () => {
    const date = new Date(`${fechaDespedida}T12:00:00`)
    const dia = date.getDate()
    const mes = date.toLocaleDateString("es-MX", { month: 'long' })
    return `Agradecemos la presencia de amigos y familiares durante el último adiós el día ${dia} de ${mes} a las ${horaDespedida} en el recinto ${iglesia}.`.toUpperCase()
  }

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const anio = fecha.getFullYear()
    return `${dia}/${mes}/${anio}`
  }

  useEffect(() => {
    const img = new Image()
    img.onload = () => setImage(img)
    img.src = imageSelect
  }, [imageSelect])

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines?: number): number {
    const words = text.split(' ')
    let line = ''
    let currentY = y
    let lineCount = 0

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const testWidth = ctx.measureText(testLine).width
      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY)
        line = words[i] + ' '
        currentY += lineHeight
        lineCount++
        if (maxLines && lineCount >= maxLines - 1) break
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, currentY)
    return currentY + lineHeight
  }

  useEffect(() => {
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const screenHeight = window.innerHeight
    const scale = screenHeight / image.height
    const width = image.width * scale
    const height = screenHeight
    const mensaje = getMensajeDespedida()
    const isDarkImage = imageIndex < 3
    const isMargin = imageIndex < 2

    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(image, 0, 0, width, height)
    ctx.fillStyle = isDarkImage ? 'black' : 'white'
    ctx.textAlign = 'center'

    let currentY = isMargin ? 120 : 60
    ctx.font = `${fontSize - 18}px serif`
    currentY = wrapText(ctx, `CON PROFUNDA TRISTEZA ANUNCIAMOS EL FALLECIMIENTO DE`, width / 2, currentY, width, fontSize)
    ctx.font = `${nameFontSize}px 'Great Vibes'`
    currentY = wrapText(ctx, `${name} ${apellido}`, width / 2, currentY + 25, width - 20, nameFontSize, 2)

    if (uploadedImage) {
      const screenWidth = window.innerWidth
      const isSmallScreen = screenWidth < 768
      const imgSize = isSmallScreen ? 160 : 220
      const x = width / 2 - imgSize / 2
      ctx.drawImage(uploadedImage, x, currentY - 20, imgSize, imgSize)
      currentY += imgSize + 40
    }

    const nacimientoFormateado = formatFecha(nacimiento)
    const fallecimientoFormateado = formatFecha(fallecimiento)
    ctx.font = `${fontSize - 18}px serif`
    currentY = wrapText(ctx, `${nacimientoFormateado} ✝ ${fallecimientoFormateado}`, width / 2, currentY, width - 20, fontSize - 5)
    ctx.font = `${fontSize - 18}px serif`
    wrapText(ctx, mensaje, width / 2, currentY + 10, width - 20, fontSize)

    if (funeraria) {
      const logo = new Image()
      logo.onload = () => {
        const logoWidth = 160
        const logoHeight = 100
        const logoX = width / 2 - logoWidth / 2
        const logoY = height - logoHeight
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
      }
      logo.src = funeraria
    }
  }, [image, name, apellido, nacimiento, fallecimiento, fontSize, nameFontSize, uploadedImage, fechaDespedida, horaDespedida, iglesia])

const subirImagenASupabase = async (canvas: HTMLCanvasElement): Promise<string | null> => {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return resolve(null)

      const filename = `despedida_${new Date().toISOString()}.png`
      const { error } = await supabase.storage
        .from('imagenesfuneraria')
        .upload(`despedidas/${filename}`, blob, {
          contentType: 'image/png',
          upsert: true,
        })

      if (error) {
        console.error('Error al subir imagen:', error.message)
        alert('Error al subir imagen a Supabase')
        return resolve(null)
      }

      const url = supabase.storage
        .from('imagenesfuneraria')
        .getPublicUrl(`despedidas/${filename}`).data.publicUrl

      resolve(url)
    }, 'image/png')
  })
}

return (
    <div className="bg-white min-h-screen p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* FORMULARIO IZQUIERDO */}
      <Card>
        <h1 className="text-2xl font-bold text-center">Datos del Memorial</h1>
        <CardContent className="pt-6">
          {/* Dropzone para imagen */}
          <div {...getRootProps()} className="border-2 border-dashed border-gray-400 rounded p-4 text-center cursor-pointer hover:bg-gray-100">
            <input {...getInputProps()} />
            <p>Arrastra o haz clic aquí para subir una imagen (foto del difunto)</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin='normal' />
            <TextField label="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} fullWidth margin='normal' />
            <TextField label="Fecha de nacimiento" type="date" value={nacimiento} onChange={(e) => setNacimiento(e.target.value)} fullWidth margin='normal' />
            <TextField
              label="Fecha de fallecimiento"
              type="date"
              value={fallecimiento}
              onChange={(e) => setFallecimiento(e.target.value)}
              fullWidth
              margin='normal'
            />
            <TextField
              select
              label="Funeraria"
              value={iglesia}
              onChange={(e) => {
                const value = e.target.value
                setIglesia(value)
                setIglesiaError(false) // limpiar el error si selecciona algo

                if (value.startsWith("San Ramón Casa Funeral")) {
                  setFuneraria(recintoImages[0])
                } else if (value.startsWith("Funeral Guadalupe")) {
                  setFuneraria(recintoImages[1])
                }
              }}
              fullWidth
              margin="normal"
              error={iglesiaError}
              helperText={iglesiaError ? 'Selecciona una funeraria' : ''}
            >
              <ListSubheader>San Ramón Casa Funeral</ListSubheader>
              <MenuItem value="San Ramón Casa Funeral - La Piedad">La Piedad</MenuItem>
              <MenuItem value="San Ramón Casa Funeral - Resurrección">Resurrección</MenuItem>
              <MenuItem value="San Ramón Casa Funeral - Sagrado Corazón">Sagrado Corazón</MenuItem>
              <MenuItem value="San Ramón Casa Funeral - Guadalupana">Guadalupana</MenuItem>
              <MenuItem value="San Ramón Casa Funeral - Fátima">Fátima</MenuItem>
              <MenuItem value="San Ramón Casa Funeral - Juan Pablo II">Juan Pablo II</MenuItem>
              <MenuItem value="San Ramón Casa Funeral - San Miguel">San Miguel</MenuItem>

              <ListSubheader>Recinto Funeral Guadalupe</ListSubheader>
              <MenuItem value="Funeral Guadalupe - La Piedad">La Piedad</MenuItem>
              <MenuItem value="Funeral Guadalupe - Anunciación">Anunciación</MenuItem>
              <MenuItem value="Funeral Guadalupe - Magna">Magna</MenuItem>
            </TextField>
            <TextField
                label="Fecha de despedida"
                type="date"
                value={fechaDespedida}
                onChange={e => setFechaDespedida(e.target.value)}
                fullWidth
                margin="normal"
            />

            <TextField
                label="Hora"
                type="time"
                value={horaDespedida}
                onChange={e => setHoraDespedida(e.target.value)}
                fullWidth
                margin="normal"
            />   
            <TextField
              label="Celular de contacto"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              fullWidth
              margin="normal"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tamaño del nombre: {nameFontSize}px
              </label>
              <input
                type="range"
                min={28}
                max={80}
                value={nameFontSize}
                onChange={(e) => setNameFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setImageIndex((prev) => (prev - 1 + defaultImages.length) % defaultImages.length)}
            >
              Anterior
            </Button>
            

            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                if (!iglesia) {
                  setIglesiaError(true)
                  alert('Por favor selecciona una funeraria antes de continuar.')
                  return
                }

                  if (!celular.trim()) {
                    alert('Por favor ingresa un número de celular antes de continuar.')
                    return
                  }


                setIglesiaError(false)

                const canvas = canvasRef.current
                if (!canvas) return

                const url = await subirImagenASupabase(canvas)
                if (!url) return

                // Guardar en Supabase
                const { error } = await supabase.from('memorial').insert({
                  nombre: `${name} ${apellido}`,
                  celular, // puedes agregar un input para el celular si es necesario
                  imagen_url: url,
                })

                if (error) {
                  console.error('Error al guardar memorial:', error.message)
                  alert('Ocurrió un error al guardar la información del memorial.')
                  return
                }

                // Compartir por WhatsApp
                // const mensaje = `Compartimos con cariño esta imagen de despedida:\n${url}`
                const mensaje = `🕊️ EN MEMORIA DE ${name} ${apellido}\n\n${getMensajeDespedida()}\n\n📎 Ver imagen: ${url}\n\n📍 Ubicación: https://www.google.com/maps/search/${encodeURIComponent(iglesia)}`


                // Asegúrate de que el número no tenga espacios ni guiones
                const celularLimpio = celular.replace(/\D/g, '')
                if (!/^\d{10}$/.test(celularLimpio)) {
                  alert('El número debe tener 10 dígitos sin espacios ni símbolos.')
                  return
                }
                const whatsappURL = `https://wa.me/52${celularLimpio}?text=${encodeURIComponent(mensaje)}`
                window.open(whatsappURL, '_blank')
                router.push('/') // Cambia la ruta según tu estructura

              }}
            >
              Compartir por WhatsApp
            </Button>

            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => setImageIndex((prev) => (prev + 1) % defaultImages.length)}
            >
              Siguiente
            </Button>
          </div>
          
        </CardContent>

      </Card>

      {/* CANVAS DERECHO */}
      <div className="flex justify-center items-center">
        <canvas ref={canvasRef} className="max-w-full border shadow-md" />
      </div>
    </div>
  )
}