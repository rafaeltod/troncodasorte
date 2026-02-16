import { NextRequest, NextResponse } from "next/server";
import { queryOne, queryMany } from "@/lib/db";

interface ConfirmPaymentRequest {
  purchaseId: string;
  raffleId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ConfirmPaymentRequest = await req.json();
    const { purchaseId, raffleId } = body;

    if (!purchaseId || !raffleId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Buscar a compra
    const purchase = await queryOne(
      'SELECT * FROM livros WHERE id = $1 AND "raffleId" = $2',
      [purchaseId, raffleId],
    );

    if (!purchase) {
      return NextResponse.json(
        { error: "Compra não encontrada" },
        { status: 404 },
      );
    }

    // Se já confirmada, retornar OK
    if (purchase.status === "confirmed") {
      return NextResponse.json({
        success: true,
        message: "Pagamento já confirmado",
        status: "confirmed",
        numbers: purchase.numbers ? purchase.numbers.split(",") : [],
      });
    }

    const livros = purchase.livros;


    const existingNumbers = await queryMany(
      `SELECT numbers FROM livros WHERE "raffleId" = $1 AND numbers != '' AND numbers IS NOT NULL`,
      [raffleId],
    );

    const usedNumbers = new Set(
      existingNumbers.flatMap((row: { numbers: string }) =>
        row.numbers ? row.numbers.split(",") : [],
      ),
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
    console.log("[Payment Confirm] Números gerados:", livroNumbersString);

    // Confirmar pagamento e adicionar números
    const updated = await queryOne(
      `UPDATE livros 
       SET status = 'confirmed', "statusPago" = true, numbers = $2, "updatedAt" = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [purchaseId, livroNumbersString],
    );

    // Atualizar soldLivros do lote
    await queryOne(
      `UPDATE lotes 
       SET "soldLivros" = "soldLivros" + $1, "updatedAt" = NOW()
       WHERE id = $2`,
      [livros, raffleId],
    );

    console.log("[Payment Confirm] ✅ Pagamento confirmado:", {
      purchaseId,
      raffleId,
      status: updated.status,
      numbers: livroNumbers,
    });

    return NextResponse.json({
      success: true,
      message: "Pagamento confirmado com sucesso!",
      status: "confirmed",
      numbers: livroNumbers,
    });
  } catch (error) {
    console.error("[Payment Confirm] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar pagamento" },
      { status: 500 },
    );
  }
}
