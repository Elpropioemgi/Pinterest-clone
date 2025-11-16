"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setAlreadyRegistered(false);
  
    // 1️⃣ Registrar usuario
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already")) {
        setAlreadyRegistered(true);
        setMessage("Ya estás registrado anteriormente, ¿prefieres iniciar sesión?");
      } else {
        setMessage("Error: " + signUpError.message);
      }
      setLoading(false);
      return;
    }
  
    // 2️⃣ Obtener el usuario directamente 
    const user = signUpData.user;
    if (!user) {
      setMessage("No se pudo obtener el usuario tras el registro.");
      setLoading(false);
      return;
    }
  
    let avatarUrl = null;
  
    // 3️⃣ Subir avatar si existe
    if (avatar) {
      const { data: avatarData, error: avatarError } = await supabase.storage
        .from("avatars")
        .upload(`avatars/${user.id}-${avatar.name}`, avatar);
  
      if (!avatarError) {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(avatarData.path);
  
        avatarUrl = publicUrlData.publicUrl;
      }
    }
  
    // 4️⃣ Insertar perfil
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        username,
        birthday,
        avatar_url: avatarUrl,
        email: user.email,
      },
    ]);
  
    if (profileError) {
      setMessage("Error creando perfil: " + profileError.message);
    } else {
      setMessage("Registro exitoso.");
    }
  
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 0);
  };

  // 🔹 JSX (debe ser lo último que devuelve la función)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black font-semibold">
      <img src="/pint.png" alt="Logo" className="w-8 mb-2" />
      <h1 className="text-3xl mb-4">Te damos la bienvenida a Pinterest</h1>
      <p className="text-gray-500 text-center font-bold text-sm mt-1">
        Encuentra nuevas ideas para experimentar
      </p>

      <form onSubmit={handleRegister} className="flex flex-col w-80 space-y-3">
        <label className="text-sm font-medium">Nombre completo</label>
        <input
          type="text"
          placeholder="Tu nombre"
          className="w-full border rounded-lg px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="text-sm font-medium">Correo electrónico</label>
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full border rounded-lg px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="text-sm font-medium">Contraseña</label>
        <input
          type="password"
          placeholder="Crea una contraseña"
          className="w-full border rounded-lg px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 text-center">
          Usa ocho letras o más, números y símbolos
        </p>

        <label className="text-sm font-medium">Fecha de nacimiento</label>
        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />

        <label className="text-sm font-medium">Foto de perfil (opcional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files[0])}
        />

        

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Continuar"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}

      {alreadyRegistered && (
        <p
          className="mt-2 text-center text-sm text-blue-600 underline cursor-pointer"
          onClick={() => (window.location.href = "/login")}
        >
          Ir a iniciar sesión
        </p>
      )}
    </div>
  );
}
