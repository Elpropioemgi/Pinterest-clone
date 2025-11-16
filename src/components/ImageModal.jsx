"use client";
import { useEffect, useState } from "react";
import { X, Heart, Bookmark, Share2, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ImageModal({ image, onClose }) {
  const [user, setUser] = useState(null);
  const [pinId, setPinId] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  // loading para acciones (evita clicks dobles)
  const [creatingPin, setCreatingPin] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Obtener el usuario (y actualizaciones de sesión)
  useEffect(() => {
    let mounted = true;
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data?.user ?? null);
    }
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // 1) Asegurar existencia global del pin (no depende del user)
  useEffect(() => {
    if (!image) return;

    let mounted = true;

    async function ensurePin() {
      setCreatingPin(true);
      try {
        // usar el id real de Unsplash
        const externalId = image.id;
    
        const { data: existing, error: exError } = await supabase
          .from("pins")
          .select("id")
          .eq("external_id", externalId)
          .maybeSingle();
    
        if (exError) {
          console.error("Error buscando pin existente:", exError);
        }
    
        if (existing) {
          setPinId(existing.id);
          return;
        }
    
        const { data: created, error: createError } = await supabase
          .from("pins")
          .insert({
            external_id: externalId,
            image_url: image.urls.regular,
            description: image.alt_description || "",
            source: image.links?.html || null,
          })
          .select("id")
          .single();
    
        if (createError) {
          console.error("Error creando pin:", createError);
          alert("Error creando pin (revisa consola)");
          return;
        }
    
        setPinId(created.id);
      } catch (err) {
        console.error("Exception en ensurePin:", err);
      } finally {
        setCreatingPin(false);
      }
    }
    

    ensurePin();

    return () => {
      mounted = false;
    };
  }, [image]);

  // 2) Cargar comentarios cuando tengamos pinId
  useEffect(() => {
    if (!pinId) {
      setComments([]);
      return;
    }

    let mounted = true;
    async function loadComments() {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("id, text, created_at, user_id, profiles(username)")
          .eq("pin_id", pinId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error cargando comentarios:", error);
          return;
        }
        if (mounted) setComments(data || []);
      } catch (err) {
        console.error("Exception loadComments:", err);
      }
    }
    loadComments();

    return () => {
      mounted = false;
    };
  }, [pinId]);

  // 3) Chequear like + saved cuando tengamos pinId y user
  useEffect(() => {
    if (!user || !pinId) {
      setLiked(false);
      setSaved(false);
      return;
    }

    let mounted = true;

    async function checkStates() {
      try {
        const [{ data: likeData, error: likeErr }, { data: saveData, error: saveErr }] =
          await Promise.all([
            supabase
              .from("likes")
              .select("*")
              .eq("user_id", user.id)
              .eq("pin_id", pinId)
              .maybeSingle(),
            supabase
              .from("favorites")
              .select("*")
              .eq("user_id", user.id)
              .eq("pin_id", pinId)
              .maybeSingle(),
          ]);

        if (likeErr) console.error("Error checking like:", likeErr);
        if (saveErr) console.error("Error checking saved:", saveErr);

        if (mounted) {
          setLiked(!!likeData);
          setSaved(!!saveData);
        }
      } catch (err) {
        console.error("Exception checking states:", err);
      }
    }

    checkStates();

    return () => {
      mounted = false;
    };
  }, [user, pinId]);

  // Helper: muestra y registra errores
  const handleError = (label, e) => {
    console.error(label, e);
    alert(`${label}: ${e.message || JSON.stringify(e)}`);
  };

  // ✅ Toggle like (solo si pinId existe)
  async function toggleLike() {
    if (!user) return alert("Debes iniciar sesión");
    if (!pinId) return alert("Pin no listo aún, espera un momento");

    setActionLoading(true);
    try {
      if (liked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("pin_id", pinId);

        if (error) {
          handleError("Error quitando like", error);
        } else {
          setLiked(false);
        }
      } else {
        const { data, error } = await supabase.from("likes").insert({
          user_id: user.id,
          pin_id: pinId,
        });

        if (error) {
          handleError("Error insertando like", error);
        } else {
          setLiked(true);
        }
      }
    } catch (err) {
      handleError("Exception toggleLike", err);
    } finally {
      setActionLoading(false);
    }
  }

  // ✅ Toggle save
  async function toggleSave() {
    if (!user) return alert("Debes iniciar sesión");
    if (!pinId) return alert("Pin no listo aún, espera un momento");

    setActionLoading(true);
    try {
      if (saved) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("pin_id", pinId)
          .eq("user_id", user.id);

        if (error) handleError("Error quitando favorito", error);
        else setSaved(false);
      } else {
        const { data, error } = await supabase.from("favorites").insert({
          user_id: user.id,
          pin_id: pinId,
        });

        if (error) handleError("Error guardando favorito", error);
        else setSaved(true);
      }
    } catch (err) {
      handleError("Exception toggleSave", err);
    } finally {
      setActionLoading(false);
    }
  }

  // ✅ Submit comment
  async function submitComment() {
    if (!user) return alert("Debes iniciar sesión");
    if (!pinId) return alert("Pin no listo aún, espera un momento");
    if (commentText.trim() === "") return;

    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          pin_id: pinId,
          text: commentText,
        })
        .select("id, text, created_at, user_id, profiles(username)")
        .single();

      if (error) {
        handleError("Error creando comentario", error);
      } else {
        setComments([data, ...comments]);
        setCommentText("");
      }
    } catch (err) {
      handleError("Exception submitComment", err);
    } finally {
      setActionLoading(false);
    }
  }

  // Compartir
  function sharePin() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: image.alt_description || "Imagen",
        text: "¡Mira este pin!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Enlace copiado al portapapeles");
    }
  }

  if (!image) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-black"
        >
          <X size={28} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <img src={image.urls.regular} className="w-full rounded-xl object-cover" />

          <div className="flex flex-col justify-between">
            <h2 className="text-xl font-bold mb-1">
              {image.alt_description || "Sin título"}
            </h2>

            <div className="flex flex-wrap gap-3 mt-4 items-center">
              <button
                onClick={toggleLike}
                disabled={!pinId || creatingPin || actionLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  !pinId || creatingPin || actionLoading ? "opacity-50 pointer-events-none" : ""
                }`}
                style={{
                  backgroundColor: liked ? "#fee2e2" : "#f3f4f6",
                  color: liked ? "#dc2626" : "#374151",
                }}
              >
                <Heart fill={liked ? "#dc2626" : "none"} strokeWidth={2} className="w-5 h-5" />
                {liked ? "Liked" : "Like"}
              </button>

              <button
                onClick={toggleSave}
                disabled={!pinId || creatingPin || actionLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  !pinId || creatingPin || actionLoading ? "opacity-50 pointer-events-none" : ""
                }`}
                style={{
                  backgroundColor: saved ? "#fef3c7" : "#f3f4f6",
                  color: saved ? "#b45309" : "#374151",
                }}
              >
                <Bookmark fill={saved ? "#facc15" : "none"} className="w-5 h-5" />
                {saved ? "Saved" : "Save"}
              </button>

              <button onClick={sharePin} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Share2 size={20} /> Compartir
              </button>
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-2">Comentarios</h3>

              <div className="flex gap-2 mb-3">
                <input
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Escribe un comentario..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button onClick={submitComment} className="px-4 py-2 bg-green-500 text-white rounded-lg">
                  Enviar
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="bg-gray-100 p-2 rounded-lg">
                    <p className="text-sm font-semibold">{c.profiles?.username || "Usuario"}</p>
                    <p className="text-sm">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
