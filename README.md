# 🎬 TechMovie

Sistema web demonstrativo de cinema, desenvolvido como projeto acadêmico da Fatec Presidente Prudente.

## Sobre o projeto

O TechMovie permite consultar filmes em cartaz, visualizar detalhes, escolher sessões, selecionar poltronas e montar pedidos com ingressos e produtos de bomboniere.

O sistema possui integração entre front-end, back-end e banco de dados.

## Tecnologias utilizadas

- **React:** desenvolvimento da interface.
- **JavaScript:** funcionalidades e interações.
- **PHP:** processamento das requisições e regras de negócio.
- **MySQL:** armazenamento dos dados.
- **XAMPP:** ambiente local de execução.
- **Vite:** servidor de desenvolvimento do front-end.

## Funcionalidades

### Filmes e sessões
- Catálogo de filmes.
- Pesquisa e filtro por gênero.
- Detalhes dos filmes.
- Consulta de datas e horários.
- Seleção de poltronas disponíveis.

### Ingressos
- Seleção de poltronas.
- Escolha entre ingresso inteiro e meia-entrada.
- Cálculo automático dos valores.
- Resumo da seleção.

### Bomboniere
- Consulta de produtos.
- Adição e remoção de produtos.
- Controle de quantidade.
- Cálculo do subtotal.

### Carrinho e pedidos
- Carrinho integrado de ingressos e produtos.
- Cálculo do valor total.
- Finalização demonstrativa.
- Registro de pedidos no MySQL.
- Consulta do histórico de compras.

## Requisitos para execução

- Node.js e npm.
- XAMPP.
- PHP.
- MySQL.
- Navegador atualizado.

## Como executar o projeto

### 1. Clonar o repositório


git clone https://github.com/LuizBotta/TechMovie.git


### 2. Instalar as dependências

Dentro da pasta do front-end:


npm install


### 3. Configurar o banco de dados

1. Inicie Apache e MySQL pelo XAMPP.
2. Acesse o phpMyAdmin.
3. Crie ou importe o banco de dados do TechMovie.
4. Configure as credenciais de conexão no arquivo PHP responsável pela conexão com o banco.

### 4. Iniciar o back-end

Execute o servidor PHP na porta configurada pelo projeto.

Exemplo:

php -S localhost:8000


### 5. Iniciar o front-end

Na pasta do React:

npm run dev


Acesse:

http://localhost:5173


## Estrutura geral

TechMovie/
├── public/
│   └── images/
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── routes/
│   └── styles/
├── backend/
│   ├── api/
│   └── config/
├── package.json
└── README.md


## Observação

O TechMovie possui finalidade acadêmica e demonstrativa. A finalização dos pedidos não representa processamento de pagamento ou cobrança financeira real.

## Equipe

Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software da Fatec Presidente Prudente.