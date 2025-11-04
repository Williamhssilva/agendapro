"use client";

import { useState } from "react";

export default function LogoUploader({ existingUrl }: { existingUrl: string }) {
  const [preview, setPreview] = useState<string>(existingUrl);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload/logo", {
        method: "POST",
        body: form,
      });
      
      let errorMessage = "Falha no upload";
      if (!res.ok) {
        try {
          const data = await res.json();
          errorMessage = data?.message || `Erro ${res.status}: ${res.statusText}`;
        } catch {
          // Se não conseguir fazer parse do JSON, pode ser XML/HTML de erro
          errorMessage = `Erro ${res.status}: ${res.statusText}. Verifique se SUPABASE_URL e SUPABASE_SERVICE_ROLE estão configurados no .env`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      if (!data.url) {
        throw new Error("URL não retornada pelo servidor");
      }
      setPreview(data.url);
    } catch (err: any) {
      setError(err?.message || "Erro ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {preview ? (
        <div className="flex items-center gap-3 mb-2">
          <img src={preview} alt="Logo" className="h-12 w-12 object-cover rounded" />
          <span className="text-xs text-gray-500 truncate max-w-[220px]">{preview}</span>
        </div>
      ) : (
        <p className="text-xs text-gray-500 mb-2">Nenhuma logo enviada</p>
      )}
      <input type="file" accept="image/*" onChange={onFileChange} disabled={uploading} />
      {uploading && <p className="text-xs text-gray-500 mt-1">Enviando...</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      <p className="text-xs text-gray-500 mt-1">Ao enviar, a logo é salva e aplicada automaticamente.</p>
    </div>
  );
}


