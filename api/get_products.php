<?php
header('Content-Type: application/json');

$dataDir = __DIR__ . '/../data';
$dataFile = $dataDir . '/products.json';

try {
    // 디렉토리 생성
    if (!is_dir($dataDir)) {
        if (!mkdir($dataDir, 0755, true)) {
            throw new Exception('Failed to create data directory');
        }
    }

    if (file_exists($dataFile)) {
        $data = file_get_contents($dataFile);

        if ($data === false) {
            throw new Exception('Failed to read file');
        }

        // JSON 유효성 검증
        $decoded = json_decode($data, true);
        if ($decoded === null && $data !== 'null') {
            throw new Exception('Invalid JSON in file');
        }

        echo $data;
    } else {
        // 기본 데이터 생성
        $defaultData = [];
        $jsonData = json_encode($defaultData, JSON_PRETTY_PRINT);

        if (file_put_contents($dataFile, $jsonData) === false) {
            throw new Exception('Failed to create default data file');
        }

        echo $jsonData;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
