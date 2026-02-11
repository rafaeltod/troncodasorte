# Documento de visão

## Tronco da Sorte

### Histórico da Revisão 

|  Data  | Versão | Descrição | Autores |
|:-------|:-------|:----------|:------|
| 05/02/2026 |  **`1`** | Início do documento de visão do projeto  | Izabel|
| 11/02/2026 |  **`2`** | Adequações  | Izabel|


### 1. Objetivo do Projeto 

O projeto tem como objetivo a criação de uma plataforma web para a gestão e comercialização de ações digitais. Automatizando o processo de reserva, venda e sorteio de cotas para os clientes. Permitindo que o administrador crie campanhas, gerencie recebimentos via Pix e realize sorteios por meio da loteria federal.
 

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
| Titulares  | Usuários que são cadastrados e possuem interesse em adquirir cotas | Logar e deslogar na conta; Visualizar ações; Fazer compras de cotas;|
| Administrador | Usuário capaz de criar e gerenciar ações | Criar, editar e deletar ações; |

### 4. Descrição do ambiente dos usuários

O sistema será acessado por dois tipos principais de usuários: o administrador e os titulares.

Administrador: acessa o sistema por meio de computador ou celular, sendo necessária uma conexão estável com a internet.

Titulares: acessam o sistema mais frequentemente por celular, mas também por computadores, sendo necessária a conexão com a internet.


### 5. Principais necessidades dos usuários
O cliente percebe a falta de um site que o de liberdade para realizar seus sorteis e que o represente, com sua própria identidade visual.

A partir das informações acima seria interessante a existência de um site onde o cliente posso criar suas ações e outros usuários possam comprá-las através do PIX.


### 6.	Visão geral do produto
A plataforma em desenvolvimento deve ser feita para ser utilizada em navegadores (browsers);
O site tem 2 tipos de usuário. O titular seria um usuário cadastrado, podendo interagir com as ações, podendo fazer compras e possuindo seus dados salvos.
O administrador será um moderador do sistema, aquele que gerência as ações do sistema.
 

### 7. Requisitos Funcionais

| Código | Nome | Descrição |
|:---  |:--- |:--- |
| RF01 | Fazer o login de usuário | Para fazer o primeiro login, se for adiministrador, o usuário vai diretamente para um site em que ele insere suas informações de login; se for titular, o usuário deve inserir o numero de telefone, se for um numero cadastrado ele ira ter acesso as irformações da conta, se não for um numero cadastrado irá aparecer um formulário com os campos necessários para o cadastro, com o campo de telefone ja preenchido.|
| RF02 | Comprar cota | O titular deve inserir o numero de cotas que deseja compras, depois inserir seu telefone, após a validação do numero deve realizar o pagamento. |
| RF03 | Criar campanha | O usuário administrador pode criar uma campanha, selecionando as fotos, o nome, o tamanho da campanha e o valor de cada cota. |
| RF04 | Selecionar o ganhador | O usuário administrador terá um campo onde poderá inserir o número ganhador e os dados do titular da cota serão mostrados. |



### 8. Requisitos não-funcionais

 Código | Nome | Descrição | Categoria | Classificação
|:---  |:--- |:--- |:--- |:--- |
| RNF01 | Design responsivo | O sistema deve adaptar-se a qualquer tamanho de tela de dispositivo, seja, computador, tablets ou smart phones. | Usabilidade | Opcional |
| RNF02 | Privacidade | O sistema não deve revelar informações pessoais sobre seus usuários | Segurança | Obrigatório |
| RNF03 | Facilidade de uso | O sistema deve ter uma interface de fácil entendimento | Usabilidade | Obrigatório |
| RNF04 | Acesso inclusivo | Ser acessível para todos os usuários, independentemente de suas habilidades | Acessibilidade | Obrigatório |
| RNF05 | Criptografia de dados| Os dados devem ser gravados de forma criptografada no banco de dados | Segurança | Obrigatório |

