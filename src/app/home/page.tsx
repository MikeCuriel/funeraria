"use client";

import { toPng } from "html-to-image";
import { useState } from "react";
import {Great_Vibes, Didact_Gothic} from 'next/font/google';


const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400']  
});

const didactGothic = Didact_Gothic({
  subsets: ['latin'],
  weight: ['400']  
});

const exportToPng = () => {
    console.log("entre");
    const node = document.getElementById("html-element-id");
  
    if (node) {
      toPng(node as HTMLElement, { width: 1080, height: 1920 }) // Cambia las dimensiones aquí
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "exported-image.png";
          link.click();
        })
        .catch((error) => {
          console.error("Error exporting to PNG:", error);
        });
    } else {
      console.error("El elemento no existe.");
    }
  };


  export const HomeApp = () => {

    const defaultImages = [
        "/images/img1.png",
        "/images/img2.png",
        "/images/img3.png",
        "/images/img4.png",
        "/images/img5.png"
    ];

    const [name, setName] = useState("Fulanito");
    const [apellido, setApellido] = useState("Perez Maldonado");
    const [nacimiento, setNacimiento] = useState("1968-03-19");
    const [fallecimiento, setFallecimiento] = useState("2025-03-20");
    const [iglesia, setIglesia] = useState("Misa en su honor Parroquia de San Juan Bosco calle cualquiera #cualquier, Col. cualquiera, Guadalajara, Jal.");
    const [velorio, setVelorio] = useState("Su cuerpo sera velado el día de hoy 11 de mayo en la funeraria San Ramón Casa Funeral a las 15:00");
    const [mensaje, setMensaje] = useState("Aunque la partida duele, sabemos que su legado de amor y esperanza perdurará en cada vida que tocó. La ausencia física nunca podrá apagar la luz de su espíritu, que sigue brillando en el corazón de todos los que lo amaron.");
    const [darkMode, setDarkMode] = useState("text-white");
    const [selectedImage, setSelectedImage] = useState(defaultImages[0]);
    const [imageSelect, setImageSelect] = useState(defaultImages[0]);

    const [currentIndex, setCurrentIndex] = useState(0);

    // Función para mover hacia la izquierda
    const handlePrev = (currentIndex: number) => {
        if (currentIndex > 0) {
            if(currentIndex < 3)
                setDarkMode("text-white");
            else
                setDarkMode("text-black");
        setCurrentIndex(currentIndex - 1);
        handleSelectImage(defaultImages[currentIndex-1]);
        }
    };

    // Función para mover hacia la derecha
    const handleNext = () => {
        if (currentIndex < defaultImages.length - 1) {
            if(currentIndex < 1)
                setDarkMode("text-white");
            else
                setDarkMode("text-black");
        setCurrentIndex(currentIndex + 1);
        handleSelectImage(defaultImages[currentIndex+1]);
        }
    };

    // Función para seleccionar una imagen
    const handleSelectImage = (image:string) => {
        setSelectedImage(image);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          setImageSelect(imageUrl);
        }
      };

    return(
        <div className="h-screen w-full flex ">
            <div className="h-full w-2/6 p-4">
                <div className="bg-gray-100 p-4 h-full rounded-xl m-0 flex flex-col">
                    <h2 className="flex justify-center items-center text-xl font-bold">Información</h2>
                    <div className="flex flex-col">
                        <label className="block text-lg font-medium text-black text-left">Imagen</label>                      
                        <input type="file" className="block w-full mb-4 rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-400" onChange={handleImageUpload}/>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-6">
                        {/* INGRESAR DATOS */}
                        <div className="sm:col-span-3">
                            <label className="block font-medium text-gray-900 text-lg">Nombres</label>
                            <div className="mt-2">
                                <input type="text" value={name} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" onChange={(e) => setName(e.target.value)}/>
                            </div>
                        </div>
                        <div className="sm:col-span-3">
                            <label className="block font-medium text-gray-900 text-lg">Apellidos</label>
                            <div className="mt-2">
                                <input type="text" value={apellido} name="first-name" id="first-name" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" onChange={(e) => setApellido(e.target.value)}/>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-6">
                        {/* INGRESAR DATOS */}
                        <div className="sm:col-span-3">
                            <label className="block text-lg font-medium text-gray-900">Nacimiento</label>
                            <div className="mt-2">
                                <input type="date" value={nacimiento} name="first-name" id="first-name" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" onChange={(e) => setNacimiento(e.target.value)}/>
                            </div>
                        </div>
                        <div className="sm:col-span-3">
                            <label className="block text-lg font-medium text-gray-900">Fallecimiento</label>
                            <div className="mt-2">
                                <input type="date" value={fallecimiento} name="first-name" id="first-name" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" onChange={(e) => setFallecimiento(e.target.value)}/>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4">
                        {/* INGRESAR DATOS */}
                        <div className="sm:col-span-3">
                            <label className="block font-medium text-gray-900 text-lg">Iglesia</label>
                            <div className="mt-2">
                                <input type="text" value={iglesia} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" onChange={(e) => setIglesia(e.target.value)}/>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4">
                        {/* INGRESAR DATOS */}
                        <div className="sm:col-span-3">
                            <label className="block font-medium text-gray-900 text-lg">Velorio</label>
                            <div className="mt-2">
                                <input type="text" value={velorio} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" onChange={(e) => setVelorio(e.target.value)}/>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 col-span-full">
                        <label className="block text-lg font-medium text-gray-900">Mensaje emotivo</label>
                        <div className="mt-2">
                            <textarea value={mensaje} className="block h-24 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" onChange={(e) => setMensaje(e.target.value)}></textarea>
                        </div>                        
                    </div>
                    <div className="flex space-x-2.5 mt-4 justify-center items-center">
                        <button onClick={() => handlePrev(currentIndex)} disabled={currentIndex === 0} className="flex items-center py-2 px-3 rounded font-medium select-none border text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-colors hover:border-blue-600 hover:bg-blue-400 hover:text-white dark:hover:text-white" >⪻ Anterior</button>
                        <button onClick={exportToPng} className="flex items-center py-2 px-3 rounded font-medium select-none border text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-colors hover:border-green-600 hover:bg-green-500 hover:text-white dark:hover:text-white" >Guardar</button>
                        <button onClick={handleNext} className="flex items-center py-2 px-3 rounded font-medium select-none border text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-colors hover:border-blue-600 hover:bg-blue-400 hover:text-white dark:hover:text-white">Siguiente ⪼</button>
                    </div>
                </div>
            </div>
            <div className="h-full w-4/6 p-4">
                <div className="p-4 h-full rounded-xl m-0 flex flex-col">
                    <div id="html-element-id" className="flex flex-col h-full relative">
                        <img className=" h-full w-full aspect-square rounded-md object-contain" src={selectedImage}/>
                        <div className="absolute grid grid-col-1 grid-rows-16 h-full w-full px-25 mt-4">
                            <h2 className={`${darkMode} text-2xl font-mono flex justify-center items-end`}>EN MEMORIA DE</h2>
                            <div className="flex w-full h-full row-span-3 justify-center items-center mt-4">
                                <div className=" flex justify-center items-center transform w-36 h-36 rounded-full overflow-hidden shadow-lg  ">
                                    <img className="w-full h-full object-fill" src={imageSelect}/>
                                </div>
                            </div>
                            <div className={`${darkMode} w-full row-span-3 flex items-center justify-center mt-8`}>
                                <h1 className={`${greatVibes.className} text-6xl h-full text-center mt-2 px-45`}>{name} {apellido}</h1>
                            </div>
                            <div className={`${darkMode} w-full items-center justify-center mt-11`}>
                                <h1 className={`text-sm h-full items-end text-center`}>{nacimiento} - {fallecimiento}</h1>
                            </div>
                            <div className={`${darkMode} row-span-4 w-full h-full flex items-start justify-center text-white px-52 mt-6`}>
                                <h1 className={`${didactGothic.className} ${darkMode} text-base text-center mt-2 ml-1.5 mr-1.5`}>{mensaje}</h1>
                            </div>
                            <div className="row-span-3 h-full w-full flex px-52 mt-3">
                                <div className={`${darkMode} h-full w-full ml-3 mr-3`}>
                                    <h2 className={`${darkMode} text-center text-xs`}>{iglesia}</h2>
                                </div>
                                <div className={`${darkMode} h-full w-full ml-3 mr-3`}>
                                    <h2 className={`${darkMode} text-center text-xs`}>{velorio}</h2>
                                </div>
                            </div>                    
                        </div>
                    </div>

                </div>
            </div>

        </div>

    )
};

export default HomeApp;