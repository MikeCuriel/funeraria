// components/DragDrop.js
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export const DragDrop = () => {
  const onDrop = useCallback((acceptedFiles) => {
    // Aquí puedes manejar los archivos cargados, como subirlos al servidor
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #cccccc",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        cursor: "pointer"
      }}
    >
      <input {...getInputProps()} />
      <p>Arrastra y suelta tus imágenes aquí, o haz clic para seleccionarlas.</p>
    </div>
  );
}