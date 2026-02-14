import { NextRequest, NextResponse } from "next/server";
import { queryOne, queryMany } from "@/lib/db";

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
        { error: "Quantidade de cotas inválida" },
        { status: 400 },
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // Verificar se a lote existe
    const raffle = await queryOne("SELECT * FROM lotes WHERE id = $1", [id]);

    if (!raffle) {
      return NextResponse.json(
        { error: "Lote não encontrada" },
        { status: 404 },
      );
    }

    // 🛡️ IDEMPOTÊNCIA: Verificar se há compra duplicada recente (mesma rifa, livros, amount, no último minuto)
    // Isso previne "cotas fantasmas" causadas por retry automático do cliente
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
    if (userId && raffle.creatorId === userId) {
      return NextResponse.json(
        { error: "Você não pode comprar cotas da sua própria lote" },
        { status: 403 },
      );
    }

    // Verificar se há cotas disponíveis
    const availableLivros = raffle.totalLivros - raffle.soldLivros;
    if (livros > availableLivros) {
      return NextResponse.json(
        { error: "Quantidade de cotas indisponível" },
        { status: 400 },
      );
    }

    // Verificar se a lote está aberta
    if (raffle.status !== "open") {
      return NextResponse.json(
        { error: "Esta lote não está aberta para compras" },
        { status: 400 },
      );
    }

    // Gerar números das cotas únicos
    const existingNumbers = await queryMany(
      `SELECT numbers FROM livros WHERE "raffleId" = $1`,
      [id]
    );

    const usedNumbers = new Set(
      existingNumbers.flatMap((row) => row.numbers.split(","))
    );

    const livroNumbers: string[] = [];
    while (livroNumbers.length < livros) {
      const randomNum = Math.floor(Math.random() * 1000000);
      const formatted = String(randomNum).padStart(6, "0");

      if (!usedNumbers.has(formatted) && !livroNumbers.includes(formatted)) {
        livroNumbers.push(formatted);
        usedNumbers.add(formatted);
      }
    }

    const livroNumbersString = livroNumbers.join(",");

    // Criar registro de compra (userId pode ser NULL para compras anônimas)
    // Salvamos o phone para rastrear compras anônimas
    // Cada transação de compra é um novo registro - usuários podem comprar múltiplas vezes
    const purchase = await queryOne(
      `INSERT INTO livros (id, "userId", "raffleId", livros, amount, numbers, phone, status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
       RETURNING id, "raffleId", "userId", livros, amount, status`,
      [userId, id, livros, amount, livroNumbersString, phone],
    );

    if (!purchase) {
      throw new Error("Erro ao criar compra");
    }

    // Atualizar quantidade de cotas vendidas
    const updatedRaffle = await queryOne(
      `UPDATE lotes 
       SET "soldLivros" = "soldLivros" + $1, "updatedAt" = NOW()
       WHERE id = $2
       RETURNING *`,
      [livros, id],
    );

    if (!updatedRaffle) {
      throw new Error("Erro ao atualizar lote");
    }

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
