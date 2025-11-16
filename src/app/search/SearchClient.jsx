"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ImageModal from "@/components/ImageModal";

export default function SearchClient() {
  const params = useSearchParams();
  const query = params.get("query") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!query) return;
    fetchImages(query);
  }, [query]);

  async function fetchImages(searchText) {
    try {
      setLoading(true);

      const url = `https://api.unsplash.com/search/photos?query=${searchText}&per_page=30&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      setResults(data.results || []);
    } catch (err) {
      console.error("Error buscando imágenes:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Resultados para: <span className="text-red-600">{query}</span>
      </h1>

      {loading && <p className="text-gray-600">Cargando imágenes...</p>}

      {!loading && results.length === 0 && (
        <p className="text-gray-600">No se encontraron resultados.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((img) => (
          <div key={img.id}>
            <img
              src={img.urls.small}
              className="w-full rounded-xl cursor-pointer hover:opacity-80 transition"
              onClick={() => setSelectedImage(img)}
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </main>
  );
}
