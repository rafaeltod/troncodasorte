
# Tronco da sorte

## Especificação do caso de uso - FX - Comprar campanha

### Histórico da Revisão

| Data       | Versão | Descrição      | Autor            |
| ---------- | ------ | -------------- | ---------------- |
| 11/02/2026 | 1.00   | Versão Inicial | Kilton J. Araújo |

---

### 1) Resumo

Permite ao restaurante adicionar, remover ou editar produtos do cardápio, incluindo nome, descrição, imagem e preço, organizando melhor a exibição para os clientes.

---

### 2) Atores

* Restaurante (usuário administrador do estabelecimento)

---

### 3) Precondições

* O restaurante deve estar autenticado no sistema.
* Deve existir ao menos uma categoria criada para vincular produtos (RF02).

---

### 4) Pós-condições

* O produto será incluído, removido ou alterado na base de dados do cardápio, sendo refletido para os clientes visualizarem.

---

### 5) Fluxos de evento

#### 5.1) Fluxo básico – Comprar campanha

1. \[IN] O usuário acessa a interface de de venda do produto.
2. \[IN] O usuário seleciona a quantidade de cotas que deseja.
3. \[IN] O usuário insere um cupom de desconto.
4. \[OUT] O sistema valida o cupom
5. \[OUT] O sistema aplica o desconto no valor da compra.
6. \[IN] O usuário clica em "Comprar".
7. \[OUT] O sistema pede o número de telefone para a primeira verificação.
8. \[IN] O usuário insere o número de telefone.
9. \[OUT] O sistema valida os dados inseridos.
10. \[OUT] O sistema redireciona o usúario para a pagina de pagamentos.
11. \[IN] O usuário realiza o pagamento via pix.
12. \[OUT] O sistema valida o pagamento
13. \[OUT] O sistema exibe mensagem de sucesso.
14. \[OUT] O sistema redireciona o usuario para a pagina de cotas compradas

#### 5.2) Fluxo alternativo – Cupom inválido

4. \[OUT] O sistema exibe "Cupom invalido".
5. \[OUT] O sistema aplica o desconto no valor da compra.
6. \[IN] O usuário clica em "Comprar".
7. \[OUT] O sistema pede o número de telefone para a primeira verificação.
8. \[IN] O usuário insere o número de telefone.
9. \[OUT] O sistema valida os dados inseridos.
10. \[OUT] O sistema redireciona o usúario para a pagina de pagamentos.
11. \[IN] O usuário realiza o pagamento via pix.
12. \[OUT] O sistema valida o pagamento
13. \[OUT] O sistema exibe mensagem de sucesso.
14. \[OUT] O sistema redireciona o usuario para a pagina de cotas compradas

#### 5.3) Fluxo alternativo – Remover produto

1. \[IN] O restaurante clica em "Remover" ao lado de um item.
2. \[OUT] O sistema solicita confirmação.
3. \[IN] O restaurante confirma a remoção.
4. \[OUT] O sistema remove o produto do banco.
5. \[OUT] O sistema exibe mensagem de sucesso.

#### 5.4) Fluxo de exceção

* Caso algum campo obrigatório não seja preenchido corretamente:
  \[OUT] O sistema destaca o(s) campo(s) com erro e exibe mensagem explicativa.

---

### 6) Dicionário de dados

| Campo     | Tipo                  | Restrições                        |
| --------- | --------------------- | --------------------------------- |
| Nome      | Texto alfabético      | Obrigatório                       |
| Descrição | Texto alfanumérico    | Obrigatório                          |
| Imagem    | Arquivo (PNG/JPG)     | Obrigatório                |
| Valor     | Número decimal        | Maior que zero                    |
| Categoria | Texto (chave externa) | Deve estar cadastrada previamente |
---

### 7) Regras de negócio

* Nome e Preço são campos obrigatórios.
* O preço do produto deve ser maior que zero.
* A imagem deve estar em formato JPG, JPEG ou PNG.
* Produtos desativados não devem ser exibidos ao cliente (RF03).

---

### 8) Protótipo(s) de interface do caso de uso

(Figura 1: Tela de gerenciamento de produtos)

Quando acabar o protótipo.
