import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint para SIMULAR um webhook do Mercado Pago
 * GET /api/debug/webhook-test - Mostra instruções
 * POST /api/debug/webhook-test - Envia webhook simulado para o endpoint real
 */

export async function GET(req: NextRequest) {
  const baseUrl = req.nextUrl.origin;
  
  return NextResponse.json({
    message: "Webhook Test Endpoint",
    instructions: [
      "Este endpoint simula webhooks do Mercado Pago",
      "Use POST para disparar um webhook de teste",
    ],
    endpoints: {
      "real_webhook": `${baseUrl}/api/payment/webhook`,
      "test_webhook": `${baseUrl}/api/debug/webhook-test`,
    },
    test_commands: [
      `curl -X POST "${baseUrl}/api/debug/webhook-test" -H "Content-Type: application/json" -d '{"action":"test"}'`,
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = req.nextUrl.origin;
    
    console.log("[Webhook Test] Simulando pagamento aprovado...");

    // Simular webhook de pagamento aprovado
    const webhookPayload = {
      topic: "payment",
      id: "999999999", // ID fake - vai falhar ao buscar do MP
      action: "payment.created",
      // Você pode customizar aqui
      ...body,
    };

    console.log("[Webhook Test] Enviando para webhook real:", webhookPayload);

    // Enviar para o webhook real
    const webhookUrl = `${baseUrl}/api/payment/webhook?topic=${webhookPayload.topic}&id=${webhookPayload.id}`;
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Webhook test sent",
      webhook_response: result,
      status_code: response.status,
    });
  } catch (error) {
    console.error("[Webhook Test] Erro:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
