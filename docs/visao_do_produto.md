# Documento de visão

## Tronco da Sorte

### Histórico da Revisão 

|  Data  | Versão | Descrição | Autores |
|:-------|:-------|:----------|:------|
| 05/02/2026 |  **`1`** | Início do documento de visão do projeto  | Izabel|


### 1. Objetivo do Projeto 

O projeto tem como objetivo a criação de uma plataforma web para a gestão e comercialização de rifas digitais. Automatizando o processo de reserva, venda e sorteio de cotas para os clientes. Permitindo que o administrador crie campanhas, gerencie recebimentos via Pix e realize sorteios por meio da loteria federal.
 

### 2. Descrição do problema 

|         __        | __   |
|:------------------|:-----|
| **_O problema_**    | A necessidade do cliente de um site para relizar seus sorteios. |
| **_Afetando_**      | A disponibilidade para realização dos sorteios do cliente. |
| **_cujo impacto é_**| A impossibilidade do cliente de relizar os sorteios. |
| **_Uma boa solução seria_** | Criar um sistema onde o cliente possa realizar seus sorteios sem interferências externas. |


### 3. Descrição dos usuários

| Nome | Descrição | Responsabilidades |
|:---  |:--- |:--- |
| Titulares  | Usuários que são cadastrados e possuem interesse em adquirir cotas | Logar e deslogar na conta; Visualizar rifas; Fazer compras de cotas;|
| Visitante  | Usuário externo não cadastrado | Acessar o site; Pesquisar rifas; Vizualizar rifas.|
| Administrador | Usuário gerenciador do sistema | Criar rifas; |

### 4. Descrição do ambiente dos usuários

O sistema será acessado por dois tipos principais de usuários: o administrador e os titulares.

Administrador: acessa o sistema por meio de computador ou celular, sendo necessária uma conexão estável com a internet.

Titulares: acessam o sistema mais frequentemente por celular, mas também por computadores, sendo necessária a conexão com a internet.


### 5. Principais necessidades dos usuários
O cliente percebe a falta de um site que o de liberdade para realizar seus sorteis e que o represente, com sua própria identidade visual.

A partir das informações acima seria interessante a existência de um site onde o cliente posso criar suas rifas e outros usuários possam comprá-las através do PIX.


### 6.	Alternativas concorrentes
Como alternativas concorrentes podemos colocar rifas em redes sociais (ex: Instagram e etc) e também sites que permitem a compra de rifas de outros usuários.

Instagram: Pontos fortes: Permite a proximidade entre o comerciente e os compradores.
Pontos fracos: Como a plataforma não é voltada para o comercio das rifas isso pode gerar grande informalidade e erros durante a venda.

Rifa365:
Pontos fortes: Criação de rifas com facilidade, boa integração com o mobile, automação dos pagamentos e boa estabilidade do site.
Pontos fracos: taxas de mensalidade, personalização limitada e dependência em terceiros.




### 7.	Visão geral do produto
A plataforma em desenvolvimento deve ser feita para ser utilizada em navegadores (browsers);
O site tem 3 tipos de usuário. O usuário visitante, quando não é cadastrado, pode acessar o site e pesquisar por rifas de seu interesse, mas não pode interagir.
O titular seria um usuário cadastrado, podendo interagir com as rifas, podendo fazer compras e possuindo seus dados salvos.
O administrador será um moderador do sistema, aquele que gerência as rifas do sistema.
 

### 8. Requisitos Funcionais

| Código | Nome | Descrição |
|:---  |:--- |:--- |
| RF01 | Fazer o login de usuário | Para fazer o primeiro login o usuário precisará preencher um campo formulário com seu nome, email, CPF, numero telefônico e senha. Os logins seguintes poderão ser feitos inserindo o email e a senha. Logo após o login, o usuário será redirecionado para a página inicial do site. |



### 9. Requisitos não-funcionais

 Código | Nome | Descrição | Categoria | Classificação
|:---  |:--- |:--- |:--- |:--- |
| RNF01 | Design responsivo | O sistema deve adaptar-se a qualquer tamanho de tela de dispositivo, seja, computador, tablets ou smart phones. | Usabilidade | Opcional |
| RNF02 | Privacidade | O sistema não deve revelar informações pessoais sobre seus usuários | Segurança | Obrigatório |
| RNF03 | Facilidade de uso | O sistema deve ter uma interface de fácil entendimento | Usabilidade | Obrigatório |
| RNF04 | Acesso inclusivo | Ser acessível para todos os usuários, independentemente de suas habilidades | Acessibilidade | Obrigatório |
| RNF05 | Criptografia de dados| Os dados devem ser gravados de forma criptografada no banco de dados | Segurança | Obrigatório |

