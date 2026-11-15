-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 15/11/2026 às 21:36
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `techmovie`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `filmes`
--

CREATE TABLE `filmes` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `genero` varchar(80) NOT NULL,
  `duracao` varchar(30) NOT NULL,
  `classificacao` varchar(30) NOT NULL,
  `imagem` text DEFAULT NULL,
  `sinopse` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `filmes`
--

INSERT INTO `filmes` (`id`, `titulo`, `genero`, `duracao`, `classificacao`, `imagem`, `sinopse`) VALUES
(1, 'Interestelar', 'Ficção científica', '2h 49min', '10 anos', '/images/filmes/interestelar.jpg', 'Com a Terra enfrentando uma crise ambiental, um grupo de astronautas atravessa um buraco de minhoca em busca de um novo lar para a humanidade.'),
(2, 'John Wick 4: Baba Yaga', 'Ação', '2h 49min', '16 anos', '/images/filmes/john-wick-4.jpg', 'John Wick descobre uma maneira de derrotar a Alta Cúpula, mas precisa enfrentar um novo inimigo com alianças poderosas ao redor do mundo.'),
(3, 'Invocação do Mal', 'Terror', '1h 52min', '14 anos', '/images/filmes/invocacao-do-mal.jpg', 'Os investigadores paranormais Ed e Lorraine Warren ajudam uma família aterrorizada por uma presença sobrenatural em sua casa.'),
(4, 'La La Land: Cantando Estações', 'Romance / Musical', '2h 08min', 'Livre', '/images/filmes/la-la-land.jpg', 'Uma aspirante a atriz e um pianista de jazz se apaixonam em Los Angeles enquanto tentam realizar seus sonhos profissionais.');

-- --------------------------------------------------------

--
-- Estrutura para tabela `ingressos`
--

