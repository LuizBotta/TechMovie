
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

function responder($codigo, $dados) {
    http_response_code($codigo);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $consulta = $pdo->query("
            SELECT id, codigo, total, status, data_pedido
            FROM pedidos
            ORDER BY data_pedido DESC, id DESC
        ");

        $pedidos = [];

        foreach ($consulta->fetchAll() as $pedido) {
            $pedidoId = (int) $pedido["id"];

            $pedidos[$pedidoId] = [
                "id" => $pedido["codigo"],
                "data" => $pedido["data_pedido"],
                "total" => (float) $pedido["total"],
                "status" => $pedido["status"],
                "produtos" => [],
                "ingressos" => []
            ];
        }

        $consultaProdutos = $pdo->query("
            SELECT
                i.pedido_id,
                i.produto_id,
                i.nome_produto,
                i.preco_unitario,
                i.quantidade,
                i.subtotal,
                p.emoji
            FROM itens_pedido i
            LEFT JOIN produtos p ON p.id = i.produto_id
            ORDER BY i.id
        ");

        foreach ($consultaProdutos->fetchAll() as $item) {
            $pedidoId = (int) $item["pedido_id"];

            if (!isset($pedidos[$pedidoId])) {
                continue;
            }

            $pedidos[$pedidoId]["produtos"][] = [
                "id" => $item["produto_id"] !== null
                    ? (int) $item["produto_id"]
                    : null,
                "nome" => $item["nome_produto"],
                "preco" => (float) $item["preco_unitario"],
                "quantidade" => (int) $item["quantidade"],
                "subtotal" => (float) $item["subtotal"],
                "emoji" => $item["emoji"] ?? "🛍️"
            ];
        }

        $consultaIngressos = $pdo->query("
            SELECT
                i.pedido_id,
                i.sessao_id,
                i.poltrona,
                i.tipo,
                i.preco,
                f.titulo AS filme,
                DATE_FORMAT(s.data_sessao, '%Y-%m-%d') AS data,
                TIME_FORMAT(s.horario, '%H:%i') AS horario
            FROM ingressos i
            INNER JOIN sessoes s ON s.id = i.sessao_id
            INNER JOIN filmes f ON f.id = s.filme_id
            ORDER BY i.id
        ");

        foreach ($consultaIngressos->fetchAll() as $ingresso) {
            $pedidoId = (int) $ingresso["pedido_id"];

            if (!isset($pedidos[$pedidoId])) {
                continue;
            }

            $pedidos[$pedidoId]["ingressos"][] = [
                "sessaoId" => (int) $ingresso["sessao_id"],
                "filme" => $ingresso["filme"],
                "data" => $ingresso["data"],
                "horario" => $ingresso["horario"],
                "poltrona" => $ingresso["poltrona"],
                "tipo" => $ingresso["tipo"],
                "preco" => (float) $ingresso["preco"]
            ];
        }

        responder(200, [
            "sucesso" => true,
            "pedidos" => array_values($pedidos)
        ]);
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        responder(405, [
            "sucesso" => false,
            "mensagem" => "Método não permitido."
        ]);
    }

    $dados = json_decode(file_get_contents("php://input"), true);

    if (!is_array($dados)) {
        responder(400, [
            "sucesso" => false,
            "mensagem" => "Dados inválidos."
        ]);
    }

    $produtosRecebidos = $dados["produtos"] ?? [];
    $ingressosRecebidos = $dados["ingressos"] ?? [];

    if (
        !is_array($produtosRecebidos) ||
        !is_array($ingressosRecebidos) ||
        (
            count($produtosRecebidos) === 0 &&
            count($ingressosRecebidos) === 0
        )
    ) {
        responder(400, [
            "sucesso" => false,
            "mensagem" => "Informe produtos ou ingressos."
        ]);
    }

    $quantidades = [];

    foreach ($produtosRecebidos as $item) {
        $id = filter_var(
            $item["id"] ?? null,
            FILTER_VALIDATE_INT
        );

        $quantidade = filter_var(
            $item["quantidade"] ?? null,
            FILTER_VALIDATE_INT
        );

        if (
            !$id ||
            !$quantidade ||
            $id < 1 ||
            $quantidade < 1 ||
            $quantidade > 99
        ) {
            throw new RuntimeException(
                "Produto ou quantidade inválida."
            );
        }

        $quantidades[$id] =
            ($quantidades[$id] ?? 0) + $quantidade;

        if ($quantidades[$id] > 99) {
            throw new RuntimeException(
                "Quantidade máxima por produto excedida."
            );
        }
    }

    $ingressosValidados = [];
    $poltronasRecebidas = [];

    foreach ($ingressosRecebidos as $item) {
        $sessaoId = filter_var(
            $item["sessaoId"] ?? null,
            FILTER_VALIDATE_INT
        );

        $poltrona = strtoupper(
            trim((string) ($item["poltrona"] ?? ""))
        );

        $tipo = $item["tipo"] ?? "";

        if (
            !$sessaoId ||
            $sessaoId < 1 ||
            !preg_match('/^[A-E][1-8]$/', $poltrona) ||
            !in_array($tipo, ["inteira", "meia"], true)
        ) {
            throw new RuntimeException(
                "Dados de ingresso inválidos."
            );
        }

        $chave = $sessaoId . "-" . $poltrona;

        if (isset($poltronasRecebidas[$chave])) {
            throw new RuntimeException(
                "A mesma poltrona foi enviada mais de uma vez."
            );
        }

        $poltronasRecebidas[$chave] = true;

        $ingressosValidados[] = [
            "sessaoId" => $sessaoId,
            "poltrona" => $poltrona,
            "tipo" => $tipo,
            "preco" => $tipo === "meia" ? 15.00 : 30.00
        ];
    }

    $pdo->beginTransaction();

    $consultaProduto = $pdo->prepare("
        SELECT id, nome, preco, emoji
        FROM produtos
        WHERE id = :id AND ativo = 1
    ");

    $produtosPedido = [];
    $total = 0;

    foreach ($quantidades as $id => $quantidade) {
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

    $consultaSessao = $pdo->prepare("
        SELECT
            s.id,
            s.data_sessao,
            s.horario,
            f.titulo
        FROM sessoes s
        INNER JOIN filmes f ON f.id = s.filme_id
        WHERE s.id = :id
    ");

    $ingressosPedido = [];

    foreach ($ingressosValidados as $ingresso) {
        $consultaSessao->execute([
            "id" => $ingresso["sessaoId"]
        ]);

        $sessao = $consultaSessao->fetch();

        if (!$sessao) {
            throw new RuntimeException(
                "Uma das sessões não existe."
            );
        }

        $inicioSessao = strtotime(
            $sessao["data_sessao"] . " " . $sessao["horario"]
        );

        if ($inicioSessao === false || $inicioSessao <= time()) {
            throw new RuntimeException(
                "Uma das sessões já começou ou terminou."
            );
        }

        $total += $ingresso["preco"];

        $ingressosPedido[] = [
            ...$ingresso,
            "filme" => $sessao["titulo"],
            "data" => $sessao["data_sessao"],
            "horario" => substr($sessao["horario"], 0, 5)
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

    $inserirProduto = $pdo->prepare("
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
        $inserirProduto->execute([
            "pedido_id" => $pedidoId,
            "produto_id" => $produto["id"],
            "nome_produto" => $produto["nome"],
            "preco_unitario" => $produto["preco"],
            "quantidade" => $produto["quantidade"],
            "subtotal" => $produto["subtotal"]
        ]);
    }

    $inserirIngresso = $pdo->prepare("
        INSERT INTO ingressos (
            pedido_id,
            sessao_id,
            poltrona,
            tipo,
            preco
        )
        VALUES (
            :pedido_id,
            :sessao_id,
            :poltrona,
            :tipo,
            :preco
        )
    ");

    foreach ($ingressosPedido as $ingresso) {
        $inserirIngresso->execute([
            "pedido_id" => $pedidoId,
            "sessao_id" => $ingresso["sessaoId"],
            "poltrona" => $ingresso["poltrona"],
            "tipo" => $ingresso["tipo"],
            "preco" => $ingresso["preco"]
        ]);
    }

    $pdo->commit();

    responder(201, [
        "sucesso" => true,
        "mensagem" => "Pedido registrado com sucesso!",
        "pedido" => [
            "id" => $codigo,
            "total" => $total,
            "status" => "Concluído",
            "produtos" => $produtosPedido,
            "ingressos" => $ingressosPedido
        ]
    ]);

} catch (RuntimeException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    responder(400, [
        "sucesso" => false,
        "mensagem" => $e->getMessage()
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if (
        $e->getCode() === "23000" &&
        isset($e->errorInfo[1]) &&
        (int) $e->errorInfo[1] === 1062
    ) {
        responder(409, [
            "sucesso" => false,
            "mensagem" => "Uma das poltronas já foi comprada. Escolha outra."
        ]);
    }

    responder(500, [
        "sucesso" => false,
        "mensagem" => "Erro ao registrar o pedido."
    ]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    responder(500, [
        "sucesso" => false,
        "mensagem" => "Não foi possível processar o pedido."
    ]);
}
