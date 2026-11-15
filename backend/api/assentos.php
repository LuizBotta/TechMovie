
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
    $sessaoId = filter_input(
        INPUT_GET,
        "sessaoId",
        FILTER_VALIDATE_INT
    );

    if (!$sessaoId || $sessaoId <= 0) {
        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Sessão inválida."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    $consultaSessao = $pdo->prepare("
        SELECT id, filme_id,
               DATE_FORMAT(data_sessao, '%Y-%m-%d') AS data,
               TIME_FORMAT(horario, '%H:%i') AS horario
        FROM sessoes
        WHERE id = :id
    ");

    $consultaSessao->execute([
        "id" => $sessaoId
    ]);

    $sessao = $consultaSessao->fetch();

    if (!$sessao) {
        http_response_code(404);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Sessão não encontrada."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    $consultaAssentos = $pdo->prepare("
        SELECT poltrona
        FROM ingressos
        WHERE sessao_id = :sessaoId
        ORDER BY poltrona
    ");

    $consultaAssentos->execute([
        "sessaoId" => $sessaoId
    ]);

    $ocupados = $consultaAssentos->fetchAll(
        PDO::FETCH_COLUMN
    );

    echo json_encode([
        "sucesso" => true,
        "sessao" => [
            "id" => (int) $sessao["id"],
            "filmeId" => (int) $sessao["filme_id"],
            "data" => $sessao["data"],
            "horario" => $sessao["horario"]
        ],
        "ocupados" => $ocupados
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao consultar poltronas."
    ], JSON_UNESCAPED_UNICODE);
}
