"use client";
import { Search, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cards = [
    {
      title: "Decoración navideña",
      subtitle: "Adornando para Nochebuena",
      img: "https://plus.unsplash.com/premium_photo-1661766896016-16e307246d5d?w=500&auto=format&fit=crop&q=60",
      dinamic: "navidad",
    },
    {
      title: "Estética del intercambio navideño",
      subtitle: "Regala y recibe",
      img: "https://images.unsplash.com/photo-1761295142589-8dc02f83a514?w=500&auto=format&fit=crop&q=60",
      dinamic: "regalos",
    },
    {
      title: "Flor de loto",
      subtitle: "Estética marcante",
      img: "https://images.unsplash.com/photo-1577083165633-14ebcdb0f658?w=500&auto=format&fit=crop&q=60",
      dinamic: "arte",
    },
    {
      title: "Atrévete con unas gafas de sol extragrandes",
      subtitle: "Accesorios estilosos",
      img: "https://images.unsplash.com/photo-1620743364175-19e0a45096a1?w=500&auto=format&fit=crop&q=60",
      dinamic: "accesorios",
    },
    {
      title: "Prueba una máscara de pestañas colorida",
      subtitle: "Maquillajes encantadores",
      img: "https://images.unsplash.com/photo-1548902378-2ec44c906391?w=500&auto=format&fit=crop&q=60",
      dinamic: "maquillaje",
    },
    {
      title: "Tu señal para visitar una casa de baños",
      subtitle: "Espacios para relajar",
      img: "https://images.unsplash.com/photo-1625610930630-35f776bb770f?w=500&auto=format&fit=crop&q=60",
      dinamic: "relajacion",
    },
  ];

  function handleSearch(e) {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
    }
  }

  // 🔥 Obtener usuario logueado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 shadow-sm">

        {/* LOGO + EXPLORAR */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png"
            alt="Pinterest Logo"
            className="w-10 h-10"
          />
          <button className="text-white px-5.5 py-3.5 rounded-full bg-gray-800 text-sm font-semibold hover:text-gray-200 transition">
            Explorar
          </button>
        </div>

        {/* BOTÓN HAMBURGUESA */}
        <button
          className="md:hidden p-2 rounded-lg bg-gray-100"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* BARRA DE BÚSQUEDA */}
        <div className="order-last md:order-none w-full md:w-[55%] hidden md:block">
          <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full w-full">
            <Search className="text-gray-500 w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Encuentra ideas sobre cenas fáciles, moda, etc."
              className="bg-transparent w-full outline-none text-sm text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        {/* BOTONES O PERFIL */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {!user ? (
            <>
              <Link href="/login">
                <button className="text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 px-5.5 py-4 rounded-full">
                  Iniciar sesión
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5.5 py-4 rounded-full">
                  Regístrate
                </button>
              </Link>
            </>
          ) : (
            <Link href="/profile">
              <div className="flex items-center gap-3 cursor-pointer">
                <img
                  src={
                    user.user_metadata?.avatar_url ??
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm font-medium">
                  {user.user_metadata?.username ?? user.email.split("@")[0]}
                </span>
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* MENÚ DESPLEGABLE MOBILE */}
      {open && (
        <div className="md:hidden flex flex-col gap-3 px-6 pb-4">

          {/* Búsqueda móvil */}
          <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full w-full">
            <Search className="text-gray-500 w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Buscar…"
              className="bg-transparent w-full outline-none text-sm text-gray-700"
            />
          </div>

          {!user ? (
            <>
              <Link href="/login">
                <button className="w-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-3 rounded-full">
                  Iniciar sesión
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-3 rounded-full">
                  Regístrate
                </button>
              </Link>
            </>
          ) : (
            <Link href="/profile">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100">
                <img
                  src={
                    user.user_metadata?.avatar_url ??
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm font-medium">
                  {user.user_metadata?.username ?? user.email.split("@")[0]}
                </span>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <section className="max-w-7xl mx-auto mt-10 px-6">
        <h1 className="text-3xl font-bold text-black text-left mb-4 mt-8">
          Explora lo mejor de Pinterest
        </h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link key={index} href={`/category/${card.dinamic}`}>
              <div className="relative rounded-4xl overflow-hidden cursor-pointer group">
                <img
                  src={card.img}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all"></div>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center text-white w-full">
                  <p className="text-sm font-semibold">{card.subtitle}</p>
                  <h1 className="text-lg font-semibold leading-tight">
                    {card.title}
                  </h1>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}
