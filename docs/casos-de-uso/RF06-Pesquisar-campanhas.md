
# Tronco da sorte

## Especificação do caso de uso - F06 - Pesquisar campanhas

### Histórico da Revisão

| Data       | Versão | Descrição      | Autor            |
| ---------- | ------ | -------------- | ---------------- |
| 11/02/2026 | 1.00   | Versão Inicial | Beatriz Maria    |

---

### 1) Resumo

Um usuário administrador ou titular irá pesquisar por uma campanha.

---

### 2) Atores

* Administrador
* Titular

---

### 3) Precondições

* O navegador deve estar acessível.
* O usuário deve estar conectado a sua conta.
* O usuário deve possuir credenciais de validas.

---

### 4) Pós-condições

* O usuário recebera uma tela com as campanhas referentes aquela pesquisa


---

### 5) Fluxos de evento

#### 5.1) Fluxo básico – Pesquisa com resultados

1. \[IN] O usuário insere um texto no botão buscar
2. \[OUT] O sistema faz uma filtração e mostra as campanhas correspondentes a pesquisa.
3. \[OUT] O sistema redireciona o usuário para uma tela mostrando duas linhas "Campanhas ativas" e "Campanhas finalizadas".
4. \[IN] O usuário seleciona a campanha desejada.
5. \[OUT] O sistema redireciona o usuário para a página da campanha.

#### 5.4) Fluxo de exceção – Falta de campanhas

1. \[IN] O usuário insere um texto no botão buscar
2. \[OUT] O sistema apresenta uma tela com uma imagem de fundo "Não há resultados para sua pesquisa".

---

### 6) Dicionário de dados


---

### 7) Regras de negócio



---

### 8) Protótipo(s) de interface do caso de uso

* (Figura 1: Tela de login inicial com seleção de tipo de usuário - Administrador ou Titular)
