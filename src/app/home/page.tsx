'use client'

import { toPng } from 'html-to-image'
import { useState } from 'react'
import { Great_Vibes, Didact_Gothic } from 'next/font/google'
import { supabase } from '../../services/dbConnection' // ajusta la ruta si es diferente
import Image from 'next/image'

const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] })
const didactGothic = Didact_Gothic({ subsets: ['latin'], weight: ['400'] })

const defaultImages = [
  "/images/img.png",
  "/images/img4.png",
  "/images/img5.png"
]

const recintoImages = [
    "/images/logoSanRamon.svg",
    "/images/logoGuadalupe.svg",
]

const FormInput = ({
  label,
  value,
  onChange,
  type = 'text'
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}) => (
  <div className="w-full">
    <label className="block font-medium text-gray-900 text-sm">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
)

const uploadImageToSupabase = async (base64Image: string, filename: string) => {
  const response = await fetch(base64Image)
  const blob = await response.blob()

  const { error } = await supabase.storage
    .from("imagenesfuneraria")
    .upload(`despedidas/${filename}`, blob, {
      contentType: "image/png",
      upsert: true,
    })

  if (error) throw error

  const { data: publicUrl } = supabase.storage
    .from("imagenesfuneraria")
    .getPublicUrl(`despedidas/${filename}`)

  return publicUrl.publicUrl
}

