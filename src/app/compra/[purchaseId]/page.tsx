"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { censorName, censorPhone } from "@/lib/formatters";
import {
  ArrowLeft,
  Ticket,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Purchase {
  id: string;
  raffleId: string;
  livros: number;
  amount: number;
  status: string;
  numbers?: string[];
  createdAt: string;
  raffle?: {
    title: string;
    status: string;
    winner?: string;
    prizeAmount?: number;
  };
}

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
}

export default function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const router = useRouter();
  const { user: authUser, loading } = useAuth();
  const [purchaseId, setPurchaseId] = useState<string>("");
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolved = await params;
      setPurchaseId(resolved.purchaseId);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (loading) return;

    if (!purchaseId) return;

    const fetchPurchaseDetails = async () => {
      try {
        // Se está logado, busca da API autenticada
        if (authUser) {
          const response = await fetch(`/api/users/${authUser.id}/purchases`, {
            credentials: "include",
          });

          if (response.ok) {
            const purchases = await response.json();
            const foundPurchase = purchases.find(
              (p: Purchase) => p.id === purchaseId,
            );

            if (!foundPurchase) {
              setError("Compra não encontrada");
              setPageLoading(false);
              return;
            }

            setPurchase(foundPurchase);
            setUser(authUser);
            setPageLoading(false);
          } else {
            setError("Erro ao carregar detalhes da compra");
            setPageLoading(false);
          }
        } else {
          // Se não está logado, tenta buscar do localStorage (vindo de meus-bilhetes)
          const purchaseData = localStorage.getItem(`purchase_${purchaseId}`);
          if (purchaseData) {
            const data = JSON.parse(purchaseData);
            setPurchase(data.purchase);
            setUser(data.user);
            setReferrer(data.referrer || null);
            setPageLoading(false);
          } else {
            setError(
              'Compra não encontrada. Acesse por "Meus Bilhetes" para visualizar.',
            );
            setPageLoading(false);
          }
        }
      } catch (err) {
        console.error("Error fetching purchase:", err);
        setError("Erro ao carregar compra");
        setPageLoading(false);
      }
    };

    fetchPurchaseDetails();
  }, [loading, authUser, purchaseId]);

  // ✅ Auto-refresh: se compra está pendente (sem números), fazer polling para atualizar
  useEffect(() => {
    if (!purchase || purchase.status !== 'pending' || !authUser) return;

    const pollForUpdates = async () => {
      try {
        const response = await fetch(`/api/users/${authUser.id}/purchases`, {
          credentials: "include",
        });

        if (response.ok) {
          const purchases = await response.json();
          const updatedPurchase = purchases.find(
            (p: Purchase) => p.id === purchaseId,
          );

          if (updatedPurchase) {
            setPurchase(updatedPurchase);
            // Se agora tá confirmado (números foram gerados), para o polling
            if (updatedPurchase.status === 'confirmed') {
              console.log('[PurchaseDetail] ✅ Números gerados! Parando polling');
            }
          }
        }
      } catch (err) {
        console.error('Error polling purchase status:', err);
      }
    };

    // Fazer polling a cada 2 segundos enquanto status for 'pending'
    const interval = setInterval(() => {
      if (purchase.status === 'pending') {
        pollForUpdates();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [purchase, authUser, purchaseId]);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-gray-600">⏳ Carregando...</div>
      </div>
    );
  }

  if (error || !purchase || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/account"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-900 font-bold text-lg">
                {error || "Compra não encontrada"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const purchaseDate = new Date(purchase.createdAt);
  const isConfirmed = purchase.status === "confirmed";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Link
            href={
              authUser
                ? "/account"
                : referrer === "meus-bilhetes-resultado"
                  ? "/meus-bilhetes/resultado"
                  : "/meus-bilhetes"
            }
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            {authUser ? "Voltar para Perfil" : "Voltar para Meus Bilhetes"}
          </Link>

          {/* Purchase Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 overflow-hidden">
                <Image
                  src="/troncodasorte.png"
                  alt="Tronco da Sorte"
                  width={50}
                  height={50}
                  priority
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black text-gray-900">
                  Detalhes da Compra
                </h1>
                <p className="text-gray-600">ID: {purchase.id}</p>
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
                  isConfirmed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isConfirmed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirmada
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    Pendente
                  </>
                )}
              </div>
            </div>

            {/* Campaign Info */}
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-600" />
                Informações da Lote
              </h2>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-2xl font-black text-gray-900">
                  {purchase.raffle?.title || "Lote"}
                </p>
                <p className="text-gray-600 mt-2">
                  Status:{" "}
                  <span className="font-bold capitalize">
                    {purchase.raffle?.status
                      ? purchase.raffle.status === "open"
                        ? "Aberta"
                        : purchase.raffle.status === "closed"
                          ? "Fechada"
                          : purchase.raffle.status === "finished"
                            ? "Finalizada"
                            : purchase.raffle.status
                      : "N/A"}
                  </span>
                </p>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 font-semibold text-sm mb-1 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald-600" />
                  Livros
                </p>
                <p className="text-3xl font-black text-gray-900">
                  {purchase.livros}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 font-semibold text-sm mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Valor Investido
                </p>
                <p className="text-3xl font-black text-emerald-700">
                  R$ {Number(purchase.amount).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-600 font-semibold text-sm mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data da Compra
              </p>
              <p className="text-gray-900 font-black">
                {purchaseDate.toLocaleDateString("pt-BR")} às{" "}
                {purchaseDate.toLocaleTimeString("pt-BR")}
              </p>
            </div>

            {/* Numbers */}
            {purchase.numbers && purchase.numbers.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-600 mb-3">
                  Números dos Livros ({purchase.numbers.length})
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
                  {purchase.numbers.map((number, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300 rounded p-2 text-center"
                    >
                      <p className="text-xs font-bold text-emerald-800">
                        {number}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-600 mb-3">
                  Números dos Livros
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Os números serão gerados após a confirmação do pagamento
                  </p>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-sm font-bold text-gray-600 mb-4">
                Dados do Comprador
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-gray-600">Nome:</p>
                  <p className="text-gray-900 font-bold">
                    {censorName(user.name)}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-gray-600">Telefone:</p>
                  <p className="text-gray-900 font-bold">
                    {censorPhone(user.phone)}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <p className="text-gray-600">Email:</p>
                  <p className="text-gray-900 font-bold">{user.email}</p>
                </div>
                <div className="flex justify-between items-center py-2">
                  <p className="text-gray-600">CPF:</p>
                  <p className="text-gray-900 font-bold">{user.cpf}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {authUser && (
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/account"
                className="text-center bg-white border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-bold hover:bg-emerald-50 transition"
              >
                ← Voltar ao Perfil
              </Link>
              {purchase.raffleId && (
                <Link
                  href={`/lotes/${purchase.raffleId}`}
                  className="text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition"
                >
                  Ver Lote →
                </Link>
              )}
            </div>
          )}
          {!authUser && (
            <div className="flex gap-4">
              <Link
                href={
                  referrer === "meus-bilhetes-resultado"
                    ? "/meus-bilhetes/resultado"
                    : "/meus-bilhetes"
                }
                className="flex-1 text-center bg-white border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-bold hover:bg-emerald-50 transition"
              >
                ← Voltar para Meus Bilhetes
              </Link>
              {purchase.raffleId && (
                <Link
                  href={`/lotes/${purchase.raffleId}`}
                  className="flex-1 text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition"
                >
                  Ver Lote →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
