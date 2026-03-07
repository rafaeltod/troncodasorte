'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-fundo-cinza">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <Link href="/" className="items-center gap-2 text-azul-royal hover:text-azul-escuro font-semibold mb-8 inline-flex transition">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="bg-branco rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-black text-cinza-escuro mb-8">Política de Privacidade</h1>

          <div className="space-y-6 text-cinza text-base leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">1. Introdução</h2>
              <p>
                O Tronco da Sorte está comprometido em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">2. Informações que Coletamos</h2>
              <p>Podemos coletar as seguintes categorias de informações:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Informações de Identificação Pessoal:</strong> nome, CPF, email, telefone, data de nascimento</li>
                <li><strong>Informações de Transação:</strong> histórico de compras, quantidade de livros, valores</li>
                <li><strong>Dados de Acesso:</strong> endereço IP, tipo de navegador, páginas visitadas</li>
                <li><strong>Informações de Localização:</strong> dados gerais de localização (país, cidade)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">3. Como Usamos Suas Informações</h2>
              <p>Usamos as informações coletadas para:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Criar e manter sua conta</li>
                <li>Processar transações e pagamentos</li>
                <li>Enviar notificações sobre seus sorteios e resultados</li>
                <li>Melhorar e otimizar a plataforma</li>
                <li>Cumprir com obrigações legais e regulatórias</li>
                <li>Prevenir fraude e abusos</li>
                <li>Enviar comunicações de suporte e atualização</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">4. Proteção de Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Criptografia de dados em trânsito (HTTPS)</li>
                <li>Autenticação segura de usuários</li>
                <li>Firewalls e sistemas de detecção de intrusão</li>
                <li>Acesso restrito a informações sensíveis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">5. Compartilhamento de Informações</h2>
              <p>
                Não vendemos, comercializamos ou transferimos suas informações pessoais para terceiros sem seu consentimento, exceto conforme necessário para:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Prestadores de serviços que atuam em nosso nome</li>
                <li>Processadores de pagamento</li>
                <li>Cumprimento de obrigações legais</li>
                <li>Proteção de direitos, privacidade, segurança ou propriedade</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">6. Cookies e Tecnologias Similares</h2>
              <p>
                Usamos cookies e tecnologias similares para melhorar sua experiência, lembrar suas preferências e entender como você usa a plataforma. Você pode controlar cookies através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">7. Retenção de Dados</h2>
              <p>
                Mantemos suas informações pessoais pelo tempo necessário para fornecer o serviço, cumprir com obrigações legais ou resolver disputas. Você pode solicitar a exclusão de sua conta a qualquer momento, sujeito a obrigações legais de retenção.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">8. Seus Direitos</h2>
              <p>
                De acordo com as leis aplicáveis, você pode ter o direito de:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir informações imprecisas</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Opor-se ao processamento de seus dados</li>
                <li>Solicitar a portabilidade de dados</li>
                <li>Revogar consentimentos anteriores</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">9. Links para Terceiros</h2>
              <p>
                Nossa plataforma pode conter links para sites de terceiros. Não somos responsáveis pelas práticas de privacidade de sites externos. Recomendamos revisar as políticas de privacidade desses sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cinza-escuro mb-4">10. Contato</h2>
              <p>
                Se tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco através do email de suporte disponível na plataforma.
              </p>
            </section>

            <section className="bg-azul-pastel border-l-4 border-azul-royal p-6 rounded">
              <p className="text-sm text-cinza-escuro">
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-cinza-escuro mt-2">
                Esta Política de Privacidade estabelece a acordo entre você e o Tronco da Sorte sobre como seus dados pessoais são coletados, usados e protegidos.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
