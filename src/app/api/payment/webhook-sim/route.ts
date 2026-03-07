import { NextRequest, NextResponse } from "next/server";
import { queryOne, queryMany } from "@/lib/db";
import { autoDrawPremiosAleatorios } from "@/lib/premios-draw";

/**
 * Simula o webhook do Mercado Pago confirmando pagamentos
 * Em produção, será chamado pelo Mercado Pago quando o PIX for confirmado
 *
 * Para testar: curl -X POST http://localhost:3000/api/payment/webhook-sim -H "Content-Type: application/json" -d '{"purchaseId":"xxx","raffleId":"yyy"}'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { purchaseId, raffleId, action = "confirm_all" } = body;

    // 1️⃣ Confirmar uma compra específica
    if (action === "confirm_one" && purchaseId && raffleId) {
      console.log("[Webhook Sim] Confirmando compra específica:", purchaseId);

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

      if (purchase.status === "confirmed") {
        return NextResponse.json({
          success: true,
          message: "Pagamento já confirmado",
          confirmedCount: 0,
          numbers: purchase.numbers ? purchase.numbers.split(",") : [],
        });
      }

      // Gerar números das cotas AGORA (após confirmação do pagamento)
      const livros = purchase.livros;

      // Buscar números já usados neste lote (apenas de compras confirmadas)
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
      console.log("[Webhook Sim] Números gerados:", livroNumbersString);

      await queryOne(
        `UPDATE livros SET status = 'confirmed', "statusPago" = true, numbers = $2, "updatedAt" = NOW() WHERE id = $1`,
        [purchaseId, livroNumbersString],
      );

      console.log("[Webhook Sim] ✅ Compra confirmada:", purchaseId);

      // ✅ Atualizar soldLivros da rifa com o pagamento confirmado
      await queryOne(
        `UPDATE lotes 
         SET "soldLivros" = "soldLivros" + $1, "updatedAt" = NOW()
         WHERE id = $2`,
        [purchase.livros, purchase.raffleId],
      );
      console.log("[Webhook Sim] ✅ Livros da rifa atualizadas");
      await autoDrawPremiosAleatorios(purchase.raffleId);

      // Atualizar top buyer
      if (purchase.userId) {
        const existingBuyer = await queryOne(
          `SELECT * FROM "topBuyer" WHERE "userId" = $1`,
          [purchase.userId],
        );

        if (existingBuyer) {
          await queryOne(
            `UPDATE "topBuyer" 
             SET "totalSpent" = "totalSpent" + $1,
                 "totalLivros" = "totalLivros" + $2,
                 "raffleBought" = "raffleBought" + 1,
                 "updatedAt" = NOW()
             WHERE "userId" = $3`,
            [purchase.amount, purchase.livros, purchase.userId],
          );
          console.log("[Webhook Sim] ✅ TopBuyer atualizado:", purchase.userId);
        } else {
          await queryOne(
            `INSERT INTO "topBuyer" (id, "userId", "totalSpent", "totalLivros", "raffleBought", "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, $3, 1, NOW(), NOW())`,
            [purchase.userId, purchase.amount, purchase.livros],
          );
          console.log("[Webhook Sim] ✅ TopBuyer criado:", purchase.userId);
        }
      }
      return NextResponse.json({
        success: true,
        message: "Pagamento confirmado com sucesso!",
        confirmedCount: 1,
        numbers: livroNumbers,
      });
    }

    // 2️⃣ Confirmar todos os pagamentos pendentes (modo debug)
    if (action === "confirm_all") {
      console.log("[Webhook Sim] Confirmando todos os pagamentos pendentes...");

      const pendingPurchases = await queryMany(
        `SELECT id, "raffleId" FROM livros WHERE status = 'pending' LIMIT 100`,
        [],
      );

      if (pendingPurchases.length === 0) {
        return NextResponse.json({
          success: true,
          message: "Nenhum pagamento pendente",
          confirmedCount: 0,
        });
      }

      let confirmed = 0;
      for (const purchase of pendingPurchases) {
        // Buscar detalhes da compra primeiro
        const fullPurchase = await queryOne(
          "SELECT * FROM livros WHERE id = $1",
          [purchase.id],
        );

        // Gerar números das cotas
        const livros = fullPurchase.livros;
        const existingNumbers = await queryMany(
          `SELECT numbers FROM livros WHERE "raffleId" = $1 AND numbers != '' AND numbers IS NOT NULL`,
          [purchase.raffleId],
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

          if (
            !usedNumbers.has(formatted) &&
            !livroNumbers.includes(formatted)
          ) {
            livroNumbers.push(formatted);
            usedNumbers.add(formatted);
          }
        }

        const livroNumbersString = livroNumbers.join(",");

        await queryOne(
          `UPDATE livros SET status = 'confirmed', "statusPago" = true, numbers = $2, "updatedAt" = NOW() WHERE id = $1`,
          [purchase.id, livroNumbersString],
        );

        // ✅ Atualizar soldLivros da rifa
        await queryOne(
          `UPDATE lotes 
           SET "soldLivros" = "soldLivros" + $1, "updatedAt" = NOW()
           WHERE id = $2`,
          [fullPurchase.livros, purchase.raffleId],
        );

        // Atualizar top buyer
        if (fullPurchase.userId) {
          const existingBuyer = await queryOne(
            `SELECT * FROM "topBuyer" WHERE "userId" = $1`,
            [fullPurchase.userId],
          );

          if (existingBuyer) {
            await queryOne(
              `UPDATE "topBuyer" 
               SET "totalSpent" = "totalSpent" + $1,
                   "totalLivros" = "totalLivros" + $2,
                   "raffleBought" = "raffleBought" + 1,
                   "updatedAt" = NOW()
               WHERE "userId" = $3`,
              [fullPurchase.amount, fullPurchase.livros, fullPurchase.userId],
            );
          } else {
            await queryOne(
              `INSERT INTO "topBuyer" (id, "userId", "totalSpent", "totalLivros", "raffleBought", "createdAt", "updatedAt")
               VALUES (gen_random_uuid(), $1, $2, $3, 1, NOW(), NOW())`,
              [fullPurchase.userId, fullPurchase.amount, fullPurchase.livros],
            );
          }
        }

        confirmed++;
      }

      console.log("[Webhook Sim] ✅ Confirmados", confirmed, "pagamentos");
      return NextResponse.json({
        success: true,
        message: `${confirmed} pagamento(s) confirmado(s)`,
        confirmedCount: confirmed,
      });
    }

    return NextResponse.json({ error: "Action inválida" }, { status: 400 });
  } catch (error) {
    console.error("[Webhook Sim] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 },
    );
  }
}
