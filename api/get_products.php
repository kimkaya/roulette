<?php
header('Content-Type: application/json');

require_once __DIR__ . '/file_lock_helper.php';

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
        // 안전한 파일 읽기 (공유 잠금 사용)
        $data = safeReadFile($dataFile);

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

        // 안전한 파일 쓰기 (배타적 잠금 사용)
        if (!safeWriteFile($dataFile, $jsonData)) {
            throw new Exception('Failed to create default data file');
        }

        echo $jsonData;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
