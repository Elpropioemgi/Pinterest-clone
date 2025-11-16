"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import UploadModal from "@/components/UploadModal";
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [pins, setPins] = useState([]);
  const [likes, setLikes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        const { data: pinsData } = await supabase
          .from("pins")
          .select("*")
          .eq("user_id", data.user.id);
        setPins(pinsData || []);

        const { data: likesData } = await supabase
          .from("likes")
          .select("*, pins(*)")
          .eq("user_id", data.user.id);
        setLikes(likesData || []);

        const { data: favData } = await supabase
          .from("favorites")
          .select("*, pins(*)")
          .eq("user_id", data.user.id);
        setFavorites(favData || []);
      }
    };

    loadUserData();
  }, [showUpload]);

  if (!user)
    return <p className="text-center mt-20 text-gray-500">Inicia sesión</p>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="p-8">
      {/* ENCABEZADO DEL PERFIL */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <img
            src={
              user.user_metadata?.avatar_url ||
              "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
            }
            alt="avatar"
            width={80}
            height={80}
            className="rounded-full border shadow"
          />

          <div>
            <h1 className="text-3xl font-bold">{user.user_metadata?.name || "Usuario"}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            ➕ Subir imagen
          </button>

          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      {/* PUBLICACIONES */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Tus publicaciones</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {pins.length === 0 && <p className="text-gray-500">No has subido nada aún.</p>}
          {pins.map((pin) => (
            <img
              key={pin.id}
              src={pin.image_url}
              alt={pin.title}
              className="rounded-xl shadow-md hover:scale-105 transition"
            />
          ))}
        </div>
      </section>

      {/* LIKES */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Tus likes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {likes.length === 0 && <p className="text-gray-500">Aún no has dado like a nada.</p>}
          {likes.map((like) => (
            <img
              key={like.id}
              src={like.pins.image_url}
              alt={like.pins.title}
              className="rounded-xl shadow-md hover:scale-105 transition"
            />
          ))}
        </div>
      </section>

      {/* GUARDADOS */}
      <section className="mt-12 mb-20">
        <h2 className="text-2xl font-semibold mb-4">Tus guardados</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {favorites.length === 0 && (
            <p className="text-gray-500">No has guardado ningún Pin aún.</p>
          )}
          {favorites.map((fav) => (
            <img
              key={fav.id}
              src={fav.pins.image_url}
              alt={fav.pins.title}
              className="rounded-xl shadow-md hover:scale-105 transition"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

