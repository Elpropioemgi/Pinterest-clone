"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
        router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center font-semibold justify-center min-h-screen bg-white color-black">
      <img src="/public/pint.png" alt="" className="w-8 mb-2" />
      <h1 className="text-3xl mb-4">Bienvenido de nuevo</h1>
      <p className="text-500 text-center font-bold text-sm mt-1">
        Inicia sesión para continuar
      </p>

      <form onSubmit={handleLogin} className="flex flex-col w-80 space-y-3">

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
          placeholder="Contraseña"
          className="w-full border rounded-lg px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-red-600">{message}</p>
      )}

      <p
        className="mt-3 text-center text-sm text-blue-600 underline cursor-pointer"
        onClick={() => (window.location.href = "/register")}
      >
        ¿No tienes cuenta? Regístrate
      </p>
     </div>
  );
}
  
