"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { censorName, censorPhoneShort } from "@/lib/formatters";
import {
  ArrowLeft,
  Ticket,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Gift,
  Star,
  Trophy,
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

interface Premio {
  number: string;
  tipo: "dinheiro" | "item";
  valor?: number;
  descricao?: string;
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
  const [premios, setPremios] = useState<Premio[]>([]);
  const [winnerNumber, setWinnerNumber] = useState<string | null>(null);

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

            if (foundPurchase) {
              setPurchase(foundPurchase);
              setUser(authUser);
              setPageLoading(false);
              return;
            }

            // Se não encontrou na lista do usuário, tenta buscar a compra diretamente
            // (pode ser uma compra anônima que foi redirecionada após confirmação)
            const directResponse = await fetch(`/api/purchases/${purchaseId}`, {
              credentials: "include",
            });

            if (directResponse.ok) {
              const directPurchase = await directResponse.json();
              setPurchase(directPurchase);
              setUser(authUser);
              setPageLoading(false);
              return;
            }

            setError("Compra não encontrada");
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
            // Último recurso: tentar buscar a compra diretamente
            const directResponse = await fetch(`/api/purchases/${purchaseId}`);

            if (directResponse.ok) {
              const directPurchase = await directResponse.json();
              setPurchase(directPurchase);
              setPageLoading(false);
              return;
            }

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

  // Buscar bilhetes premiados do lote
  useEffect(() => {
    if (!purchase?.raffleId) return;
    const fetchPremios = async () => {
      try {
        const res = await fetch(`/api/lotes/${purchase.raffleId}`);
        if (res.ok) {
          const data = await res.json();
          const raw =
            data.status === "drawn"
              ? data.premiosAleatorios
              : data.premiosConfig;
          if (raw) {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (Array.isArray(parsed)) setPremios(parsed);
          }
          if (data.winnerNumber) {
            setWinnerNumber(data.winnerNumber);
          }
        }
      } catch {
        // silently ignore
      }
    };
    fetchPremios();
  }, [purchase?.raffleId]);

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
      <div className="min-h-screen bg-fundo-cinza flex items-center justify-center">
        <div className="text-xl font-bold text-cinza">Carregando...</div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen bg-fundo-cinza py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-5">
                <a href="/account" className=" items-center gap-2 text-azul-royal text-1xl font-bold inline-flex transition">
                    <ArrowLeft className="w-5 h-5" />
                    Voltar
                </a>
            </div>


            <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro text-center">
              <AlertCircle className="w-16 h-16 text-vermelho-vivo mx-auto mb-4" />
              <p className="text-cinza-escuro font-bold text-lg">
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
    <div className="min-h-screen bg-fundo-cinza py-12">
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
            className="flex items-center gap-2 text-azul-royal hover:text-azul-claro font-bold mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            {authUser ? "Voltar para Perfil" : "Voltar para Meus Bilhetes"}
          </Link>

          {/* Purchase Card */}
          <div className="bg-branco rounded-2xl shadow-lg p-8 border border-cinza-claro mb-8">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-cinza-claro">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src="/troncodasorte.png"
                  alt="Tronco da Sorte"
                  width={50}
                  height={50}
                  priority
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black text-cinza">
                  Detalhes da Compra
                </h1>
                <p className="text-cinza">ID: {purchase.id}</p>
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
                  isConfirmed
                    ? "bg-verde-pastel text-verde-menta"
                    : "bg-vermelho-pastel text-vermelho-vivo"
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
              <h2 className="text-sm font-bold text-cinza mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-azul-royal" />
                Informações da Lote
              </h2>
              <div className="bg-azul-pastel rounded-lg p-4">
                <p className="text-2xl font-black text-cinza">
                  {purchase.raffle?.title || "Lote"}
                </p>
                <p className="text-cinza-claro mt-2">
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
              <div className="bg-fundo-cinza border border-cinza-claro rounded-lg p-4">
                <p className="text-cinza font-semibold text-sm mb-1 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-azul-royal" />
                  Livros
                </p>
                <p className="text-3xl font-black text-cinza-escuro">
                  {purchase.livros}
                </p>
              </div>

              <div className="bg-fundo-cinza border border-cinza-claro rounded-lg p-4">
                <p className="text-cinza font-semibold text-sm mb-1 flex items-center gap-2">
                  Valor Investido
                </p>
                <p className="text-3xl font-black text-azul-royal">
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
              <p className="text-cinza-escuro font-black">
                {purchaseDate.toLocaleDateString("pt-BR")} às{" "}
                {purchaseDate.toLocaleTimeString("pt-BR")}
              </p>
            </div>

            {/* Numbers */}
            {purchase.numbers && purchase.numbers.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-cinza mb-3">
                  Números dos Livros ({purchase.numbers.length})
                </h3>
                {/* Alerta de bilhetes premiados */}
                {(() => {
                  const premioMap = new Map(
                    premios.map((p) => [p.number, p])
                  );
                  const ganhadores = purchase.numbers.filter((n) =>
                    premioMap.has(n)
                  );
                  if (premios.length > 0 && ganhadores.length === 0) {
                    return (
                      <div className="mb-4 bg-cinza-claro rounded-xl p-5 flex items-center gap-3">
                        <p className="font-bold text-cinza-escuro">
                          Não foi dessa vez... Mas continue participando!
                        </p>
                      </div>
                    );
                  }
                  if (ganhadores.length === 0) return null;
                  return (
                    <div className="mb-4 bg-verde-pastel rounded-full p-8 flex items-start gap-3">
                      <Gift className="w-7 h-7 text-verde-menta" />
                      <div>
                        
                        <p className="font-black text-2xl text-verde-menta">
                          Parabéns! Você tem{" "}
                          {ganhadores.length === 1
                            ? "1 bilhete premiado"
                            : `${ganhadores.length} bilhetes premiados`}!
                        </p>
                        <div className="mt-5 space-y-1">
                          {ganhadores.map((n) => {
                            const p = premioMap.get(n)!;
                            return (
                              <p key={n} className="text-2xl text-cinza-escuro">
                                <span className="font-mono text-[20px] font-bold rounded-full bg-vermelho-vivo text-branco px-4 py-2">
                                  {n}
                                </span>{" "}
                                →{" "}
                                {p.tipo === "dinheiro" && p.valor
                                  ? `R$ ${Number(p.valor).toFixed(2)}`
                                  : p.descricao || "Prêmio"}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
                  {purchase.numbers.map((number, index) => {
                    const isMain = winnerNumber === number;
                    const premio = !isMain ? premios.find((p) => p.number === number) : null;
                    return isMain ? (
                      <div
                        key={index}
                        title="Número vencedor do Prêmio Principal!"
                        className="bg-amarelo-pastel border-2 border-amarelo-gold rounded p-2 text-center relative"
                      >
                        <Trophy className="w-3 h-3 text-amarelo-gold mx-auto mb-0.5" />
                        <p className="text-xs font-black text-amarelo-gold">{number}</p>
                      </div>
                    ) : premio ? (
                      <div
                        key={index}
                        title={
                          premio.tipo === "dinheiro" && premio.valor
                            ? `Prêmio: R$ ${Number(premio.valor).toFixed(2)}`
                            : `Prêmio: ${premio.descricao || "Bilhete premiado"}`
                        }
                        className="bg-verde-pastel rounded-full border-2 border-verde-menta p-2 text-center relative"
                      >
                        <p className="text-1xl font-black text-verde-menta">
                          {number}
                        </p>
                        <p className="text-1xl text-cinza mt-1"><a href='#' className='text-cinza-escuro underline hover:text-verde-menta'>Entre em contato</a> para resgatar seu prêmio!</p>
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="bg-azul-pastel rounded p-2 text-center"
                      >
                        <p className="text-xs font-bold text-azul-royal">
                          {number}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-cinza mb-3">
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
            {user && (
            <div className="border-t border-cinza-claro pt-8">
              <h3 className="text-sm font-bold text-cinza mb-4">
                Dados do Comprador
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-cinza-claro">
                  <p className="text-cinza">Nome:</p>
                  <p className="text-cinza-escuro font-bold">
                    {censorName(user.name)}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cinza-claro">
                  <p className="text-cinza">Telefone:</p>
                  <p className="text-cinza-escuro font-bold">
                    {censorPhoneShort(user.phone)}
                  </p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cinza-claro">
                  <p className="text-cinza">Email:</p>
                  <p className="text-cinza-escuro font-bold">{user.email}</p>
                </div>
                <div className="flex justify-between items-center py-2">
                  <p className="text-cinza">CPF:</p>
                  <p className="text-cinza-escuro font-bold">{user.cpf}</p>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Action Buttons */}
          {authUser && (
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/account"
                className="text-center bg-branco border-2 border-azul-royal text-azul-royal px-6 py-3 rounded-lg font-bold hover:bg-azul-pastel transition"
              >
                ← Voltar ao Perfil
              </Link>
              {purchase.raffleId && (
                <Link
                  href={`/lotes/${purchase.raffleId}`}
                  className="text-center bg-azul-royal text-branco hover:bg-branco hover:text-azul-royal border px-6 py-3 rounded-lg font-bold transition"
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
                className="flex-1 text-center bg-branco border-2 border-azul-royal text-azul-royal px-6 py-3 rounded-lg font-bold hover:bg-azul-pastel transition"
              >
                ← Voltar para Meus Bilhetes
              </Link>
              {purchase.raffleId && (
                <Link
                  href={`/lotes/${purchase.raffleId}`}
                  className="flex-1 text-center bg-azul-royal text-branco hover:bg-branco hover:text-azul-royal border px-6 py-3 rounded-lg font-bold transition"
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
