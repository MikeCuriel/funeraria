// app/ver/[img]/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

const VerImagen = () => {
  const searchParams = useSearchParams()
  const imgUrl = searchParams.get('url')

  if (!imgUrl) {
    return (
      <div className="h-screen flex justify-center items-center text-red-500 font-semibold">
        No se proporcionó ninguna imagen para mostrar.
      </div>
    )
  }

  return ( 
      <div className="w-full h-full shadow-md rounded-lg overflow-hidden border bg-white">
        <Image
          src={imgUrl ?? ''}
          alt="Imagen de despedida"
          width={1080}
          height={1920}
          className="w-full h-auto object-contain"
          unoptimized
        />
      </div>
  )
}

export default VerImagen