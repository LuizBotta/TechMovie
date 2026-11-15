
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
    $filmeId = filter_input(
        INPUT_GET,
        "filmeId",
        FILTER_VALIDATE_INT
    );

    if ($filmeId === false || $filmeId === null || $filmeId <= 0) {
        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Informe um filme válido."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    $sql = "
        SELECT
            id,
            filme_id,
            DATE_FORMAT(data_sessao, '%Y-%m-%d') AS data,
            TIME_FORMAT(horario, '%H:%i') AS horario
        FROM sessoes
        WHERE filme_id = :filmeId
        ORDER BY data_sessao ASC, horario ASC
    ";

    $consulta = $pdo->prepare($sql);
    $consulta->execute([
        "filmeId" => $filmeId
    ]);

    $sessoes = $consulta->fetchAll();

    foreach ($sessoes as &$sessao) {
        $sessao["id"] = (int) $sessao["id"];
        $sessao["filme_id"] = (int) $sessao["filme_id"];
    }

    unset($sessao);

    echo json_encode([
        "sucesso" => true,
        "sessoes" => $sessoes
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao buscar sessões."
    ], JSON_UNESCAPED_UNICODE);
}
