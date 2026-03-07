'use client'

import { useState, useEffect } from 'react'

export default function TestPaymentPage() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPurchase, setSelectedPurchase] = useState<string>('')
  const [details, setDetails] = useState<any>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    loadPurchases()
  }, [])

  const loadPurchases = async () => {
    try {
      const res = await fetch('/api/debug/test-payment')
      const data = await res.json()
      setPurchases(data.purchases || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadDetails = async (purchaseId: string) => {
    setSelectedPurchase(purchaseId)
    try {
      const res = await fetch(`/api/debug/test-payment?purchaseId=${purchaseId}`)
      const data = await res.json()
      setDetails(data)
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar detalhes')
    }
  }

  const confirmManual = async (purchaseId: string) => {
    if (!confirm('Confirmar pagamento manualmente?')) return
    setConfirming(true)
    try {
      const res = await fetch(`/api/payment/confirm-manual?purchaseId=${purchaseId}`)
      const data = await res.json()
      if (data.success) {
        alert(`✅ Confirmado!\nNúmeros: ${data.numbers}`)
        loadPurchases()
        if (selectedPurchase === purchaseId) {
          loadDetails(purchaseId)
        }
      } else {
        alert(`❌ Erro: ${data.error}`)
      }
    } catch (err) {
      alert(`❌ Erro: ${err}`)
    } finally {
      setConfirming(false)
    }
  }

  const addColumn = async () => {
    try {
      const res = await fetch('/api/debug/add-payment-id-column')
      const data = await res.json()
      alert(data.message)
    } catch (err) {
      alert(`Erro: ${err}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Test de Pagamentos</h1>
          <p className="text-gray-600">Debug de pagamentos PIX e webhook do Mercado Pago</p>
          <button
            onClick={addColumn}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔧 Adicionar coluna payment_id
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de Compras */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📦 Últimas Compras</h2>
              <button
                onClick={loadPurchases}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                🔄 Atualizar
              </button>
            </div>
            
            <div className="space-y-2">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className={`p-4 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedPurchase === purchase.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => loadDetails(purchase.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-mono text-sm text-gray-500">{purchase.id}</p>
                      <p className="font-semibold">
                        {purchase.livros} livro(s) - R$ {purchase.amount}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        purchase.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </div>
                  
                  {purchase.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmManual(purchase.id)
                      }}
                      disabled={confirming}
                      className="w-full mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
                    >
                      ✅ Confirmar Manualmente
                    </button>
                  )}
                </div>
              ))}

              {purchases.length === 0 && (
                <p className="text-center text-gray-500 py-8">Nenhuma compra encontrada</p>
              )}
            </div>
          </div>

          {/* Detalhes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🔍 Detalhes</h2>
            
            {!details ? (
              <p className="text-center text-gray-500 py-8">
                Selecione uma compra para ver os detalhes
              </p>
            ) : (
              <div className="space-y-4">
                {/* Purchase Info */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">📦 Compra</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">ID:</span> <code>{details.purchase.id}</code></p>
                    <p><span className="text-gray-600">Status:</span> <strong>{details.purchase.status}</strong></p>
                    <p><span className="text-gray-600">Livros:</span> {details.purchase.livros}</p>
                    <p><span className="text-gray-600">Valor:</span> R$ {details.purchase.amount}</p>
                    <p><span className="text-gray-600">Payment ID:</span> {details.purchase.payment_id || 'N/A'}</p>
                    <p><span className="text-gray-600">Números:</span> {details.purchase.numbers || 'Não gerados'}</p>
                  </div>
                </div>

                {/* Mercado Pago Info */}
                {details.mercadoPago && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-2">💳 Mercado Pago</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Status:</span> <strong>{details.mercadoPago.status}</strong></p>
                      <p><span className="text-gray-600">Detail:</span> {details.mercadoPago.status_detail}</p>
                      <p><span className="text-gray-600">Valor:</span> R$ {details.mercadoPago.transaction_amount}</p>
                      <p><span className="text-gray-600">Criado:</span> {details.mercadoPago.date_created}</p>
                      {details.mercadoPago.date_approved && (
                        <p><span className="text-gray-600">Aprovado:</span> {details.mercadoPago.date_approved}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Analysis */}
                <div>
                  <h3 className="font-semibold mb-2">📊 Análise</h3>
                  <div className="space-y-2">
                    {details.analysis.needsConfirmation && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-800 font-bold">⚠️ Pagamento aprovado mas não confirmado!</p>
                        <p className="text-sm text-red-700 mt-1">
                          O webhook pode não ter funcionado. Use o botão de confirmação manual.
                        </p>
                      </div>
                    )}
                    
                    {details.purchase.status === 'confirmed' && (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-green-800 font-bold">✅ Compra confirmada com sucesso!</p>
                        <p className="text-sm text-green-700 mt-1">
                          Números: {details.purchase.numbers}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
