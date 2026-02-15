"use client";

import { useState, useEffect } from "react";
import { X, Copy, CheckCircle2, Clock } from "lucide-react";
import QRCode from "qrcode";
import { usePurchaseStatus } from "@/hooks/use-purchase-status";
import { formatDecimal } from "@/lib/formatters";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string;
  amount: number;
  raffleId: string;
  onPaymentConfirmed?: () => void;
}

export function PixPaymentModal({
  isOpen,
  onClose,
  purchaseId,
  amount,
  raffleId,
  onPaymentConfirmed,
}: PixPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(4 * 60); // 4 minutes in seconds
  const [backendAmount, setBackendAmount] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

  // Polling para confirmar pagamento
  const { status: purchaseStatus, retryCount } = usePurchaseStatus({
    purchaseId,
    raffleId,
    onConfirmed: onPaymentConfirmed,
    enabled: isOpen && !!pixData, // Só faz polling quando modal está aberto e QR foi gerado
  });

  // ✅ Resetar pixData e backendAmount quando purchaseId mudar
  useEffect(() => {
    setPixData(null);
    setBackendAmount(null);
    setCopied(false);
    setTimeRemaining(4 * 60);
    setExpired(false);
  }, [purchaseId]);

  // ✅ Gerar QR code automaticamente quando modal abre
  useEffect(() => {
    if (isOpen && purchaseId && !pixData && !loading) {
      generatePixQR();
    }
  }, [isOpen, purchaseId]);

  // Timer countdown
  useEffect(() => {
    if (!pixData || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pixData, timeRemaining]);

  // ✅ Excluir compra quando expirar (4 minutos)
  useEffect(() => {
    if (timeRemaining === 0 && !expired && purchaseId && raffleId) {
      setExpired(true);
      console.log(
        "[PixPaymentModal] ⏰ Tempo expirado - excluindo compra:",
        purchaseId,
      );

      // Deletar a compra pendente
      fetch(`/api/rifas/${raffleId}/purchase/${purchaseId}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then(() => {
          console.log("[PixPaymentModal] ✅ Compra expirada excluída");
        })
        .catch((err) => {
          console.error(
            "[PixPaymentModal] Erro ao excluir compra expirada:",
            err,
          );
        });
    }
  }, [timeRemaining, expired, purchaseId, raffleId]);

  const generatePixQR = async () => {
    setLoading(true);
    console.log("[PixPaymentModal] Iniciando generatePixQR...");
    try {
      if (!raffleId) {
        console.log(
          "[PixPaymentModal] Chamando GET /api/payment/pix/:purchaseId",
        );
        const response = await fetch(`/api/payment/pix/${purchaseId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Erro ao recuperar QR code");
        }

        const data = await response.json();
        setPixData(data);
        if (data.amount) {
          setBackendAmount(Number(data.amount));
        }
      } else {
        console.log("[PixPaymentModal] Chamando POST /api/payment/pix");
        const response = await fetch("/api/payment/pix", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            purchaseId,
            raffleId,
            amount,
          }),
        });

        console.log(
          "[PixPaymentModal] Status da resposta:",
          response.status,
          response.statusText,
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("[PixPaymentModal] Erro na resposta:", errorData);
          throw new Error(errorData.error || "Erro ao gerar QR code");
        }

        const data = await response.json();
        console.log("[PixPaymentModal] Dados recebidos:", {
          source: data.source,
          hasQRCode: !!data.qrCode,
          hasContent: !!data.content,
        });

        // Se o backend já retornou um qrCode pronto, usar direto
        if (
          data.qrCode &&
          typeof data.qrCode === "string" &&
          data.qrCode.startsWith("data:")
        ) {
          // Já é um data URL válido, usar direto
          console.log("[PixPaymentModal] QR Code já vem do backend");
        } else if (!data.qrCode && (data.content || data.pixKey)) {
          // Se não tem qrCode mas tem content (BR Code), gerar localmente
          const payload = data.content || data.pixKey;
          const isEmail = /\S+@\S+\.\S+/.test(payload);
          const FORCE_QR = process.env.NEXT_PUBLIC_FORCE_QR === "true";

          if (isEmail && !FORCE_QR) {
            console.log(
              "[PixPaymentModal] Payload é email, não gerando QR automaticamente",
            );
            data.qrCode = null;
          } else {
            try {
              console.log("[PixPaymentModal] Gerando QR code localmente");
              const svgString = await QRCode.toString(payload, {
                type: "svg",
                width: 300,
              });
              data.qrCode =
                "data:image/svg+xml;utf8," + encodeURIComponent(svgString);
            } catch (err) {
              console.error(
                "[PixPaymentModal] Erro ao gerar QR localmente:",
                err,
              );
              data.qrCode = null;
            }
          }
        }

        setPixData(data);
        // ✅ Setar o amount validado do backend (tanto no POST quanto no GET)
        if (data.amount) {
          setBackendAmount(Number(data.amount));
        }
      }
      // Reset timer quando QR code é gerado/recuperado
      setTimeRemaining(5 * 60);
      console.log("[PixPaymentModal] ✅ QR code gerado com sucesso!");
    } catch (error) {
      console.error("[PixPaymentModal] ❌ Erro ao gerar QR code:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao gerar/recuperar QR code PIX";
      console.error("[PixPaymentModal] Mensagem de erro:", message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const copyPixKey = () => {
    const key = pixData?.pixKey || pixData?.content || "";
    if (key) {
      navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-screen shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Pagamento PIX</h2>
            <p className="text-sm text-gray-600 mt-1">Mercado Pago</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {!pixData ? (
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-4 rounded-xl">
              <p className="text-sm text-gray-700 mb-3">
                💰 <span className="font-bold">Valor a pagar:</span> R${" "}
                {formatDecimal(backendAmount || amount)}
              </p>
              <p className="text-xs text-gray-600">
                Gerando QR Code PIX para você...
              </p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin">⏳</div>
              </div>
            </div>
          ) : (
            <>
              {/* Timer and Status */}
              <div className=" bg-yellow-50 h-20 w-full rounded-xl  border-2 flex flex-col justify-center items-center mb-4 border-yellow-200">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-yellow-900">
                      Aguardando pagamento
                    </p>
                    <p className="text-3xl font-black text-yellow-700">
                      {String(Math.floor(timeRemaining / 60)).padStart(2, "0")}:
                      {String(timeRemaining % 60).padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 flex items-center justify-center w-full">
                  {pixData.qrCode ? (
                    <img
                      src={pixData.qrCode}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22white%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22 fill=%22black%22%3EPIX QR Code%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="w-full p-6 text-center text-sm text-gray-600">
                      <p className="font-semibold">QR indisponível</p>
                      <p className="mt-2">
                        Use a chave abaixo para pagar via PIX
                      </p>
                    </div>
                  )}
                </div>

                {/* Copiar chave - sempre mostrar abaixo do QR */}
                <div className="w-full">
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    OU COPIE A CHAVE:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pixData.content || pixData.pixKey || ""}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-400 rounded-lg font-mono font-bold"
                    />
                    <button
                      onClick={copyPixKey}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-bold">
                    Transação ID:{" "}
                    <span className="font-mono text-xs">
                      {pixData.transactionId}
                    </span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Sua compra será confirmada em até alguns minutos após o
                    pagamento.
                  </p>
                  {retryCount > 0 && (
                    <p className="text-xs text-blue-500 mt-2">
                      🔄 Verificando... ({retryCount})
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={timeRemaining === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-bold transition disabled:cursor-not-allowed"
              >
                {timeRemaining === 0 ? "⏱️ Tempo expirado" : "✅ Entendi"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const mpPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
