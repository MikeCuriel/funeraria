"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { supabase } from "../../services/dbConnection";
import Image from "next/image";
import Cookies from "js-cookie";

import MemorialesTable from "./MemorialesTable";
import MemorialPreviewModal from "./MemorialPreviewModal";

export interface Memorial {
  id: string;
  nombre: string;
  celular: string;
  imagen_url: string;
}

export default function MemorialesPage() {
  const router = useRouter();
  const [memoriales, setMemoriales] = useState<Memorial[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(null);
  const [isGuadalupe, setIsGuadalupe] = useState<boolean | null>(null);

  useEffect(() => {
    const raw = Cookies.get("isGuadalupe");
    setIsGuadalupe(raw === "true" ? true : raw === "false" ? false : null);
  }, []);

  useEffect(() => {
    if (isGuadalupe === null) return;
    let cancelled = false;
    const cargarMemoriales = async () => {
      const { data, error } = await supabase
        .from("memorial")
        .select("id, nombre, celular, imagen_url")
        .eq("bGuadalupe", isGuadalupe)
        .order("id", { ascending: false });
      if (!cancelled && !error && data) setMemoriales(data);
    };
    cargarMemoriales();
    return () => {
      cancelled = true;
    };
  }, [isGuadalupe]);

  // const eliminarMemorial = async (id: string) => {
  //   await supabase.from("memorial").delete().eq("id", id);

  //   await supabase.storage.from("imagenesfuneraria").remove([`memoriales/${id}.png`]);
  //   setMemoriales((prev) => prev.filter((m) => m.id !== id));
  // };

  const eliminarMemorial = async (id: string) => {
    // 1. Primero obtenemos la ruta del archivo desde la BD
    const { data, error } = await supabase
      .from("memorial")
      .select("identificacion") // o el nombre real de tu columna
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("No se pudo obtener el memorial:", error);
      return;
    }

    // const filePath = data.imagen_url as Memorial; // ej: "memoriales/jose-de-jesus-mendoza-olmedo.png"

    // // 2. Borramos el archivo del Storage
    // const { error: storageError } = await supabase.storage
    //   .from("imagenesfuneraria")
    //   .remove([filePath]);

    // if (storageError) {
    //   console.error("Error al borrar del storage:", storageError);
    //   // según tu lógica, puedes decidir si sigues o no borrando de la tabla
    // }

    // 3. Borramos el registro de la tabla
    const { error: dbError } = await supabase
      .from("memorial")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Error al borrar de la tabla memorial:", dbError);
      return;
    }

    // 4. Actualizamos el estado en React
    setMemoriales((prev) => prev.filter((m) => m.id !== id));
  };

  const reenviarWhatsapp = (celular: string, imagenUrl: string) => {
    const url = `https://api.whatsapp.com/send?phone=${celular}&text=${encodeURIComponent(
      `Aquí está el memorial: ${imagenUrl}`
    )}`;
    window.open(url, "_blank");
  };

  const abrirModal = (memorial: Memorial) => {
    console.log("abrirModal", { memorial });
    setSelectedMemorial(memorial);
    setOpenModal(true);
  };

  const handlePage = () => {
    router.replace(isGuadalupe ? "/Guadalupe" : "/SanRamon");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" }).catch(() => {});
    } finally {
      setIsGuadalupe(null);
      setMemoriales([]);
      setOpenModal(false);
      setSelectedMemorial(null);
      router.replace("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <Card className="w-full max-w-6xl shadow-lg border border-gray-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            {isGuadalupe !== null && (
              <Image
                src={isGuadalupe ? "/images/logoGuadalupe.svg" : "/images/logoSanRamon.svg"}
                alt={isGuadalupe ? "Funeraria Guadalupe" : "Funeraria San Ramón"}
                width={120}
                height={120}
              />
            )}
            <Typography variant="h5" className="font-bold text-gray-800">
              Memoriales Generados
            </Typography>
            <div className="flex gap-2">
              <Button variant="contained" color="primary" onClick={handlePage}>
                Nuevo Memorial
              </Button>
              <Button variant="outlined" color="error" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <MemorialesTable
              memoriales={memoriales}
              abrirModal={abrirModal}
              eliminarMemorial={eliminarMemorial}
              reenviarWhatsapp={reenviarWhatsapp}
            />
          </div>
        </CardContent>
      </Card>
      <MemorialPreviewModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        memorial={selectedMemorial}
      />
    </div>
  );
}