CREATE TABLE `ingressos` (
  `id` int(11) NOT NULL,
  `pedido_id` bigint(20) NOT NULL,
  `sessao_id` int(11) NOT NULL,
  `poltrona` varchar(3) NOT NULL,
  `tipo` enum('inteira','meia') NOT NULL,
  `preco` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `ingressos`
--

INSERT INTO `ingressos` (`id`, `pedido_id`, `sessao_id`, `poltrona`, `tipo`, `preco`) VALUES
(1, 4, 3, 'E1', 'inteira', 30.00),
(2, 4, 3, 'E2', 'inteira', 30.00),
(3, 4, 3, 'E3', 'inteira', 30.00),
(4, 4, 3, 'E4', 'inteira', 30.00),
(5, 5, 6, 'C1', 'inteira', 30.00),
(6, 5, 6, 'C2', 'inteira', 30.00),
(7, 5, 6, 'C3', 'inteira', 30.00),
(8, 5, 6, 'C4', 'inteira', 30.00),
(9, 5, 9, 'E4', 'inteira', 30.00),
(10, 5, 9, 'D4', 'inteira', 30.00),
(11, 5, 9, 'D5', 'inteira', 30.00),
(12, 5, 9, 'C5', 'inteira', 30.00),
(13, 5, 9, 'B5', 'inteira', 30.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `itens_pedido`
--

CREATE TABLE `itens_pedido` (
  `id` bigint(20) NOT NULL,
  `pedido_id` bigint(20) NOT NULL,
  `produto_id` int(11) DEFAULT NULL,
  `nome_produto` varchar(120) NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `itens_pedido`
--

INSERT INTO `itens_pedido` (`id`, `pedido_id`, `produto_id`, `nome_produto`, `preco_unitario`, `quantidade`, `subtotal`) VALUES
(1, 1, 1, 'Pipoca Pequena', 12.00, 1, 12.00),
(2, 1, 3, 'Refrigerante', 9.00, 1, 9.00),
(3, 2, 1, 'Pipoca Pequena', 12.00, 1, 12.00),
(4, 2, 2, 'Pipoca Grande', 22.00, 1, 22.00),
(5, 2, 3, 'Refrigerante', 9.00, 1, 9.00),
(6, 3, 1, 'Pipoca Pequena', 12.00, 1, 12.00),
(7, 3, 2, 'Pipoca Grande', 22.00, 1, 22.00),
(8, 3, 3, 'Refrigerante', 9.00, 1, 9.00),
(9, 4, 1, 'Pipoca Pequena', 12.00, 1, 12.00),
(10, 4, 2, 'Pipoca Grande', 22.00, 1, 22.00),
(11, 4, 3, 'Refrigerante', 9.00, 2, 18.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedidos`
--

CREATE TABLE `pedidos` (
  `id` bigint(20) NOT NULL,
  `codigo` varchar(40) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Concluído',
  `data_pedido` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `pedidos`
--

INSERT INTO `pedidos` (`id`, `codigo`, `total`, `status`, `data_pedido`) VALUES
(1, 'PED-20261115201615-FD3F64', 21.00, 'Concluído', '2026-11-15 19:16:15'),
(2, 'PED-20261115202852-39E7FB', 43.00, 'Concluído', '2026-11-15 19:28:52'),
(3, 'PED-20261115210137-530187', 43.00, 'Concluído', '2026-11-15 20:01:37'),
(4, 'PED-20261115212134-A6CB8F', 172.00, 'Concluído', '2026-11-15 20:21:34'),
(5, 'PED-20261115212209-76A906', 270.00, 'Concluído', '2026-11-15 20:22:09');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(120) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `emoji` varchar(20) DEFAULT NULL,
  `categoria` varchar(80) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `descricao`, `preco`, `emoji`, `categoria`, `ativo`) VALUES
(1, 'Pipoca Pequena', 'Pipoca tradicional com manteiga.', 12.00, '🍿', 'Pipocas', 1),
(2, 'Pipoca Grande', 'Pipoca grande para compartilhar.', 22.00, '🍿', 'Pipocas', 1),
(3, 'Refrigerante', 'Refrigerante gelado de 500ml.', 9.00, '🥤', 'Bebidas', 1),
(4, 'Água Mineral', 'Água mineral sem gás de 500ml.', 5.00, '💧', 'Bebidas', 1),
(5, 'Chocolate', 'Barra de chocolate ao leite.', 8.00, '🍫', 'Doces', 1),
(6, 'Combo Cinema', 'Pipoca grande e dois refrigerantes.', 35.00, '🍿', 'Combos', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `sessoes`
--

CREATE TABLE `sessoes` (
  `id` int(11) NOT NULL,
  `filme_id` int(11) NOT NULL,
  `data_sessao` date NOT NULL,
  `horario` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `sessoes`
--

INSERT INTO `sessoes` (`id`, `filme_id`, `data_sessao`, `horario`) VALUES
(1, 1, '2026-11-20', '14:00:00'),
(2, 1, '2026-11-20', '17:30:00'),
(3, 1, '2026-11-20', '20:00:00'),
(4, 1, '2026-11-21', '15:00:00'),
(5, 1, '2026-11-21', '19:30:00'),
(6, 1, '2026-11-21', '22:00:00'),
(7, 2, '2026-11-20', '16:00:00'),
(8, 2, '2026-11-20', '19:00:00'),
(9, 2, '2026-11-20', '21:30:00'),
(10, 3, '2026-11-20', '18:00:00'),
(11, 3, '2026-11-20', '20:30:00'),
(12, 3, '2026-11-20', '22:30:00'),
(13, 4, '2026-11-20', '14:30:00'),
(14, 4, '2026-11-20', '17:00:00'),
(15, 4, '2026-11-20', '20:00:00');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `filmes`
--
ALTER TABLE `filmes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `ingressos`
--
ALTER TABLE `ingressos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sessao_id` (`sessao_id`,`poltrona`),
  ADD KEY `pedido_id` (`pedido_id`);

--
-- Índices de tabela `itens_pedido`
--
ALTER TABLE `itens_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_item_pedido` (`pedido_id`),
  ADD KEY `fk_item_produto` (`produto_id`);

--
-- Índices de tabela `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `sessoes`
--
ALTER TABLE `sessoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `filme_id` (`filme_id`,`data_sessao`,`horario`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `filmes`
--
ALTER TABLE `filmes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `ingressos`
--
ALTER TABLE `ingressos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `itens_pedido`
--
ALTER TABLE `itens_pedido`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `sessoes`
--
ALTER TABLE `sessoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `ingressos`
--
ALTER TABLE `ingressos`
  ADD CONSTRAINT `ingressos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `ingressos_ibfk_2` FOREIGN KEY (`sessao_id`) REFERENCES `sessoes` (`id`);

--
-- Restrições para tabelas `itens_pedido`
--
ALTER TABLE `itens_pedido`
  ADD CONSTRAINT `fk_item_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_item_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `sessoes`
--
ALTER TABLE `sessoes`
  ADD CONSTRAINT `sessoes_ibfk_1` FOREIGN KEY (`filme_id`) REFERENCES `filmes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
