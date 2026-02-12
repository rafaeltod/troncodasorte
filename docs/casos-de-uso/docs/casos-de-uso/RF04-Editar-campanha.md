
# Tronco da sorte

## Especificação do caso de uso - F03 - Editar campanha

### Histórico da Revisão

| Data       | Versão | Descrição      | Autor            |
| ---------- | ------ | -------------- | ---------------- |
| 12/02/2026 | 1.00   | Versão Inicial | Beatriz Maria    |

---

### 1) Resumo

Um usuário administrador irá edtiar uma campanha, podendo alterar nome, descrição, imagens, quantidade máxima de cotas e o valor da cota

---

### 2) Atores

* Administrador

---

### 3) Precondições

* O navegador deve estar acessível.
* O usuário deve estar conectado a sua conta.
* A campanha deve estar cadastrada no banco de dados.
* O usuário deve possuir credenciais de acesso válidas para administrador.

---

### 4) Pós-condições

* As informações da  campanha devem mudar.
* O usuário é redirecionado para a tela da campanha.


---

### 5) Fluxos de evento

#### 5.1) Fluxo básico – Login de Administrador

1. \[IN] O usuário aperta no botão "editar campanha".
2. \[OUT] O sistema o redireciona para o formulário de alteração da campanha.
3. \[IN] O usuário altera as informações(Nome da campanha,descrição, número de cotas, preço da cota, fotos).
4. \[OUT] O sistema confirma que o usuário é um administrador.
5. \[OUT] O sistema altera as informações da campanha no banco de dados.
6. \[OUT] O sistema redireciona o usuário para a página da campanha.

#### 5.4) Fluxo de exceção – Sem altração

1. \[IN] O usuário não faz altrações e aperta em salvar
2. \[OUT] O sistema apenas redireciona o usuário para a pagina da campanha

---

### 6) Dicionário de dados

| Campo             | Tipo              | Restrições                                          |
| ----------------- | ----------------- | --------------------------------------------------- |
| Nome              | Texto             | Obrigatório                                        | 
| Descrição         | Texto             | Opcional                                           |
| Número de cotas   | Número inteiro    | Obrigatório                                        |
| Valor das cotas   | Número boleano    | Obrigatório, valor > 0                             |
| Quantidade de cotas    | Número inteiro    | Obrigatório, quantidade > 1                   |  

---

### 7) Regras de negócio

* **Distinção de perfil**: O sistema deve identificar se o usuário é administrador ou titular (comprador de cotas) baseado na entrada.

---

### 8) Protótipo(s) de interface do caso de uso

* (Figura 1: Tela de login inicial com seleção de tipo de usuário - Administrador ou Titular) 
