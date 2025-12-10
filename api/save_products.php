<?php
header('Content-Type: application/json');

require_once __DIR__ . '/file_lock_helper.php';

$dataDir = __DIR__ . '/../data';
$dataFile = $dataDir . '/products.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // 디렉토리 생성
        if (!is_dir($dataDir)) {
            if (!mkdir($dataDir, 0755, true)) {
                throw new Exception('Failed to create data directory');
            }
        }

        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        if ($data === null) {
            throw new Exception('Invalid JSON format');
        }

        // 데이터 검증
        if (!is_array($data)) {
            throw new Exception('Data must be an array');
        }

        // 각 상품 데이터 검증
        foreach ($data as $product) {
            if (!isset($product['id']) || !isset($product['name']) || !isset($product['quantity']) || !isset($product['color'])) {
                throw new Exception('Invalid product data structure');
            }

            if (!is_numeric($product['id'])) {
                throw new Exception('Product ID must be numeric');
            }

            if (!is_string($product['name']) || empty(trim($product['name']))) {
                throw new Exception('Product name must be a non-empty string');
            }

            if (!is_numeric($product['quantity']) || $product['quantity'] < 0) {
                throw new Exception('Product quantity must be a non-negative number');
            }

            // 색상 코드 검증
            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $product['color'])) {
                throw new Exception('Product color must be a valid hex color code');
            }
        }

        // 파일 저장 (배타적 잠금 사용)
        $jsonData = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($jsonData === false) {
            throw new Exception('Failed to encode JSON');
        }

        // 안전한 파일 쓰기 (파일 잠금 적용)
        if (!safeWriteFile($dataFile, $jsonData)) {
            throw new Exception('Failed to write to file');
        }

        echo json_encode(['success' => true]);

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
?>