export const HomeApp = () => {
  const [name, setName] = useState("Fulanito")
  const [apellido, setApellido] = useState("Perez Maldonado")
  const [nacimiento, setNacimiento] = useState("1968-03-19")
  const [fallecimiento, setFallecimiento] = useState("2025-03-20")
  const [darkMode, setDarkMode] = useState("text-black")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState(defaultImages[0])
  const [imageSelect, setImageSelect] = useState(defaultImages[0])
  const [imageFuneraria, setFuneraria] = useState(recintoImages[0])
  const [iglesia, setIglesia] = useState("San Ramón Casa Funeral - La Piedad")
    const [fechaDespedida, setFechaDespedida] = useState("2025-04-15")
    const [horaDespedida, setHoraDespedida] = useState("15:00")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImageSelect(URL.createObjectURL(file))
  }

  const handleNext = () => {
    if (currentIndex < defaultImages.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setSelectedImage(defaultImages[nextIndex])
      setDarkMode(nextIndex < 0 ? "text-white" : "text-black")
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setSelectedImage(defaultImages[prevIndex])
      setDarkMode(prevIndex < 0 ? "text-white" : "text-black")
    }
  }

  // const exportToPng = () => {
  //   const node = document.getElementById("html-element-id")
  //   if (!node) return console.error("El elemento no existe.")
  //     toPng(node, {
  //       width: 720,
  //       height: 1280
  //     })
  //     .then(dataUrl => {
  //       const link = document.createElement("a")
  //       link.href = dataUrl
  //       link.download = "exported-image.png"
  //       link.click()
  //     })
  //     .catch(err => console.error("Error al exportar imagen:", err))
  // }

  const getMensajeDespedida = () => {
    const date = new Date(fechaDespedida)
    const dia = date.getDate()
    const mes = date.toLocaleDateString("es-MX", { month: 'long' })
  
    const mensaje = `Agradecemos la presencia de amigos y familiares durante el último adiós el día ${dia} de ${mes} a las ${horaDespedida} en el recinto ${iglesia}.`
    return mensaje.toUpperCase()
  }
  
  const handleSendWhatsapp = async () => {
    const node = document.getElementById("html-element-id")
    if (!node) return console.error("El elemento no existe.")
  
    try {
      const dataUrl = await toPng(node)
      const filename = `despedida_${Date.now()}.png`
      const imageUrl = await uploadImageToSupabase(dataUrl, filename)
      const viewerUrl = `https://funeraria-jade.vercel.app//ver/img?url=${encodeURIComponent(imageUrl)}`
  
      const mensaje = `🕊️ EN MEMORIA DE ${name} ${apellido}\n\n${getMensajeDespedida()}\n\n📎 Ver imagen: ${viewerUrl}\n📍 Ubicación: https://www.google.com/maps/search/${encodeURIComponent(iglesia)}`

      window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank")
    } catch (error) {
      console.error("Error al generar imagen o subir a Supabase:", error)
    }
  }
  

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      {/* FORMULARIO */}
      <div className="lg:w-2/6 w-full p-4">
        <div className="bg-gray-100 p-4 h-full rounded-xl flex flex-col">
          <h2 className="text-center text-xl font-bold mb-3 text-black">Información</h2>

          <input
            type="file"
            onChange={handleImageUpload}
            className="mb-4 w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 border border-gray-300"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Nombres" value={name} onChange={e => setName(e.target.value)} />
            <FormInput label="Apellidos" value={apellido} onChange={e => setApellido(e.target.value)} />
            <FormInput label="Nacimiento" type="date" value={nacimiento} onChange={e => setNacimiento(e.target.value)} />
            <FormInput label="Fallecimiento" type="date" value={fallecimiento} onChange={e => setFallecimiento(e.target.value)} />
          </div>

          <div className="mt-4 space-y-2">
            <div>
                <label className="block text-sm font-medium text-gray-900">Funeraria</label>
                <select
                value={iglesia}
                onChange={(e) => {
                  const value = e.target.value
                  setIglesia(value)
                
                  // Detectar qué imagen usar según el texto
                  if (value.startsWith("San Ramón Casa Funeral")) {
                    setFuneraria(recintoImages[0])
                  } else if (value.startsWith("Funeral Guadalupe")) {
                    setFuneraria(recintoImages[1])
                  }
                }}
                className="mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                >
                <optgroup label="San Ramón Casa Funeral">
                    <option value="San Ramón Casa Funeral - La Piedad">La Piedad</option>
                    <option value="San Ramón Casa Funeral - Resurrección">Resurrección</option>
                    <option value="San Ramón Casa Funeral - Sagrado Corazón">Sagrado Corazón</option>
                    <option value="San Ramón Casa Funeral - Guadalupana">Guadalupana</option>
                    <option value="San Ramón Casa Funeral - Fátima">Fátima</option>
                    <option value="San Ramón Casa Funeral - Juan Pablo II">Juan Pablo II</option>
                    <option value="San Ramón Casa Funeral - San Miguel">San Miguel</option>
                </optgroup>
                <optgroup label="Recinto Funeral Guadalupe">
                    <option value="Funeral Guadalupe - La Piedad">La Piedad</option>
                    <option value="Funeral Guadalupe - Anunciación">Anunciación</option>
                    <option value="Funeral Guadalupe - Magna">Magna</option>
                </optgroup>
                </select>
            </div>

            <FormInput
                label="Fecha de despedida"
                type="date"
                value={fechaDespedida}
                onChange={e => setFechaDespedida(e.target.value)}
            />

            <FormInput
                label="Hora"
                type="time"
                value={horaDespedida}
                onChange={e => setHoraDespedida(e.target.value)}
            />
        </div>


          <div className="flex justify-center items-center space-x-3 mt-6">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="btn">⪻ Anterior</button>
            <button onClick={handleSendWhatsapp} className="btn bg-green-500 hover:bg-green-600 text-white">Guardar y Enviar por WhatsApp</button>
            <button onClick={handleNext} className="btn">Siguiente ⪼</button>
          </div>
        </div>
      </div>

      {/* VISTA PREVIA */}
      <div className="lg:w-4/6 w-full p-4">
        <div className="rounded-xl h-full flex justify-center items-center relative">
          <div id="html-element-id" className="relative w-full h-full">
          <Image
            src={selectedImage}
            alt="Imagen de fondo"
            width={1080}
            height={1920}
            className="w-full h-full object-contain rounded-md"
          />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-center space-y-4 w-full max-w-[700px] px-4 pt-20 md:pt-40 lg:pt-30 xl:pt-30 xl:px-12 2xl:px-9">
                <h3 className={`${darkMode} ${didactGothic.className} text-black text-xs md:text-4xl lg:mx-30 lg:text-base 2xl:text-xl`}>
                  CON PROFUNDA TRISTEZA ANUNCIAMOS EL FALLECIMIENTO DE
                </h3>

                <h1 className={`${greatVibes.className} ${darkMode} text-3xl md:text-8xl lg:text-6xl lg:px-8 2xl:text-7xl`}>
                  {name} {apellido}
                </h1>

                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg md:w-96 md:h-96 lg:h-48 lg:w-48 xl:w-48 xl:h-48 2xl:w-84 2xl:h-84">
                  <Image
                    src={imageSelect}
                    alt="Imagen del difunto"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />

                </div>

                <p className={`${darkMode} text-sm md:text-lg 2xl:text-xl`}>{nacimiento} - {fallecimiento}</p>

                <p className={`${darkMode} ${didactGothic.className} w-full text-center uppercase text-xs md:text-4xl lg:text-base lg:px-27 2xl:text-xl `}>
                    {getMensajeDespedida()}
                </p>

                <div className="w-24 h-24 md:w-56 md:h-56 lg:w-38 lg:h-38 2xl:w-52 2xl:h-52">
                  <Image
                    src={imageFuneraria}
                    alt="Logo funeraria"
                    width={150}
                    height={150}
                    className="w-full h-full object-contain"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid #ccc;
          background-color: white;
          color: #000;
          transition: all 0.2s ease;
        }
        .btn:hover {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
