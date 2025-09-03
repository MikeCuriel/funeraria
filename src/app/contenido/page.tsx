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

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isSelected: boolean;
}

export default function HomePageContenido() {
  const [imageIndex, setImageIndex] = useState(0)
  const imageSelect = defaultImages[imageIndex]
  const [name, setName] = useState("Fulanito")
  const [apellido, setApellido] = useState("Perez Maldonado")
  const [nacimiento, setNacimiento] = useState("1968-03-19")
  const [iglesiaError, setIglesiaError] = useState(false)
  const [fallecimiento, setFallecimiento] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const fontSize = 36
  const [fechaDespedida, setFechaDespedida] = useState(() => new Date().toISOString().split('T')[0])
  const [horaDespedida, setHoraDespedida] = useState("15:00")
  const [iglesia, setIglesia] = useState('')
  const recintoImages = ["/images/logoSanRamon.svg", "/images/logoGuadalupe.svg"]
  const [funeraria, setFuneraria] = useState('')
  const [celular, setCelular] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null)
  const router = useRouter()
  const [imagePosition, setImagePosition] = useState({ x: 200, y: 120 })
  const [resizeDirection, setResizeDirection] = useState<'se' | null>(null)

  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedElement, setSelectedElement] = useState<TextElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)

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

  // Solo inicializar una vez los textos
  useEffect(() => {
    if (!image || textElements.length > 0) return

    const screenHeight = window.innerHeight
    const scale = screenHeight / image.height
    const canvasWidth = image.width * scale
    const isDarkImage = imageIndex < 3
    const color = isDarkImage ? 'black' : 'white'

    const initialTextElements: TextElement[] = [
      {
        id: 'title',
        text: `CON PROFUNDA TRISTEZA ANUNCIAMOS EL FALLECIMIENTO DE`,
        x: 40, y: 60, width: canvasWidth - 40, height: 100,
        fontSize: fontSize - 18, fontFamily: 'serif', color, isSelected: false
      },
      {
        id: 'name',
        text: `${name} ${apellido}`,
        x: 40, y: 120, width: canvasWidth - 80, height: 100,
        fontSize: fontSize - 18, fontFamily: "'Great Vibes'", color, isSelected: false
      },
      {
        id: 'dates',
        text: `${formatFecha(nacimiento)} ✝ ${formatFecha(fallecimiento)}`,
        x: 40, y: 200, width: canvasWidth - 80, height: 100,
        fontSize: fontSize - 18, fontFamily: 'serif', color, isSelected: false
      },
      {
        id: 'message',
        text: getMensajeDespedida(),
        x: 40, y: 260, width: canvasWidth - 80, height: 100,
        fontSize: fontSize - 18, fontFamily: 'serif', color, isSelected: false
      }
    ]

    setTextElements(initialTextElements)
  }, [image])

  // Actualizar contenido sin perder posiciones
  useEffect(() => {
    setTextElements(prev => prev.map(el => {
      if (el.id === 'name') return { ...el, text: `${name} ${apellido}` }
      if (el.id === 'dates') return { ...el, text: `${formatFecha(nacimiento)} ✝ ${formatFecha(fallecimiento)}` }
      if (el.id === 'message') return { ...el, text: getMensajeDespedida() }
      return el
    }))
  }, [name, apellido, nacimiento, fallecimiento, fechaDespedida, horaDespedida, iglesia])

  useEffect(() => {
    if (!selectedElement) return
    setTextElements(prev => prev.map(el =>
      el.id === selectedElement.id ? { ...el, fontSize: selectedElement?.fontSize || 36 } : el
    ))
  }, [selectedElement?.fontSize || 36])

    // 🎯 Cambiar tamaño al elemento seleccionado (solo si hay uno)
  // const handleFontSizeChange = (size: number) => {
  //   if (!selectedElement) return
  //   setTextElements(prev => prev.map(el =>
  //     el.id === selectedElement.id ? { ...el, fontSize: size } : el
  //   ))
  //   setSelectedElement(prev => prev ? { ...prev, fontSize: size } : null)
  // }

  // 🆕 Mostrar slider con tamaño del texto seleccionado
  // const renderFontSizeSlider = () => {
  //   if (!selectedElement) return null
  //   return (
  //     <div>
  //       <label className="block text-sm font-medium text-gray-700 mb-1">
  //         Tamaño de fuente para: <strong>{selectedElement.id.toUpperCase()}</strong>
  //       </label>
  //       <div className="mt-2 text-center text-sm text-gray-700">
  //         {selectedElement.fontSize} px
  //       </div>
  //       <input
  //         type="range"
  //         min={12}
  //         max={80}
  //         value={selectedElement.fontSize}
  //         onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
  //         className="w-full"
  //       />
  //     </div>
  //   )
  // }

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

  const drawCanvas = () => {
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const screenHeight = window.innerHeight
    const scale = screenHeight / image.height
    const width = image.width * scale
    const height = screenHeight


    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(image, 0, 0, width, height)

    // Dibujar todos los elementos de texto
    console.log(textElements)
    textElements.forEach(element => {
      ctx.fillStyle = element.color
      ctx.font = `${element.fontSize}px ${element.fontFamily}`
      ctx.textAlign = 'center'
      
    if (element.isSelected) {
      ctx.strokeStyle = 'blue'
      ctx.lineWidth = 1
      ctx.strokeRect(element.x, element.y, element.width, (selectedElement?.fontSize || 50) + 50)
    }
      
    wrapText(ctx, element.text, element.x + element.width / 2, element.y + element.fontSize, element.width - 20, element.fontSize)

    })

    if (uploadedImage) {
      const screenWidth = window.innerWidth
      const isSmallScreen = screenWidth < 768
      const imgSize = isSmallScreen ? 160 : 220
      // const x = width / 2 - imgSize / 2
      // const y = textElements.find(e => e.id === 'name')?.y || 120
      ctx.drawImage(uploadedImage, imagePosition.x, imagePosition.y, imgSize, imgSize)
    }

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
  }

  useEffect(() => {
    drawCanvas()
  }, [image, textElements, uploadedImage, funeraria])

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Verificar si se hizo clic en un elemento de texto
const clickedElement = textElements.find(element => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  ctx.font = `${element.fontSize}px ${element.fontFamily}`

  const boxX = element.x
  const boxY = element.y
  const boxWidth = element.width
  const boxHeight = element.height

  const isInsideBox = x >= boxX && x <= boxX + boxWidth && y >= boxY && y <= boxY + boxHeight
  const resizeHandleSize = 10
  const isResizeCorner = (
    x >= element.x + element.width - resizeHandleSize &&
    x <= element.x + element.width + resizeHandleSize &&
    y >= element.y + element.height - resizeHandleSize &&
    y <= element.y + element.height + resizeHandleSize
  )

  if (isResizeCorner) {
    setIsResizing(true)
    setResizeDirection('se')
    setSelectedElement(element)
    return true
  }

  if (isInsideBox) {
    setIsDragging(true)
    setDragOffset({
      x: x - element.x,
      y: y - element.y
    })
    setSelectedElement(element)
    return true
  }

  return false
})

    
  // Verificar si se hace clic sobre la imagen del difunto
