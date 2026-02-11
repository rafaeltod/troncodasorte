
# Tronco da sorte

## Especificação do caso de uso - F01 - Realizar login

### Histórico da Revisão

| Data       | Versão | Descrição      | Autor            |
| ---------- | ------ | -------------- | ---------------- |
| 11/02/2026 | 1.00   | Versão Inicial | Kilton J. Araújo |

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
2. \[OUT] O sistema exibe a interface de login com campos para e-mail e senha.
3. \[IN] O usuário insere suas credenciais de administrador (e-mail e senha).
4. \[OUT] O sistema valida as credenciais contra a base de dados.
5. \[OUT] O sistema confirma que o usuário é um administrador.
6. \[OUT] O sistema autentica o usuário e cria uma sessão.
7. \[OUT] O sistema redireciona o usuário para o dashboard de administrador.

#### 5.2) Fluxo alternativo – Login de Usuário com Telefone Cadastrado

1. \[IN] O usuário acessa a página de login do sistema.
2. \[OUT] O sistema exibe a interface de login com campo para telefone.
3. \[IN] O usuário insere seu número de telefone.
4. \[OUT] O sistema valida o formato do telefone (XX) 9XXXX-XXXX.
5. \[OUT] O sistema busca na base de dados se o telefone está cadastrado.
6. \[OUT] O sistema encontra um usuário registrado com esse telefone.
7. \[OUT] O sistema autentica o usuário e cria uma sessão.
8. \[OUT] O sistema redireciona o usuário para o dashboard com suas informações de conta.

#### 5.3) Fluxo alternativo – Cadastro de Usuário (Telefone não cadastrado)

1. \[IN] O usuário acessa a página de login do sistema.
2. \[OUT] O sistema exibe a interface de login com campo para telefone.
3. \[IN] O usuário insere seu número de telefone.
4. \[OUT] O sistema valida o formato do telefone (XX) 9XXXX-XXXX.
5. \[OUT] O sistema busca na base de dados se o telefone está cadastrado.
6. \[OUT] O sistema NÃO encontra um usuário com esse telefone.
7. \[OUT] O sistema exibe um formulário de cadastro com o telefone já preenchido.
8. \[IN] O usuário preenche os campos obrigatórios: CPF, e-mail, data de nascimento e aceita os termos.
9. \[OUT] O sistema valida todos os campos (CPF com 11 dígitos, e-mail válido, idade ≥ 18 anos).
10. \[OUT] O sistema cria uma nova conta de usuário.
11. \[OUT] O sistema autentica o usuário e cria uma sessão.
12. \[OUT] O sistema redireciona o usuário para o dashboard com um bem-vindo inicial.

#### 5.4) Fluxo de exceção – Erros de Validação

* **Campo de telefone/credencial inválido**: \[OUT] O sistema destaca o campo com erro e exibe a mensagem: "Por favor, preencha o campo corretamente."
* **Credenciais de administrador inválidas**: \[OUT] O sistema exibe mensagem: "E-mail ou senha incorretos."
* **CPF inválido**: \[OUT] O sistema exibe mensagem: "CPF deve conter 11 dígitos."
* **Usuário menor de idade**: \[OUT] O sistema exibe mensagem: "Você deve ter mínimo 18 anos para se cadastrar."
* **E-mail já registrado**: \[OUT] O sistema exibe mensagem: "Este e-mail já está cadastrado no sistema."

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

* (Figura 1: Tela de login inicial com seleção de tipo de usuário - Administrador ou Titular)
* (Figura 3: Formulário de login para Titular com campo de telefone)
* (Figura 4: Validação de telefone e redirecionamento para dashboard ou cadastro)
* (Figura 5: Formulário de cadastro com telefone pré-preenchido para novo usuário)
* (Figura 6: Dashboard após login bem-sucedido)
