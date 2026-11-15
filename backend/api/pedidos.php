<?php

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../config/database.php";

try {
    // CONSULTAR HISTÓRICO
    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $sql = "
            SELECT
                p.id AS pedido_id,
                p.codigo,
                p.total,
                p.status,
                p.data_pedido,
                i.id AS item_id,
                i.produto_id,
                i.nome_produto,
                i.preco_unitario,
                i.quantidade,
                i.subtotal,
                pr.emoji
            FROM pedidos p
            LEFT JOIN itens_pedido i ON i.pedido_id = p.id
            LEFT JOIN produtos pr ON pr.id = i.produto_id
            ORDER BY p.data_pedido DESC, p.id DESC, i.id ASC
        ";

        $consulta = $pdo->query($sql);
        $linhas = $consulta->fetchAll();

        $pedidos = [];

        foreach ($linhas as $linha) {
            $id = $linha["pedido_id"];

            if (!isset($pedidos[$id])) {
                $pedidos[$id] = [
                    "id" => $linha["codigo"],
                    "data" => $linha["data_pedido"],
                    "total" => (float) $linha["total"],
                    "status" => $linha["status"],
                    "produtos" => []
                ];
            }

            if ($linha["item_id"] !== null) {
                $pedidos[$id]["produtos"][] = [
                    "id" => $linha["produto_id"] !== null
                    ? (int) $linha["produto_id"]
                    : null,
                    "nome" => $linha["nome_produto"],
                    "preco" => (float) $linha["preco_unitario"],
                    "quantidade" => (int) $linha["quantidade"],
                    "subtotal" => (float) $linha["subtotal"],
                    "emoji" => $linha["emoji"] ?? "🛍️"
                ];
            }
        }

        echo json_encode([
            "sucesso" => true,
            "pedidos" => array_values($pedidos)
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    // REGISTRAR NOVO PEDIDO
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $dados = json_decode(file_get_contents("php://input"), true);

        if (
            !is_array($dados) ||
            !isset($dados["produtos"]) ||
            !is_array($dados["produtos"]) ||
            count($dados["produtos"]) === 0
        ) {
            http_response_code(400);

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Informe pelo menos um produto."
            ]);

            exit;
        }

        // Agrupa produtos repetidos e valida as quantidades.
        $itens = [];

        foreach ($dados["produtos"] as $item) {
            $id = filter_var($item["id"] ?? null, FILTER_VALIDATE_INT);
            $quantidade = filter_var(
                $item["quantidade"] ?? null,
                FILTER_VALIDATE_INT
            );

            if (
                !$id ||
                !$quantidade ||
                $quantidade < 1 ||
                $quantidade > 99
            ) {
                http_response_code(400);

                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Produto ou quantidade inválida."
                ]);

                exit;
            }

            $itens[$id] = ($itens[$id] ?? 0) + $quantidade;

            if ($itens[$id] > 99) {
                http_response_code(400);

                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Quantidade máxima por produto excedida."
                ]);

                exit;
            }
        }

        $pdo->beginTransaction();

        $consultaProduto = $pdo->prepare("
            SELECT id, nome, preco, emoji
            FROM produtos
            WHERE id = :id AND ativo = 1
        ");

        $produtosPedido = [];
        $total = 0;

        foreach ($itens as $id => $quantidade) {
            $consultaProduto->execute(["id" => $id]);
            $produto = $consultaProduto->fetch();

            if (!$produto) {
                throw new RuntimeException(
                    "Um dos produtos não está disponível."
                );
            }

            $preco = (float) $produto["preco"];
            $subtotal = round($preco * $quantidade, 2);
            $total += $subtotal;

            $produtosPedido[] = [
                "id" => (int) $produto["id"],
                "nome" => $produto["nome"],
                "preco" => $preco,
                "quantidade" => $quantidade,
                "subtotal" => $subtotal,
                "emoji" => $produto["emoji"] ?? "🛍️"
            ];
        }

        $total = round($total, 2);

        $codigo = "PED-" . date("YmdHis") . "-" .
            strtoupper(bin2hex(random_bytes(3)));

        $inserirPedido = $pdo->prepare("
            INSERT INTO pedidos (codigo, total, status)
            VALUES (:codigo, :total, 'Concluído')
        ");

        $inserirPedido->execute([
            "codigo" => $codigo,
            "total" => $total
        ]);

        $pedidoId = (int) $pdo->lastInsertId();

        $inserirItem = $pdo->prepare("
            INSERT INTO itens_pedido (
                pedido_id,
                produto_id,
                nome_produto,
                preco_unitario,
                quantidade,
                subtotal
            )
            VALUES (
                :pedido_id,
                :produto_id,
                :nome_produto,
                :preco_unitario,
                :quantidade,
                :subtotal
            )
        ");

        foreach ($produtosPedido as $produto) {
            $inserirItem->execute([
                "pedido_id" => $pedidoId,
                "produto_id" => $produto["id"],
                "nome_produto" => $produto["nome"],
                "preco_unitario" => $produto["preco"],
                "quantidade" => $produto["quantidade"],
                "subtotal" => $produto["subtotal"]
            ]);
        }

        $pdo->commit();

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Pedido registrado com sucesso!",
            "pedido" => [
                "id" => $codigo,
                "data" => date("Y-m-d H:i:s"),
                "total" => $total,
                "status" => "Concluído",
                "produtos" => $produtosPedido
            ]
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    http_response_code(405);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Método não permitido."
    ]);

} catch (RuntimeException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(400);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Não foi possível processar o pedido."
    ], JSON_UNESCAPED_UNICODE);
}
