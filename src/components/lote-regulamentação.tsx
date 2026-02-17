'use client'

import { AccordionItem } from './accordion'
import { FileText } from 'lucide-react'

export function RaffleRegulation() {
  return (
    <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <FileText className="w-8 h-8 text-emerald-600" />
        Regulamento
      </h2>

      <div className="space-y-4">
        <AccordionItem title="Termos e Condições">
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p>
              Esta lote é organizada de acordo com os regulamentos da Lei nº 9.504/1997 e da Resolução do Tribunal Superior Eleitoral (TSE). 
              Todos os participantes devem aceitar os Termos e Condições da plataforma Tronco da Sorte.
            </p>
          </div>
        </AccordionItem>

        <AccordionItem title="Responsabilidade Legal">
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p className="font-semibold">O organizador desta lote é responsável por:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Manter registros completos de todas as transações</li>
              <li>Realizar o sorteio de forma justa e transparente</li>
              <li>Cumprir todas as obrigações legais e fiscais</li>
              <li>Proteger os dados pessoais dos participantes</li>
              <li>Entregar o prêmio ao vencedor conforme regulamentado</li>
            </ul>
          </div>
        </AccordionItem>

        <AccordionItem title="🔒 Transparência e Sorteio">
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p className="font-semibold">O sorteio será realizado de forma pública e auditável. Todos os participantes serão notificados sobre:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Data e horário exato do sorteio</li>
              <li>Método de seleção do vencedor</li>
              <li>Resultado do sorteio em tempo real</li>
              <li>Dados do vencedor (apenas primeira letra do nome)</li>
            </ul>
          </div>
        </AccordionItem>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-900 font-semibold">
            <strong>⚠️ Aviso Legal:</strong> A participação nesta lote constitui aceitação automática de todos os termos, 
            condições e regulamentos estabelecidos. Para mais informações, consulte a{' '}
            <a href="/termos" className="text-emerald-600 hover:text-emerald-700 font-bold">
              Política de Termos
            </a>{' '}
            e{' '}
            <a href="/privacidade" className="text-emerald-600 hover:text-emerald-700 font-bold">
              Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
