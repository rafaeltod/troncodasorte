
# Tronco da sorte

## Especificação do caso de uso - F02 - Comprar cotas

### Histórico da Revisão

| Data       | Versão | Descrição      | Autor            |
| ---------- | ------ | -------------- | ---------------- |
| 11/02/2026 | 1.00   | Versão Inicial | Kilton J. Araújo |

---

### 1) Resumo

Permite ao usuário/cliente comprar cotas de uma campanha ativa, selecionando a quantidade desejada, aplicando descontos (automáticos ou via cupom) e realizando o pagamento via PIX.

---

### 2) Atores

* Cliente/Usuário (comprador de cotas)

---

### 3) Precondições

* Deve existir uma campanha ativa.
* Deve haver cotas disponíveis para compra.
* O usuário deve ter acesso à página de campanhas.

---

### 4) Pós-condições

* A compra será registrada no banco de dados.
* As cotas vendidas serão descontadas do total disponível da campanha.
* O usuário receberá confirmação do pagamento e seus números de cotas.

---

### 5) Fluxos de evento

#### 5.1) Fluxo básico – Comprar cotas

1. \[IN] O usuário acessa a interface de venda das cotas.
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
13. \[IN] O usuário realiza o pagamento via pix.
14. \[OUT] O sistema valida o pagamento
15. \[OUT] O sistema exibe mensagem de sucesso.
16. \[OUT] O sistema redireciona o usuário para a página de cotas compradas

#### 5.2) Fluxo alternativo – Usuário não cadastrado

11. \[OUT] O sistema valida o telefone e detecta que o usuário NÃO está cadastrado.
12. \[OUT] O sistema redireciona o usuário para um formulário de cadastramento.
13. \[IN] O usuário insere seus dados pessoais (Nome, telefone, cpf, email, data nascimento)
14. \[OUT] O sistema valida os dados inseridos.
15. \[OUT] O sistema cadastra o usuário
16. \[OUT] Segue para o fluxo básico no passo 12 (redireciona para pagamento)


##### 5.2.1) Fluxo alternativo – Usuário com idade inferior a 18 anos

14. \[OUT] O sistema valida os dados e detecta idade < 18 anos.
15. \[OUT] O sistema exibe "Vendas não permitidas para menores de 18 anos"
16. \[OUT] FIM - Compra bloqueada

#### 5.3) Fluxo alternativo – Cupom inválido

6. \[OUT] O sistema valida o cupom e detecta que é inválido ou expirado.
7. \[OUT] O sistema exibe "Cupom inválido".
8. \[IN] Usuário pode tentar outro cupom ou remover e continuar sem desconto.
9. \[OUT] Se usuário tentar outro cupom, volta ao passo 5 do fluxo básico.
10. \[OUT] Se usuário remover/continuar sem cupom, pula para passo 8 do fluxo básico.


#### 5.4) Fluxo alternativo – Link de vendas (Afiliado/Vendedor)

1. \[IN] O usuário acessa a interface via **link de afiliado único** (de um vendedor/afiliado).
2. \[OUT] O sistema identifica e armazena a referência do afiliado.
3. \[OUT] Segue fluxo básico do passo 2 ao 14 normalmente.
4. \[OUT] Após validação do pagamento (passo 14 do básico), o sistema verifica se há afiliado associado.
5. \[OUT] O sistema registra a venda com referência ao afiliado.
6. \[OUT] O sistema calcula e envia o **cashback** para o vendedor/afiliado.
7. \[OUT] Continua fluxo básico no passo 15 (exibe mensagem de sucesso).

##### 5.4.1) Fluxo alternativo – Link de vendas expirado

1. \[IN] O usuário acessa a interface via **link de afiliado expirado/inválido**.
2. \[OUT] O sistema detecta que o link expirou ou é inválido.
3. \[OUT] O sistema descarta a referência do afiliado.
4. \[OUT] O usuário acessa a página normalmente (sem afiliação).
5. \[OUT] Continua fluxo básico no passo 2 (sem cashback para afiliado ao final).

#### 5.5) Fluxo de exceção

* Caso algum campo obrigatório não seja preenchido corretamente:
  \[OUT] O sistema destaca o(s) campo(s) com erro e exibe mensagem explicativa.

---

### 6) Dicionário de dados

| Campo           | Tipo              | Restrições                                |
| --------------- | ----------------- | ----------------------------------------- |
| Quantidade      | Número inteiro    | Obrigatório, > 0, ≤ cotas disponíveis     |
| Cupom           | Texto             | Opcional, deve ser válido e não expirado  |
| Telefone        | Texto numérico    | Obrigatório, formato (XX) 9XXXX-XXXX      |
| CPF             | Texto numérico    | Obrigatório (novo usuário), 11 dígitos    |
| Imagem Campanha | Texto             | Obrigatório                               |
| Email           | Texto             | Obrigatório (novo usuário)                |
| Data Nascimento | Data              | Obrigatório, usuário ≥ 18 anos            |
| Valor Total     | Número decimal    | Calculado: quantidade × preço - descontos |
---

### 7) Regras de negócio

* O usuário deve ter **mínimo 18 anos** para comprar cotas.
* A quantidade de cotas não pode exceder as **cotas disponíveis** da campanha.
* **Promoção automática**: A partir de 50 unidades, o usuário ganha cotas extras automaticamente.
* **Cupom de desconto**: Opcional, acumula com promoção automática.
* **Link de afiliado**: Deve estar ativo e não expirado para gerar cashback.
* O pagamento deve ser via **PIX exclusivamente**.
* Após validação do pagamento, as cotas são **liberadas imediatamente**.

---

### 8) Protótipo(s) de interface do caso de uso

(Figura 1: )
(Figura 2: )
(Figura 3: )

