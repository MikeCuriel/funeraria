// pages/test-upload.tsx
"use client";

import { useState } from "react";
import { supabase } from "../../services/dbConnection";

const TestUpload = () => {
  const [status, setStatus] = useState("Esperando prueba...");

  const handleUpload = async () => {
    setStatus("Generando imagen de prueba...");

    // Crear una imagen en blanco simple como Blob
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#3B82F6";
    ctx.fillRect(0, 0, 300, 300);

    const blob: Blob = await new Promise((resolve) => canvas.toBlob(resolve as any, "image/png"));

    const filename = `prueba_${Date.now()}.png`;

    setStatus("Subiendo a Supabase...");

    const { error } = await supabase.storage
      .from("imagenesfuneraria")
      .upload(`test/${filename}`, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/png",
      });

    if (error) {
      console.error(error);
      setStatus("❌ Error: " + error.message);
    } else {
      const { data } = supabase.storage
        .from("imagenesfuneraria")
        .getPublicUrl(`test/${filename}`);
      setStatus("✅ Imagen subida correctamente: " + data.publicUrl);
    }
  };

  return (
    <div className="p-8 text-center">
      <h1 className="text-xl font-bold mb-4">Prueba de Subida a Supabase</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={handleUpload}
      >
        Subir Imagen de Prueba
      </button>
      <p className="mt-6 text-sm font-mono">{status}</p>
    </div>
  );
};

export default TestUpload;