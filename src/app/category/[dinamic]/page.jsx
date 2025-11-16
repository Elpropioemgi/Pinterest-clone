"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import ImageModal from "@/components/ImageModal";


export default function CategoryPage({ params }) {
  const { dinamic } = use(params); 
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const relatedTopics = {
    navidad: ["cena", "christmas", "SantaClaus", "Grinch", "festividad"],
    regalos: ["regalos", "obsequio", "regalo", "envoltorio", "presente", "presents",],
    relajacion: ["calma", "relajación", "comodidad", "tranquilidad", "interior", "modern"],
    accesorios: ["joyas", "gafas", "accesorios", "reloj", "ring"],
    maquillaje: ["pestañas", "maquillaje", "makeup", "belleza"],
    arte: ["art", "painting", "creative", "design", "abstract","arte","recuadro","arte abstracto","flores","escultura", "estatua","monalisa", "da Vinci",],
  };

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      const topics = relatedTopics[dinamic] || [dinamic];

      // 🔁 Combina resultados de varias búsquedas relacionadas
      const promises = topics.map(async (topic) => {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${topic}&per_page=30&client_id=BRiprXFYAS33ysoYpEwfbefLSR0tcrL32GUJGhre0Vs`
        );
        const data = await res.json();
        return data.results || [];
      });

      // 🔀 Junta todos los resultados y quita duplicados
      const results = (await Promise.all(promises)).flat();
      const unique = Array.from(new Map(results.map((img) => [img.id, img])).values());

      setImages(unique);
      setLoading(false);
    }

    fetchImages();
  }, [dinamic]);
  

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Mira todo lo relacionado con "{dinamic}"
      </h1>
      <Link
          href="/"
          className="bg-black text-white mb-5 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Volver al inicio
        </Link>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
          {images.length > 0 ? (
            images.map((img) => (
              <div key={img.id} className="break-inside-avoid" onClick={() => setSelectedImage(img)}>
                <img
                  src={img.urls.small}
                  alt={img.alt_description}
                  className="w-full rounded-2xl shadow-md hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No se encontraron imágenes para esta categoría.
            </p> 
          )}
        </div>
      )}
      {/* Modal */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}
