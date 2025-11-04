import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.estabelecimentoId) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    // Verificar variáveis de ambiente
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
      return NextResponse.json({ 
        message: "Supabase não configurado. Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE no .env" 
      }, { status: 500 });
    }

    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ message: "Arquivo não enviado" }, { status: 400 });
    }

    // Validar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "Arquivo muito grande. Máximo 5MB" }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Apenas imagens são permitidas" }, { status: 400 });
    }

    const estabelecimentoId = session.user.estabelecimentoId as string;
    
    let supabase;
    try {
      supabase = getSupabaseServerClient();
    } catch (err: any) {
      console.error("Erro ao inicializar Supabase:", err);
      return NextResponse.json({ 
        message: `Erro ao conectar com Supabase: ${err.message}` 
      }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const fileExt = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${estabelecimentoId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("logos")
      .upload(path, bytes, {
        contentType: file.type || "image/png",
        upsert: false,
      });

    if (error) {
      console.error("Erro no upload do Supabase:", error);
      return NextResponse.json({ 
        message: `Erro ao fazer upload: ${error.message}` 
      }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ message: "Upload concluído mas sem dados retornados" }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(data.path);
    const publicUrl = publicUrlData.publicUrl;

    await prisma.estabelecimento.update({
      where: { id: estabelecimentoId },
      data: { logoUrl: publicUrl },
    });

    return NextResponse.json({ url: publicUrl });
  } catch (e: any) {
    console.error("Erro geral no upload:", e);
    return NextResponse.json({ 
      message: e?.message || "Erro ao fazer upload" 
    }, { status: 500 });
  }
}


