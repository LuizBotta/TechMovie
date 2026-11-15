
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
            titulo,
            genero,
            duracao,
            classificacao,
            imagem,
            sinopse
        FROM filmes
        ORDER BY id ASC
    ";

    $consulta = $pdo->query($sql);
    $filmes = $consulta->fetchAll();

    foreach ($filmes as &$filme) {
        $filme["id"] = (int) $filme["id"];
    }

    unset($filme);

    echo json_encode([
        "sucesso" => true,
        "filmes" => $filmes
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao buscar filmes."
    ], JSON_UNESCAPED_UNICODE);
}
