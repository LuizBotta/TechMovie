
<?php

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Método não permitido."
    ]);

    exit;
}

require_once __DIR__ . "/../config/database.php";

try {
    $sql = "
        SELECT
            id,
            nome,
            descricao,
            preco,
            emoji,
            categoria
        FROM produtos
        WHERE ativo = 1
        ORDER BY id ASC
    ";

    $consulta = $pdo->query($sql);
    $produtos = $consulta->fetchAll();

    foreach ($produtos as &$produto) {
        $produto["id"] = (int) $produto["id"];
        $produto["preco"] = (float) $produto["preco"];
    }

    echo json_encode([
        "sucesso" => true,
        "produtos" => $produtos
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao buscar produtos."
    ], JSON_UNESCAPED_UNICODE);
}
