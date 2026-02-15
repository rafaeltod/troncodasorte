import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { livros, amount, phone } = body;

    // Token é opcional (permite compras anônimas)
    const token = req.cookies.get("token")?.value || null;

    // IMPORTANTE: Telefone é obrigatório para rastrear compas anônimas
    if (!phone) {
      return NextResponse.json(
        { error: "Telefone é obrigatório para criar compra" },
        { status: 400 },
      );
    }

    // Determinar userId
    let userId: string | null = token;

    // Se não está logado, buscar usuário pelo telefone
    if (!token) {
      const phoneOnly = phone.replace(/\D/g, "");
      const userByPhone = await queryOne(
        'SELECT id FROM "user" WHERE phone = $1',
        [phoneOnly],
      );
      if (userByPhone) {
        userId = userByPhone.id;
      }
    }

    // Validar dados - livros deve ser inteiro positivo, amount deve ser positivo
    if (!Number.isInteger(livros) || livros < 1) {
      return NextResponse.json(
        { error: "Quantidade de livros inválida" },
        { status: 400 },
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // Verificar se o lote existe
    const lote = await queryOne("SELECT * FROM lotes WHERE id = $1", [id]);

    if (!lote) {
      return NextResponse.json(
        { error: "Lote não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se o lote está aberto para compras
    if (lote.status !== "open") {
      return NextResponse.json(
        { error: "Este lote não está aberto para compras" },
        { status: 400 },
      );
    }

    // 🛡️ IDEMPOTÊNCIA: Verificar se há compra duplicada recente (mesmo lote, livros, amount, no último minuto)
    // Isso previne "livros fantasmas" causados por retry automático do cliente
    const recentDuplicate = await queryOne(
      `SELECT id FROM livros 
       WHERE "raffleId" = $1 
       AND "userId" = $2 
       AND livros = $3 
       AND amount = $4
       AND "createdAt" > NOW() - INTERVAL '1 minute'
       LIMIT 1`,
      [id, userId, livros, amount],
    );

    if (recentDuplicate) {
      console.log(
        "[Purchase] ⚠️ Compra duplicada detectada - retornando compra anterior:",
        recentDuplicate.id,
      );
      return NextResponse.json(
        {
          purchaseId: recentDuplicate.id,
          message: "Compra realizada com sucesso. Aguardando pagamento PIX.",
          checkoutUrl: null,
          isDuplicate: true,
        },
        { status: 201 },
      );
    }

    // Se está logado, verificar se não é o criador
    if (userId && lote.creatorId === userId) {
      return NextResponse.json(
        { error: "Você não pode comprar livros do seu próprio lote" },
        { status: 403 },
      );
    }

    // Verificar se há livros disponíveis
    const availableLivros = lote.totalLivros - lote.soldLivros;
    if (livros > availableLivros) {
      return NextResponse.json(
        { error: "Quantidade de livros indisponível" },
        { status: 400 },
      );
    }

    // Verificar se o lote está aberto
    if (lote.status !== "open") {
      return NextResponse.json(
        { error: "Este lote não está aberto para compras" },
        { status: 400 },
      );
    }

    // NÃO gerar números aqui - os números só são gerados após confirmação do pagamento
    // Criar registro de compra com numbers vazio (userId pode ser NULL para compras anônimas)
    // Salvamos o phone para rastrear compras anônimas
    // Cada transação de compra é um novo registro - usuários podem comprar múltiplas vezes
    const purchase = await queryOne(
      `INSERT INTO livros (id, "userId", "raffleId", livros, amount, numbers, phone, status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, '', $5, 'pending', NOW(), NOW())
       RETURNING id, "raffleId", "userId", livros, amount, status`,
      [userId, id, livros, amount, phone],
    );

    if (!purchase) {
      throw new Error("Erro ao criar compra");
    }

    // ✅ NÃO incrementar soldLivros aqui - só após confirmação do pagamento
    // Os números das cotas também só são gerados após confirmação
    // ✅ A compra fica como 'pending' até que o webhook do Mercado Pago confirme
    // NÃO marcar como 'confirmed' automaticamente!
    // A confirmação happen quando o pagamento PIX é realmente confirmado
    // O topBuyer só é atualizado quando o webhook confirma o pagamento (status = 'confirmed')

    return NextResponse.json(
      {
        purchaseId: purchase.id,
        message: "Compra realizada com sucesso. Aguardando pagamento PIX.",
        checkoutUrl: null, // Será preenchido quando integrar com gateway
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in purchase:", error);
    const errorMessage =
      error instanceof Error ? error.message : "erro desconhecido";
    return NextResponse.json(
      { error: `Erro ao processar compra: ${errorMessage}` },
      { status: 500 },
    );
  }
}
