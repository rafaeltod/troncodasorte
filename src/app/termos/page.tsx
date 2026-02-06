'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <Link href="/" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-8 inline-flex transition">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Termos e Condições de Uso</h1>

          <div className="space-y-6 text-gray-700 text-base leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p>
                Por acessar e usar o Tronco da Sorte, você concorda em cumprir estes Termos e Condições. Se você não concordar com qualquer disposição destes termos, por favor, não use o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p>
                Tronco da Sorte é uma plataforma online que permite que usuários participem de sorteios e rifas. O serviço inclui:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Criação e participação em rifas online</li>
                <li>Gerenciamento de compras e quotas</li>
                <li>Registro de resultados e vencedores</li>
                <li>Histórico de transações</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registro de Usuário</h2>
              <p>
                Para usar o Tronco da Sorte, você deve criar uma conta fornecendo informações precisas e completas, incluindo:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Nome completo</li>
                <li>CPF válido</li>
                <li>Email ativo</li>
                <li>Telefone válido</li>
                <li>Data de nascimento</li>
              </ul>
              <p className="mt-3">
                Você é responsável por manter a confidencialidade de suas credenciais de acesso. Notifique-nos imediatamente de qualquer uso não autorizado da sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Conduta do Usuário</h2>
              <p>Você concorda em não:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Usar informações falsas ou enganosas</li>
                <li>Criar múltiplas contas para ganhar vantagens indevidas</li>
                <li>Tentar hackear oder acessar sistemas não autorizados</li>
                <li>Interferir com o funcionamento seguro da plataforma</li>
                <li>Usar a plataforma para atividades ilegais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Direitos de Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo da plataforma, incluindo texto, imagens, logotipos e design, é protegido por direitos autorais e outros direitos de propriedade intelectual. Você não pode reproduzir ou distribuir este conteúdo sem permissão explícita.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitação de Responsabilidade</h2>
              <p>
                O Tronco da Sorte é fornecido "no estado em que se encontra", sem garantias de qualquer tipo. Não somos responsáveis por:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Danos diretos, indiretos ou consequentes</li>
                <li>Perda de dados ou informações</li>
                <li>Interrupção de serviço</li>
                <li>Danos a dispositivos ou sistemas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Indenização</h2>
              <p>
                Você concorda em indenizar, defender e manter-nos indemnes de qualquer reclamação, dano, perda ou gasto (incluindo honorários legais) resultantes do seu uso da plataforma ou violação destes Termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modificações dos Termos</h2>
              <p>
                Reservamos o direito de modificar estes Termos a qualquer momento. Mudanças significativas serão notificadas por email. Seu uso continuado da plataforma após taismudanças constitui sua aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contato</h2>
              <p>
                Se tiver dúvidas sobre estes Termos, entre em contato conosco através do email de suporte disponível na plataforma.
              </p>
            </section>

            <section className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
              <p className="text-sm text-gray-700">
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Estes Termos e Condições são um documento legal vinculativo entre você e o Tronco da Sorte.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
