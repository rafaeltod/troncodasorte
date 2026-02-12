
# Tronco da sorte

## Especificação do caso de uso - F05 - Excluir campanha

### Histórico da Revisão

| Data       | Versão | Descrição      | Autor            |
| ---------- | ------ | -------------- | ---------------- |
| 11/02/2026 | 1.00   | Versão Inicial | Beatriz Maria    |

---

### 1) Resumo

Um usuário administrador irá excluir uma campanha, apenas se ela não possuir cotas compradas, então essa campanha será excluida do banco de dados.

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

* A campanha não deve constar no banco de dados.
* O usuário é redirecionado para a tela da início.


---

### 5) Fluxos de evento

#### 5.1) Fluxo básico – Login de Administrador

1. \[IN] O usuário aperta no botão "excluir campanha".
2. \[OUT] O sistema valida e confirma que a campanha não possuí cotas compradas.
3. \[OUT] O sistema apresenta a mensagem "Essa ação é definitiva".
4. \[IN] O usuário aperta em "confirmar exclusão".
5. \[OUT] O sistema retira a campanha no banco de dados.
6. \[OUT] O sistema redireciona o usuário para a página inicial.

#### 5.4) Fluxo de exceção – Falta de informações

1. \[IN] O usuário aperta para excluir campanha
2. \[OUT] O sistema apresenta uma mensagem de erro avisando que não é possivel excluir a campanha pois já houveram cotas compradas

---

### 6) Dicionário de dados

| Campo             | Tipo              | Restrições                                          |
| ----------------- | ----------------- | --------------------------------------------------- |
| Quantidade de cotas| Número inteiro    | Obrigatório, quantidade < 1                        |   

---

### 7) Regras de negócio

* **Distinção de perfil**: O sistema deve identificar se o usuário é administrador ou titular (comprador de cotas) baseado na entrada.

---

### 8) Protótipo(s) de interface do caso de uso

* (Figura 1: Tela de login inicial com seleção de tipo de usuário - Administrador ou Titular)
