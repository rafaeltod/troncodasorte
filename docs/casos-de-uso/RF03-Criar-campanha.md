
# Tronco da sorte

## Especificação do caso de uso - F03 - Criar campanha

### Histórico da Revisão

| Data       | Versão | Descrição      | Autor            |
| ---------- | ------ | -------------- | ---------------- |
| 11/02/2026 | 1.00   | Versão Inicial | Beatriz Maria    |

---

### 1) Resumo

Um usuário administrador irá criar uma campanha, adicionando imagens, definindo quantidade máxima de cotas e o valor da campanha

---

### 2) Atores

* Administrador

---

### 3) Precondições

* O navegador deve estar acessível.
* O usuário deve estar conectado a sua conta.
* O usuário deve possuir credenciais de acesso válidas para administrador.

---

### 4) Pós-condições

* A campanha deve estar cadastrada dentro do banco de dados.
* O usuário é redirecionado para a tela da campanha.
* A campanha irá aparecer em "campanhas ativas".


---

### 5) Fluxos de evento

#### 5.1) Fluxo básico – Login de Administrador

1. \[IN] O usuário aperta no botão "criar campanha".
2. \[OUT] O sistema o redireciona para o formulário de criação de campanha.
3. \[IN] O usuário insere as informações(Nome da campanha, número de cotas, preço da cota, fotos, .
4. \[OUT] O sistema cadastra a campanha no banco de dados.
5. \[OUT] O sistema confirma que o usuário é um administrador.
6. \[OUT] O sistema redireciona o usuário para a página da campanha.

#### 5.4) Fluxo de exceção – Falta de informações

1. \[IN] O usuário insere as informações deixando algum campo em branco
2. \[OUT] O sistema apresenta uma mensagem de erro avisando a falta de informações e o campo em branco fica com borda avermelhada

---

### 6) Dicionário de dados

| Campo             | Tipo              | Restrições                                          |
| ----------------- | ----------------- | --------------------------------------------------- |
| Telefone          | Texto numérico    | Obrigatório, formato (XX) 9XXXX-XXXX               |
| CPF               | Texto numérico    | Obrigatório (novo usuário), 11 dígitos             |
| E-mail            | Texto             | Obrigatório (novo usuário), deve ser válido        |
| Data Nascimento   | Data              | Obrigatório (novo usuário), usuário ≥ 18 anos      |
| Nome              | Texto             | Obrigatório                                        | 
| Descrição         | Texto             | Opcional                                           |
| Número de cotas   | Número inteiro    | Obrigatório                                        |
| Valor das cotas   | Número boleano    | Obrigatório, valor > 0                             |
| Quantidade de     | Número inteiro    | Obrigatório, quantidade > 1                        |
  cotas   

---

### 7) Regras de negócio

* **Distinção de perfil**: O sistema deve identificar se o usuário é administrador ou titular (comprador de cotas) baseado na entrada.

---

### 8) Protótipo(s) de interface do caso de uso

* (Figura 1: Tela de login inicial com seleção de tipo de usuário - Administrador ou Titular)
