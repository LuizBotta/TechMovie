CREATE DATABASE IF NOT EXISTS techmovie
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE techmovie;

CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    emoji VARCHAR(20),
    categoria VARCHAR(80),
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(40) NOT NULL UNIQUE,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Concluído',
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    produto_id INT NULL,
    nome_produto VARCHAR(120) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    quantidade INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_item_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON DELETE SET NULL
);

INSERT IGNORE INTO produtos
(id, nome, descricao, preco, emoji, categoria)
VALUES
(1, 'Pipoca Pequena', 'Pipoca tradicional com manteiga.', 12.00, '🍿', 'Pipocas'),
(2, 'Pipoca Grande', 'Pipoca grande para compartilhar.', 22.00, '🍿', 'Pipocas'),
(3, 'Refrigerante', 'Refrigerante gelado de 500ml.', 9.00, '🥤', 'Bebidas'),
(4, 'Água Mineral', 'Água mineral sem gás de 500ml.', 5.00, '💧', 'Bebidas'),
(5, 'Chocolate', 'Barra de chocolate ao leite.', 8.00, '🍫', 'Doces'),
(6, 'Combo Cinema', 'Pipoca grande e dois refrigerantes.', 35.00, '🍿', 'Combos');
