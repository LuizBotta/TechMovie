<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/config/database.php";

try {
    $resultado = $pdo->query("SELECT COUNT(*) AS quantidade FROM produtos");

    $dados = $resultado->fetch();

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Conexão com o MySQL realizada!",
        "produtos_cadastrados" => (int) $dados["quantidade"]
    ]);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao consultar os produtos."
    ]);
}
