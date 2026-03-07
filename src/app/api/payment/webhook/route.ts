import { NextRequest, NextResponse } from "next/server";
import { queryOne, queryMany } from "@/lib/db";
import { autoDrawPremiosAleatorios } from "@/lib/premios-draw";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  try {
    // Mercado Pago envia via query params ou form data
    const searchParams = req.nextUrl.searchParams;
    const body = await req.json().catch(() => ({}));

    console.log("[MP Webhook] ===== WEBHOOK CHAMADO =====");
    console.log("[MP Webhook] Timestamp:", new Date().toISOString());
    console.log("[MP Webhook] Headers:", {
      'content-type': req.headers.get('content-type'),
      'user-agent': req.headers.get('user-agent'),
    });
    console.log("[MP Webhook] Query params:", Object.fromEntries(searchParams));
    console.log("[MP Webhook] Body:", JSON.stringify(body, null, 2));

    // O Mercado Pago envia o tipo de evento via query param "topic" ou no body "action"
    // action pode ser: "payment.created", "payment.updated", etc.
    // type pode ser: "payment"
    const topic = searchParams.get("topic") || body.type || body.action;
    const paymentId = searchParams.get("id") || body.data?.id;

    // Se for um evento de pagamento (topic pode ser "payment" ou "payment.created"/"payment.updated")
    const isPaymentEvent =
      topic === "payment" ||
      (typeof topic === "string" && topic.startsWith("payment."));

    console.log("[MP Webhook] Análise do evento:", {
      topic,
      isPaymentEvent,
      paymentId,✅ É evento de pagamento! ID: ${paymentId}`);

      // Buscar detalhes do pagamento no Mercado Pago
      console.log(`[MP Webhook] Buscando detalhes do pagamento no Mercado Pago...`);
    if (isPaymentEvent && paymentId) {
      console.log(`[MP Webhook] Processando pagamento: ${paymentId}`);

      // Buscar detalhes do pagamento no Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          },
        },
      );

      if (!paymentResponse.ok) {
        console.error(
          "[MP Webhook] Erro ao buscar pagamento:",
          paymentResponse.statusText,
        );
        return NextResponse.json(
          { error: "Erro ao buscar pagamento" },
          { status: 400 },
        );
      }

      const payment = await paymentResponse.json();

      console.log("[MP Webhook] Detalhes completos do pagamento:", {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        external_reference: payment.external_reference,
        metadata: payment.metadata,
        date_created: payment.date_created,
        date_approved: payment.date_approved,
      });

      // Extrair purchaseId dos metadata com múltiplas tentativas
      let purchaseId = 
        payment.metadata?.purchase_id ||      // snake_case (padrão MP)
        payment.metadata?.purchaseId ||       // camelCase (fallback)
        payment.external_reference;           // último recurso

      console.log("[MP Webhook] purchaseId extraído:", purchaseId);

      if (!purchaseId) {
        console.error("[MP Webhook] ❌ purchaseId não encontrado!", {
          metadata: JSON.stringify(payment.metadata, null, 2),
          external_reference: payment.external_reference,
        });
        return NextResponse.json(
          { error: "purchaseId não encontrado" },
          { status: 400 },
        );
      }

      // Se o pagamento foi aprovado/confirmado
      if (payment.status === "approved") {
        console.log(
          `[MP Webhook] ✅ Pagamento aprovado! Confirmando compra: ${purchaseId}`,
        );

        // Buscar a compra
        const purchase = await queryOne("SELECT * FROM livros WHERE id = $1", [
          purchaseId,
        ]);

        if (!purchase) {
          console.error(`[MP Webhook] Compra não encontrada: ${purchaseId}`);
          return NextResponse.json(
            { error: "Compra não encontrada" },
            { status: 404 },
          );
        }

        // Verificar se o valor corresponde (segurança extra)
        const expectedAmount = Number(purchase.amount);
        const receivedAmount = payment.transaction_amount;

        if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
          console.error("[MP Webhook] Valor do pagamento não corresponde:", {
            esperado: expectedAmount,
            recebido: receivedAmount,
          });
          return NextResponse.json(
            { error: "Valor do pagamento não corresponde" },
            { status: 400 },
          );
        }

        // Se já está confirmado, retornar sucesso (idempotência)
        if (purchase.status === "confirmed") {
          console.log(
            "[MP Webhook] Compra já confirmada anteriormente:",
            purchaseId,
          );
          return NextResponse.json({
            success: true,
            message: "Compra já confirmada",
            purchaseId,
          });
        }

        // Gerar números das cotas AGORA (após confirmação do pagamento)
        const livros = purchase.livros;
        const raffleId = purchase.raffleId;

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

          if (
            !usedNumbers.has(formatted) &&
            !livroNumbers.includes(formatted)
          ) {
            livroNumbers.push(formatted);
            usedNumbers.add(formatted);
          }
        }

        const livroNumbersString = livroNumbers.join(",");
        console.log("[MP Webhook] Números gerados:", livroNumbersString);

        // Atualizar status da compra para 'confirmed' e adicionar números
        const updatedPurchase = await queryOne(
          `UPDATE livros 
           SET status = 'confirmed', "statusPago" = true, numbers = $2, "updatedAt" = NOW()
           WHERE id = $1
           RETURNING *`,
          [purchaseId, livroNumbersString],
        );

        console.log("[MP Webhook] ✅ Compra confirmada:", {
          purchaseId: updatedPurchase.id,
          status: updatedPurchase.status,
          livros: updatedPurchase.livros,
          amount: updatedPurchase.amount,
        });

        // ✅ Agora sim atualizar soldLivros da rifa pois o pagamento foi confirmado
        await queryOne(
          `UPDATE lotes 
           SET "soldLivros" = "soldLivros" + $1, "updatedAt" = NOW()
           WHERE id = $2`,
          [updatedPurchase.livros, updatedPurchase.raffleId],
        );
        console.log("[MP Webhook] ✅ Livros da rifa atualizadas");
        await autoDrawPremiosAleatorios(updatedPurchase.raffleId);

        // Atualizar top buyer agora que a compra foi confirmada
        if (updatedPurchase.userId) {
          const existingBuyer = await queryOne(
            `SELECT * FROM "topBuyer" WHERE "userId" = $1`,
            [updatedPurchase.userId],
          );

          if (existingBuyer) {
            // Atualizar comprador existente
            await queryOne(
              `UPDATE "topBuyer" 
               SET "totalSpent" = "totalSpent" + $1,
                   "totalLivros" = "totalLivros" + $2,
                   "raffleBought" = "raffleBought" + 1,
                   "updatedAt" = NOW()
               WHERE "userId" = $3`,
              [
                updatedPurchase.amount,
                updatedPurchase.livros,
                updatedPurchase.userId,
              ],
            );
            console.log(
              "[MP Webhook] ✅ TopBuyer atualizado (existente):",
              updatedPurchase.userId,
            );
          } else {
            // Criar novo comprador
            await queryOne(
              `INSERT INTO "topBuyer" (id, "userId", "totalSpent", "totalLivros", "raffleBought", "createdAt", "updatedAt")
               VALUES (gen_random_uuid(), $1, $2, $3, 1, NOW(), NOW())`,
              [
                updatedPurchase.userId,
                updatedPurchase.amount,
                updatedPurchase.livros,
              ],
            );
            console.log(
              "[MP Webhook] ✅ TopBuyer criado (novo):",
              updatedPurchase.userId,
            );
          }
        }

        return NextResponse.json({
          success: true,
          message: "Compra confirmada",
          purchaseId,
        });
      } else if (payment.status === "pending") {
        console.log(`[MP Webhook] ⏳ Pagamento pendente: ${purchaseId}`);
        // Compra continua como pending
        return NextResponse.json({
          success: true,
          message: "Pagamento ainda pendente",
          purchaseId,
        });
      } else if (
        payment.status === "rejected" ||
        payment.status === "cancelled"
      ) {
        console.log(
          `[MP Webhook] ❌ Pagamento rejeitado/cancelado: ${purchaseId}`,
        );

        // Opcionalmente, deletar a compra se o pagamento foi rejeitado
        // Por enquanto, apenas logar

        return NextResponse.json({
          success: true,
          message: "Pagamento rejeitado/cancelado",
          purchaseId,
        });
      }
    }

    // Se chegou aqui, é um tipo de evento que ignoramos
    console.log("[MP Webhook] Evento ignorado:", topic);

    return NextResponse.json({
      success: true,
      message: "Evento processado",
    });
  } catch (error) {
    console.error("[MP Webhook] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 },
    );
  }
}