if (uploadedImage) {
  const imgSize = window.innerWidth < 768 ? 160 : 220
  const xStart = imagePosition.x
  const yStart = imagePosition.y
  const xEnd = xStart + imgSize
  const yEnd = yStart + imgSize

  if (x >= xStart && x <= xEnd && y >= yStart && y <= yEnd) {
    setIsDragging(true)
    setSelectedElement(null) // para que no interfiera con texto
    setDragOffset({ x: x - xStart, y: y - yStart })
    return
  }
}

    if (clickedElement) {
      // Verificar si se hizo clic en un manejador de redimensionamiento
      const isResizeHandle = 
        (x >= clickedElement.x + (canvas.width - 20) / 2 - 5 && 
         x <= clickedElement.x + (canvas.width - 20) / 2 + 5 && 
         ((y >= clickedElement.y - clickedElement.fontSize - 15 && 
           y <= clickedElement.y - clickedElement.fontSize - 5) || 
          (y >= clickedElement.y + 5 && 
           y <= clickedElement.y + 15)))
      
      if (isResizeHandle) {
        setIsResizing(true)
      } else {
        setIsDragging(true)
        setDragOffset({
          x: x - clickedElement.x,
          y: y - clickedElement.y
        })
      }
      
      // Actualizar elementos para marcar solo el seleccionado
      setTextElements(textElements.map(el => ({
        ...el,
        isSelected: el.id === clickedElement.id
      })))
      setSelectedElement(clickedElement)
    } else {
      // Deseleccionar todos los elementos si se hizo clic fuera
      setTextElements(textElements.map(el => ({
        ...el,
        isSelected: false
      })))
      setSelectedElement(null)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || (!isDragging && !isResizing)) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (isDragging && !selectedElement && uploadedImage) {
  // const imgSize = window.innerWidth < 768 ? 160 : 220
  setImagePosition({
    x: x - dragOffset.x,
    y: y - dragOffset.y
  })
  return
}

  if (isResizing && selectedElement) {
    if (resizeDirection === 'se') {
      const newWidth = Math.max(50, x - selectedElement.x)
      const newHeight = Math.max(30, y - selectedElement.y)

      setTextElements(textElements.map(el => {
        if (el.id === selectedElement.id) {
          return {
            ...el,
            width: newWidth,
            height: newHeight
          }
        }
        return el
      }))
    }
  }

