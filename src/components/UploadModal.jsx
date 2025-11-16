"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { X } from "lucide-react";

export default function UploadModal({ onClose }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      alert("Debes iniciar sesión para subir imágenes");
      setLoading(false);
      return;
    }

    if (!file) {
      alert("Selecciona una imagen");
      setLoading(false);
      return;
    }

    // Subir archivo al bucket
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from("pins")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      alert("Error subiendo la imagen");
      setLoading(false);
      return;
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from("pins")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Insertar en la tabla pins
    const { error: insertError } = await supabase.from("pins").insert({
      user_id: user.id,
      title,
      image_url: imageUrl,
    });

    if (insertError) {
      console.error(insertError);
      alert("Error guardando los datos en la base");
    } else {
      alert("Imagen subida correctamente 🎉");
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <X />
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Subir una imagen
        </h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Título de la imagen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded-lg"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            {loading ? "Subiendo..." : "Subir imagen"}
          </button>
        </form>
      </div>
    </div>
  );
}
