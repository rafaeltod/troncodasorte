
# Tronco da sorte

## Especificação do caso de uso - F01 - Realizar login

### Histórico da Revisão

| Data       | Versão | Descrição      | Autor            |
| ---------- | ------ | -------------- | ---------------- |
| 11/02/2026 | 1.00   | Versão Inicial | Kilton J. Araújo |
| 12/02/2026 | 1.01   | Atualizações   | Kilton J. Araújo |

---

### 1) Resumo

Para fazer o primeiro login, se for administrador, o usuário vai diretamente para um site em que insere suas informações de login; se for titular, o usuário deve inserir o número de telefone. Se for um número cadastrado, ele terá acesso às informações da conta; se não for um número cadastrado, aparecerá um formulário com os campos necessários para o cadastro, com o campo de telefone já preenchido.

---

### 2) Atores

* Cliente/Usuário (comprador de cotas)
* Administrador

---

### 3) Precondições

* O navegador deve estar acessível.
* O usuário deve ter um número de telefone válido.
* (Se administrador) O usuário deve possuir credenciais de acesso válidas.

---

### 4) Pós-condições

* O usuário realiza login com sucesso.
* O usuário é redirecionado para o painel/dashboard da conta.
* As credenciais de acesso são validadas e armazenadas na sessão.


---

### 5) Fluxos de evento

#### 5.1) Fluxo básico – Login de Administrador

1. \[IN] O usuário acessa a página de login do sistema.
2. \[OUT] O sistema exibe a interface de login com campos para telefone e cpf.
3. \[IN] O usuário insere suas credenciais.
4. \[OUT] O sistema valida as credenciais contra a base de dados.
5. \[OUT] O sistema confirma que o usuário é um administrador.
6. \[OUT] O sistema autentica o usuário e cria uma sessão.
7. \[OUT] O sistema redireciona o usuário para o dashboard.

#### 5.2) Fluxo alternativo – Login de Usuário com Telefone Cadastrado

1. \[IN] O usuário acessa a interface de venda da campanha.
2. \[IN] O usuário seleciona a quantidade de cotas que deseja.
3. \[OUT] O sistema valida a quantidade de cotas disponíveis.
4. \[OUT] O sistema valida a disponibilidade de promoções e aplica automaticamente (se aplicável).
5. \[IN] O usuário pode inserir um cupom de desconto (opcional).
6. \[OUT] Se cupom foi inserido, o sistema valida o cupom.
7. \[OUT] Se cupom válido, o sistema aplica o desconto adicional no valor da compra.
8. \[IN] O usuário clica em "Comprar".
9. \[OUT] O sistema pede o número de telefone para verificar se o usuário existe.
10. \[IN] O usuário insere o número de telefone.
11. \[OUT] O sistema valida os dados inseridos, constando como usuário existente.
12. \[OUT] O sistema redireciona o usuário para a página de pagamentos.


#### 5.3) Fluxo alternativo – Cadastro de Usuário (Telefone não cadastrado)

1. \[IN] O usuário acessa a interface de venda da campanha.
2. \[IN] O usuário seleciona a quantidade de cotas que deseja.
3. \[OUT] O sistema valida a quantidade de cotas disponíveis.
4. \[OUT] O sistema valida a disponibilidade de promoções e aplica automaticamente (se aplicável).
5. \[IN] O usuário pode inserir um cupom de desconto (opcional).
6. \[OUT] Se cupom foi inserido, o sistema valida o cupom.
7. \[OUT] Se cupom válido, o sistema aplica o desconto adicional no valor da compra.
8. \[IN] O usuário clica em "Comprar".
9. \[OUT] O sistema pede o número de telefone para verificar se o usuário existe.
10. \[IN] O usuário insere o número de telefone.
11. \[OUT] O sistema valida o telefone e detecta que o usuário NÃO está cadastrado.
12. \[OUT] O sistema redireciona o usuário para um formulário de cadastramento.
13. \[IN] O usuário insere seus dados pessoais (Nome, telefone, cpf, email, data nascimento)
14. \[OUT] O sistema valida os dados inseridos.
15. \[OUT] O sistema cadastra o usuário.
16. \[OUT] O sistema redireciona o usuário para a pagina de pagamento.

#### 5.4) Fluxo de exceção – Erros de Validação

* **Campo de telefone/credencial inválido**: \[OUT] O sistema destaca o campo com erro e exibe a mensagem: "Por favor, preencha o campo corretamente."
* **CPF inválido**: \[OUT] O sistema exibe mensagem: "CPF deve conter 11 dígitos."
* **Usuário menor de idade**: \[OUT] O sistema exibe mensagem: "Você deve ter mínimo 18 anos para logar/cadastrar."

---

### 6) Dicionário de dados

| Campo             | Tipo              | Restrições                                          |
| ----------------- | ----------------- | --------------------------------------------------- |
| Telefone          | Texto numérico    | Obrigatório, formato (XX) 9XXXX-XXXX               |
| CPF               | Texto numérico    | Obrigatório (novo usuário), 11 dígitos             |
| E-mail            | Texto             | Obrigatório (novo usuário), deve ser válido        |
| Data Nascimento   | Data              | Obrigatório (novo usuário), usuário ≥ 18 anos      |
---

### 7) Regras de negócio

* **Distinção de perfil**: O sistema deve identificar se o usuário é administrador ou titular (comprador de cotas) baseado na entrada.
* **Validação de telefone**: O telefone deve estar no formato (XX) 9XXXX-XXXX para ser considerado válido.
* **Maioridade**: Usuários devem ter mínimo 18 anos para se cadastrar.
* **CPF único**: O CPF deve ser único no sistema e conter exatamente 11 dígitos.
* **E-mail único**: O e-mail deve ser único no sistema.
* **Sessão ativa**: Após login bem-sucedido, a sessão do usuário deve ser armazenada por um período determinado.
* **Telefone único**: Cada número de telefone pode ser registrado apenas uma vez no sistema.

---

### 8) Protótipo(s) de interface do caso de uso

* (Figura 1: )
* (Figura 2: )
* (Figura 3: )