if (isDragging && selectedElement) {
  setTextElements(textElements.map(el => {
    if (el.id === selectedElement.id) {
      return {
        ...el,
        x: x - dragOffset.x,
        y: y - dragOffset.y
      }
    }
    return el
  }))
}
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setIsResizing(false)
    setResizeDirection(null)
  }

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
            <TextField label="Nombre" value={name} onChange={(e) => {
              setName(e.target.value)
              setTextElements(textElements.map(el => 
                el.id === 'name' ? {...el, text: `${e.target.value} ${apellido}`} : el
              ))
            }} fullWidth margin='normal' />
            <TextField label="Apellido" value={apellido} onChange={(e) => {
              setApellido(e.target.value)
              setTextElements(textElements.map(el => 
                el.id === 'name' ? {...el, text: `${name} ${e.target.value}`} : el
              ))
            }} fullWidth margin='normal' />
            <TextField label="Fecha de nacimiento" type="date" value={nacimiento} onChange={(e) => {
              setNacimiento(e.target.value)
              setTextElements(textElements.map(el => 
                el.id === 'dates' ? {...el, text: `${formatFecha(e.target.value)} ✝ ${formatFecha(fallecimiento)}`} : el
              ))
            }} fullWidth margin='normal' />
            <TextField
              label="Fecha de fallecimiento"
              type="date"
              value={fallecimiento}
              onChange={(e) => {
                setFallecimiento(e.target.value)
                setTextElements(textElements.map(el => 
                  el.id === 'dates' ? {...el, text: `${formatFecha(nacimiento)} ✝ ${formatFecha(e.target.value)}`} : el
                ))
              }}
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
                setIglesiaError(false)

                if (value.startsWith("San Ramón Casa Funeral")) {
                  setFuneraria(recintoImages[0])
                } else if (value.startsWith("Funeral Guadalupe")) {
                  setFuneraria(recintoImages[1])
                }
                
                // Actualizar el mensaje de despedida
                setTextElements(textElements.map(el => 
                  el.id === 'message' ? {...el, text: getMensajeDespedida()} : el
                ))
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
                onChange={e => {
                  setFechaDespedida(e.target.value)
                  setTextElements(textElements.map(el => 
                    el.id === 'message' ? {...el, text: getMensajeDespedida()} : el
                  ))
                }}
                fullWidth
                margin="normal"
            />

            <TextField
                label="Hora"
                type="time"
                value={horaDespedida}
                onChange={e => {
                  setHoraDespedida(e.target.value)
                  setTextElements(textElements.map(el => 
                    el.id === 'message' ? {...el, text: getMensajeDespedida()} : el
                  ))
                }}
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
              {selectedElement && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamaño de fuente para: <strong>{selectedElement.id.toUpperCase()}</strong>
                  </label>
                  <div className="mt-2 text-center text-sm text-gray-700">
                    {Math.round(selectedElement.fontSize)} px
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={80}
                    value={selectedElement.fontSize}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value)
                      setTextElements(prev => prev.map(el =>
                        el.id === selectedElement.id ? { ...el, fontSize: newSize } : el
                      ))
                      setSelectedElement(prev => prev ? { ...prev, fontSize: newSize } : null)
                    }}
                    className="w-full"
                  />
                </div>
              )}
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
                  celular,
                  imagen_url: url,
                })

                if (error) {
                  console.error('Error al guardar memorial:', error.message)
                  alert('Ocurrió un error al guardar la información del memorial.')
                  return
                }

                const mensaje = `🕊️ EN MEMORIA DE ${name} ${apellido}\n\n${getMensajeDespedida()}\n\n📎 Ver imagen: ${url}\n\n📍 Ubicación: https://www.google.com/maps/search/${encodeURIComponent(iglesia)}`

                const celularLimpio = celular.replace(/\D/g, '')
                if (!/^\d{10}$/.test(celularLimpio)) {
                  alert('El número debe tener 10 dígitos sin espacios ni símbolos.')
                  return
                }
                const whatsappURL = `https://wa.me/52${celularLimpio}?text=${encodeURIComponent(mensaje)}`
                window.open(whatsappURL, '_blank')
                router.push('/')
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
        <canvas 
          ref={canvasRef} 
          className="max-w-full border shadow-md"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>
    </div>
  )
}