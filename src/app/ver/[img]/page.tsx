// app/ver/[img]/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

const VerImagen = () => {
  const searchParams = useSearchParams()
  const imgUrl = searchParams.get('url')
  console.log(imgUrl);

  if (!imgUrl) {
    return (
      <div className="h-screen flex justify-center items-center text-red-500 font-semibold">
        No se proporcionó ninguna imagen para mostrar.
      </div>
    )
  }

  return ( 
    <div className='w-full h-full flex justify-center '>
      <div className='object-cover'>
        <Image
        className='md:px-40 lg:px-60 xl:px-80' 
              src={imgUrl ?? ''}
              alt="Imagen de despedida"
              fill
            />
      </div>

    </div>
  )
}

export default VerImagen