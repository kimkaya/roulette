<?php
/**
 * 재고 감소 API
 * 룰렛 당첨 시 재고를 안전하게 감소시키는 API
 * 여러 사용자가 동시에 접근해도 race condition이 발생하지 않도록 원자적 작업으로 처리
 */

header('Content-Type: application/json');

require_once __DIR__ . '/file_lock_helper.php';

$dataDir = __DIR__ . '/../data';
$dataFile = $dataDir . '/products.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = file_get_contents('php://input');
        $requestData = json_decode($input, true);

        if ($requestData === null) {
            throw new Exception('Invalid JSON format');
        }

        // 필수 파라미터 검증
        if (!isset($requestData['productId'])) {
            throw new Exception('Product ID is required');
        }

        $productId = $requestData['productId'];

        if (!is_numeric($productId)) {
            throw new Exception('Product ID must be numeric');
        }

        // 원자적 작업으로 재고 감소
        $result = atomicFileOperation($dataFile, function($content) use ($productId) {
            // 파일이 비어있으면 빈 배열로 초기화
            if (empty($content)) {
                $content = '[]';
            }

            $products = json_decode($content, true);

            if ($products === null) {
                throw new Exception('Invalid JSON in file');
            }

            if (!is_array($products)) {
                throw new Exception('Products data must be an array');
            }

            // 상품 찾기
            $productIndex = -1;
            $selectedProduct = null;

            foreach ($products as $index => $product) {
                if ($product['id'] == $productId) {
                    $productIndex = $index;
                    $selectedProduct = $product;
                    break;
                }
            }

            if ($productIndex === -1) {
                throw new Exception('Product not found');
            }

            // 재고 확인
            if (!isset($selectedProduct['quantity']) || $selectedProduct['quantity'] <= 0) {
                throw new Exception('Product out of stock');
            }

            // 재고 감소
            $products[$productIndex]['quantity']--;

            // JSON 인코딩
            $newContent = json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            if ($newContent === false) {
                throw new Exception('Failed to encode JSON');
            }

            // 업데이트된 상품 정보를 반환값으로 설정 (콜백 외부에서 사용)
            global $updatedProduct;
            $updatedProduct = [
                'id' => $products[$productIndex]['id'],
                'name' => $products[$productIndex]['name'],
                'quantity' => $products[$productIndex]['quantity'],
                'color' => $products[$productIndex]['color']
            ];

            // 새 내용 반환 (파일에 쓰여짐)
            return $newContent;
        });

        // 성공 응답
        echo json_encode([
            'success' => true,
            'product' => $updatedProduct,
            'message' => 'Stock decreased successfully'
        ]);

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method'
    ]);
}
?>
